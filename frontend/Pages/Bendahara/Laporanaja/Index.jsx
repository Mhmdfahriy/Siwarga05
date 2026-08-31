import React, { useMemo, useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import ModalCard from '@/Components/ModalCard';
import Footer from '@/Components/Footer';

const STATUS_STYLES = {
    pending: { label: 'Pending', dot: 'bg-gray-400', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700', bar: 'bg-gray-300' },
    diproses: { label: 'Diproses', dot: 'bg-[#0D7A57]', text: 'text-[#0D7A57]', badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-[#0D7A57]' },
    selesai: { label: 'Selesai', dot: 'bg-slate-400', text: 'text-slate-500', badge: 'bg-slate-100 text-slate-500', bar: 'bg-slate-300' },
    ditolak: { label: 'Ditolak', dot: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-50 text-red-600', bar: 'bg-red-400' },
};

const CATEGORY_STYLES = {
    keamanan: { badge: 'bg-red-100 text-red-700' },
    infrastruktur: { badge: 'bg-amber-100 text-amber-800' },
    sosial: { badge: 'bg-blue-100 text-blue-800' },
    kebersihan: { badge: 'bg-emerald-100 text-emerald-800' },
    keuangan: { badge: 'bg-purple-100 text-purple-800' },
    umum: { badge: 'bg-gray-100 text-gray-800' },
};

function statusStyle(status) {
    return STATUS_STYLES[status] || STATUS_STYLES.pending;
}

function categoryStyle(kategori = '') {
    const key = kategori.toLowerCase().trim();
    return CATEGORY_STYLES[key] || { badge: 'bg-emerald-50 text-emerald-700 font-bold' };
}

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('') || '?';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export default function BendaharaLaporanIndex({ auth, laporans, stats, filters, recentNews }) {
    const items = laporans?.data || [];
    const [activeLaporan, setActiveLaporan] = useState(items.length > 0 ? items[0] : null);
    const [search, setSearch] = useState('');
    
    const [statusFilter, setStatusFilter] = useState('semua');
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        onConfirm: () => {}
    });

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [previousStatus, setPreviousStatus] = useState(null);

    const commentForm = useForm({
        pesan: '',
    });

    const rejectForm = useForm({
        status: 'ditolak',
        alasan: '',
    });

    // PREFIX RUTE KHUSUS BENDAHARA
    const routePrefix = 'bendahara';

    // Listener Echo untuk chat real-time via Laravel Reverb
    useEffect(() => {
        if (!activeLaporan) return;

        const channelName = `laporan.${activeLaporan.id}`;

        if (window.Echo) {
            window.Echo.private(channelName)
                .listen('.Komentar.Dikirim', (e) => {
                    setActiveLaporan((prev) => {
                        if (!prev) return prev;
                        const existing = prev.komentars || [];
                        if (existing.find((k) => k.id === e.komentar.id)) return prev;
                        return {
                            ...prev,
                            komentars: [...existing, e.komentar],
                        };
                    });
                });
        }

        return () => {
            if (window.Echo) {
                window.Echo.leave(channelName);
            }
        };
    }, [activeLaporan?.id]);

    const filteredItems = useMemo(() => {
        let result = items;

        if (statusFilter !== 'semua') {
            result = result.filter((l) => l.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((l) =>
                l.judul?.toLowerCase().includes(q) || l.user?.name?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [items, search, statusFilter]);

    const totalLaporan = stats?.total ?? items.length;
    const pendingCount = stats?.pending ?? items.filter((l) => l.status === 'pending').length;
    const diprosesCount = stats?.diproses ?? items.filter((l) => l.status === 'diproses').length;
    const selesaiCount = stats?.selesai ?? items.filter((l) => l.status === 'selesai').length;

    const laporansLinks = laporans?.links || null;

    const handleFilter = (kategori) => {
        const value = kategori.toLowerCase() === 'semua' ? 'semua' : kategori.toLowerCase();
        router.get(route(`${routePrefix}.laporan.index`), { kategori: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const submitKomentar = (e) => {
        e.preventDefault();
        if (!activeLaporan || !commentForm.data.pesan.trim()) return;

        const pesanBaru = commentForm.data.pesan;

        commentForm.post(route(`${routePrefix}.laporan.komentar`, activeLaporan.id), {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset('pesan');
                
                const newKomentarObj = {
                    id: Date.now(),
                    user_id: auth.user.id,
                    pesan: pesanBaru,
                    created_at: new Date().toISOString(),
                };

                setActiveLaporan(prev => ({
                    ...prev,
                    komentars: [...(prev.komentars || []), newKomentarObj]
                }));
            },
        });
    };

    const handleStatusChange = (newStatus) => {
        if (!activeLaporan) return;

        if (newStatus === 'ditolak') {
            setPreviousStatus(activeLaporan.status); 
            setActiveLaporan({ ...activeLaporan, status: 'ditolak' }); 
            rejectForm.setData('alasan', '');
            rejectForm.clearErrors();
            setIsRejectModalOpen(true);
            return;
        }

        const oldStatus = activeLaporan.status;
        setActiveLaporan({ ...activeLaporan, status: newStatus });

        router.patch(route(`${routePrefix}.laporan.status`, activeLaporan.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.errors && Object.keys(page.props.errors).length > 0) {
                    setActiveLaporan({ ...activeLaporan, status: oldStatus });
                    
                    setModalConfig({
                        isOpen: true,
                        title: 'Akses Ditolak',
                        message: page.props.errors.status || 'Gagal memperbarui status.',
                        type: 'error',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                } else {
                    setModalConfig({
                        isOpen: true,
                        title: 'Status Diperbarui',
                        message: `Status laporan berhasil diubah menjadi ${newStatus.toUpperCase()}.`,
                        type: 'success',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                }
            },
            onError: (errors) => {
                setActiveLaporan({ ...activeLaporan, status: oldStatus });
                setModalConfig({
                    isOpen: true,
                    title: 'Gagal Memperbarui',
                    message: errors.status || 'Terjadi kesalahan saat memproses permintaan.',
                    type: 'error',
                    onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        });
    };

    const confirmReject = (e) => {
        e.preventDefault();
        rejectForm.patch(route(`${routePrefix}.laporan.status`, activeLaporan.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.errors && Object.keys(page.props.errors).length > 0) {
                    setIsRejectModalOpen(false);
                    setActiveLaporan({ ...activeLaporan, status: previousStatus });
                    setModalConfig({
                        isOpen: true,
                        title: 'Akses Ditolak',
                        message: page.props.errors.status || 'Gagal menolak laporan.',
                        type: 'error',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                } else {
                    setIsRejectModalOpen(false);
                    setActiveLaporan(prev => ({ ...prev, alasan_penolakan: rejectForm.data.alasan }));
                    rejectForm.reset();
                    setModalConfig({
                        isOpen: true,
                        title: 'Laporan Ditolak',
                        message: 'Laporan berhasil ditolak dan warga akan menerima notifikasi beserta alasannya.',
                        type: 'success',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const cancelReject = () => {
        setIsRejectModalOpen(false);
        setActiveLaporan({ ...activeLaporan, status: previousStatus }); 
    };

    // Sesuaikan kategori untuk keperluan tampilan
    const categories = ['Semua', 'Keuangan', 'Keamanan', 'Infrastruktur', 'Sosial', 'Kebersihan', 'Umum'];
    const statusOptions = [
        { key: 'semua', label: 'Semua Status' },
        { key: 'pending', label: 'Pending' },
        { key: 'diproses', label: 'Diproses' },
        { key: 'selesai', label: 'Selesai' },
        { key: 'ditolak', label: 'Ditolak' },
    ];

    return (
        <Sidebar currentRole={auth.user.role} activeMenu="laporan">
            <Head title="Kelola Laporan & Aduan Warga" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Atas */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Kelola Laporan Warga</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Tinjau, tanggapi, dan perbarui status aduan dari lingkungan RT 05.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                                {/* PREFIX KHUSUS BENDAHARA */}
                                <NotifikasiBell prefix="bendahara" />
                            </div>
                        </div>
                    </div>

                    {/* Filter Tab Kategori + Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide w-full sm:w-auto">
                            {categories.map((cat) => {
                                const isSemua = cat.toLowerCase() === 'semua';
                                const catValue = isSemua ? 'semua' : cat.toLowerCase();
                                const isActive = filters?.kategori === catValue || (!filters?.kategori && isSemua);

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleFilter(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                            isActive
                                                ? 'bg-[#0D7A57] text-white shadow-xs'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"></path></svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari laporan atau nama warga..."
                                className="w-full bg-white border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-3 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Filter Berdasarkan Status */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-bold text-gray-400 mr-1 uppercase tracking-wider">Status:</span>
                        {statusOptions.map((st) => (
                            <button
                                key={st.key}
                                onClick={() => setStatusFilter(st.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    statusFilter === st.key
                                        ? 'bg-slate-800 text-white shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid Utama */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* KOLOM KIRI: Statistik */}
                        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Statistik Laporan</h3>
                                
                                <div className="flex justify-between items-center text-xs py-1">
                                    <span className="text-gray-500 font-medium">Total Laporan</span>
                                    <span className="text-sm font-bold text-gray-900">{totalLaporan}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs py-1 px-3 rounded-xl bg-red-50/80 border border-red-100 my-1">
                                    <span className="font-bold text-red-600">Belum Diproses</span>
                                    <span className="text-sm font-bold text-red-600">{pendingCount}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs py-1">
                                    <span className="text-gray-500 font-medium">Diproses</span>
                                    <span className="text-sm font-bold text-gray-900">{diprosesCount}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs py-1">
                                    <span className="text-gray-400 font-medium">Selesai</span>
                                    <span className="text-sm font-bold text-gray-400">{selesaiCount}</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#10b981] to-[#0D7A57] p-5 sm:p-6 rounded-3xl shadow-sm text-white relative overflow-hidden space-y-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <h4 className="font-bold text-xs uppercase tracking-wider">Administrasi Keuangan</h4>
                                </div>
                                <p className="text-xs text-emerald-50 leading-relaxed">
                                    Pantau dan kelola aduan warga khusus yang berkaitan dengan transparansi, iuran, dan masalah keuangan lingkungan.
                                </p>
                            </div>
                        </div>

                        {/* KOLOM KANAN / DETAIL UTAMA */}
                        <div className="lg:col-span-5 order-1 lg:order-2">
                            {activeLaporan ? (
                                <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 relative">

                                    <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 leading-tight">{activeLaporan.judul}</h3>
                                            <p className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-1.5">
                                                Oleh <span className="font-bold text-gray-800">{activeLaporan.user?.name || 'Warga'}</span>
                                                {activeLaporan.user?.blok ? ` (${activeLaporan.user.blok})` : ''}
                                                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                                                    {activeLaporan.kategori || 'Umum'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tombol Buka / Tutup Diskusi (Collapse Toggle) */}
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="text-xs text-gray-500 font-medium">
                                            {activeLaporan.komentars?.length > 0 ? `${activeLaporan.komentars.length} balasan dalam diskusi` : 'Belum ada balasan'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsChatOpen(!isChatOpen)}
                                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${isChatOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                            <span>{isChatOpen ? 'Tutup Diskusi' : 'Buka Diskusi'}</span>
                                        </button>
                                    </div>

                                    {/* Area Kotak Diskusi (Live Chat Collapse) */}
                                    {isChatOpen && (
                                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs animate-fadeIn">
                                            <div className="bg-white px-4 pt-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                                                <p className="text-xs font-bold text-gray-500">Interaksi Petugas &amp; Warga</p>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">Live Chat</span>
                                            </div>
                                            <div className="bg-slate-50/70 p-4 space-y-4">
                                                <div className="space-y-3 max-h-72 overflow-y-auto px-1">
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs border border-blue-100 text-[10px] font-bold">
                                                            {initials(activeLaporan.user?.name)}
                                                        </div>
                                                        <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-xs border border-gray-100 text-xs text-gray-800 space-y-2 w-full">
                                                            <p className="leading-relaxed">
                                                                {activeLaporan.deskripsi || 'Warga belum menuliskan deskripsi untuk laporan ini.'}
                                                            </p>

                                                            {activeLaporan.foto && (
                                                                <div className="mt-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 max-w-xs">
                                                                    <img 
                                                                        src={`/storage/${activeLaporan.foto}`} 
                                                                        alt="Bukti Foto Laporan" 
                                                                        className="w-full h-auto object-cover max-h-56 cursor-pointer hover:opacity-95 transition-opacity"
                                                                        onClick={() => window.open(`/storage/${activeLaporan.foto}`, '_blank')}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="text-[9px] text-gray-400 text-right">
                                                                {formatTime(activeLaporan.created_at)} WIB
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {activeLaporan.status === 'ditolak' && activeLaporan.alasan_penolakan && (
                                                        <div className="ml-11 mr-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                                            </svg>
                                                            <div>
                                                                <span className="font-bold">Alasan Penolakan:</span> {activeLaporan.alasan_penolakan}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activeLaporan.komentars?.map((komentar) => {
                                                        const isMine = komentar.user_id === auth.user.id;
                                                        return (
                                                            <div key={komentar.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`p-3.5 rounded-2xl shadow-xs border text-xs max-w-[85%] space-y-1 ${
                                                                    isMine ? 'bg-[#0D7A57] text-white border-[#0D7A57]' : 'bg-white text-gray-800 border-gray-100'
                                                                }`}>
                                                                    <p className="leading-relaxed">{komentar.pesan}</p>
                                                                    <div className={`text-[9px] text-right ${isMine ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                                        {formatTime(komentar.created_at)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* FORM CHAT: Otomatis tertutup jika status selesai atau ditolak */}
                                                {activeLaporan.status !== 'selesai' && activeLaporan.status !== 'ditolak' ? (
                                                    <form onSubmit={submitKomentar} className="relative flex items-center bg-white border border-gray-200 rounded-full py-1 px-4 shadow-xs focus-within:ring-1 focus-within:ring-[#0D7A57] focus-within:border-[#0D7A57]">
                                                        <input
                                                            type="text"
                                                            placeholder="Tulis balasan..."
                                                            value={commentForm.data.pesan}
                                                            onChange={(e) => commentForm.setData('pesan', e.target.value)}
                                                            className="w-full bg-transparent border-none text-xs focus:ring-0 focus:outline-none py-2.5"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={commentForm.processing || !commentForm.data.pesan.trim()}
                                                            className="bg-[#0D7A57] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#0A6145] transition-colors cursor-pointer shadow-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                        >
                                                            {commentForm.processing ? 'Mengirim...' : 'Balas'}
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="p-3 text-center bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                                                        Diskusi ditutup karena laporan telah berstatus <span className="uppercase font-bold">{activeLaporan.status}</span>.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {/* REAL-TIME LOCK CHECK */}
                                            {activeLaporan.can_update && !(['selesai', 'ditolak'].includes(activeLaporan.status) && !activeLaporan.is_ketua_rt) ? (
                                                <>
                                                    <label htmlFor="status-select" className="text-xs font-bold text-gray-500 whitespace-nowrap">Ubah Status:</label>
                                                    <select
                                                        id="status-select"
                                                        value={activeLaporan.status || 'pending'}
                                                        onChange={(e) => handleStatusChange(e.target.value)}
                                                        className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 py-2.5 px-3 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] cursor-pointer outline-none shadow-xs"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="diproses">Diproses</option>
                                                        <option value="selesai">Selesai</option>
                                                        <option value="ditolak">Ditolak</option>
                                                    </select>
                                                </>
                                            ) : (
                                                <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-xs border ${statusStyle(activeLaporan.status).badge}`}>
                                                    Status: {statusStyle(activeLaporan.status).label}
                                                    {['selesai', 'ditolak'].includes(activeLaporan.status) && !activeLaporan.is_ketua_rt && (
                                                        <span className="ml-2 text-[10px] text-gray-500 font-normal">(Terkunci)</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tombol Tandai Selesai */}
                                        {activeLaporan.can_update && !(['selesai', 'ditolak'].includes(activeLaporan.status) && !activeLaporan.is_ketua_rt) && (
                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange('selesai')}
                                                disabled={activeLaporan.status === 'selesai'}
                                                className="w-full sm:w-auto bg-[#0D7A57] hover:bg-[#0A6145] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                <span>{activeLaporan.status === 'selesai' ? 'Sudah Selesai' : 'Tandai Selesai'}</span>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            ) : (
                                <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 text-gray-400 text-xs shadow-sm">
                                    Pilih salah satu laporan di daftar untuk melihat detail.
                                </div>
                            )}
                        </div>

                        {/* KOLOM TENGAH: Daftar Laporan */}
                        <div className="lg:col-span-4 space-y-4 order-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Daftar Laporan ({filteredItems.length})
                            </div>

                            <div className="space-y-3">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((laporan) => {
                                        const isSelected = activeLaporan?.id === laporan.id;
                                        const sStyle = statusStyle(laporan.status);
                                        const catStyle = categoryStyle(laporan.kategori);
                                        return (
                                            <button
                                                key={laporan.id}
                                                onClick={() => setActiveLaporan(laporan)}
                                                className={`w-full text-left bg-white p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden focus:outline-none shadow-xs ${
                                                    isSelected ? 'border-[#0D7A57] ring-1 ring-[#0D7A57]' : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${sStyle.bar}`}></div>

                                                <div className="flex justify-between items-center mb-2 pl-1.5">
                                                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg ${catStyle.badge}`}>
                                                        {laporan.kategori || 'Umum'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {formatDate(laporan.created_at)}
                                                    </span>
                                                </div>

                                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug mb-1 pl-1.5 line-clamp-2">{laporan.judul}</h4>
                                                <p className="text-xs text-gray-500 mb-3 pl-1.5">{laporan.user?.name || 'Warga'}{laporan.user?.blok ? ` - ${laporan.user.blok}` : ''}</p>

                                                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider pl-1.5 ${sStyle.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sStyle.dot}`}></span>
                                                    {sStyle.label}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-2 shadow-xs">
                                        <svg className="w-10 h-10 text-gray-300 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <p className="text-xs font-semibold text-gray-500">
                                            {search || statusFilter !== 'semua' ? 'Tidak ada laporan yang cocok dengan filter' : 'Belum ada laporan masuk'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {laporansLinks && laporansLinks.length > 3 && (
                                <div className="pt-2 flex justify-center">
                                    <Pagination links={laporansLinks} />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL FORM ALASAN PENOLAKAN */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-fadeIn">
                        <h3 className="text-base font-bold text-gray-900 mb-2">Alasan Penolakan Laporan</h3>
                        <p className="text-xs text-gray-500 mb-4">Silakan masukkan alasan mengapa laporan ini ditolak agar warga dapat memahaminya.</p>
                        
                        <form onSubmit={confirmReject}>
                            <textarea 
                                rows="3"
                                placeholder="Contoh: Lokasi tidak sesuai atau informasi kurang lengkap..."
                                value={rejectForm.data.alasan}
                                onChange={(e) => rejectForm.setData('alasan', e.target.value)}
                                className={`w-full text-xs p-3 border rounded-xl outline-none resize-none mb-1 ${
                                    rejectForm.errors.alasan ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                }`}
                            ></textarea>
                            {rejectForm.errors.alasan && (
                                <p className="text-[11px] text-rose-600 font-semibold mb-4">{rejectForm.errors.alasan}</p>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    type="button"
                                    onClick={cancelReject}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={rejectForm.processing}
                                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {rejectForm.processing ? 'Menyimpan...' : 'Konfirmasi Tolak'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ModalCard
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText="OK, Mengerti"
                cancelText=""
            />
            <Footer />
        </Sidebar>
    );
}