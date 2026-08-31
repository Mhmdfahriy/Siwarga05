import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Clock, 
    XCircle,
    Download, 
    LayoutDashboard, 
    Share2, 
    Receipt,
    Building2
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar'; 
import Footer from '@/Components/Footer';

export default function Invoice({ user, payment }) {
    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    // Konfigurasi tampilan berdasarkan status sebenarnya dari database,
    // bukan hardcode teks statis.
    const statusConfig = {
        menunggu_verifikasi: {
            icon: <Clock className="w-3.5 h-3.5 animate-spin hide-on-print" />,
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
            headerIcon: <CheckCircle2 className="w-8 h-8" />,
            headerIconClass: 'bg-emerald-50 text-[#0D7A57] border-emerald-100',
            title: 'Bukti Pembayaran Terkirim!',
            description: 'Terima kasih atas partisipasi Anda. Bukti pembayaran sedang menunggu diverifikasi oleh Bendahara.',
        },
        diverifikasi: {
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            headerIcon: <CheckCircle2 className="w-8 h-8" />,
            headerIconClass: 'bg-emerald-50 text-[#0D7A57] border-emerald-100',
            title: 'Pembayaran Terverifikasi!',
            description: 'Terima kasih atas partisipasi Anda dalam membangun lingkungan yang lebih baik dan harmonis di RT 05.',
        },
        ditolak: {
            icon: <XCircle className="w-3.5 h-3.5" />,
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
            headerIcon: <XCircle className="w-8 h-8" />,
            headerIconClass: 'bg-rose-50 text-rose-600 border-rose-100',
            title: 'Pembayaran Ditolak',
            description: 'Bukti pembayaran Anda belum bisa diverifikasi. Silakan periksa alasan penolakan dan unggah ulang bukti yang valid.',
        },
    };

    const currentStatus = statusConfig[payment.status] || statusConfig.menunggu_verifikasi;
    const statusLabel = payment.status_label || 'Menunggu Verifikasi';

    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <Head title="Rincian Pembayaran" />

            <style>{`
                @media print {
                    .hide-on-print {
                        display: none !important;
                    }
                    .print-full-width {
                        grid-template-columns: 1fr !important;
                        max-width: 100% !important;
                    }
                    main {
                        padding: 0 !important;
                        max-width: 100% !important;
                    }
                    @page {
                        margin: 12mm;
                    }
                }
            `}</style>

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* HEADER / STATUS UTAMA (Ikut tercetak di atas struk) */}
                    <div className="text-center space-y-3 pt-2">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full shadow-xs border ${currentStatus.headerIconClass}`}>
                            {currentStatus.headerIcon}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{currentStatus.title}</h1>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                            {currentStatus.description}
                        </p>
                    </div>

                    {/* CONTAINER KONTEN (kolom kanan otomatis hilang saat print) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start print-full-width">
                        
                        {/* KIRI: KARTU INVOICE UTAMA (yang ini yang dicetak) */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
                            
                            {/* ID TRANSAKSI & METODE */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">ID TRANSAKSI</p>
                                    <p className="text-sm sm:text-base font-extrabold text-gray-900">#SWG-{payment.created_at_year}-{payment.uuid?.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#0D7A57] text-xs font-bold rounded-xl border border-emerald-100 self-start sm:self-auto">
                                    <Receipt className="w-3.5 h-3.5" /> Pembayaran Iuran Warga
                                </span>
                            </div>

                            {/* WAKTU & STATUS */}
                            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">WAKTU PENGAJUAN</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-800">{payment.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">STATUS</p>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl border ${currentStatus.badgeClass}`}>
                                        {currentStatus.icon} {statusLabel}
                                    </div>
                                </div>
                            </div>

                            {/* ALASAN PENOLAKAN — hanya tampil jika statusnya ditolak */}
                            {payment.status === 'ditolak' && payment.rejection_reason && (
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-1">
                                    <p className="text-[10px] font-bold text-rose-600 tracking-wider uppercase">Alasan Penolakan</p>
                                    <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">{payment.rejection_reason}</p>
                                </div>
                            )}

                            {/* RINCIAN TAGIHAN */}
                            <div className="space-y-3 border-b border-gray-100 pb-6">
                                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">RINCIAN TAGIHAN</p>
                                
                                <div className="space-y-2.5">
                                    {payment.dues?.map((due, index) => (
                                        <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-gray-600 font-medium">{due.title}</span>
                                            <span className="font-bold text-gray-900">{formatRupiah(due.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOTAL PEMBAYARAN */}
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-sm sm:text-base font-extrabold text-gray-900">Total Pembayaran</span>
                                <span className="text-xl sm:text-2xl font-extrabold text-[#0D7A57]">
                                    {formatRupiah(payment.total_amount)}
                                </span>
                            </div>

                            {/* FOOTER INVOICE / BUKTI — disembunyikan saat print, link foto tidak berguna di kertas */}
                            {payment.proof_photo && (
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between hide-on-print">
                                    <span className="text-xs text-gray-400 font-medium">Bukti transfer terlampir</span>
                                    <a 
                                        href={payment.proof_photo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-[#0D7A57] hover:underline flex items-center gap-1"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Lihat Foto Struk
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* KANAN: PANEL INFORMASI & AKSI — seluruhnya disembunyikan saat print */}
                        <div className="space-y-6 hide-on-print">
                            
                            {/* KONTRIBUSI BERMAKNA */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Kontribusi Anda Bermakna</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Dana yang Anda bayarkan akan langsung dialokasikan untuk pemeliharaan fasilitas blok RT 05 dan kesejahteraan warga.
                                </p>
                                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-2.5">
                                    <Building2 className="w-4 h-4 text-[#0D7A57] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                                        Lihat laporan penggunaan dana secara transparan di menu Keuangan.
                                    </p>
                                </div>
                            </div>

                            {/* TOMBOL NAVIGASI & CETAK */}
                            <div className="space-y-3">
                                {payment.status === 'ditolak' && (
                                    <Link 
                                        href={route(`${prefix}.dues.payment-form`, { dues: payment.dues?.map((d) => d.id) })}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-600 text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-rose-700 transition shadow-md cursor-pointer"
                                    >
                                        Bayar Ulang
                                    </Link>
                                )}

                                <Link 
                                    href={route(`${prefix}.dues.index`)} 
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0D7A57] text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#0A6145] transition shadow-md cursor-pointer"
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Kembali ke Dashboard
                                </Link>
                                
                                <button 
                                    type="button"
                                    onClick={() => window.print()}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs sm:text-sm hover:bg-gray-50 transition shadow-xs cursor-pointer"
                                >
                                    <Share2 className="w-4 h-4" /> Cetak / Simpan Bukti
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Sidebar>
    );
}