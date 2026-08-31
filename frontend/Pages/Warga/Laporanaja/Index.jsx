import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import LaporanCard from '@/Components/Laporan/LaporanCard';
import LaporanForm from '@/Components/Laporan/LaporanForm';
import Pagination from '@/Components/Pagination';
import ModalCard from '@/Components/ModalCard';
import Footer from '@/Components/Footer';

export default function LaporanIndex({ auth, laporans, stats, filters, canManage, recentNews }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // State untuk kontrol ModalCard Hapus Laporan
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const routePrefix = auth.user.role === 'ketua_rt' ? 'ketuart' : auth.user.role;
    
    const categories = ['Semua', 'Keamanan', 'Infrastruktur', 'Sosial', 'Kebersihan', 'Keuangan'];
    
    const statusOptions = [
        { key: 'semua', label: 'Semua Status' },
        { key: 'pending', label: 'Pending' },
        { key: 'diproses', label: 'Diproses' },
        { key: 'selesai', label: 'Selesai' },
        { key: 'ditolak', label: 'Ditolak' },
    ];

    const currentKategori = filters?.kategori || 'semua';
    const currentStatus = filters?.status || 'semua';

    const handleFilter = (kategori, status = currentStatus) => {
        const katValue = kategori.toLowerCase() === 'semua' ? 'semua' : kategori.toLowerCase();
        const statValue = status.toLowerCase() === 'semua' ? 'semua' : status.toLowerCase();

        router.get(route(`${routePrefix}.laporan.index`), { 
            kategori: katValue, 
            status: statValue 
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStatusFilter = (statusKey) => {
        handleFilter(currentKategori, statusKey);
    };

    // Fungsi untuk membuka modal hapus
    const openDeleteModal = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    // Fungsi eksekusi hapus setelah dikonfirmasi di ModalCard
    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        router.delete(route(`${routePrefix}.laporan.destroy`, deleteModal.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal({ isOpen: false, id: null });
            }
        });
    };

    const laporansLinks = laporans?.links || null;

    useEffect(() => {
        if (recentNews && recentNews.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % recentNews.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [recentNews]);

    // BARU: Polling auto-refresh data laporan (termasuk komentar/chat)
    // supaya balasan baru dari staff/warga muncul tanpa perlu refresh manual.
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['laporans'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Sidebar currentRole={auth.user.role} activeMenu="laporan">
            <Head title="Laporan & Aduan Warga" />

            <div className="py-8 font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Atas */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Laporan & Aduan Warga</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Suarakan aspirasi dan laporkan kendala di lingkungan RT 05.</p>
                        </div>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="bg-[#0D7A57] text-white px-5 py-2.5 rounded-xl hover:bg-[#0A6145] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm w-full sm:w-auto justify-center cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                            <span>Buat Laporan Baru</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* KOLOM KIRI */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Kotak Statistik */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-base font-bold text-gray-900 mb-5 leading-tight">Statistik Laporan<br/>Anda</h3>
                                <div className="flex justify-between items-center text-center">
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-[#0D7A57]">{stats?.total || 0}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-bold">TOTAL</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.proses || 0}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-bold">PROSES</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">{stats?.selesai || 0}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-bold">SELESAI</div>
                                    </div>
                                </div>
                            </div>

                            {/* KOTAK BANNER */}
                            <div className="rounded-3xl shadow-sm text-white relative overflow-hidden h-48 bg-gradient-to-br from-[#10b981] to-[#0D7A57] group">
                                {recentNews && recentNews.length > 0 ? (
                                    <>
                                        <div 
                                            className="flex transition-transform duration-700 ease-in-out h-full"
                                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                        >
                                            {recentNews.map((news) => (
                                                <div 
                                                    key={news.id} 
                                                    onClick={() => router.get(route(`${routePrefix}.news.show`, news.id))}
                                                    className="w-full flex-shrink-0 h-full p-6 flex flex-col justify-end cursor-pointer relative bg-cover bg-center"
                                                    style={{ 
                                                        backgroundImage: news.thumbnail ? `url(/storage/${news.thumbnail})` : 'none' 
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    <div className="relative z-10 w-full">
                                                        <h3 className="text-base font-bold mb-1 leading-tight line-clamp-2 pr-4 drop-shadow-md">
                                                            {news.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-100 leading-relaxed line-clamp-2 pr-4 drop-shadow">
                                                            {news.content ? news.content.replace(/(<([^>]+)>)/gi, "") : ''}
                                                        </p>
                                                        <div className="mt-2.5 inline-block bg-[#0D7A57]/90 text-white px-2.5 py-0.5 rounded-lg text-[9px] font-bold tracking-wider uppercase shadow-sm border border-emerald-400/30">
                                                            Info Terbaru
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {recentNews.length > 1 && (
                                            <div className="absolute bottom-5 right-5 flex space-x-1.5 z-20">
                                                {recentNews.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentSlide(index);
                                                        }}
                                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                            currentSlide === index ? 'w-4 bg-white shadow' : 'w-1.5 bg-white/50 hover:bg-white/80'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-6 h-full flex flex-col justify-end bg-gradient-to-br from-[#10b981] to-[#0D7A57]">
                                        <div className="relative z-10 w-full">
                                            <h3 className="text-lg font-bold mb-1">Gotong Royong<br/>Digital</h3>
                                            <p className="text-xs opacity-90 leading-relaxed">Partisipasi aktif Anda membangun lingkungan yang lebih baik.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KOLOM KANAN */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-base font-bold text-gray-900">Riwayat Laporan</h3>
                                
                                <div className="flex flex-col gap-2 w-full sm:w-auto items-end">
                                    {/* Filter Kategori */}
                                    <div className="flex space-x-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-hide">
                                        {categories.map((cat) => {
                                            const isSemua = cat.toLowerCase() === 'semua';
                                            const catValue = isSemua ? 'semua' : cat.toLowerCase();
                                            const isActive = currentKategori === catValue;

                                            return (
                                                <button 
                                                    key={cat}
                                                    onClick={() => handleFilter(cat, currentStatus)}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

                                    {/* Filter Status */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto justify-start sm:justify-end">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
                                        {statusOptions.map((st) => (
                                            <button
                                                key={st.key}
                                                onClick={() => handleStatusFilter(st.key)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                                    currentStatus === st.key
                                                        ? 'bg-slate-800 text-white shadow-xs'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {st.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {laporans?.data?.length > 0 ? (
                                    laporans.data.map((laporan) => (
                                        <LaporanCard 
                                            key={laporan.id} 
                                            laporan={laporan} 
                                            canManage={canManage}
                                            routePrefix={routePrefix}
                                            auth={auth}
                                            onDelete={() => openDeleteModal(laporan.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs shadow-sm">
                                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Tidak ada laporan yang sesuai dengan filter.
                                    </div>
                                )}
                            </div>

                            {/* Navigasi Pagination Terpusat */}
                            {laporansLinks && laporansLinks.length > 3 && (
                                <div className="pt-2 flex justify-center">
                                    <Pagination links={laporansLinks} />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Formulir Pengaduan Warga */}
            {isFormOpen && <LaporanForm onClose={() => setIsFormOpen(false)} routePrefix={routePrefix} />}

            {/* ModalCard Kustom Pengganti window.confirm */}
            <ModalCard
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Hapus Laporan Warga"
                message="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                processing={isDeleting}
            />
            <Footer />
        </Sidebar>
    );
}