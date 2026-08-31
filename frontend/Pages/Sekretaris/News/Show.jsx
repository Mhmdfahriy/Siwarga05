import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Show({ auth, news, recentArticles }) {
  const articlesList = recentArticles?.data || (Array.isArray(recentArticles) ? recentArticles : []);
  const articlesLinks = recentArticles?.links || null;

  return (
    <Sidebar currentRole="sekretaris" activeMenu="news">
      <Head title={`${news.title} - Detail Berita`} />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Tombol Kembali */}
        <div>
          <Link 
            href={route('sekretaris.news.index')} 
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>

        {/* Grid Layout Detail Berita & Sidebar Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Kolom Kiri: Detail Berita Utama */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">
            
            {/* Meta Informasi & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">
                <Tag className="w-3.5 h-3.5" />
                {news.category}
              </span>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {news.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {news.date}
                </span>
              </div>
            </div>

            {/* Judul Berita */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {news.title}
            </h1>

            {/* Banner/Thumbnail Berita */}
            {news.image ? (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner border border-gray-100 bg-slate-50">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-xs font-semibold">Tidak ada thumbnail visual untuk berita ini</span>
              </div>
            )}

            {/* Isi Konten Utama (Mendukung HTML Aman dari Purifier) */}
            <div 
              className="prose prose-emerald max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4 pt-4 border-t border-gray-50"
              dangerouslySetInnerHTML={{ __html: news.main_content }}
            />

          </div>

          {/* Kolom Kanan: Berita Terbaru / Sidebar Pengumuman Lain */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">
                Pengumuman Terbaru Lainnya
              </h3>

              <div className="space-y-4">
                {articlesList.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Tidak ada pengumuman lain saat ini.</p>
                ) : (
                  articlesList.map((item) => (
                    <Link 
                      key={item.id}
                      href={route('sekretaris.news.show', item.id)}
                      className="flex gap-3 items-center group border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                    >
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-14 h-14 object-cover rounded-xl shrink-0 bg-gray-50 border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl shrink-0 bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D7A57]">
                          <Calendar className="w-5 h-5 opacity-60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-gray-700 group-hover:text-[#0D7A57] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 block">{item.date}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Komponen Pagination Terpusat untuk Sidebar (Jika Digunakan) */}
              {articlesLinks && articlesLinks.length > 3 && (
                <div className="pt-3 border-t border-gray-100 overflow-x-auto">
                  <Pagination links={articlesLinks} />
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      <Footer />
    </Sidebar>
  );
}