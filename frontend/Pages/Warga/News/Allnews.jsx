import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, ArrowLeft, Megaphone } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import NewsCard from '@/Components/News/NewsCard';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

/**
 * Allnews.jsx
 * Halaman "Lihat Semua" — menampilkan daftar lengkap berita & pengumuman warga dengan Live Search.
 */
export default function Allnews({ articles, filters = {} }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category ?? 'Semua');

  const categories = ['Semua', 'Announcement', 'Event', 'Keamanan', 'Informasi', 'Keuangan'];
  const dataBerita = articles?.data || [];

  // Fungsi untuk mengirim request filter ke backend
  const applyFilters = (nextSearch, nextCategory) => {
    router.get(
      route('warga.news.all'),
      {
        search: nextSearch || undefined,
        category: nextCategory !== 'Semua' ? nextCategory : undefined,
      },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  // Live Search dengan Debounce (menunggu user selesai mengetik selama 400ms agar tidak spam request ke server)
  useEffect(() => {
    // Jangan trigger jika nilai input sama persis dengan filter awal dari props
    if (search === (filters.search ?? '')) return;

    const timer = setTimeout(() => {
      applyFilters(search, selectedCategory);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    applyFilters(search, cat);
  };

  return (
    <Sidebar currentRole="warga" activeMenu="news">
      <Head title="Semua Berita & Pengumuman" />

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

        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          INFORMASI LINGKUNGAN
        </div>

        {/* Header & Fitur Pencarian */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Semua Berita & Pengumuman
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {articles?.total ?? dataBerita.length} berita ditemukan
            </p>
          </div>

          {/* Form Input Live Search */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul berita..."
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D7A57]/30 focus:border-[#0D7A57]"
              />
            </div>
          </div>
        </div>

        {/* Tombol Grup Kategori */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0D7A57] text-white border-[#0D7A57] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Render Grid Berita / Kosong */}
        {dataBerita.length > 0 ? (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            {/* Menampilkan semua data berita */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {dataBerita.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isAdmin={false}
                  baseUrl="warga.news.show"
                  readMoreText="Lihat Selengkapnya"
                />
              ))}
            </div>

            {/* Komponen Pagination Terpusat */}
            {articles?.links && articles.links.length > 3 && (
              <div className="bg-[#F1F5F9] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-3xl overflow-x-auto">
                <Pagination links={articles.links} />
              </div>
            )}
          </div>
        ) : (
          /* State Kosong (Not Found) */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto mt-6">
            <div className="w-12 h-12 bg-emerald-50 text-[#0D7A57] rounded-xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Berita Tidak Ditemukan</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Coba ubah kata kunci pencarian atau pilih kategori lain untuk melihat informasi.
            </p>
          </div>
        )}

      </div>
      <Footer />
    </Sidebar>
  );
}