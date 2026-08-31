import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import { 
    Bell, 
    Wallet, 
    FileText, 
    AlertTriangle, 
    CheckCheck, 
    Clock, 
    ShieldCheck,
    ExternalLink
} from 'lucide-react';
import Footer from '@/Components/Footer';

export default function Index({ notifications, unreadCounts, category }) {
    
    const { auth } = usePage().props;
    const userRole = auth?.user?.role || 'warga';

    const routePrefix = userRole === 'ketua_rt' ? 'ketuart' : userRole;

    const safeUnreadCounts = unreadCounts || {};
    const totalUnreadAll = Object.values(safeUnreadCounts).reduce((a, b) => a + (Number(b) || 0), 0);

    const formatTanggalJam = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;

        const tanggal = date.toISOString().split('T')[0];
        const jam = date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });
        
        return `${tanggal} • ${jam}`;
    };

    const handleCategoryChange = (selectedCategory) => {
        router.get(
            route(`${routePrefix}.notifikasi.index`), 
            { category: selectedCategory }, 
            { preserveState: true, replace: true }
        );
    };

    const handleMarkAllAsRead = () => {
        router.post(route(`${routePrefix}.notifikasi.baca-semua`), {}, {
            preserveScroll: true
        });
    };

    const handleNotificationClick = (item) => {
        if (!item.read_at) {
            router.post(route(`${routePrefix}.notifikasi.baca`, item.id), {}, {
                preserveScroll: true
            });
        }
    };

    // Mark-as-read dulu (tunggu selesai), baru navigasi manual ke url tombol aksi.
    // Ini nyegah dua visit Inertia jalan bareng (yang bikin salah satu ke-cancel).
    const handleActionClick = (e, item, url) => {
        e.preventDefault();
        e.stopPropagation();

        if (!item.read_at) {
            router.post(route(`${routePrefix}.notifikasi.baca`, item.id), {}, {
                preserveScroll: true,
                onFinish: () => {
                    if (url && url !== '#') {
                        router.visit(url);
                    }
                }
            });
        } else if (url && url !== '#') {
            router.visit(url);
        }
    };

    const getCategoryDetails = (cat) => {
        const normalizedCat = (cat || '').toLowerCase();

        switch (normalizedCat) {
            case 'keuangan':
            case 'keuangan/ iuran rt':
                return { 
                    label: 'Keuangan', 
                    icon: <Wallet className="w-5 h-5 text-emerald-600" />, 
                    bg: 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                };
            case 'berita':
                return { 
                    label: 'Berita', 
                    icon: <FileText className="w-5 h-5 text-sky-600" />, 
                    bg: 'bg-sky-50 border-sky-100 text-sky-700' 
                };
            case 'laporan':
                return { 
                    label: 'Laporan', 
                    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />, 
                    bg: 'bg-amber-50 border-amber-100 text-amber-700' 
                };
            case 'infrastruktur':
                return { 
                    label: 'Infrastruktur', 
                    icon: <AlertTriangle className="w-5 h-5 text-blue-600" />, 
                    bg: 'bg-blue-50 border-blue-100 text-blue-700' 
                };
            case 'keamanan':
                return { 
                    label: 'Keamanan', 
                    icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, 
                    bg: 'bg-rose-50 border-rose-100 text-rose-700' 
                };
            case 'sosial':
                return { 
                    label: 'Sosial', 
                    icon: <AlertTriangle className="w-5 h-5 text-purple-600" />, 
                    bg: 'bg-purple-50 border-purple-100 text-purple-700' 
                };
            case 'kebersihan':
                return { 
                    label: 'Kebersihan', 
                    icon: <AlertTriangle className="w-5 h-5 text-teal-600" />, 
                    bg: 'bg-teal-50 border-teal-100 text-teal-700' 
                };
            case 'lainnya':
                return { 
                    label: 'Lainnya', 
                    icon: <AlertTriangle className="w-5 h-5 text-gray-600" />, 
                    bg: 'bg-gray-50 border-gray-100 text-gray-700' 
                };
            default:
                return { 
                    label: cat ? cat.toUpperCase() : 'Sistem', 
                    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />, 
                    bg: 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                };
        }
    };

    const notificationList = notifications?.data || [];

    return (
        <Sidebar currentRole={userRole} activeMenu="notifications">
            <Head title="Pusat Notifikasi - Siwarga05" />

            <div className="max-w-5xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 border-b border-gray-100 pb-6">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">Pusat Notifikasi</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Pantau informasi terbaru, tagihan iuran, dan pengumuman penting lingkungan RT 05.
                        </p>
                    </div>
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0a6144] text-white text-xs font-bold rounded-xl shadow-sm transition-all gap-2 cursor-pointer shrink-0"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Tandai Semua Dibaca
                    </button>
                </div>

                {/* Tab Kategori / Filter Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    
                    <button
                        onClick={() => handleCategoryChange('semua')}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 sm:h-28 cursor-pointer shadow-sm ${
                            category === 'semua'
                                ? 'bg-[#0D7A57] border-[#0D7A57] text-white shadow-emerald-900/10'
                                : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className={`p-2 sm:p-2.5 rounded-xl ${category === 'semua' ? 'bg-[#0a6144] text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {totalUnreadAll > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                    category === 'semua' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {totalUnreadAll} Baru
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Semua Notifikasi</span>
                    </button>

                    <button
                        onClick={() => handleCategoryChange('keuangan')}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 sm:h-28 cursor-pointer shadow-sm ${
                            category === 'keuangan'
                                ? 'bg-[#0D7A57] border-[#0D7A57] text-white shadow-emerald-900/10'
                                : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className={`p-2 sm:p-2.5 rounded-xl ${category === 'keuangan' ? 'bg-[#0a6144] text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {safeUnreadCounts['keuangan'] > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                    category === 'keuangan' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {safeUnreadCounts['keuangan']} Baru
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Keuangan & Iuran</span>
                    </button>

                    <button
                        onClick={() => handleCategoryChange('berita')}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 sm:h-28 cursor-pointer shadow-sm ${
                            category === 'berita'
                                ? 'bg-[#0D7A57] border-[#0D7A57] text-white shadow-emerald-900/10'
                                : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className={`p-2 sm:p-2.5 rounded-xl ${category === 'berita' ? 'bg-[#0a6144] text-white' : 'bg-sky-50 text-sky-600'}`}>
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {safeUnreadCounts['berita'] > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                    category === 'berita' ? 'bg-white text-emerald-900' : 'bg-sky-100 text-sky-800'
                                }`}>
                                    {safeUnreadCounts['berita']} Baru
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Berita & Info</span>
                    </button>

                    <button
                        onClick={() => handleCategoryChange('laporan')}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 sm:h-28 cursor-pointer shadow-sm ${
                            category === 'laporan'
                                ? 'bg-[#0D7A57] border-[#0D7A57] text-white shadow-emerald-900/10'
                                : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
                        }`}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className={`p-2 sm:p-2.5 rounded-xl ${category === 'laporan' ? 'bg-[#0a6144] text-white' : 'bg-amber-50 text-amber-600'}`}>
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            {safeUnreadCounts['laporan'] > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                    category === 'laporan' ? 'bg-white text-emerald-900' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {safeUnreadCounts['laporan']} Baru
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Laporan Warga</span>
                    </button>

                </div>

                {/* List Notifikasi */}
                <div className="space-y-4">
                    {notificationList.length > 0 ? (
                        notificationList.map((item) => {
                            const details = getCategoryDetails(item.category);
                            const isUnread = !item.read_at;
                            const isPaymentRejected = item.title === 'Pembayaran Ditolak';

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleNotificationClick(item)}
                                    className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-sm transition-all relative flex items-start gap-3 sm:gap-4 cursor-pointer hover:shadow-md ${
                                        isUnread ? 'border-l-4 border-l-[#0D7A57] border-gray-200 bg-emerald-50/10' : 'border-gray-100'
                                    }`}
                                >
                                    <div className={`p-2.5 sm:p-3 rounded-xl border ${details.bg} shrink-0 mt-0.5`}>
                                        {details.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-full">
                                                    {item.title}
                                                </h2>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${details.bg} uppercase tracking-wider shrink-0`}>
                                                    {details.label}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatTanggalJam(item.created_at)}
                                                </span>
                                                {isUnread && (
                                                    <span className="w-2 h-2 bg-[#0D7A57] rounded-full shrink-0"></span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 leading-relaxed mb-4 break-words">
                                            {item.message}
                                        </p>

                                        {/* TOMBOL AKSI: navigasi ditunda sampe mark-as-read kelar (cegah race dua visit Inertia) */}
                                        {((item.actions && Array.isArray(item.actions) && item.actions.length > 0) || isPaymentRejected) && (
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                                                {item.actions && item.actions.length > 0 ? (
                                                    item.actions.map((action, idx) => (
                                                        <Link
                                                            key={idx}
                                                            href={action.url || '#'}
                                                            onClick={(e) => handleActionClick(e, item, action.url)}
                                                            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                                                                action.primary 
                                                                    ? 'bg-[#0D7A57] hover:bg-[#0a6144] text-white shadow-sm' 
                                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {action.label}
                                                            {action.primary && <ExternalLink className="w-3 h-3" />}
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={route(`${routePrefix}.dues.index`)}
                                                            onClick={(e) => handleActionClick(e, item, route(`${routePrefix}.dues.index`))}
                                                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                                                        >
                                                            Bayar Ulang
                                                        </Link>
                                                        <Link
                                                            href={route(`${routePrefix}.dues.success`, item.notifiable_id)}
                                                            onClick={(e) => handleActionClick(e, item, route(`${routePrefix}.dues.success`, item.notifiable_id))}
                                                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                                                        >
                                                            Lihat Detail
                                                        </Link>
                                                        <Link
                                                            href={route(`${routePrefix}.dues.payment-form`)}
                                                            onClick={(e) => handleActionClick(e, item, route(`${routePrefix}.dues.payment-form`))}
                                                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0D7A57] hover:bg-[#0a6144] text-white shadow-sm transition-colors inline-flex items-center gap-1.5"
                                                        >
                                                            Upload Ulang Bukti Pembayaran
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
                            <p className="text-gray-800 font-bold text-base">Belum Ada Notifikasi</p>
                            <p className="text-gray-400 text-xs mt-1">Anda tidak memiliki pesan atau pemberitahuan pada kategori ini saat ini.</p>
                        </div>
                    )}
                </div>

                {notifications?.links && notifications.links.length > 3 && (
                    <div className="mt-8 overflow-x-auto pb-2">
                        <Pagination links={notifications.links} />
                    </div>
                )}

            </div>
            <Footer />
        </Sidebar>
    );
}