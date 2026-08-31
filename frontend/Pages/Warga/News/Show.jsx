import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, TrendingUp, Send, FileText, Shield, CalendarDays, Megaphone, Tag } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

// Icon & warna berdasarkan kategori (konsisten dengan NewsCard)
const categoryStyle = {
  Event:        { icon: CalendarDays, bg: 'bg-sky-50',   text: 'text-sky-500',   badge: 'bg-sky-500' },
  Keamanan:     { icon: Shield,       bg: 'bg-rose-50',  text: 'text-rose-500',  badge: 'bg-rose-500' },
  Keuangan:     { icon: FileText,     bg: 'bg-violet-50',text: 'text-violet-500',badge: 'bg-violet-500' },
  Announcement: { icon: Megaphone,    bg: 'bg-amber-50', text: 'text-amber-500',  badge: 'bg-amber-500' },
};

const getCategoryStyle = (category) =>
  categoryStyle[category] || { icon: FileText, bg: 'bg-slate-50', text: 'text-slate-400', badge: 'bg-amber-500' };

export default function Show({ auth, news, recentArticles }) {
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState({});

  const showMainImage = news?.image && !mainImageError;
  const style = getCategoryStyle(news?.category);
  const IconComponent = style.icon;

  // Mendukung format array biasa maupun objek pagination Laravel (recentArticles.data & recentArticles.links)
  const articlesList = recentArticles?.data || (Array.isArray(recentArticles) ? recentArticles : []);
  const articlesLinks = recentArticles?.links || null;

  const markThumbError = (id) => {
    setThumbErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <Sidebar currentRole="warga" activeMenu="news">
      <Head title={news?.title || "Detail Berita"} />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Tombol Kembali / Navigasi Atas */}
        <div>
          <Link 
            href={route('warga.news.index')} 
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>

        {/* Sub-header Kecil Atas */}
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          INFORMASI LINGKUNGAN
        </div>

        {/* Grid Layout Detail Konten & Sidebar Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Sisi Kiri & Tengah: Detail Artikel (2/3 Space) */}
          <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            
            {/* Cover Image Utama Banner */}
            <div className="h-64 sm:h-80 md:h-96 w-full relative bg-slate-50 border-b border-gray-100 flex items-center justify-center">
              {showMainImage ? (
                <>
                  <img 
                    src={news.image} 
                    alt={news?.title} 
                    onError={() => setMainImageError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-[#0D7A57] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                    {news?.category || 'Pengumuman'}
                  </span>
                </>
              ) : (
                /* Tampilan jika artikel utama tidak memiliki gambar / gambar gagal dimuat */
                <div className={`w-full h-full ${style.bg} flex flex-col items-center justify-center gap-2 p-6 select-none relative`}>
                  <span className={`absolute top-4 sm:top-6 left-4 sm:left-6 ${style.badge} text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider`}>
                    {news?.category || 'Pengumuman'}
                  </span>
                  <div className={`w-14 h-14 rounded-2xl ${style.bg} border border-current/10 flex items-center justify-center ${style.text}`}>
                    <IconComponent className="w-7 h-7 opacity-60" />
                  </div>
                  <span className={`text-xs font-semibold ${style.text} opacity-60`}>
                    {news?.category || 'Informasi'}
                  </span>
                </div>
              )}
            </div>

            {/* Artikel Body Box */}
            <div className="p-5 sm:p-8 md:p-10">
              {/* Meta Informasi Penulis & Tanggal */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6">
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {news?.date || '24 Okt 2024'}
                  </span>
                  <span>👤 {news?.author || 'Admin RT 05'}</span>
                </div>
              </div>

              {/* Judul Utama Berita */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-5 sm:mb-6 leading-snug">
                {news?.title}
              </h1>

              {/* Konten Utama Artikel (Render HTML dari Editor) */}
              <div 
                className="prose prose-emerald max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: news?.main_content }}
              />

              {/* Bagian Tag di Bawah Artikel */}
              {news?.featured_tag && (
                <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-100 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] font-semibold text-[#0D7A57] bg-emerald-50 px-2.5 py-1 rounded-xl">
                    {news.featured_tag}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Berita Terbaru Lainnya (1/3 Space) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm border-b border-gray-50 pb-3">
                <TrendingUp className="w-4 h-4 text-[#0D7A57]" />
                <span>Pengumuman Terbaru</span>
              </div>

              {/* List Berita Singkat */}
              <div className="space-y-4">
                {articlesList.length > 0 ? (
                  articlesList.map((item) => {
                    const showThumb = item.image && !thumbErrors[item.id];
                    const itemStyle = getCategoryStyle(item.category);
                    const ItemIcon = itemStyle.icon;
                    return (
                      <Link 
                        key={item.id} 
                        href={route('warga.news.show', item.id)}
                        className="flex gap-3 items-center group"
                      >
                        {showThumb ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            onError={() => markThumbError(item.id)}
                            className="w-14 h-14 object-cover rounded-xl shrink-0 bg-gray-50 border border-gray-100"
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-xl shrink-0 ${itemStyle.bg} border border-gray-100 flex items-center justify-center ${itemStyle.text}`}>
                            <ItemIcon className="w-5 h-5 opacity-60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-gray-700 group-hover:text-[#0D7A57] transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 block">{item.date}</span>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">Belum ada pengumuman terbaru lainnya.</p>
                )}
              </div>

              {/* Komponen Pagination Terpusat untuk List Sidebar (Jika Menggunakan Pagination) */}
              {articlesLinks && articlesLinks.length > 3 && (
                <div className="pt-3 border-t border-gray-100 overflow-x-auto">
                  <Pagination links={articlesLinks} />
                </div>
              )}

              <Link 
                href={route('warga.news.index')}
                className="w-full mt-2 block text-center py-2.5 border border-gray-100 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all"
              >
                Lihat Semua Berita
              </Link>
            </div>

            {/* Widget: Call to Action Submit Berita */}
            <div className="bg-[#0D7A57] rounded-3xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
              <h3 className="text-base font-bold mb-1.5">Punya Berita?</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed mb-4">
                Kirimkan informasi atau pengumuman dari warga untuk diterbitkan oleh admin.
              </p>
              <button type="button" className="w-full bg-white text-[#0D7A57] hover:bg-emerald-50 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" /> Kirim Berita
              </button>
            </div>
          </div>

        </div>

      </div>
      <Footer />
    </Sidebar>
  );
}