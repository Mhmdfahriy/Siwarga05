import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { Eye, Calendar, FileText, Plus, Filter } from 'lucide-react';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function BendaharaNewsIndex({ auth, articles }) {
    const user = auth.user;
    const [statusFilter, setStatusFilter] = useState('all');

    const getRolePrefix = () => {
        if (user.role === 'bendahara' || user.isBendahara) return 'bendahara';
        return 'warga';
    };

    // Ekstrak data array artikel dan tautan paginasi dari objek Laravel
    const articlesData = articles?.data || (Array.isArray(articles) ? articles : []);
    const articlesLinks = articles?.links || null;

    // Filter logic berdasarkan status berita
    const filteredArticles = articlesData.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
    });

    return (
        <Sidebar currentRole={getRolePrefix()} activeMenu="news">
            <Head title="Kelola Berita & Laporan - Bendahara RT" />

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
                
                {/* Header Bagian Atas */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            Kabar & Laporan Keuangan RT
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Kelola publikasi berita, pengumuman, serta transparansi laporan keuangan warga.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Komponen Notifikasi */}
                        <NotifikasiBell prefix={getRolePrefix()} />

                        <Link
                            href={route('bendahara.news.manage')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0a6145] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> <span>Kelola Data Berita</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Bar Khusus Bendahara */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                        <Filter className="w-4 h-4" /> Filter Status:
                    </div>
                    {['all', 'published', 'scheduled', 'draft'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold capitalize transition-all cursor-pointer ${
                                statusFilter === s 
                                    ? 'bg-gray-900 text-white shadow-xs' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {s === 'all' ? 'Semua' : s}
                        </button>
                    ))}
                </div>

                {/* Grid Daftar Berita */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
                                
                                <div className="relative h-44 sm:h-48 bg-slate-100 overflow-hidden">
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                                            item.status === 'published' ? 'bg-emerald-600' : 'bg-amber-500'
                                        }`}>
                                            {item.status === 'published' ? 'Terbit' : item.status}
                                        </span>
                                    </div>

                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                            <FileText className="w-8 h-8 opacity-40" />
                                        </div>
                                    )}
                                    
                                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-black/60 text-white">
                                        {item.category || 'Keuangan'}
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#0D7A57] transition-colors">
                                        {item.title}
                                    </h3>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" /> 
                                            <span>{item.date || 'Hari ini'}</span>
                                        </div>
                                        <Link
                                            href={route('bendahara.news.show', item.id)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-gray-400" /> <span>Lihat</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-xs sm:text-sm text-gray-400 font-medium">Tidak ada berita dengan status tersebut.</p>
                        </div>
                    )}
                </div>

                {/* Komponen Pagination Laravel Terpusat */}
                {articlesLinks && articlesLinks.length > 3 && (
                    <div className="pt-4 flex justify-center">
                        <Pagination links={articlesLinks} />
                    </div>
                )}

            </div>
            <Footer />
        </Sidebar>
    );
}