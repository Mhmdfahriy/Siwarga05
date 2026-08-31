import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    Download, 
    Wallet, 
    CalendarX2, 
    Star, 
    Search,
    Eye,
    RefreshCcw,
    Clock,
    XCircle,
    CheckCircle2,
    Home,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Upload,
    X
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar'; 
import Pagination from '@/Components/Pagination'; 
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import jsPDF from 'jspdf';
import Footer from '@/Components/Footer';

export default function Index({ user, dues = [], paymentMethods = [], paymentHistory = [], filters = {} }) {
    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    if (user.role !== 'bendahara' && !user.house_id) {
        return (
            <Sidebar currentRole={user.role} activeMenu="finance">
                <Head title="Manajemen Keuangan" />
                <div className="py-12 bg-[#F8FAFC] min-h-screen font-sans flex items-center justify-center">
                    <div className="mx-auto max-w-md px-4 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-[#0D7A57] rounded-3xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Home className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                Data Rumah Belum Terdaftar
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                Oops! Anda belum memiliki data rumah atau belum terhubung ke unit rumah manapun di RT 05. Silakan daftarkan data rumah Anda terlebih dahulu.
                            </p>
                        </div>
                        <div>
                            <Link 
                                href={route(`${prefix}.house.index`)}
                                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#0D7A57] text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#0A6145] transition shadow-md cursor-pointer"
                            >
                                <span>Isi Data Rumah Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            <Footer />
            </Sidebar>
        );
    }

    const [searchHistory, setSearchHistory] = useState(filters.search || '');

    // State untuk Modal Upload Ulang Bukti Pembayaran
    const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        proof_photo: null,
    });

    const openReuploadModal = (paymentId) => {
        setSelectedPaymentId(paymentId);
        reset();
        setIsReuploadModalOpen(true);
    };

    const handleReuploadSubmit = (e) => {
        e.preventDefault();
        router.post(route(`${prefix}.dues.reupload-payment`, selectedPaymentId), {
            _method: 'PUT',
            proof_photo: data.proof_photo,
        }, {
            onSuccess: () => {
                setIsReuploadModalOpen(false);
                reset();
            },
        });
    };

    // Filter tagihan aktif
    const activeIurans = dues.filter(i => i.status === 'belum_bayar' || i.status === 'ditolak');

    // Pagination Tagihan Aktif (Frontend 5 per halaman)
    const [tagihanPage, setTagihanPage] = useState(1);
    const tagihanPerPage = 5; 
    const totalTagihanPages = Math.ceil(activeIurans.length / tagihanPerPage);
    const paginatedActiveIurans = activeIurans.slice(
        (tagihanPage - 1) * tagihanPerPage,
        tagihanPage * tagihanPerPage
    );

    const [selectedDueIds, setSelectedDueIds] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeProofUrl, setActiveProofUrl] = useState(null);

    const handleCheckboxChange = (id) => {
        if (selectedDueIds.includes(id)) {
            setSelectedDueIds(selectedDueIds.filter(itemId => itemId !== id));
        } else {
            setSelectedDueIds([...selectedDueIds, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedDueIds.length === activeIurans.length) {
            setSelectedDueIds([]);
        } else {
            setSelectedDueIds(activeIurans.map(i => i.id));
        }
    };

    const checkedIurans = activeIurans.filter(i => selectedDueIds.includes(i.id));
    const totalTagihanValue = checkedIurans.reduce((sum, item) => sum + Number(item.amount), 0);

    // AMBIL ARRAY DATA DARI .data OBJECT PAGINATION LARAVEL
    const historyList = paymentHistory.data || [];
    const verifiedPayments = historyList.filter(p => p.status === 'diverifikasi' || p.status === 'lunas' || p.status === 'success');
    const totalKontribusiValue = verifiedPayments.reduce((sum, item) => sum + Number(item.total_amount), 0);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchHistory(value);

        router.get(route(`${prefix}.dues.index`), { search: value }, {
            preserveState: true,
            preserveScroll: true,
            only: ['paymentHistory', 'filters'],
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    const handleDownloadPDF = () => {
        if (!historyList || historyList.length === 0) {
            alert('Tidak ada data riwayat untuk diunduh.');
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.setTextColor(13, 122, 87); 
        doc.text("REKAPITULASI KEUANGAN WARGA RT 05", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Nama Warga: ${user.name || '-'}`, 14, 28);
        doc.text(`Blok Rumah: ${user.block_house || '-'}`, 14, 34);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 40);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 45, 196, 45);

        let startY = 55;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "bold");
        
        doc.text("Tanggal", 14, startY);
        doc.text("Keterangan", 50, startY);
        doc.text("Jumlah", 130, startY);
        doc.text("Status", 170, startY);

        doc.setLineCap(2);
        doc.line(14, startY + 2, 196, startY + 2);

        doc.setFont("helvetica", "normal");
        let currentY = startY + 10;

        historyList.forEach((item) => {
            if (currentY > 280) {
                doc.addPage();
                currentY = 20;
            }

            const tanggal = item.created_at || '-';
            const keterangan = item.dues_titles?.join(', ') || '-';
            const jumlah = formatRupiah(item.total_amount);
            const status = (item.status || '-').toUpperCase();

            doc.text(tanggal, 14, currentY);
            doc.text(keterangan.substring(0, 35), 50, currentY);
            doc.text(jumlah, 130, currentY);
            doc.text(status, 170, currentY);

            currentY += 8;
        });

        doc.save(`rekap_keuangan_${user.name || 'warga'}.pdf`);
    };

    const StatusBadge = ({ status, label }) => {
        if (status === 'diverifikasi' || status === 'lunas' || status === 'success') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Sukses
                </span>
            );
        }
        if (status === 'menunggu_verifikasi' || status === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            );
        }
        if (status === 'ditolak' || status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                    <XCircle className="w-3 h-3" /> Ditolak
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                <RefreshCcw className="w-3 h-3" /> {label || status}
            </span>
        );
    };

    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <Head title="Manajemen Keuangan" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Atas & Aksi Cepat */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Manajemen Keuangan</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola iuran dan pantau kontribusi Anda secara transparan di lingkungan RT 05.</p>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                                <NotifikasiBell prefix={prefix} />
                            </div>

                            <button 
                                onClick={handleDownloadPDF}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-gray-400" />
                                <span>Unduh Rekap (PDF)</span>
                            </button>

                            <Link 
                                href={route(`${prefix}.dues.payment-form`, { dues: selectedDueIds })} 
                                disabled={selectedDueIds.length === 0}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                    selectedDueIds.length === 0 
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                        : 'bg-[#0D7A57] text-white hover:bg-[#0A6145] cursor-pointer'
                                }`}
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Bayar Dipilih ({selectedDueIds.length})</span>
                            </Link>
                        </div>
                    </div>

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Tagihan Dipilih</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#0D7A57] tracking-tight">
                                    {formatRupiah(totalTagihanValue)}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5 mt-4 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
                                <CalendarX2 className="w-3.5 h-3.5" />
                                <span>{selectedDueIds.length} dari {activeIurans.length} tagihan dicentang</span>
                            </div>
                            <Wallet className="absolute right-4 top-4 w-12 h-12 text-gray-50 pointer-events-none" />
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Status Tagihan</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {activeIurans.length > 0 ? (
                                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                                            Belum Lunas ({activeIurans.length} Tagihan)
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">
                                            Semua Sudah Lunas 🎉
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                                Centang item tagihan di sebelah kiri untuk melanjutkan pembayaran.
                            </p>
                            <CalendarX2 className="absolute right-4 top-4 w-12 h-12 text-gray-50 pointer-events-none" />
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Kontribusi (Terkonfirmasi)</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#0D7A57] tracking-tight">
                                    {formatRupiah(totalKontribusiValue)}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1.5 mt-4 text-gray-500 text-xs font-medium">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>Terima kasih atas partisipasi Anda</span>
                            </div>
                            <Star className="absolute right-4 top-4 w-12 h-12 text-gray-50 pointer-events-none" />
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        
                        {/* Left Column: Tagihan Aktif */}
                        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tagihan Aktif</h3>
                                    {activeIurans.length > 0 && (
                                        <button 
                                            onClick={handleSelectAll}
                                            className="text-xs font-bold text-[#0D7A57] hover:underline cursor-pointer"
                                        >
                                            {selectedDueIds.length === activeIurans.length ? 'Batalkan Semua' : 'Pilih Semua'}
                                        </button>
                                    )}
                                </div>

                                {activeIurans.length > 0 ? (
                                    <div className="space-y-3">
                                        {paginatedActiveIurans.map((due) => {
                                            const isChecked = selectedDueIds.includes(due.id);
                                            return (
                                                <div 
                                                    key={due.id} 
                                                    onClick={() => handleCheckboxChange(due.id)}
                                                    className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 shadow-xs ${
                                                        isChecked ? 'border-[#0D7A57] bg-emerald-50/20 ring-1 ring-[#0D7A57]' : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked} 
                                                        onChange={() => {}} 
                                                        className="w-4 h-4 mt-1 text-[#0D7A57] rounded border-gray-300 focus:ring-[#0D7A57] cursor-pointer shrink-0"
                                                    />
                                                    <div className="flex-1 truncate">
                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">{due.title}</span>
                                                            {(due.type === 'seikhlasnya' || Number(due.amount) === 0) ? (
                                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-100">
                                                                    Seikhlasnya
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-[#0D7A57] text-xs sm:text-sm shrink-0">{formatRupiah(due.amount)}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 capitalize">
                                                            Tipe: {due.type === 'seikhlasnya' || Number(due.amount) === 0 ? 'Seikhlasnya' : due.type} • {due.period_label || 'Insidental'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm space-y-2">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto" />
                                        <p className="text-xs font-semibold text-gray-500">Hore! Tidak ada tagihan aktif saat ini.</p>
                                    </div>
                                )}
                            </div>

                            {activeIurans.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    {totalTagihanPages > 1 && (
                                        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-gray-100 shadow-xs text-xs">
                                            <button 
                                                onClick={() => setTagihanPage(prev => Math.max(prev - 1, 1))}
                                                disabled={tagihanPage === 1}
                                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-gray-600">
                                                Hal {tagihanPage} dari {totalTagihanPages}
                                            </span>
                                            <button 
                                                onClick={() => setTagihanPage(prev => Math.min(prev + 1, totalTagihanPages))}
                                                disabled={tagihanPage === totalTagihanPages}
                                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <Link 
                                        href={route(`${prefix}.dues.payment-form`, { dues: selectedDueIds })} 
                                        disabled={selectedDueIds.length === 0}
                                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                            selectedDueIds.length === 0 
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                : 'bg-[#0D7A57] text-white hover:bg-[#0A6145] cursor-pointer'
                                        }`}
                                    >
                                        <Wallet className="w-4 h-4" />
                                        <span>Lanjut Pembayaran ({selectedDueIds.length} Item)</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Riwayat Pembayaran */}
                        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Riwayat Pembayaran</h3>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Cari transaksi..." 
                                            value={searchHistory}
                                            onChange={handleSearchChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-4 py-3">Keterangan</th>
                                                <th className="px-4 py-3">Jumlah</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {historyList.length > 0 ? (
                                                historyList.map((history) => (
                                                    <tr key={history.id} className="text-xs sm:text-sm hover:bg-gray-50/50 transition">
                                                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                                                            <p className="font-bold text-gray-900">{history.created_at?.split(' ')[0]}</p>
                                                            <p className="text-[10px] text-gray-400">{history.created_at?.split(' ')[1]}</p>
                                                        </td>
                                                        <td className="px-4 py-3.5">
                                                            <p className="font-bold text-gray-900 max-w-[180px] sm:max-w-xs truncate" title={history.dues_titles?.join(', ')}>
                                                                {history.dues_titles?.join(', ')}
                                                            </p>
                                                            {history.rejection_reason && (
                                                                <p className="text-red-500 text-[10px] italic mt-0.5">
                                                                    Alasan: {history.rejection_reason}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                                            {formatRupiah(history.total_amount)}
                                                        </td>
                                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                                            <StatusBadge status={history.status} label={history.status_label} />
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {history.proof_photo && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setActiveProofUrl(history.proof_photo);
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        <span>Lihat</span>
                                                                    </button>
                                                                )}

                                                                {/* Tombol Upload Ulang via Modal jika Status Ditolak */}
                                                                {history.status === 'ditolak' && (
                                                                    <button 
                                                                        onClick={() => openReuploadModal(history.id)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                                                                    >
                                                                        <Upload className="w-3.5 h-3.5" />
                                                                        <span>Upload Ulang</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-400 italic">
                                                        Tidak ada data riwayat pembayaran ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Render Komponen Pagination Laravel */}
                            {paymentHistory?.links && paymentHistory.links.length > 3 && (
                                <div className="py-4 px-4 bg-[#F4F6FC] border-t border-gray-100 flex justify-center">
                                    <Pagination links={paymentHistory.links} />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL BUKTI TRANSFER */}
            <ModalCard 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Bukti Transfer Pembayaran"
                imageUrl={activeProofUrl}
                onConfirm={() => setIsModalOpen(false)}
                confirmText="Tutup"
                cancelText="" 
            />

            {/* MODAL UPLOAD ULANG BUKTI PEMBAYARAN */}
            {isReuploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsReuploadModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Ulang Bukti</h3>
                        <p className="text-xs text-gray-500 mb-5">Pilih File Baru</p>
                        
                        <form onSubmit={handleReuploadSubmit} className="space-y-4">
                            <label className="border-2 border-dashed border-gray-200 hover:border-[#0D7A57] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 transition">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0D7A57] flex items-center justify-center mb-2">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">Klik untuk pilih file</span>
                                <span className="text-[10px] text-gray-400 mt-1">Format: JPG, PNG, PDF (Maks. 2MB)</span>
                                <input 
                                    type="file" 
                                    accept="image/*,.pdf"
                                    onChange={(e) => setData('proof_photo', e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            {data.proof_photo && (
                                <p className="text-xs text-emerald-600 font-semibold text-center truncate">
                                    File terpilih: {data.proof_photo.name}
                                </p>
                            )}
                            {errors.proof_photo && <span className="text-red-500 text-xs block text-center">{errors.proof_photo}</span>}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsReuploadModalOpen(false)}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing || !data.proof_photo}
                                    className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-sm ${
                                        processing || !data.proof_photo ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                    }`}
                                >
                                    {processing ? 'Mengunggah...' : 'Upload Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </Sidebar>
    );
}