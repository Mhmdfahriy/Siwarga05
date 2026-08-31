import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Megaphone, Calendar, TrendingUp, Send, FileText } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Index({ auth, articles, upcomingAgendas = [], popularTags = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Ekstrak array data asli dari objek pagination Laravel agar fungsi .filter tidak crash
  const dataBerita = articles?.data || [];

  // Logika penyaringan berita secara langsung di frontend
  const filteredArticles = dataBerita.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(search.toLowerCase()) || 
      article.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      article.category?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Sidebar currentRole="warga" activeMenu="news">
      <Head title="Berita & Pengumuman Warga" />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Sub-header Kecil Atas */}
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          INFORMASI LINGKUNGAN
        </div>

        {/* Bagian Header Utama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Berita & Pengumuman
            </h1>
          </div>
        </div>

        {/* Layout Grid Utama Asimetris */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* KOLOM KIRI: Tempat Berita Utama & List Updates */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* 1. FEATURED BANNER UTAMA */}
            {filteredArticles.length > 0 && (
              <div className="relative group overflow-hidden rounded-3xl bg-slate-900 aspect-[16/9] flex items-end p-5 sm:p-6 shadow-sm">
                
                {filteredArticles[0].image ? (
                  <img 
                    src={filteredArticles[0].image} 
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-102 transition-transform duration-500"
                    alt={filteredArticles[0].title}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800 gap-2">
                    <FileText className="w-10 h-10 opacity-30" />
                    <span className="text-xs font-medium opacity-50 text-slate-300">Informasi Tanpa Gambar</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                
                <div className="relative z-10 w-full text-white">
                  <span className="px-2.5 py-1 bg-[#0D7A57] text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                    {filteredArticles[0].category || 'Pembangunan'}
                  </span>
                  
                  <Link href={route('warga.news.show', filteredArticles[0].id)}>
                    <h2 className="text-base sm:text-xl md:text-2xl font-bold mt-2.5 mb-2 leading-tight hover:text-emerald-300 transition-colors cursor-pointer max-w-xl">
                      {filteredArticles[0].title}
                    </h2>
                  </Link>
                  
                  <p className="text-xs text-gray-300 line-clamp-2 mb-4 font-light max-w-xl">
                    {filteredArticles[0].excerpt}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1 w-full">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pb-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {filteredArticles[0].date || '24 Okt 2024'}
                      </span>
                      <span>👤 {filteredArticles[0].author || 'Admin RT 05'}</span>
                    </div>
                    
                    <Link 
                      href={route('warga.news.show', filteredArticles[0].id)}
                      className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/10 transition-all inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      Lihat Selengkapnya <Send className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUB-SECTION: LATEST UPDATES */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900">Kabar Terbaru</h3>
                <Link 
                  href={route('warga.news.all')} 
                  className="text-xs font-bold text-gray-400 hover:text-[#0D7A57] transition-all"
                >
                  Lihat Semua
                </Link>
              </div>

              {filteredArticles.length > 0 ? (
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      {filteredArticles.slice(1, 7).map((article) => {
                        const isKeuangan = article.category === 'Keuangan' || article.title?.toLowerCase().includes('keuangan');

                        return (
                          <div key={article.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col justify-between">
                            <div>
                              {article.image ? (
                                <div className="rounded-xl overflow-hidden aspect-video mb-3 bg-gray-100">
                                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="rounded-xl overflow-hidden aspect-video mb-3 bg-indigo-50/70 border border-indigo-100 flex flex-col items-center justify-center text-indigo-500 gap-1.5">
                                  <FileText className="w-8 h-8 opacity-80" />
                                  <span className="text-[10px] font-bold tracking-wide text-indigo-600">
                                    {isKeuangan ? 'Keuangan' : 'Dokumen / Informasi'}
                                  </span>
                                </div>
                              )}
                              
                              <span className="text-[9px] font-bold text-[#0D7A57] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                {article.category || 'Informasi'}
                              </span>
                              
                              <Link href={route('warga.news.show', article.id)}>
                                <h4 className="text-sm font-bold text-gray-900 mt-1.5 hover:text-[#0D7A57] transition-colors line-clamp-2">
                                  {article.title}
                                </h4>
                              </Link>

                              {isKeuangan ? (
                                <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
                                  <p className="font-semibold text-gray-800 text-[11px]">📊 Rangkuman Realisasi</p>
                                  <p className="text-[11px] text-gray-500 line-clamp-2">
                                    {article.excerpt?.replace(/===\s*LAPORAN REALISASI KEUANGAN\s*===/gi, '') || 'Klik untuk melihat rincian keuangan secara lengkap.'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {article.excerpt || 'Tidak ada ringkasan tersedia.'}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                              <span>{article.date || 'Baru saja'}</span>
                              <Link href={route('warga.news.show', article.id)} className="font-bold text-[#0D7A57] hover:underline">
                                Lihat Selengkapnya &rarr;
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {articles?.links && articles.links.length > 3 && (
                    <div className="bg-[#F1F5F9] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-3xl overflow-x-auto">
                      <Pagination links={articles.links} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto mt-6">
                  <div className="w-12 h-12 bg-emerald-50 text-[#0D7A57] rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Pengumuman Tidak Ditemukan</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Belum ada berita atau pengumuman resmi yang diterbitkan dalam kategori yang Anda pilih saat ini. Silakan periksa kembali nanti.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* KOLOM KANAN: Widget Penunjang */}
          <div className="space-y-6">
            
            {/* Widget: Agenda Mendatang (Dinamis) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 font-bold text-gray-900 text-sm">
                <Calendar className="w-4 h-4 text-[#0D7A57]" />
                <span>Agenda Mendatang</span>
              </div>
              
              <div className="space-y-4">
                {upcomingAgendas.length > 0 ? (
                  upcomingAgendas.map((item, index) => {
                    const dateObj = new Date(item.date);
                    const day = isNaN(dateObj.getDate()) ? '01' : dateObj.getDate();
                    const monthNames = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
                    const month = isNaN(dateObj.getMonth()) ? 'BRL' : monthNames[dateObj.getMonth()];

                    return (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="bg-[#E8F5E9] text-[#0D7A57] rounded-xl p-1.5 w-11 text-center flex flex-col justify-center shrink-0">
                          <span className="text-base font-extrabold leading-none">{day}</span>
                          <span className="text-[8px] font-bold mt-0.5 tracking-wider">{month}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 truncate">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">07:00 WIB - Selesai</p>
                          <p className="text-[10px] text-gray-400 truncate">{item.location || 'Lingkungan RT'}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">Belum ada agenda mendatang.</p>
                )}
              </div>

              <Link 
                href={route('warga.calendar.index')} 
                className="w-full mt-4 py-2.5 border border-gray-100 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all text-center block"
              >
                Lihat Kalender
              </Link>
            </div>

            {/* Widget: Topik Populer (DINAMIS DARI DATABASE) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3.5 font-bold text-gray-900 text-sm">
                <TrendingUp className="w-4 h-4 text-[#0D7A57]" />
                <span>Topik Populer</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.length > 0 ? (
                  popularTags.map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSearch(tag)}
                      className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-[10px] font-medium hover:bg-emerald-50 hover:text-[#0D7A57] hover:border-emerald-200 transition-all cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Belum ada topik populer.</p>
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