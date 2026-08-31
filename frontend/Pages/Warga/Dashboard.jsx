import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import { 
    Home, CreditCard, Newspaper, AlertTriangle, 
    CheckCircle2, ArrowRight, Bell, PlusCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Footer from '@/Components/Footer';

export default function Dashboard({ auth, houseInfo, recentNews, totalNewsCount, iuranBulanan, laporanStatus, notifications: initialNotifications }) {
    const { auth: pageAuth } = usePage().props;
    const user = pageAuth?.user || auth?.user || {};
    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    const [notifications, setNotifications] = useState(initialNotifications || []);

    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo && user.id) {
            const channel = window.Echo.private(`App.Models.User.${user.id}`);
            
            channel.notification((notification) => {
                setNotifications((prev) => [
                    {
                        title: notification.title || 'Notifikasi Baru',
                        time: 'Baru saja',
                    },
                    ...prev
                ]);
            });

            return () => {
                window.Echo.leave(`App.Models.User.${user.id}`);
            };
        }
    }, [user.id]);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    return (
        <Sidebar currentRole={user.role} activeMenu="dashboard">
            <Head title="Dashboard Warga" />

            <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans antialiased text-[#1A202C]">
                
                {/* Header Sapaan */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Selamat Datang, {user.name || 'Warga'} <span className="text-xl">👋</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Pantau informasi dan aktivitas lingkungan RT 05 dengan mudah.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotifikasiBell prefix={prefix} />
                    </div>
                </div>

                {/* 4 Kartu Ringkasan Utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Kartu 1: Data Rumah */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 bg-emerald-50 text-[#0D7A57] rounded-xl flex items-center justify-center mb-3">
                                <Home className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Data Rumah</p>
                            <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                {houseInfo?.block_number ? `Blok ${houseInfo.block_number}` : 'Belum Terdaftar'}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1">Data rumah terdaftar</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                            <Link href={route(`${prefix}.house.index`)} className="text-xs font-semibold text-[#0D7A57] hover:underline flex items-center gap-1">
                                Lihat Detail <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Kartu 2: Bayar Iuran */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Bayar Iuran</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <h3 className="text-lg font-bold text-gray-900">{iuranBulanan?.label || 'Belum'}</h3>
                                {iuranBulanan?.isPaid && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">Iuran {iuranBulanan?.title || 'bulan ini'}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                            <Link href={route(`${prefix}.dues.index`)} className="text-xs font-semibold text-[#0D7A57] hover:underline flex items-center gap-1">
                                Lihat Iuran <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Kartu 3: Berita */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-3">
                                <Newspaper className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Berita</p>
                            <h3 className="text-lg font-bold text-gray-900 mt-0.5">{totalNewsCount || 0}</h3>
                            <p className="text-[11px] text-gray-400 mt-1">Informasi baru dari RT 05</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                            <Link href={route(`${prefix}.news.index`)} className="text-xs font-semibold text-[#0D7A57] hover:underline flex items-center gap-1">
                                Lihat Berita <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Kartu 4: Laporan Terakhir */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Laporan Terakhir</p>
                            <h3 className="text-sm font-bold text-gray-900 mt-0.5 truncate" title={laporanStatus?.status}>
                                {laporanStatus?.status || 'Tidak ada laporan'}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 truncate">{laporanStatus?.title || 'Belum ada pengaduan'}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50">
                            <Link href={route(`${prefix}.laporan.index`)} className="text-xs font-semibold text-[#0D7A57] hover:underline flex items-center gap-1">
                                Lihat Laporan <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Grid Tata Letak Utama (2 Kolom Seimbang) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* ================= KOLOM KIRI (Lebar: 2 Span) ================= */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Berita Terbaru */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">Berita Terbaru</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Informasi terbaru dari lingkungan RT 05</p>
                                </div>
                                <Link href={route(`${prefix}.news.index`)} className="text-xs text-[#0D7A57] font-semibold hover:underline">Lihat Semua</Link>
                            </div>

                            <div className="space-y-3">
                                {recentNews && recentNews.length > 0 ? (
                                    recentNews.map((item) => (
                                        <Link 
                                            key={item.id}
                                            href={route(`${prefix}.news.show`, item.id)}
                                            className="p-4 border border-gray-100 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-all group block"
                                        >
                                            <div className="space-y-1 pr-4 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#0D7A57] transition-colors truncate">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                                    <span>📅 {item.date}</span>
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                                                {item.category || 'Informasi'}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-4">Belum ada berita terbaru.</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Status Iuran */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm">Status Iuran</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-gray-50 text-xs">
                                <div>
                                    <span className="text-gray-400 block">Bulan</span>
                                    <strong className="text-gray-800 font-semibold mt-0.5 block">{iuranBulanan?.bulan || 'Agustus 2026'}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Nominal</span>
                                    <strong className="text-gray-800 font-semibold mt-0.5 block">{iuranBulanan?.nominal || 'Rp 50.000'}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Status</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {iuranBulanan?.label || 'Belum'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Tanggal Bayar</span>
                                    <strong className="text-gray-800 font-semibold mt-0.5 block">{iuranBulanan?.tanggal || '-'}</strong>
                                </div>
                            </div>
                            <div>
                                <Link 
                                    href={route(`${prefix}.dues.index`)} 
                                    className="w-full py-2.5 border border-[#0D7A57] text-[#0D7A57] hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all text-center block"
                                >
                                    Lihat Riwayat Iuran
                                </Link>
                            </div>
                        </div>

                        {/* 3. Kotak Buat Laporan (Dipindah ke Kiri agar Seimbang) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-[#0D7A57] rounded-full flex items-center justify-center shrink-0">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Ada masalah di lingkungan?</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Sampaikan laporan kepada pengurus RT agar dapat segera ditindaklanjuti.</p>
                                </div>
                            </div>
                            <Link 
                                href={route(`${prefix}.laporan.index`)} 
                                className="px-5 py-2.5 bg-[#0D7A57] hover:bg-[#0a5e43] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 block text-center"
                            >
                                + Buat Laporan
                            </Link>
                        </div>

                    </div>

                    {/* ================= KOLOM KANAN (Sidebar Widget: 1 Span) ================= */}
                    <div className="space-y-6">
                        
                        {/* Widget Kalender RT */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                                    <CalendarIcon className="w-4 h-4 text-[#0D7A57]" />
                                    <span>Kalender RT</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 w-24 text-center">
                                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </span>
                                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Grid Mini Kalender */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
                                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                {Array.from({ length: firstDayIndex }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                                    return (
                                        <div 
                                            key={day} 
                                            className={`py-1.5 rounded-lg font-medium text-gray-700 ${isToday ? 'bg-[#0D7A57] text-white font-bold shadow-xs' : 'hover:bg-gray-50'}`}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2 border-t border-gray-50 text-center">
                                <Link href={route(`${prefix}.calendar.index`)} className="text-xs font-semibold text-[#0D7A57] hover:underline">
                                    Buka Kalender Lengkap &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Widget Notifikasi Realtime */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                                    <Bell className="w-4 h-4 text-[#0D7A57]" />
                                    <span>Notifikasi Terbaru</span>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Reverb Realtime Aktif"></span>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {notifications && notifications.length > 0 ? (
                                    notifications.map((notif, index) => (
                                        <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-gray-800 truncate">{notif.title}</h5>
                                                <span className="text-[10px] text-gray-400 mt-0.5 block">{notif.time}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-2">Tidak ada notifikasi baru.</p>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
            <Footer />
        </Sidebar>
    );
}