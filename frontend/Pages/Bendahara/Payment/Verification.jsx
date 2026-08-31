import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    Bell, 
    ClipboardList, 
    CheckCircle, 
    XCircle, 
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    ArrowLeft
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Verification({ user, payments, stats, filters, highlightId }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [activeFilter, setActiveFilter] = useState(filters?.status || '');

    // State Modals
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [activeProofUrl, setActiveProofUrl] = useState(null);

    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyingId, setVerifyingId] = useState(null);
    const [verifyProcessing, setVerifyProcessing] = useState(false);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectProcessing, setRejectProcessing] = useState(false);

    // Highlight dari notifikasi
    const [activeHighlight, setActiveHighlight] = useState(highlightId || null);
    const highlightRef = useRef(null);

    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    // Scroll otomatis ke payment yang di-highlight saat halaman dimuat/berganti data
    useEffect(() => {
        if (activeHighlight && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Hilangkan efek highlight setelah beberapa detik biar tidak mengganggu terus-terusan
            const timer = setTimeout(() => setActiveHighlight(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [activeHighlight, payments]);

    // Fungsi Request ke Controller via Inertia
    const applyFilters = (newStatus = activeFilter, newSearch = searchQuery) => {
        router.get(route(`${prefix}.dues.verification`), { 
            status: newStatus, 
            search: newSearch 
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    // LIVE SEARCH DENGAN DEBOUNCE (Otomatis mencari saat diketik)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || '')) {
                applyFilters(activeFilter, searchQuery);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFilterClick = (statusValue) => {
        setActiveFilter(statusValue);
        applyFilters(statusValue, searchQuery);
    };

    // Fungsi Aksi Bukti
    const handleViewProof = (url) => {
        setActiveProofUrl(url);
        setIsProofModalOpen(true);
    };

    // Fungsi Aksi Terima/Verifikasi
    const handleVerifyClick = (id) => {
        setVerifyingId(id);
        setIsVerifyModalOpen(true);
    };

    const submitVerify = () => {
        if (!verifyingId) return;
        setVerifyProcessing(true);
        router.put(route(`${prefix}.dues.verify`, verifyingId), {}, {
            preserveScroll: true,
            onFinish: () => {
                setVerifyProcessing(false);
                setIsVerifyModalOpen(false);
                setVerifyingId(null);
            }
        });
    };

    // Fungsi Aksi Tolak
    const handleRejectClick = (id) => {
        setRejectingId(id);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const submitReject = (reason) => {
        if (!rejectingId) return;
        setRejectProcessing(true);
        router.put(route(`${prefix}.dues.reject`, rejectingId), { rejection_reason: reason }, {
            preserveScroll: true,
            onFinish: () => {
                setRejectProcessing(false);
                setIsRejectModalOpen(false);
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    const filterTabs = [
        { label: 'Semua', value: '' },
        { label: 'Menunggu', value: 'menunggu_verifikasi' },
        { label: 'Disetujui', value: 'diverifikasi' },
        { label: 'Ditolak', value: 'ditolak' }
    ];

    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <Head title="Verifikasi Pembayaran" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div className="flex items-center gap-3">
                            <Link 
                                href={route(`${prefix}.dues.index`)}
                                className="p-2.5 bg-white border border-gray-200 hover:bg-emerald-50 text-[#0D7A57] rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                                title="Kembali ke Manajemen Keuangan"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Verifikasi Pembayaran</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola dan setujui laporan pembayaran iuran warga.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama warga..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-2.5 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                                />
                            </div>

                            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                                <NotifikasiBell prefix={prefix} />
                            </div>
                        </div>
                    </div>

                    {/* KARTU STATISTIK */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D7A57]">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Menunggu Verifikasi</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#0D7A57] tracking-tight">{stats?.pending || 0}</h2>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Disetujui Hari Ini</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-cyan-700 tracking-tight">{stats?.approved || 0}</h2>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ditolak Hari Ini</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">{stats?.rejected || 0}</h2>
                            </div>
                        </div>
                    </div>

                    {/* FILTER PILIHAN STATUS */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleFilterClick(tab.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeFilter === tab.value 
                                    ? 'bg-[#0D7A57] text-white shadow-sm' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* DAFTAR TRANSAKSI */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {payments.data.length > 0 ? (
                                payments.data.map((payment) => {
                                    const initials = payment.resident_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                    const isPending = payment.status === 'menunggu_verifikasi';
                                    const isHighlighted = activeHighlight === payment.id;
                                    
                                    return (
                                        <div 
                                            key={payment.id} 
                                            ref={isHighlighted ? highlightRef : null}
                                            className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                                                isHighlighted 
                                                    ? 'bg-emerald-50 ring-2 ring-inset ring-[#0D7A57]' 
                                                    : 'hover:bg-gray-50/50'
                                            }`}
                                        >
                                            
                                            {/* Kiri: Avatar & Info Warga */}
                                            <div className="flex items-center gap-3.5 w-full md:w-1/3">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-[#0D7A57] font-bold flex items-center justify-center text-xs shadow-xs border border-emerald-100 shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                                                        {payment.resident_name}
                                                    </h3>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-medium">
                                                        <span>Blok {payment.block_number}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span>{payment.created_at}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Kanan: Nominal, Bukti & Status */}
                                            <div className="flex flex-row items-center justify-between md:justify-end gap-3 sm:gap-6 w-full md:w-2/3">
                                                
                                                {/* Nominal */}
                                                <div className="text-left md:text-right min-w-[110px]">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jumlah</p>
                                                    <p className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                                                        {formatRupiah(payment.total_amount)}
                                                    </p>
                                                </div>

                                                {/* Tombol Lihat Bukti */}
                                                <button 
                                                    onClick={() => handleViewProof(payment.proof_photo)}
                                                    className="shrink-0 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] flex items-center gap-1.5 transition text-xs font-bold cursor-pointer border border-emerald-100 shadow-xs"
                                                    title="Lihat Bukti Foto"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Bukti</span>
                                                </button>

                                                {/* Tombol Aksi / Badge Status */}
                                                <div className="min-w-[130px] flex justify-end">
                                                    {isPending ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button 
                                                                onClick={() => handleRejectClick(payment.id)}
                                                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-100"
                                                            >
                                                                Tolak
                                                            </button>
                                                            <button 
                                                                onClick={() => handleVerifyClick(payment.id)}
                                                                className="px-3 py-1.5 bg-[#0D7A57] text-white hover:bg-[#0A6145] font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                                                            >
                                                                Terima
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold inline-flex items-center justify-center w-full ${
                                                            payment.status === 'diverifikasi' || payment.status === 'lunas' 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                        }`}>
                                                            {payment.status_label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <ClipboardList className="w-10 h-10 text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-500 font-medium">Tidak ada data verifikasi yang ditemukan.</p>
                                    {searchQuery && <p className="text-[10px] text-gray-400 mt-1">Coba kata kunci pencarian yang lain.</p>}
                                </div>
                            )}
                        </div>

                        {/* PAGINASI MENGGUNAKAN KOMPONEN GLOBAL */}
                        {payments?.links && payments.links.length > 3 && (
                            <div className="py-4 px-4 bg-[#F4F6FC] border-t border-gray-100 flex justify-center">
                                <Pagination links={payments.links} />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* MODALS */}
            <ModalCard 
                isOpen={isProofModalOpen}
                onClose={() => setIsProofModalOpen(false)}
                title="Bukti Transfer Pembayaran"
                imageUrl={activeProofUrl}
                onConfirm={() => setIsProofModalOpen(false)}
                confirmText="Tutup"
                cancelText="" 
            />

            <ModalCard
                isOpen={isVerifyModalOpen}
                onClose={() => {
                    if (verifyProcessing) return;
                    setIsVerifyModalOpen(false);
                    setVerifyingId(null);
                }}
                title="Terima Pembayaran"
                message="Apakah Anda yakin ingin menyetujui dan memverifikasi pembayaran ini?"
                confirmText="Ya, Setujui"
                cancelText="Batal"
                processing={verifyProcessing}
                onConfirm={submitVerify}
            />

            <ModalCard
                isOpen={isRejectModalOpen}
                onClose={() => {
                    if (rejectProcessing) return;
                    setIsRejectModalOpen(false);
                    setRejectingId(null);
                    setRejectReason('');
                }}
                type="prompt"
                title="Tolak Pembayaran"
                message="Berikan alasan mengapa Anda menolak bukti transfer ini:"
                confirmText="Tolak Pembayaran"
                cancelText="Batal"
                inputValue={rejectReason}
                onInputChange={setRejectReason}
                inputPlaceholder="Contoh: Bukti transfer blur/tidak sesuai"
                processing={rejectProcessing}
                onConfirm={submitReject}
            />
            <Footer />
        </Sidebar>
    );
}