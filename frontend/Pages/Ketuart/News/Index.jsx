import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import NewsTable from '@/Components/News/NewsTable';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Index({ auth, articles }) {
  
  // State untuk mengontrol Modal Hapus
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ekstrak array data asli dari objek pagination Laravel
  const dataBerita = articles?.data || [];

  const totalArticles = articles?.total || dataBerita.length;
  const publishedCount = dataBerita.filter(a => a.status === 'published').length || 0;
  const draftCount = dataBerita.filter(a => a.status === 'draft' || a.status === 'scheduled').length || 0;

  const handleDeleteClick = (id) => {
    setArticleToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    router.delete(route('ketuart.news.destroy', articleToDelete), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setArticleToDelete(null);
      }
    });
  };

  return (
    <Sidebar currentRole="ketuart" activeMenu="news">
      <Head title="Manajemen Berita - Ketua RT" />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Top Header Section dengan Lonceng Notifikasi */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Kontrol Berita & Pengumuman</span>
              <span className="bg-[#E8F5E9] text-[#0D7A57] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Mode Admin
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Pantau, tinjau, dan moderasi seluruh pengumuman lingkungan yang diterbitkan oleh staf pengurus RT
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Komponen Lonceng Notifikasi Interaktif */}
            <NotifikasiBell prefix="ketuart" />
          </div>
        </div>

        {/* Statistik Monitoring Widget untuk Ketua RT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Total Berita */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Berita</span>
              <span className="text-base sm:text-lg font-extrabold text-gray-800">{totalArticles}</span>
            </div>
          </div>

          {/* Sudah Terbit */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D7A57] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sudah Terbit</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600">{publishedCount}</span>
            </div>
          </div>

          {/* Antrean / Draf */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Antrean / Draf</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-600">{draftCount}</span>
            </div>
          </div>
        </div>

        {/* Wadah Tabel Data Berita & Pagination */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Pemanggilan NewsTable Reusable */}
          <NewsTable 
            articles={dataBerita} 
            onDelete={handleDeleteClick}
            role="ketuart"
          />
          
          {/* Komponen Pagination Terpusat */}
          {articles?.links && articles.links.length > 3 && (
            <div className="bg-[#F1F5F9] px-4 sm:px-6 py-3 border-t border-gray-200 overflow-x-auto">
              <Pagination links={articles.links} />
            </div>
          )}
        </div>

      </div>

      {/* Modal Konfirmasi Hapus Berita */}
      <ModalCard
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berita Permanen"
        message="Apakah Anda yakin ingin menghapus berita ini secara permanen? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        processing={isDeleting}
      />
      <Footer />
    </Sidebar>
  );
}