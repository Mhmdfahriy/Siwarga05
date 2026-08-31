import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar'; 
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import { 
    CreditCard, Wallet, AlertTriangle, Newspaper, 
    CheckCircle2, Plus, Search, X, Check, Eye 
} from 'lucide-react';
import Footer from '@/Components/Footer';

export default function Dashboard({ 
    auth, 
    financialSummary, 
    recentTransactions = [], 
    recentNews = [], 
    recentLaporan = [], 
    laporanBaruCount = 0, 
    chartData = [], 
    filters = {} 
}) {
    const namaUser = auth?.user?.name || "Bendahara RT 05";

    // State untuk Search dan Modal
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Live Search otomatis setiap huruf diketik dengan jeda (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('bendahara.dashboard'), 
                { search: searchTerm }, 
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true, 
                }
            );
        }, 300); 

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Format Rupiah helper
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    };

    const openVerifyModal = (trx) => {
        setSelectedTransaction(trx);
        setIsModalOpen(true);
    };

    const handleVerify = (uuid) => {
        router.put(route('bendahara.dues.verify', uuid), {}, {
            preserveScroll: true,
            onSuccess: () => setIsModalOpen(false),
        });
    };

    // Data asli dari database, tanpa fallback dummy
    const totalWarga = financialSummary?.total_warga ?? 0;
    const wargaSudahBayar = financialSummary?.warga_sudah_bayar ?? 0;
    const wargaBelumBayar = Math.max(0, totalWarga - wargaSudahBayar);

    // Cari nilai tertinggi di chart untuk skala tinggi bar yang proporsional
    const maxChartValue = chartData.length > 0
        ? Math.max(...chartData.map(d => Math.max(d.bulanan, d.insidental)), 1)
        : 1;

    return (
        /* KUNCI PERBAIKAN: Seluruh isi Dashboard DIBUNGKUS oleh komponen Sidebar */
        <Sidebar currentRole="bendahara" activeMenu="dashboard">
            <Head title="Dashboard Bendahara" />

            <div className="flex-1 flex flex-col justify-between min-w-0 font-sans antialiased text-[#0b1c30]">
                
                {/* Top Header Navbar - Ditambahkan 'hidden md:flex' agar tidak double dengan header HP */}
                <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 justify-between items-center sticky top-0 z-30">
                    <h1 className="text-xl font-bold text-gray-900">Dashboard Bendahara</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari data warga..." 
                                className="pl-9 pr-4 py-2 bg-[#F1F5F9] border-none rounded-full text-xs text-gray-700 focus:ring-2 focus:ring-[#006948] w-64"
                            />
                        </div>

                        <NotifikasiBell prefix="bendahara" />

                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900">{namaUser}</p>
                                <p className="text-[10px] text-gray-500">Admin Keuangan</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#006948] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {namaUser.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 space-y-6">
                    
                    {/* Baris 1: 4 Kolom Card Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* Card 1: Gabungan Iuran Bulanan & Tagihan Khusus */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-2 relative items-center">
                            <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-gray-100 -translate-x-1/2"></div>

                            <div className="flex flex-col justify-between h-full space-y-2 pr-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 bg-emerald-50 text-[#006948] rounded-md flex items-center justify-center shrink-0">
                                        <CreditCard className="w-3 h-3" />
                                    </div>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto text-green-700 bg-green-50">
                                        AKTIF
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium">Total Iuran</p>
                                    <h4 className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                                        {formatRupiah(financialSummary?.total_iuran || 0)}
                                    </h4>
                                </div>
                                <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400">Bulanan</span>
                                    <Link href={route('bendahara.dues.manage')} className="text-[#006948] font-semibold hover:underline">
                                        Kelola
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between h-full space-y-2 pl-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 bg-teal-50 text-teal-700 rounded-md flex items-center justify-center shrink-0">
                                        <Wallet className="w-3 h-3" />
                                    </div>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto text-teal-700 bg-teal-50">
                                        DANA
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium">Insidental</p>
                                    <h4 className="text-xs font-bold text-gray-900 mt-0.5 truncate">
                                        {formatRupiah(financialSummary?.dana_insidental || 0)}
                                    </h4>
                                </div>
                                <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400">Khusus</span>
                                    <Link href={route('bendahara.dues.verification')} className="text-[#006948] font-semibold hover:underline">
                                        Detail
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Belum Terbayar */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full animate-pulse">
                                    {wargaBelumBayar} Warga
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-[11px] text-gray-500 font-medium">Belum Terbayar</p>
                                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                    {formatRupiah(financialSummary?.tagihan_belum_lunas ?? 0)}
                                </h3>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Tunggakan Warga</span>
                                <Link href={route('bendahara.dues.verification')} className="text-[#006948] font-semibold hover:underline">
                                    Tagih &gt;
                                </Link>
                            </div>
                        </div>

                        {/* Card 3: Berita Terkini */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Newspaper className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                                        PUBLIK
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Berita Terkini</p>
                                <h3 className="text-base font-bold text-gray-900 mt-0.5 truncate">
                                    {recentNews[0]?.title || 'Belum ada berita'}
                                </h3>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Internal & Warga</span>
                                <Link href={route('bendahara.news.index')} className="text-[#006948] font-semibold hover:underline">
                                    Pantau &gt;
                                </Link>
                            </div>
                        </div>

                        {/* Card 4: Laporan Warga */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    {laporanBaruCount > 0 && (
                                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md animate-pulse">
                                            {laporanBaruCount} BARU
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 font-medium">Laporan Warga</p>
                                <h3 className="text-base font-bold text-gray-900 mt-0.5">
                                    {recentLaporan.length} Kendala Aktif
                                </h3>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Perlu Ditinjau</span>
                                <Link href={route('bendahara.laporan.index')} className="text-[#006948] font-semibold hover:underline">
                                    Tinjau &gt;
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Baris 2: Analisis Iuran & Dana Kas */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Analisis Iuran & Dana Kas</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Tren pemasukan 6 bulan terakhir</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span> Iuran Bulanan</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#68dba9]"></span> Iuran Insidental</span>
                            </div>
                        </div>

                        {chartData.length > 0 ? (
                            <div className="grid grid-cols-6 gap-4 pt-6 items-end h-44">
                                {chartData.map((item, idx) => {
                                    const bulananHeight = Math.max(4, (item.bulanan / maxChartValue) * 100);
                                    const insidentalHeight = Math.max(4, (item.insidental / maxChartValue) * 100);

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                                            <div className="w-full flex items-end justify-center gap-1.5 h-full px-1">
                                                <div 
                                                    className="w-1/2 bg-[#006948] rounded-t-lg transition-all duration-300 hover:opacity-90" 
                                                    style={{ height: `${bulananHeight}%` }}
                                                    title={`Iuran Bulanan ${item.month}: ${formatRupiah(item.bulanan)}`}
                                                ></div>
                                                <div 
                                                    className="w-1/2 bg-[#68dba9] rounded-t-lg transition-all duration-300 hover:opacity-90" 
                                                    style={{ height: `${insidentalHeight}%` }}
                                                    title={`Iuran Insidental ${item.month}: ${formatRupiah(item.insidental)}`}
                                                ></div>
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-500">{item.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-44 flex items-center justify-center text-xs text-gray-400 italic">
                                Belum ada data pemasukan untuk ditampilkan.
                            </div>
                        )}
                    </div>

                    {/* Baris 3: Tombol Aksi Cepat */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href={route('bendahara.dues.manage')} className="px-4 py-2 bg-[#006948] hover:bg-[#005137] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition">
                            <CreditCard className="w-4 h-4" /> Kelola Tagihan
                        </Link>
                        <Link href={route('bendahara.dues.verification')} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-2 transition">
                            <Wallet className="w-4 h-4 text-[#006948]" /> Verifikasi Pembayaran
                        </Link>
                        <Link href={route('bendahara.news.create')} className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-2 transition">
                            <Plus className="w-4 h-4 text-[#006948]" /> Buat Berita
                        </Link>
                    </div>

                    {/* Baris 4: Konten Dua Kolom Bawah */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Aktivitas Pembayaran Terbaru */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-sm">Aktivitas Pembayaran Terbaru</h3>
                                <Link href={route('bendahara.dues.verification')} className="text-xs text-[#006948] font-semibold hover:underline">Lihat Semua</Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-max">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="py-3 px-2">Warga</th>
                                            <th className="py-3 px-2">Tanggal</th>
                                            <th className="py-3 px-2">Jumlah</th>
                                            <th className="py-3 px-2">Status</th>
                                            <th className="py-3 px-2 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-xs">
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((trx) => (
                                                <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3.5 px-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#006948] font-bold text-xs flex items-center justify-center shrink-0">
                                                                {/* KUNCI PERBAIKAN: Mencegah error null charAt */}
                                                                {trx?.name ? trx.name.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{trx?.name || 'User Tanpa Nama'}</p>
                                                                <p className="text-[10px] text-gray-400">{trx?.block || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-2 text-gray-600">{trx.date}</td>
                                                    <td className="py-3.5 px-2 font-bold text-gray-900">{formatRupiah(trx.amount)}</td>
                                                    <td className="py-3.5 px-2">
                                                        {trx.status === 'diverifikasi' && (
                                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold inline-block">Verified</span>
                                                        )}
                                                        {trx.status === 'menunggu_verifikasi' && (
                                                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold inline-block">Pending</span>
                                                        )}
                                                        {trx.status === 'ditolak' && (
                                                            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-[10px] font-bold inline-block">Failed</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-2 text-right">
                                                        {trx.status === 'menunggu_verifikasi' ? (
                                                            <button 
                                                                onClick={() => openVerifyModal(trx)}
                                                                className="px-3 py-1 bg-[#006948] hover:bg-[#005137] text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                                                            >
                                                                <Eye className="w-3 h-3" /> Tinjau
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-[11px]">Selesai</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-gray-400 italic">
                                                    Tidak ada data transaksi yang cocok dengan pencarian.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Kolom Kanan: Berita Terkini & Laporan Warga */}
                        <div className="space-y-6">
                            
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 text-sm">Berita Terkini</h3>
                                    <Link href={route('bendahara.news.index')} className="text-xs text-[#006948] font-semibold hover:underline flex items-center">
                                        &gt;
                                    </Link>
                                </div>

                                {recentNews.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentNews.map((news, idx) => (
                                            idx === 0 ? (
                                                <Link 
                                                    key={news.id}
                                                    href={route('bendahara.news.show', news.id)}
                                                    className="block border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition bg-white"
                                                >
                                                    <div 
                                                        className="h-28 bg-gray-100 relative bg-cover bg-center"
                                                        style={news.image ? { backgroundImage: `url(${news.image})` } : {}}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                                            <span className="text-[9px] font-bold text-white bg-[#006948] px-2 py-0.5 rounded uppercase">
                                                                {news.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{news.title}</h4>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{news.date}</p>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <Link 
                                                    key={news.id}
                                                    href={route('bendahara.news.show', news.id)}
                                                    className="p-3 border border-gray-100 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition"
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                                                        <Newspaper className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h5 className="text-xs font-bold text-gray-900 truncate">{news.title}</h5>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{news.date}</p>
                                                    </div>
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-2">Belum ada berita yang dipublikasikan.</p>
                                )}
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 text-sm">Laporan Warga</h3>
                                    {laporanBaruCount > 0 && (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                            {laporanBaruCount} BARU
                                        </span>
                                    )}
                                </div>

                                {recentLaporan.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentLaporan.map((laporan) => (
                                            <div key={laporan.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-bold text-gray-900">{laporan.judul}</p>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                        laporan.status === 'pending' 
                                                            ? 'text-amber-700 bg-amber-50' 
                                                            : laporan.status === 'selesai'
                                                            ? 'text-emerald-700 bg-emerald-50'
                                                            : 'text-blue-700 bg-blue-50'
                                                    }`}>
                                                        {laporan.status === 'pending' ? 'Segera' : laporan.status === 'selesai' ? 'Selesai' : 'Diproses'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-1">{laporan.deskripsi}</p>
                                                <p className="text-[9px] text-gray-400">Oleh: {laporan.author}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-2">Belum ada laporan kategori keuangan.</p>
                                )}
                            </div>

                        </div>
                    </div>

                </main>
            </div>

            {/* MODAL CARD VERIFIKASI PEMBAYARAN */}
            {isModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 space-y-4">
                        
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#006948]" /> Validasi Pembayaran Warga
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400">Nama Warga</span>
                                <span className="font-bold text-gray-900">{selectedTransaction.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400">Blok Rumah</span>
                                <span className="font-bold text-gray-900">{selectedTransaction.block}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400">Tanggal Upload</span>
                                <span className="font-bold text-gray-900">{selectedTransaction.date}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400">Nominal Transfer</span>
                                <span className="font-bold text-[#006948] text-sm">{formatRupiah(selectedTransaction.amount)}</span>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => handleVerify(selectedTransaction.uuid)}
                                className="px-4 py-2 bg-[#006948] hover:bg-[#005137] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                                <Check className="w-4 h-4" /> Konfirmasi Diverifikasi
                            </button>
                        </div>

                    </div>
                </div>
            )}
            <Footer />
        </Sidebar>
    );
}