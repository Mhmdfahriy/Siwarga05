import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell, Wallet, Newspaper, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';

const ICON_BY_CATEGORY = {
    keuangan: Wallet,
    berita:   Newspaper,
    laporan:  AlertTriangle,
    sistem:   ShieldCheck,
};

const POLL_INTERVAL_MS = 15000;

export default function NotifikasiBell({ prefix }) {
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!prefix) return;
        let isMounted = true;

        const poll = async () => {
            try {
                const currentLastId = parseInt(sessionStorage.getItem(`notif_last_id_${prefix}`) || '0', 10);
                const isFirstLoad = sessionStorage.getItem(`notif_first_load_${prefix}`) !== 'false';

                const { data } = await axios.get(route(`${prefix}.notifikasi.cek-baru`), {
                    params: { since_id: currentLastId },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                if (!isMounted) return;

                setUnreadTotal(data.unread_total);

                if (!isFirstLoad && data.new.length > 0) {
                    const limitedNew = data.new.slice(-3); 
                    const newToasts = limitedNew.map((n) => ({ ...n, toastId: `${n.id}-${Date.now()}` }));
                    
                    setToasts((prev) => [...prev, ...newToasts].slice(-3));

                    newToasts.forEach((t) => {
                        setTimeout(() => {
                            setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
                        }, 5000);
                    });
                }

                sessionStorage.setItem(`notif_last_id_${prefix}`, data.latest_id.toString());
                sessionStorage.setItem(`notif_first_load_${prefix}`, 'false');

            } catch (err) {
                if (err.response?.status !== 403) {
                    console.error('Gagal cek notifikasi:', err);
                }
            }
        };

        poll();
        const interval = setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [prefix]);

    const dismissToast = (toastId) => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
    };

    if (!prefix) return null;

    return (
        <>
            <Link href={route(`${prefix}.notifikasi.index`)} className="relative inline-flex transition-transform hover:scale-105">
                <Bell size={22} className="text-gray-500 hover:text-[#0D7A57] transition-colors cursor-pointer" />
                {unreadTotal > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </Link>

            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-[360px] pointer-events-none">
                {toasts.map((t) => {
                    const Icon = ICON_BY_CATEGORY[t.category] ?? ShieldCheck;
                    
                    const isPaymentRequired = [
                        'Tagihan Iuran Baru', 
                        'Tagihan Khusus / Insidental Baru', 
                        'Pengingat Pembayaran Iuran'
                    ].includes(t.title);

                    const isRejected = t.title === 'Pembayaran Ditolak';
                    const isPaidSuccess = t.title === 'Pembayaran Lunas & Diverifikasi';

                    return (
                        <div
                            key={t.toastId}
                            className="pointer-events-auto bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 flex flex-col gap-3 transform transition-all duration-300 animate-in slide-in-from-right-8 fade-in hover:border-emerald-300"
                        >
                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-[#E8FFF3] border border-emerald-100 flex items-center justify-center shrink-0">
                                    <Icon size={18} className="text-[#0D7A57]" />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="font-bold text-sm text-gray-900 truncate">{t.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.message}</p>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissToast(t.toastId);
                                    }} 
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg shrink-0 transition h-fit cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 justify-end">
                                {isPaymentRequired && (
                                    <>
                                        <button
                                            onClick={() => {
                                                router.visit(route(`${prefix}.payment.index`));
                                                dismissToast(t.toastId);
                                            }}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0D7A57] text-white hover:bg-[#095c41] transition cursor-pointer"
                                        >
                                            Bayar Sekarang
                                        </button>
                                        <button
                                            onClick={() => dismissToast(t.toastId)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                                        >
                                            Nanti Saja
                                        </button>
                                    </>
                                )}

                                {isRejected && (
                                    <button
                                        onClick={() => {
                                            router.visit(route(`${prefix}.payment.index`));
                                            dismissToast(t.toastId);
                                        }}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-sm"
                                    >
                                        Bayar Ulang
                                    </button>
                                )}

                                {isPaidSuccess && (
                                    <button
                                        onClick={() => {
                                            router.visit(route(`${prefix}.payment.index`));
                                            dismissToast(t.toastId);
                                        }}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0D7A57] border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                    >
                                        Lihat Riwayat
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}