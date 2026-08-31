import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { ArrowLeft, Calendar, FileText, Tag, Edit3 } from 'lucide-react';
import Footer from '@/Components/Footer';

export default function Show({ auth, news }) {
    return (
        <Sidebar currentRole="bendahara" activeMenu="news">
            <Head title={`Detail Laporan: ${news?.title}`} />

            <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 font-sans">
                
                {/* Header Navigasi & Tombol Aksi */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('bendahara.news.index')}
                            className="p-2.5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:bg-gray-50 transition-all text-gray-600 group cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PRATINJAU LAPORAN</span>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
                                Detail Laporan Keuangan
                            </h1>
                        </div>
                    </div>

                    {/* Tombol Edit Cepat */}
                    <Link
                        href={route('bendahara.news.edit', news.id)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5" /> <span>Edit Laporan Ini</span>
                    </Link>
                </div>

                {/* Main Card Konten */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Meta Informasi Header */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-[#F8FAFC]/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="flex items-center gap-2.5 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase">Tanggal Rilis</span>
                                <span className="font-semibold text-gray-800">{news.date || 'Baru saja'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-gray-600">
                            <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase">Kategori</span>
                                <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-50 text-[#0D7A57] border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                    {news.category || 'Keuangan'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-gray-600">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <div>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase">Status Hak Akses</span>
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Published
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Body Konten */}
                    <div className="p-5 sm:p-8 space-y-6">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                                {news.title}
                            </h2>
                            {news.excerpt && (
                                <p className="text-xs sm:text-sm text-gray-500 mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 italic leading-relaxed">
                                    "{news.excerpt}"
                                </p>
                            )}
                        </div>

                        {news.image && (
                            <div>
                                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Bukti Foto / Nota Transaksi
                                </span>
                                <div className="inline-block p-1.5 border border-gray-200 rounded-2xl bg-gray-50/50 shadow-xs">
                                    <img 
                                        src={news.image} 
                                        alt="Bukti Nota Kas" 
                                        className="max-w-full sm:max-w-sm h-auto rounded-xl object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Rincian Buku Kas / Catatan Laporan
                            </span>
                            {/* Render HTML Aman Menggunakan dangerouslySetInnerHTML */}
                            <div 
                                className="w-full text-xs sm:text-sm p-5 border border-gray-200/80 rounded-2xl bg-gray-50/40 text-gray-800 leading-relaxed shadow-inner prose prose-sm max-w-none prose-p:my-1.5 prose-ul:list-disc prose-ol:list-decimal font-sans"
                                dangerouslySetInnerHTML={{ __html: news.main_content || news.content }}
                            />
                        </div>
                    </div>

                </div>

            </div>
            <Footer />
        </Sidebar>
    );
}