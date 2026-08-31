import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar'; 
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';
import { 
    Newspaper, AlertTriangle, Users, 
    Bell, Plus, ArrowRight, Leaf, Megaphone, 
    Info, Clock, FileText, Search
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    stats = { berita: 0, laporan: 0, notifikasi: 0, warga: 0 },
    statusLaporan = { baru: 0, diproses: 0, selesai: 0 },
    beritaTerbaru = [],
    aktivitasTerbaru = [],
    filters = {}
}) {
    const namaUser = auth?.user?.name || "Sekretaris RT 05";
    const totalLaporan = (statusLaporan.baru + statusLaporan.diproses + statusLaporan.selesai) || 1; 

    // State untuk Search
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Live Search (Opsional, jika nanti Sekretaris butuh fitur cari warga/berita dari dashboard)
    useEffect(() => {
        const timer = setTimeout(() => {
            // router.get(route('sekretaris.dashboard'), { search: searchTerm }, { preserveState: true, replace: true });
        }, 300); 
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Helper untuk style badge kategori berita
    const getCategoryStyle = (kategori) => {
        switch (kategori?.toLowerCase()) {
            case 'kegiatan': return { bg: 'bg-emerald-50', text: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', Icon: Leaf };
            case 'informasi': return { bg: 'bg-blue-50', text: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', Icon: Megaphone };
            case 'pengumuman': return { bg: 'bg-orange-50', text: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', Icon: Info };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', Icon: FileText };
        }
    };

    return (
        <Sidebar currentRole="sekretaris" activeMenu="dashboard">
            <Head title="Dashboard Sekretaris" />

            <div className="flex-1 flex flex-col justify-between min-w-0 font-sans antialiased text-[#0b1c30]">
                
                {/* Top Header Navbar */}
                <header className="hidden md:flex bg-white/85 backdrop-blur-md border-b border-gray-100 px-8 py-4 justify-between items-center sticky top-0 z-30 shadow-xs">
                    <h1 className="text-xl font-bold text-gray-900">Dashboard Sekretaris</h1>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari data warga atau berita..." 
                                className="pl-9 pr-4 py-2 bg-[#F1F5F9] border-none rounded-full text-xs text-gray-700 focus:ring-2 focus:ring-[#006948] w-64"
                            />
                        </div>

                        {/* Pastikan kamu punya komponen ini, sesuaikan prefixnya */}
                        <NotifikasiBell prefix="sekretaris" />

                        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-900">{namaUser}</p>
                                <p className="text-[10px] text-gray-500">Admin Administrasi</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#0D7A57] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {namaUser.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 space-y-6">
                    
                    {/* Baris 1: 3 Kolom Card Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            { title: 'BERITA', desc: 'Berita diterbitkan', value: stats.berita, icon: Newspaper },
                            { title: 'LAPORANAJA', desc: 'Laporan warga', value: stats.laporan, icon: AlertTriangle },
                            { title: 'NOTIFIKASI', desc: 'Belum dibaca', value: stats.notifikasi, icon: Bell }
                        ].map((metric, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <metric.icon className="text-gray-600" size={24} />
                                    <span className="text-4xl font-bold text-gray-900">{metric.value}</span>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 mb-1 mt-4 tracking-wider">{metric.title}</h3>
                                    <p className="text-sm font-semibold text-gray-700">{metric.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Baris 2: Fokus Utama (Berita & Laporan) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Berita Terbaru (Span 8 - Diperlebar) */}
                        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-bold text-gray-900">Berita Terbaru</h2>
                                <Link href={route('sekretaris.news.index')} className="bg-[#0D7A57] hover:bg-[#0a6145] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                                    <Plus size={14} /> Buat Berita
                                </Link>
                            </div>
                            <div className="space-y-4 flex-1">
                                {beritaTerbaru.length > 0 ? (
                                    beritaTerbaru.map((berita, idx) => {
                                        const style = getCategoryStyle(berita.kategori);
                                        const Icon = style.Icon;
                                        return (
                                            <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                                                <div className={`${style.bg} ${style.text} p-2.5 rounded-xl shrink-0`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`${style.badgeBg} ${style.badgeText} text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide`}>
                                                            {berita.kategori}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{berita.tanggal}</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-gray-800 truncate">{berita.judul}</h4>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-xs text-gray-400 flex items-center justify-center h-full italic">Belum ada berita.</div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 text-center border-t border-gray-50">
                                <Link href={route('sekretaris.news.index')} className="text-[#0D7A57] text-xs font-bold inline-flex items-center gap-1 hover:underline">
                                    Kelola Semua Berita <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Status LaporanWarga (Span 4 - Diperlebar) */}
                        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col h-full">
                            <h2 className="text-sm font-bold text-gray-900 mb-6">Status Laporan Warga</h2>
                            <div className="space-y-6 flex-1 mt-2">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-700">Baru Masuk</span>
                                        <span className="text-xs font-bold text-red-600">{statusLaporan.baru}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${(statusLaporan.baru / totalLaporan) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-700">Sedang Diproses</span>
                                        <span className="text-xs font-bold text-yellow-500">{statusLaporan.diproses}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${(statusLaporan.diproses / totalLaporan) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-gray-700">Selesai</span>
                                        <span className="text-xs font-bold text-emerald-600">{statusLaporan.selesai}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(statusLaporan.selesai / totalLaporan) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 text-center border-t border-gray-50">
                                <Link href={route('sekretaris.laporan.index')} className="text-[#0D7A57] text-xs font-bold inline-flex items-center gap-1 hover:underline">
                                    Tinjau Laporan <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Baris 3: Operasional */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Aktivitas Terbaru (Span 7) */}
                        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
                            <h2 className="text-sm font-bold text-gray-900 mb-6">Log Aktivitas Terbaru</h2>
                            {aktivitasTerbaru.length > 0 ? (
                                <div className="relative pl-3 space-y-5 before:absolute before:inset-y-1.5 before:left-[15px] before:w-[2px] before:bg-gray-100">
                                    {aktivitasTerbaru.map((aktivitas, idx) => (
                                        <div key={idx} className="relative flex items-start gap-4">
                                            <div className={`absolute -left-2 w-2.5 h-2.5 rounded-full ring-4 ring-white mt-1 ${
                                                idx === 0 ? 'bg-[#0D7A57]' : 
                                                idx === aktivitasTerbaru.length - 1 ? 'bg-white border-2 border-gray-300' : 'bg-gray-400'
                                            }`}></div>
                                            <div className="ml-3 min-w-0">
                                                <h4 className={`text-xs truncate ${idx === 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                                                    {aktivitas.deskripsi}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{aktivitas.waktuLalu}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 py-4 italic">Belum ada log aktivitas.</div>
                            )}
                        </div>

                        {/* Ringkasan Administrasi (Span 5) */}
                        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col">
                            <h2 className="text-sm font-bold text-gray-900 mb-6">Ringkasan Administrasi</h2>
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                {[
                                    { title: 'Warga Terdaftar', value: stats.warga, icon: Users, color: 'emerald' },
                                    { title: 'Total Berita', value: stats.berita, icon: FileText, color: 'slate' },
                                    { title: 'Total Laporan', value: stats.laporan, icon: AlertTriangle, color: 'orange' }
                                ].map((stat, idx) => {
                                    const colorConfig = {
                                        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                        slate: 'bg-gray-50 text-gray-600 border-gray-100',
                                        orange: 'bg-orange-50 text-orange-500 border-orange-100'
                                    }[stat.color];

                                    return (
                                        <div key={idx} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-default">
                                            <div className={`${colorConfig} p-2 rounded-lg shrink-0 border`}>
                                                <stat.icon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide truncate">{stat.title}</p>
                                                <p className="text-sm font-bold text-gray-900 leading-tight truncate">{stat.value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 text-center border-t border-gray-50">
                                <Link href={route('sekretaris.data-warga.index')} className="text-[#0D7A57] text-xs font-bold inline-flex items-center gap-1 hover:underline">
                                    Kelola Data Warga <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                    </div>
                </main>

                <Footer />
                
            </div>
        </Sidebar>
    );
}