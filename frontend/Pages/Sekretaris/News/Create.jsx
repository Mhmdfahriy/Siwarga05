import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react'; 
import TextEditor from '@/Components/TextEditor'; 
import { ChevronDown, Image as ImageIcon, Send, ArrowLeft, Calendar } from 'lucide-react'; 
import Sidebar from '@/Layouts/Sidebar';
import Footer from '@/Components/Footer';

export default function Create() {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    category: 'Announcement', 
    featured_tag: '',
    content: '',
    thumbnail: null,
    publish_type: 'now',
    published_at: '',
    // Data tambahan untuk Kalender
    is_event: false,
    event_date: '',
    event_time: '',
    event_location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.publish_type === 'schedule' && !data.published_at) {
      alert('Silakan tentukan tanggal dan waktu penjadwalan terlebih dahulu!');
      return;
    }

    // Validasi pencegahan jika dicentang sebagai event tapi tanggal kosong
    if (data.is_event && !data.event_date) {
      alert('Silakan tentukan tanggal acara jika ingin menampilkannya di Kalender Warga!');
      return;
    }

    post(route('sekretaris.news.store'), {
      onSuccess: () => {
        reset();
      },
      onError: (err) => {
        console.error("Gagal memproses artikel:", err);
      }
    });
  };

  return (
    <Sidebar currentRole="sekretaris" activeMenu="news">
      <Head title="Buat Artikel Baru - Siwarga05" />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans flex flex-col min-h-screen">
        
        {/* HEADER UTAMA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div className="flex flex-col gap-3">
            <Link 
              href={route('sekretaris.news.manage')} 
              className="inline-flex w-fit items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke manajemen berita</span>
            </Link>
            
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Buat Artikel Baru</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Tulis informasi atau berita lingkungan RT 05 terbaru</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start flex-1 mb-8">
          
          {/* KANVAS FORM UTAMA */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">
            
            {/* Judul Berita */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Judul Berita</label>
              <input 
                type="text"
                placeholder="Contoh: Kerja Bakti Mingguan RT 05: Revitalisasi Taman"
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none transition-all ${
                  errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57]'
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
            </div>

            {/* Kategori & Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Kategori</label>
                <div className="relative">
                  <select
                    value={data.category}
                    onChange={e => setData('category', e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57] transition-all cursor-pointer"
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Informasi">Informasi</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Tag Unggulan</label>
                <input 
                  type="text"
                  placeholder="Contoh: #GotongRoyong"
                  value={data.featured_tag}
                  onChange={e => setData('featured_tag', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57] transition-all"
                />
              </div>
            </div>

            {/* Foto Sampul */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Foto Sampul</label>
              <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 sm:p-10 hover:bg-gray-50/50 transition-all text-center group cursor-pointer">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => setData('thumbnail', e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-3 bg-gray-50 rounded-xl mb-3 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Klik untuk mengunggah atau seret gambar</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {data.thumbnail ? data.thumbnail.name : 'PNG, JPG hingga 10MB (Rekomendasi rasio 16:9)'}
                </p>
              </div>
              {errors.thumbnail && <p className="text-xs text-red-500 font-medium">{errors.thumbnail}</p>}
            </div>

            {/* EDITOR RICH TEXT UTAMA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Konten Utama</label>
              <TextEditor 
                value={data.content} 
                onChange={(val) => setData('content', val)} 
              />
              {errors.content && <p className="text-xs text-red-500 font-medium">{errors.content}</p>}
            </div>

            {/* Pengaturan Masuk ke Kalender Warga */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={data.is_event}
                  onChange={(e) => setData('is_event', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#0D7A57] focus:ring-[#0D7A57] cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0D7A57]" />
                  Jadikan sebagai Agenda Kalender Warga
                </span>
              </label>

              {data.is_event && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8FAFC] p-5 rounded-2xl border border-gray-200 transition-all">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Tanggal Acara <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={data.event_date}
                      onChange={(e) => setData('event_date', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:ring-1 focus:ring-[#0D7A57]"
                      required={data.is_event}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Waktu (WIB)</label>
                    <input
                      type="time"
                      value={data.event_time}
                      onChange={(e) => setData('event_time', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:ring-1 focus:ring-[#0D7A57]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Lokasi <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Contoh: Balai Warga"
                      value={data.event_location}
                      onChange={(e) => setData('event_location', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:ring-1 focus:ring-[#0D7A57]"
                      required={data.is_event}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* KOLOM SAMPING KANAN (DITUKAR URUTANNYA) */}
          <div className="space-y-6">
            
            {/* Panduan Penerbitan (Sekarang di atas) */}
            <div className="bg-[#F8FAFC] rounded-3xl border border-gray-200/60 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 font-bold text-gray-700 text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#0D7A57]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Panduan Penerbitan</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-500 list-disc list-inside pl-1 leading-relaxed">
                <li>Buat judul yang singkat & jelas.</li>
                <li>Sertakan foto berkualitas tinggi.</li>
                <li>Gunakan tag kategori agar mudah dicari warga.</li>
                <li><strong>Centang "Jadikan Agenda"</strong> jika artikel ini merupakan undangan fisik/acara.</li>
              </ul>
            </div>

            {/* Opsi Penerbitan (Sekarang di bawah) */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                <Send className="w-4 h-4 text-gray-500 rotate-45" />
                <span>Opsi Penerbitan</span>
              </div>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-3.5 sm:p-4 border rounded-2xl cursor-pointer transition-all ${data.publish_type === 'now' ? 'border-[#0D7A57] bg-emerald-50/20' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="publish_type" 
                    value="now" 
                    checked={data.publish_type === 'now'} 
                    onChange={() => setData('publish_type', 'now')} 
                    className="mt-0.5 accent-[#0D7A57] h-4 w-4 shrink-0 cursor-pointer" 
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Publish Sekarang</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Langsung dapat dilihat oleh warga</p>
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
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">Jadwalkan</p>
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
                          className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-[#0D7A57] focus:ring-1 focus:ring-[#0D7A57] [color-scheme:light]"
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

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-medium">
                <span className="text-gray-400">Visibilitas:</span>
                <span className="text-[#0D7A57] font-semibold">Publik (Semua Warga)</span>
              </div>

              <button 
                type="submit" 
                disabled={processing} 
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0D7A57] hover:bg-[#0A6145] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 rotate-45" />
                <span>
                  {processing ? 'Memproses...' : data.publish_type === 'schedule' ? 'Jadwalkan Artikel' : 'Terbitkan Artikel'}
                </span>
              </button>
            </div>

          </div>

        </form>
        
        {/* Footer */}
        <div className="mt-auto -mx-4 sm:-mx-6 md:-mx-8">
            <Footer />
        </div>
      </div>
    </Sidebar>
  );
}