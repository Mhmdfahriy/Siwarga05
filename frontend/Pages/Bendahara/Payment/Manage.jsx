import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { 
    Search, 
    BellRing, 
    CheckCircle2, 
    AlertCircle,
    ArrowLeft,
    Plus,
    X
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

const ROLES_LABEL = {
    warga: 'Warga RT 05',
    sekretaris: 'Sekretaris RT 05',
    bendahara: 'Bendahara RT 05',
    ketua_rt: 'Ketua RT 05',
    superadmin: 'Developer / Super Admin',
    super_admin: 'Developer / Super Admin',
    admin: 'Developer / Super Admin',
};

export default function Manage({ dues, stats, filters, houses = [] }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const currentRole = authUser?.role || 'bendahara';
    const prefix = currentRole === 'ketua_rt' ? 'ketuart' : currentRole;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'semua');
    
    // State untuk Modal Tambah Tagihan & Tipe Tagihan (bulanan / insidental)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [billType, setBillType] = useState('bulanan'); // 'bulanan' atau 'insidental'

    // State untuk search & pilih rumah target tagihan insidental
    const [houseSearch, setHouseSearch] = useState('');

    // Form Inertia untuk Tagihan Bulanan
    const monthlyForm = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        amount: '',
    });

    // Form Inertia untuk Tagihan Insidental
    const incidentalForm = useForm({
        title: '',
        amount_type: 'fixed', // 'fixed' (tetap) atau 'voluntary' (seikhlasnya)
        amount: '',
        target: 'semua', // 'semua' atau 'tertentu'
        house_ids: [],
    });

    const filteredHouses = houses.filter(h => 
        h.block_number.toLowerCase().includes(houseSearch.toLowerCase()) ||
        h.resident_name.toLowerCase().includes(houseSearch.toLowerCase())
    );

    const toggleHouseSelection = (houseId) => {
        const current = incidentalForm.data.house_ids;
        if (current.includes(houseId)) {
            incidentalForm.setData('house_ids', current.filter(id => id !== houseId));
        } else {
            incidentalForm.setData('house_ids', [...current, houseId]);
        }
    };

    // Real-time search dengan debounce (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('bendahara.dues.manage'), 
                    { search, status: selectedStatus }, 
                    { preserveState: true, replace: true, preserveScroll: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle Submit Bulanan
    const handleMonthlySubmit = (e) => {
        e.preventDefault();
        monthlyForm.post(route('bendahara.dues.generate-monthly'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                monthlyForm.reset();
            },
        });
    };

    // Handle Submit Insidental
    const handleIncidentalSubmit = (e) => {
        e.preventDefault();
        
        if (incidentalForm.data.amount_type === 'voluntary') {
            incidentalForm.setData('amount', 0);
        }

        incidentalForm.post(route('bendahara.dues.store-incidental'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setHouseSearch('');
                incidentalForm.reset();
            },
        });
    };

    // FUNGSI: Tombol Ingatkan Semua
    const handleIngatkanSemua = () => {
        if (confirm('Apakah Anda yakin ingin mengirim pengingat tagihan secara massal ke semua warga yang belum membayar?')) {
            router.post(route('bendahara.dues.remind-all'), {}, {
                preserveScroll: true,
            });
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'lunas':
                return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 border border-emerald-100">● LUNAS</span>;
            case 'belum_bayar':
            case 'ditolak':
                return <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 border border-rose-100">● BELUM BAYAR</span>;
            case 'menunggu_verifikasi':
                return <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 border border-amber-100">● MENUNGGU</span>;
            default:
                return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold">TERLAMBAT</span>;
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'W';
    };

    return (
        <Sidebar currentRole={currentRole} activeMenu="finance">
            <Head title="Kelola Tagihan" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div className="flex items-center gap-3">
                            <Link 
                                href={route('bendahara.dues.index')} 
                                className="p-2.5 bg-white border border-gray-200 hover:bg-emerald-50 text-[#0D7A57] rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                                title="Kembali"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Kelola Tagihan</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Atur dan monitoring pembayaran iuran warga secara real-time.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari warga / blok..." 
                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                                />
                            </div>

                            <button 
                                onClick={handleIngatkanSemua}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#0D7A57] font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
                            >
                                <BellRing className="w-4 h-4" /> Ingatkan Semua
                            </button>

                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0A6145] text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Tambah Tagihan
                            </button>

                            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                                <NotifikasiBell prefix={prefix} />
                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <CheckCircle2 className="w-6 h-6 text-[#0D7A57]" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tagihan (Periode Ini)</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{formatRupiah(stats?.total_tagihan || 0)}</h3>
                            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">Total seluruh Kepala Keluarga</p>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                    <CheckCircle2 className="w-6 h-6 text-[#0D7A57]" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-emerald-800/70 uppercase tracking-wider mb-1">Total Terkumpul</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#0D7A57] tracking-tight">{formatRupiah(stats?.terkumpul || 0)}</h3>
                            <div className="w-full bg-emerald-100 h-2 rounded-full mt-3 overflow-hidden">
                                <div className="bg-[#0D7A57] h-full rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                                    <AlertCircle className="w-6 h-6 text-rose-600" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Belum Terbayar</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">{formatRupiah(stats?.belum_bayar || 0)}</h3>
                            <p className="text-xs text-rose-400 mt-3 pt-3 border-t border-gray-50">{stats?.count_tertunda || 0} Tagihan Tertunda</p>
                        </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-xs font-medium text-gray-500">
                                Menampilkan <span className="font-bold text-gray-800">{dues.data.length}</span> dari <span className="font-bold text-gray-800">{dues.total}</span> data
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                <thead>
                                    <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                                        <th className="py-3 px-4">Warga</th>
                                        <th className="py-3 px-4">Blok/No</th>
                                        <th className="py-3 px-4">Kategori</th>
                                        <th className="py-3 px-4">Jumlah</th>
                                        <th className="py-3 px-4">Jatuh Tempo</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dues.data.length > 0 ? (
                                        dues.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                                <td className="py-3.5 px-4 flex items-center gap-3 whitespace-nowrap">
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D7A57] font-bold flex items-center justify-center text-xs shadow-xs border border-emerald-100 shrink-0">
                                                        {getInitials(item.resident_name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.resident_name}</p>
                                                        <p className="text-[10px] text-gray-400">{item.resident_email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-gray-700 whitespace-nowrap">{item.block_number}</td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className="bg-emerald-50 text-[#0D7A57] border border-emerald-100 px-2.5 py-1 rounded-xl text-xs font-bold">
                                                        {item.title}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                                                    {item.amount > 0 ? formatRupiah(item.amount) : <span className="text-gray-400 font-medium italic text-xs">Seikhlasnya</span>}
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-500 font-medium whitespace-nowrap">{item.due_date}</td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-xs text-gray-400 italic">
                                                Tidak ada data tagihan ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION TERPUSAT */}
                        {dues?.links && dues.links.length > 3 && (
                            <div className="py-4 px-4 bg-[#F4F6FC] border-t border-gray-100 flex justify-center">
                                <Pagination links={dues.links} />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* MODAL TAMBAH TAGIHAN (Tanpa Blur Latar Belakang) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">Buat Tagihan Baru</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex rounded-2xl bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setBillType('bulanan')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${billType === 'bulanan' ? 'bg-white text-[#0D7A57] shadow-sm' : 'text-gray-500'}`}
                                >
                                    Tagihan Bulanan (Massal)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillType('insidental')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${billType === 'insidental' ? 'bg-white text-[#0D7A57] shadow-sm' : 'text-gray-500'}`}
                                >
                                    Tagihan Insidental / Khusus
                                </button>
                            </div>

                            {/* FORM BULANAN */}
                            {billType === 'bulanan' ? (
                                <form onSubmit={handleMonthlySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bulan</label>
                                        <select 
                                            value={monthlyForm.data.period_month}
                                            onChange={(e) => monthlyForm.setData('period_month', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                        >
                                            {[
                                                {v: 1, l: 'Januari'}, {v: 2, l: 'Februari'}, {v: 3, l: 'Maret'}, 
                                                {v: 4, l: 'April'}, {v: 5, l: 'Mei'}, {v: 6, l: 'Juni'}, 
                                                {v: 7, l: 'Juli'}, {v: 8, l: 'Agustus'}, {v: 9, l: 'September'}, 
                                                {v: 10, l: 'Oktober'}, {v: 11, l: 'November'}, {v: 12, l: 'Desember'}
                                            ].map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tahun</label>
                                        <input 
                                            type="number"
                                            value={monthlyForm.data.period_year}
                                            onChange={(e) => monthlyForm.setData('period_year', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nominal (Rp)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Contoh: 50000"
                                            value={monthlyForm.data.amount}
                                            onChange={(e) => monthlyForm.setData('amount', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                        />
                                        {monthlyForm.errors.amount && <p className="text-xs text-rose-500 mt-1">{monthlyForm.errors.amount}</p>}
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer">Batal</button>
                                        <button type="submit" disabled={monthlyForm.processing} className="px-5 py-2.5 bg-[#0D7A57] text-white rounded-xl text-xs font-bold hover:bg-[#0A6145] disabled:opacity-50 cursor-pointer shadow-sm">Generate Tagihan</button>
                                    </div>
                                </form>
                            ) : (
                                /* FORM INSIDENTAL */
                                <form onSubmit={handleIncidentalSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Judul / Nama Tagihan</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Iuran Perayaan 17 Agustus"
                                            value={incidentalForm.data.title}
                                            onChange={(e) => incidentalForm.setData('title', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                        />
                                        {incidentalForm.errors.title && <p className="text-xs text-rose-500 mt-1">{incidentalForm.errors.title}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Jenis Nominal</label>
                                        <div className="flex gap-4 p-1">
                                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    value="fixed"
                                                    checked={incidentalForm.data.amount_type === 'fixed'}
                                                    onChange={(e) => incidentalForm.setData('amount_type', e.target.value)}
                                                    className="w-4 h-4 text-[#0D7A57] focus:ring-[#0D7A57] border-gray-300"
                                                />
                                                Ditentukan (Tetap)
                                            </label>
                                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    value="voluntary"
                                                    checked={incidentalForm.data.amount_type === 'voluntary'}
                                                    onChange={(e) => {
                                                        incidentalForm.setData('amount_type', e.target.value);
                                                        incidentalForm.setData('amount', '');
                                                    }}
                                                    className="w-4 h-4 text-[#0D7A57] focus:ring-[#0D7A57] border-gray-300"
                                                />
                                                Seikhlasnya (Sukarela)
                                            </label>
                                        </div>
                                    </div>

                                    {incidentalForm.data.amount_type === 'fixed' ? (
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nominal (Rp)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Contoh: 25000"
                                                value={incidentalForm.data.amount}
                                                onChange={(e) => incidentalForm.setData('amount', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                            />
                                            {incidentalForm.errors.amount && <p className="text-xs text-rose-500 mt-1">{incidentalForm.errors.amount}</p>}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 bg-emerald-50 text-[#0D7A57] rounded-xl text-xs sm:text-sm font-medium border border-emerald-100 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                                            Warga dapat memasukkan nominal secara bebas saat membayar.
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Warga</label>
                                        <select 
                                            value={incidentalForm.data.target}
                                            onChange={(e) => {
                                                incidentalForm.setData('target', e.target.value);
                                                if (e.target.value === 'semua') {
                                                    incidentalForm.setData('house_ids', []);
                                                    setHouseSearch('');
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                        >
                                            <option value="semua">Semua Rumah / Warga</option>
                                            <option value="tertentu">Rumah Tertentu</option>
                                        </select>
                                    </div>

                                    {incidentalForm.data.target === 'tertentu' && (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                <input 
                                                    type="text"
                                                    placeholder="Cari blok / nama warga..."
                                                    value={houseSearch}
                                                    onChange={(e) => setHouseSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none"
                                                />
                                            </div>

                                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                                                {filteredHouses.length > 0 ? (
                                                    filteredHouses.map((house) => (
                                                        <label 
                                                            key={house.id} 
                                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition"
                                                        >
                                                            <input 
                                                                type="checkbox"
                                                                checked={incidentalForm.data.house_ids.includes(house.id)}
                                                                onChange={() => toggleHouseSelection(house.id)}
                                                                className="w-4 h-4 text-[#0D7A57] focus:ring-[#0D7A57] border-gray-300 rounded"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-gray-900">Blok {house.block_number}</p>
                                                                <p className="text-[10px] text-gray-400 truncate">{house.resident_name}</p>
                                                            </div>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic text-center py-4">Tidak ada rumah ditemukan.</p>
                                                )}
                                            </div>

                                            <p className="text-[10px] text-gray-500 font-medium">
                                                {incidentalForm.data.house_ids.length} rumah dipilih
                                            </p>

                                            {incidentalForm.errors.house_ids && (
                                                <p className="text-xs text-rose-500">{incidentalForm.errors.house_ids}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => { setIsModalOpen(false); setHouseSearch(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer">Batal</button>
                                        <button type="submit" disabled={incidentalForm.processing} className="px-5 py-2.5 bg-[#0D7A57] text-white rounded-xl text-xs font-bold hover:bg-[#0A6145] disabled:opacity-50 cursor-pointer shadow-sm">Simpan Tagihan</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </Sidebar>
    );
}