import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowLeft, Tag, Trash2, ShieldCheck, FileText } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import ModalCard from '@/Components/ModalCard';
import Footer from '@/Components/Footer';

export default function Show({ auth, news, recentArticles }) {
  
  // State untuk mengontrol Modal Konfirmasi Hapus
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    router.delete(route('ketuart.news.destroy', news.id), {
      onFinish: () => {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    });
  };

  // Mendukung format array biasa maupun objek pagination Laravel (recentArticles.data & recentArticles.links)
  const articlesList = recentArticles?.data || (Array.isArray(recentArticles) ? recentArticles : []);
  const articlesLinks = recentArticles?.links || null;

  return (
    <Sidebar currentRole="ketuart" activeMenu="news">
      <Head title={`Tinjau Artikel - ${news?.title}`} />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Top Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <Link 
            href={route('ketuart.news.index')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Manajemen Berita</span>
          </Link>

          {/* Tombol Aksi Moderasi Cepat untuk RT */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100 shadow-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Artikel Ini</span>
          </button>
        </div>

        {/* Grid Layout Detail Konten & Sidebar Info */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8 items-start">
          
          {/* Sisi Kiri: Konten Artikel */}
          <div className="xl:col-span-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            
            {/* Cover Image Banner Fallback */}
            <div className="h-64 sm:h-80 xl:h-96 w-full relative bg-slate-50 border-b border-gray-100 flex items-center justify-center">
              {news?.image ? (
                <>
                  <img 
                    src={news.image} 
                    alt={news?.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </>
              ) : (
                /* Tampilan jika artikel utama tidak memiliki gambar */
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2 p-6 select-none">
                  <FileText className="w-12 h-12 opacity-50 text-slate-400" />
                  <span className="text-xs font-semibold tracking-wide text-slate-400 text-center">
                    Pengumuman / Berita Tanpa Lampiran Gambar
                  </span>
                </div>
              )}
              
              {/* Status & Kategori Badge */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex items-center gap-2 z-10 flex-wrap">
                <span className="bg-[#0D7A57] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                  {news?.category || 'Announcement'}
                </span>
                <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg shadow-md text-white uppercase tracking-wider ${
                  news?.status === 'published' ? 'bg-emerald-600' : 'bg-gray-600'
                }`}>
                  {news?.status === 'published' ? 'Sudah Terbit' : 'Draf'}
                </span>
              </div>
            </div>

            {/* Artikel Body */}
            <div className="p-5 sm:p-8 md:p-10">
              {/* Meta Informasi */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-[#0D7A57] font-bold shrink-0">
                    {news?.author?.substring(0, 1) || 'A'}
                  </div>
                  <span className="text-gray-700 font-semibold truncate">Penulis: {news?.author || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
                  <span>Dibuat pada: {news?.date || 'Hari ini'}</span>
                </div>
              </div>

              {/* Judul */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-5 sm:mb-6 leading-snug">
                {news?.title}
              </h1>

              {/* Konten Utama HTML dari Rich Text Editor */}
              <div 
                className="prose prose-emerald max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: news?.main_content }}
              />

              {/* Bagian Tag */}
              {news?.featured_tag && (
                <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-gray-100 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-[#0D7A57] bg-emerald-50 px-2.5 py-1 rounded-xl">
                    {news.featured_tag}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Panel Peninjau RT (Audit Sidebar) */}
          <div className="space-y-6">
            {/* Audit Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#0D7A57]" />
                <h3 className="font-bold text-sm text-gray-800">Panel Tinjauan RT</h3>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed">
                Sebagai Ketua RT, Anda memiliki hak penuh untuk mengawasi dan memoderasi konten ini. Jika terdapat informasi yang tidak sesuai, penulisan yang keliru, atau data kelurahan yang kurang tepat, Anda dapat menghapusnya.
              </p>

              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Visibilitas:</span>
                  <span className="font-bold text-emerald-600">Dapat Dilihat Warga</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Pemirsa:</span>
                  <span className="font-bold text-gray-700">Seluruh Warga RT 05</span>
                </div>
              </div>
            </div>

            {/* Berita Lainnya untuk Pembanding */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
                Pengumuman Aktif Lainnya
              </h3>
              <div className="space-y-4">
                {articlesList.length > 0 ? (
                  articlesList.map((item) => (
                    <Link 
                      key={item.id} 
                      href={route('ketuart.news.show', item.id)}
                      className="flex gap-3 items-center group"
                    >
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-14 h-14 object-cover rounded-xl shrink-0 bg-gray-50 border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0 bg-slate-100 border border-slate-200/50 text-slate-400 select-none">
                          <FileText className="w-5 h-5 opacity-60" />
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
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">Tidak ada pengumuman lain saat ini.</p>
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

      {/* Modal Konfirmasi Hapus Artikel (Latar belakang solid gelap tanpa efek blur) */}
      <ModalCard
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berita Permanen"
        message="Apakah Anda yakin ingin menghapus artikel atau pengumuman ini secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        processing={isDeleting}
      />
      <Footer />
    </Sidebar>
  );
}