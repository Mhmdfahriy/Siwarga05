import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Calendar, Globe } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import TextEditor from '@/Components/TextEditor'; 
import Footer from '@/Components/Footer';

export default function Edit({ auth, news }) {
  // Inisialisasi formulir dengan spoofing metode PUT
  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT', // Memberitahu Laravel untuk membaca ini sebagai request PUT
    title: news.title || '',
    category: news.category || '',
    excerpt: news.excerpt || '',
    content: news.main_content || '', 
    thumbnail: null,
    publish_type: news.publish_type || 'now', 
    published_at: news.published_at || '', 
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('sekretaris.news.update', news.id), {
      forceFormData: true,
      transform: (data) => ({
        ...data,
        published_at: data.publish_type === 'now' ? '' : data.published_at,
      }),
    });
  };

  return (
    <Sidebar currentRole="sekretaris" activeMenu="news">
      <Head title={`Edit Berita: ${news.title} - Sekretaris`} />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        
        {/* Tombol Kembali */}
        <div>
          <Link 
            href={route('sekretaris.news.manage')} 
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Manajemen Berita</span>
          </Link>
        </div>

        {/* Header Judul */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Edit Berita & Pengumuman
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Perbarui informasi atau ubah jadwal penayangan berita warga.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Kolom Kiri: Form Utama */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 sm:space-y-5">
              
              {/* Input Judul */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Judul Berita</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57]"
                  placeholder="Masukkan judul berita utama..."
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-0.5">{errors.title}</p>}
              </div>

              {/* Kategori */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kategori</label>
                <select
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57]"
                >
                  <option value="Informasi">Informasi Umum</option>
                  <option value="Kegiatan">Kegiatan Warga</option>
                  <option value="Pengumuman">Pengumuman Penting</option>
                  <option value="Laporan">Laporan Keuangan</option>
                </select>
                {errors.category && <p className="text-[11px] text-red-500 mt-0.5">{errors.category}</p>}
              </div>

              {/* Ringkasan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ringkasan Singkat</label>
                <textarea
                  rows="3"
                  value={data.excerpt}
                  onChange={(e) => setData('excerpt', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57] resize-none"
                  placeholder="Tulis ringkasan berita pendek untuk halaman depan..."
                />
                {errors.excerpt && <p className="text-[11px] text-red-500 mt-0.5">{errors.excerpt}</p>}
              </div>

              {/* Isi Konten Utama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Isi Berita Lengkap</label>
                <TextEditor 
                  value={data.content} 
                  onChange={(val) => setData('content', val)} 
                />
                {errors.content && <p className="text-[11px] text-red-500 mt-0.5">{errors.content}</p>}
              </div>

            </div>
          </div>

          {/* Kolom Kanan: Thumbnail & Opsi Terbit */}
          <div className="space-y-6">
            
            {/* Thumbnail */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Foto Sampul (Thumbnail)</label>
              
              {news.image && !data.thumbnail && (
                <div className="rounded-xl overflow-hidden border border-gray-100 max-h-[140px]">
                  <img src={news.image} alt="Current cover" className="w-full h-full object-cover" />
                </div>
              )}

              <input
                type="file"
                onChange={(e) => setData('thumbnail', e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#0D7A57] hover:file:bg-emerald-100 cursor-pointer"
              />
              <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP. Maksimal 2MB. Kosongkan jika tidak ingin mengubah gambar.</p>
              {errors.thumbnail && <p className="text-[11px] text-red-500 mt-0.5">{errors.thumbnail}</p>}
            </div>

            {/* Opsi Penerbitan */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Opsi Penerbitan</label>
              
              <div className="flex flex-col gap-3">
                
                <label className={`flex items-start gap-3 p-3.5 sm:p-4 border rounded-2xl cursor-pointer transition-all ${data.publish_type === 'now' ? 'border-[#0D7A57] bg-emerald-50/20' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="publish_type" 
                    value="now" 
                    checked={data.publish_type === 'now'} 
                    onChange={() => {
                      setData((old) => ({ ...old, publish_type: 'now', published_at: '' }));
                    }} 
                    className="mt-0.5 accent-[#0D7A57] h-4 w-4 shrink-0 cursor-pointer" 
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#0D7A57]" /> Terbitkan Sekarang
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Berita langsung dapat diakses oleh seluruh warga</p>
                  </div>
                </label>

                <label className={`flex flex-col gap-3 p-3.5 sm:p-4 border rounded-2xl cursor-pointer transition-all ${data.publish_type === 'schedule' ? 'border-[#0D7A57] bg-emerald-50/20' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="publish_type" 
                      value="schedule" 
                      checked={data.publish_type === 'schedule'} 
                      onChange={() => setData('publish_type', 'schedule')} 
                      className="mt-0.5 accent-[#0D7A57] h-4 w-4 shrink-0 cursor-pointer" 
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> Jadwalkan Rilis
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Pilih tanggal & waktu mendatang</p>
                    </div>
                  </div>

                  {data.publish_type === 'schedule' && (
                    <div className="mt-1 pt-3 border-t border-gray-100 transition-all space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Tanggal & Waktu Rilis (WIB)
                      </label>
                      <div className="relative flex items-center">
                        <input 
                          type="datetime-local"
                          value={data.published_at}
                          onChange={e => setData('published_at', e.target.value)}
                          className="w-full pl-3 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57] [color-scheme:light]"
                        />
                        <span className="absolute right-3 text-[10px] font-extrabold text-gray-400 pointer-events-none bg-white pl-1">
                          WIB
                        </span>
                      </div>
                      {errors.published_at && <p className="text-[11px] text-red-500 mt-1">{errors.published_at}</p>}
                    </div>
                  )}
                </label>

              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-2">
              <Link
                href={route('sekretaris.news.index')}
                className="flex-1 text-center py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0D7A57] hover:bg-[#0A6145] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>

          </div>

        </form>

      </div>
      <Footer />
    </Sidebar>
  );
}