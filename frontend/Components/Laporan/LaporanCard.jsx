import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function LaporanCard({ laporan, routePrefix, auth, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // State lokal untuk status dropdown
    const [currentStatus, setCurrentStatus] = useState(laporan.status);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    // 1. TAMBAHAN: Buat state lokal khusus untuk menampung chat agar bisa ditambah secara real-time
    const [komentarList, setKomentarList] = useState(laporan.komentars || []);

    // 2. TAMBAHAN: Sinkronisasi jika ada data baru dari props bawaan Inertia (misal setelah kita sendiri yg submit)
    useEffect(() => {
        setKomentarList(laporan.komentars || []);
    }, [laporan.komentars]);

    // 3. TAMBAHAN: Mesin Penangkap (Listener) Reverb
    useEffect(() => {
        // Pastikan Echo sudah berjalan
        if (window.Echo) {
            // Dengarkan channel private yang spesifik untuk laporan ini
            window.Echo.private(`laporan.${laporan.id}`)
                // Gunakan titik di depan (.Komentar.Dikirim) karena kita pakai broadcastAs() di Laravel
                .listen('.Komentar.Dikirim', (e) => {
                    console.log('Ada komentar baru masuk:', e.komentar);
                    
                    // Masukkan komentar baru ke dalam list obrolan seketika tanpa refresh
                    setKomentarList((prevList) => {
                        // Mencegah duplikasi jika pesan sudah ada
                        if (prevList.find(k => k.id === e.komentar.id)) return prevList;
                        return [...prevList, e.komentar];
                    });
                });
        }

        // Bersihkan (tinggalkan ruang obrolan) jika komponen ditutup atau pindah halaman
        return () => {
            if (window.Echo) {
                window.Echo.leave(`laporan.${laporan.id}`);
            }
        };
    }, [laporan.id]);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        status: 'ditolak',
        alasan: '',
    });

    const commentForm = useForm({
        pesan: '',
    });

    const submitKomentar = (e) => {
        e.preventDefault();
        commentForm.post(route(`${routePrefix}.laporan.komentar`, laporan.id), {
            preserveScroll: true,
            preserveState: true, 
            onSuccess: () => commentForm.reset('pesan'),
        });
    };

    const handleStatusChange = (e) => {
        const selectedStatus = e.target.value;

        if (selectedStatus === 'ditolak') {
            setData('status', 'ditolak');
            setData('alasan', '');
            clearErrors();
            setIsRejectModalOpen(true);
            return;
        }

        setCurrentStatus(selectedStatus);
        router.patch(route(`${routePrefix}.laporan.status`, laporan.id), {
            status: selectedStatus,
            alasan: null
        }, { 
            preserveScroll: true,
            preserveState: true,
            onError: () => setCurrentStatus(laporan.status)
        });
    };

    const confirmReject = (e) => {
        e.preventDefault();
        patch(route(`${routePrefix}.laporan.status`, laporan.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setCurrentStatus('ditolak');
                reset('alasan');
            },
        });
    };

    const isDiproses = currentStatus === 'diproses';
    const cardBorderClass = isDiproses ? 'border-[#0D7A57] border-2 shadow-md' : 'border-gray-200 border shadow-sm';

    const badgeConfig = {
        pending: { style: 'bg-gray-100 text-gray-600', label: 'Pending' },
        diproses: { style: 'bg-emerald-100 text-emerald-800', label: 'Diproses' },
        selesai: { style: 'bg-[#0D7A57] text-white', label: 'Selesai' },
        ditolak: { style: 'bg-red-100 text-red-700', label: 'Ditolak' }
    };
    const currentBadge = badgeConfig[currentStatus] || badgeConfig['pending'];

    const formattedDate = new Date(laporan.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();

    const isMyReport = laporan.user_id === auth?.user?.id;
    
    // 4. UBAHAN: Gunakan komentarList state, bukan props laporan.komentars lagi
    const totalKomentar = komentarList.length;
    const canEditStatus = laporan.can_update && !(laporan.is_locked && !laporan.can_finalize);
    const isLockedStatus = currentStatus === 'selesai' || currentStatus === 'ditolak';

    return (
        <div className={`bg-white rounded-3xl p-6 ${cardBorderClass} transition-all relative`}>
            
            {/* Header Laporan */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{laporan.judul}</h4>
                            {isMyReport && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Laporan Anda
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-bold text-gray-400 mt-1.5 tracking-wide flex flex-wrap gap-2 items-center">
                            <span>{laporan.kategori.toUpperCase()}</span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                            
                            {laporan.can_delete && (
                                <>
                                    <span>•</span>
                                    <button 
                                        type="button"
                                        onClick={onDelete} 
                                        className="text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </>
                            )}
                        </div>
                        {laporan.lokasi && (
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {laporan.lokasi}
                            </div>
                        )}

                        {/* Kotak Alasan Penolakan di Kartu Laporan */}
                        {currentStatus === 'ditolak' && laporan.alasan_penolakan && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 flex items-start gap-2">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <div>
                                    <span className="font-bold">Alasan Penolakan:</span> {laporan.alasan_penolakan}
                                </div>
                            </div>
                        )}
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
                                value={data.alasan}
                                onChange={(e) => setData('alasan', e.target.value)}
                                className={`w-full text-xs p-3 border rounded-xl outline-none resize-none mb-1 ${
                                    errors.alasan ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-gray-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                }`}
                            ></textarea>
                            {errors.alasan && (
                                <p className="text-[11px] text-rose-600 font-semibold mb-4">{errors.alasan}</p>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsRejectModalOpen(false);
                                        setCurrentStatus(laporan.status);
                                    }}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Konfirmasi Tolak'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bagian Bawah: Dropdown Ubah Status & Tombol Diskusi */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {canEditStatus ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Ubah Status:</span>
                            <select 
                                value={currentStatus}
                                onChange={handleStatusChange}
                                className={`text-xs font-bold rounded-xl border-gray-200 shadow-sm focus:ring-[#0D7A57] focus:border-[#0D7A57] py-1.5 pl-3 pr-8 cursor-pointer ${currentBadge.style}`}
                            >
                                <option value="pending">Pending</option>
                                <option value="diproses">Diproses</option>
                                <option value="selesai">Selesai</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                    ) : (
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-xs ${currentBadge.style}`}>
                            {currentBadge.label}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <div className="text-xs text-gray-500 font-medium">
                        {totalKomentar > 0 ? `${totalKomentar} balasan` : 'Belum ada balasan'}
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        <span>{isOpen ? 'Tutup Diskusi' : 'Buka Diskusi'}</span>
                    </button>
                </div>
            </div>

            {/* Kotak Diskusi */}
            {isOpen && (
                <div className="mt-4 border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-fadeIn">
                    <div className="bg-white px-4 pt-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                        <p className="text-xs font-bold text-gray-500">Interaksi Petugas &amp; Warga</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">Live Chat</span>
                    </div>
                    <div className="bg-slate-50/70 p-4">
                        <div className="space-y-3 max-h-80 overflow-y-auto mb-4 px-1">
                            
                            {/* Pesan Laporan Utama */}
                            <div className={`flex w-full my-1 ${isMyReport ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-xs relative ${
                                    isMyReport 
                                        ? 'bg-[#0D7A57] text-white rounded-br-sm' 
                                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                }`}>
                                    {!isMyReport && (
                                        <div className="font-bold text-xs mb-1 text-emerald-800">
                                            {laporan.user?.name} (Warga)
                                        </div>
                                    )}
                                    
                                    <p className="leading-relaxed break-words">{laporan.deskripsi}</p>

                                    {laporan.foto && (
                                        <div className="mt-3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 max-w-xs">
                                            <img 
                                                src={`/storage/${laporan.foto}`} 
                                                alt="Bukti Foto Laporan" 
                                                className="w-full h-auto object-cover max-h-56 cursor-pointer hover:opacity-95 transition-opacity"
                                                onClick={() => window.open(`/storage/${laporan.foto}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={`text-[10px] mt-2 font-medium flex items-center justify-end gap-1 ${
                                        isMyReport ? 'text-emerald-100' : 'text-gray-400'
                                    }`}>
                                        {new Date(laporan.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>

                            {/* 5. UBAHAN: Looping menggunakan komentarList dari state */}
                            {komentarList.map((komentar) => {
                                const isMe = komentar.user_id === auth?.user?.id;
                                
                                return (
                                    <div key={komentar.id} className={`flex w-full my-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xs relative ${
                                            isMe 
                                                ? 'bg-[#0D7A57] text-white rounded-br-sm' 
                                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                        }`}>
                                            {!isMe && (
                                                <div className="font-bold text-xs mb-1 text-emerald-800">
                                                    {komentar.user?.name} 
                                                    {komentar.user?.role && komentar.user?.role !== 'warga' && ` (${komentar.user?.role.replace('_', ' ').toUpperCase()})`}
                                                </div>
                                            )}
                                            
                                            <p className="leading-relaxed break-words">{komentar.pesan}</p>
                                            
                                            <div className={`text-[10px] mt-1.5 font-medium flex items-center justify-end gap-1 ${
                                                isMe ? 'text-emerald-100' : 'text-gray-400'
                                            }`}>
                                                {new Date(komentar.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Form Balas Pesan / Dikunci jika Selesai/Ditolak */}
                        {laporan.can_komentar && !isLockedStatus ? (
                            <form onSubmit={submitKomentar} className="relative mt-2">
                                <input 
                                    type="text" 
                                    placeholder="Ketik balasan..."
                                    value={commentForm.data.pesan}
                                    onChange={(e) => commentForm.setData('pesan', e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-full py-3 pl-5 pr-14 text-sm focus:ring-2 focus:ring-[#0D7A57]/20 focus:border-[#0D7A57] shadow-xs outline-none transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={commentForm.processing || !commentForm.data.pesan}
                                    className="absolute right-2 top-1.5 p-2 bg-[#0D7A57] text-white hover:bg-[#0A6145] rounded-full disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
                                >
                                    <svg className="w-4 h-4 -rotate-45 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </form>
                        ) : (
                            <div className="p-3 text-center bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium mt-2">
                                Diskusi ditutup karena laporan telah berstatus <span className="uppercase font-bold">{currentStatus}</span>.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}