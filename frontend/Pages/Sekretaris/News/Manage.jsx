import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, FileText, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import NewsTable from '@/Components/News/NewsTable';
import ModalCard from '@/Components/ModalCard';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

export default function Index({ auth, articles }) {
  // Menyimpan data array berita dari data pagination Laravel (articles.data)
  const [dataBerita, setDataBerita] = useState(articles?.data || []);
  
  // State untuk melacak tab filter yang sedang aktif
  const [activeTab, setActiveTab] = useState('semua');

  // State untuk mengontrol Modal Hapus
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sinkronisasi state lokal jika ada pembaruan data atau perpindahan halaman pagination
  useEffect(() => {
    setDataBerita(articles?.data || []);
  }, [articles]);

  // 💡 PANTAUAN REAL-TIME: Mengecek jadwal waktu rilis berita setiap 10 detik memakai `raw_date`
  useEffect(() => {
    const interval = setInterval(() => {
      const waktuSekarang = new Date();

      setDataBerita((beritaLama) => {
        let adaPerubahan = false;
        
        const beritaTerpindah = beritaLama.map((item) => {
          if (item.status === 'scheduled' && item.raw_date) {
            const waktuJadwal = new Date(item.raw_date); 
            
            if (!isNaN(waktuJadwal) && waktuJadwal <= waktuSekarang) {
              adaPerubahan = true;
              return { ...item, status: 'published' }; // Ubah status di layer secara instan tanpa reload
            }
          }
          return item;
        });

        return adaPerubahan ? beritaTerpindah : beritaLama;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 🌟 Mengambil total data keseluruhan dari pagination database, bukan per halaman
  const totalSemuaBerita = articles?.total || dataBerita.length;
  
  // Statistik filter (berdasarkan halaman aktif saat ini untuk menjaga sinkronisasi visual tabel)
  const jumlahTerbit = dataBerita.filter(a => a.status === 'published').length || 0;
  const jumlahJadwal = dataBerita.filter(a => a.status === 'scheduled').length || 0;

  // Menyaring data berita berdasarkan tab status yang dipilih
  const dataBeritaTerfilter = dataBerita.filter((item) => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'dijadwalkan') return item.status === 'scheduled';
    if (activeTab === 'diterbitkan') return item.status === 'published';
    return true;
  });

  // Fungsi saat tombol hapus pada baris tabel ditekan (membuka modal)
  const handleDeleteClick = (id) => {
    setArticleToDelete(id);
  };

  // Fungsi eksekusi hapus setelah dikonfirmasi lewat ModalCard
  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    setIsDeleting(true);

    router.delete(route('sekretaris.news.destroy', articleToDelete), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setArticleToDelete(null);
      }
    });
  };

  return (
    <Sidebar currentRole="sekretaris" activeMenu="news">
      <Head title="Manajemen Berita & Pengumuman - Sekretaris" />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Header Atas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-3"> 
            <Link 
              href={route('sekretaris.news.index')} 
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Manajemen Berita & Pengumuman
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Tulis, edit, dan kelola seluruh informasi publik untuk warga RT 05.
              </p>
            </div>
          </div>
  
          <Link
            href={route('sekretaris.news.create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0A6145] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Berita Baru</span>
          </Link>
        </div>

        {/* Grid Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Total Berita Keseluruhan */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Berita</span>
              <span className="text-base sm:text-lg font-extrabold text-gray-800">{totalSemuaBerita}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D7A57] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sudah Terbit</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600">{jumlahTerbit}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Dijadwalkan</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-600">{jumlahJadwal}</span>
            </div>
          </div>
        </div>

        {/* Navigasi Klaster Filter Status (Tabs) */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 select-none overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('semua')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'semua' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua Berita
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diterbitkan')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'diterbitkan' ? 'bg-[#0D7A57] text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Sudah Terbit
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dijadwalkan')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'dijadwalkan' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>Dijadwalkan</span>
            {jumlahJadwal > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                activeTab === 'dijadwalkan' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
              }`}>
                {jumlahJadwal}
              </span>
            )}
          </button>
        </div>

        {/* Wadah Tabel Data Berita & Pagination */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabel Pengolah Data Berita */}
          <NewsTable 
            articles={dataBeritaTerfilter} 
            onDelete={handleDeleteClick} 
            role="sekretaris" 
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