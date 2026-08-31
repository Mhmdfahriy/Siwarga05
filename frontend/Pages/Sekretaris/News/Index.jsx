import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { Eye, Calendar, FileText, Plus, Filter } from 'lucide-react';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Index({ auth, articles }) {
    const user = auth.user;
    const [statusFilter, setStatusFilter] = useState('all');

    const getRolePrefix = () => {
        if (user.role === 'sekretaris' || user.isSekretaris) return 'sekretaris';
        if (user.role === 'bendahara' || user.isBendahara) return 'bendahara';
        if (user.role === 'ketuart' || user.isKetuaRt) return 'ketuart';
        return 'warga';
    };

    const rolePrefix = getRolePrefix();
    const dataBerita = articles?.data || [];

    // Filter logic: Jika pengurus, filter berdasarkan status.
    const filteredArticles = dataBerita.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    return (
        <Sidebar currentRole={rolePrefix} activeMenu="news">
            <Head title="Berita & Laporan RT" />

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
                
                {/* Header Utama */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Kabar Terbaru</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Kelola dan pantau publikasi berita serta laporan keuangan RT.
                        </p>
                    </div>

                    {/* Wadah Flex untuk Notifikasi dan Tombol Aksi di Kanan */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <NotifikasiBell prefix={rolePrefix} />

                        <Link
                            href={route(`${rolePrefix}.news.manage`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0a6145] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" /> Kelola Data Berita
                        </Link>
                    </div>
                </div>

                {/* FILTER BAR KHUSUS PENGURUS */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold shrink-0">
                        <Filter className="w-4 h-4" /> Filter Status:
                    </div>
                    {['all', 'published', 'scheduled'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all border shrink-0 cursor-pointer ${
                                statusFilter === s 
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Grid List Berita */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col hover:border-gray-200 transition-all group relative">
                                    
                                    <div className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden">
                                        {/* Status Badge Over-image */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm ${
                                                item.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>

                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                                                <FileText className="w-8 h-8 opacity-30" />
                                            </div>
                                        )}
                                        
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-xs">
                                            {item.category}
                                        </span>
                                    </div>

                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#0D7A57] transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                                            </div>
                                            <Link
                                                href={route(`${rolePrefix}.news.show`, item.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-gray-400" /> Lihat
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                <p className="text-xs font-semibold">Tidak ada berita dengan status tersebut.</p>
                            </div>
                        )}
                    </div>

                    {/* Komponen Pagination Terpusat */}
                    {articles?.links && articles.links.length > 3 && (
                        <div className="bg-[#F1F5F9] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-3xl overflow-x-auto">
                            <Pagination links={articles.links} />
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </Sidebar>
    );
}