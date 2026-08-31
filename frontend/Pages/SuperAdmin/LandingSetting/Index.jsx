import React, { useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import { Upload, Trash2, Image as ImageIcon, CheckCircle2, AlertCircle, Palette } from 'lucide-react';

export default function Index({ setting, galleries, flash }) {
    // State untuk kontrol ModalCard sukses
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    // Form untuk Pengaturan Beranda (Hero) saja tanpa modal
    const { data: homeData, setData: setHomeData, post: postHome, processing: processingHome, errors: errorsHome, setError: setHomeError, clearErrors: clearHomeErrors } = useForm({
        hero_title: setting?.hero_title || '',
        hero_highlight: setting?.hero_highlight || '',
        hero_highlight_color: setting?.hero_highlight_color || '#34d399',
        hero_subtitle: setting?.hero_subtitle || '',
        hero_bg_image: null,
    });

    // Form untuk Upload Galeri
    const { data: galleryData, setData: setGalleryData, post: postGallery, processing: processingGallery, errors: errorsGallery, setError: setGalleryError, clearErrors: clearGalleryErrors, reset: resetGallery } = useForm({
        title: '',
        image: null,
    });

    const fileInputRef = useRef(null);
    const [homeFileName, setHomeFileName] = useState('');
    const [galleryFileName, setGalleryFileName] = useState('');

    const handleFileChange = (e, fieldName, formType) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // Batas 2MB
            const errorMsg = 'Ukuran file tidak boleh lebih dari 2 MB.';
            if (formType === 'home') {
                setHomeError(fieldName, errorMsg);
                setHomeData(fieldName, null);
                setHomeFileName('');
            } else {
                setGalleryError(fieldName, errorMsg);
                setGalleryData(fieldName, null);
                setGalleryFileName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
            return;
        }

        if (formType === 'home') {
            clearHomeErrors(fieldName);
            setHomeData(fieldName, file);
            setHomeFileName(file.name);
        } else {
            clearGalleryErrors(fieldName);
            setGalleryData(fieldName, file);
            setGalleryFileName(file.name);
        }
    };

    const submitHome = (e) => {
        e.preventDefault();
        postHome(route('superadmin.landing.home'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSuccessModal({
                    isOpen: true,
                    title: 'Berhasil!',
                    message: 'Pengaturan Beranda berhasil disimpan.'
                });
            },
        });
    };

    const submitGallery = (e) => {
        e.preventDefault();
        postGallery(route('superadmin.landing.gallery.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                resetGallery();
                setGalleryFileName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                setSuccessModal({
                    isOpen: true,
                    title: 'Berhasil!',
                    message: 'Foto galeri berhasil diunggah.'
                });
            },
        });
    };

    const deleteGallery = (id) => {
        if (confirm('Yakin ingin menghapus foto ini dari galeri?')) {
            router.delete(route('superadmin.landing.gallery.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <Sidebar currentRole="superadmin" activeMenu="kelola-landing">
            <Head title="Pengaturan Landing Page" />

            <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Halaman Depan (Landing Page)</h1>
                    <p className="text-sm text-slate-500 mt-1">Sesuaikan konten banner utama dan galeri kegiatan warga.</p>
                </div>

                {flash?.status && (
                    <div className="flex items-center gap-3 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{flash.status}</span>
                    </div>
                )}

                {/* SECTION 1: PENGATURAN BERANDA */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Pengaturan Hero / Banner Utama</h2>
                            <p className="text-xs text-slate-500">Atur teks utama, teks sorotan berwarna, dan latar belakang.</p>
                        </div>
                    </div>

                    <form onSubmit={submitHome} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Utama</label>
                            <textarea
                                rows="3"
                                className="w-full border-slate-200 rounded-2xl shadow-xs focus:border-[#0D7A57] focus:ring-[#0D7A57] text-sm p-4"
                                value={homeData.hero_title}
                                onChange={(e) => setHomeData('hero_title', e.target.value)}
                                placeholder="Contoh: Sistem Informasi Lingkungan RT 05"
                            ></textarea>
                            {errorsHome.hero_title && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errorsHome.hero_title}</p>}
                        </div>

                        {/* Bagian Teks Sorotan & Color Picker */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Teks Sorotan / Highlight (Baris Berwarna)</label>
                                <input
                                    type="text"
                                    className="w-full border-slate-200 rounded-xl shadow-xs focus:border-[#0D7A57] focus:ring-[#0D7A57] text-sm px-4 py-2.5 bg-white"
                                    value={homeData.hero_highlight}
                                    onChange={(e) => setHomeData('hero_highlight', e.target.value)}
                                    placeholder="Contoh: Jaya Jaya Jaya"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Palette className="w-4 h-4 text-emerald-600" /> Warna Teks
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-1 bg-white"
                                        value={homeData.hero_highlight_color}
                                        onChange={(e) => setHomeData('hero_highlight_color', e.target.value)}
                                    />
                                    <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                        {homeData.hero_highlight_color}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sub Judul</label>
                            <input
                                type="text"
                                className="w-full border-slate-200 rounded-2xl shadow-xs focus:border-[#0D7A57] focus:ring-[#0D7A57] text-sm px-4 py-3"
                                value={homeData.hero_subtitle}
                                onChange={(e) => setHomeData('hero_subtitle', e.target.value)}
                            />
                            {errorsHome.hero_subtitle && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errorsHome.hero_subtitle}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Gambar Latar Belakang <span className="text-xs font-normal text-slate-400">(Opsional, Maksimal 2 MB)</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Pilih Berkas
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'hero_bg_image', 'home')}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-slate-500 truncate max-w-xs">
                                    {homeFileName || 'Belum ada berkas dipilih'}
                                </span>
                            </div>
                            {errorsHome.hero_bg_image && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errorsHome.hero_bg_image}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processingHome}
                                className="bg-[#0D7A57] text-white px-7 py-3 rounded-2xl text-sm font-bold hover:bg-[#0A6145] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                            >
                                {processingHome ? 'Menyimpan...' : 'Simpan Perubahan Beranda'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECTION 2: KELOLA GALERI */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Kelola Galeri Kegiatan</h2>
                            <p className="text-xs text-slate-500">Tambah atau hapus foto dokumentasi kegiatan warga.</p>
                        </div>
                    </div>

                    <form onSubmit={submitGallery} className="space-y-6 mb-8 pb-8 border-b border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Foto / Kegiatan</label>
                                <input
                                    type="text"
                                    className="w-full border-slate-200 rounded-2xl shadow-xs focus:border-[#0D7A57] focus:ring-[#0D7A57] text-sm px-4 py-3"
                                    value={galleryData.title}
                                    onChange={(e) => setGalleryData('title', e.target.value)}
                                    placeholder="Contoh: Kerjabakti RT 05"
                                />
                                {errorsGallery.title && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errorsGallery.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Berkas Foto <span className="text-xs font-normal text-slate-400">(Maksimal 2 MB)</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors">
                                        <Upload className="w-4 h-4" />
                                        Pilih Foto
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'image', 'gallery')}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-xs text-slate-500 truncate max-w-xs">
                                        {galleryFileName || 'Belum ada berkas dipilih'}
                                    </span>
                                </div>
                                {errorsGallery.image && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{errorsGallery.image}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processingGallery}
                            className="bg-[#0D7A57] text-white px-7 py-3 rounded-2xl text-sm font-bold hover:bg-[#0A6145] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                        >
                            {processingGallery ? 'Mengunggah...' : 'Unggah Foto Galeri'}
                        </button>
                    </form>

                    {/* Daftar Foto Galeri */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Daftar Foto Saat Ini ({galleries.length})</h3>
                        {galleries.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {galleries.map((g) => (
                                    <div key={g.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                                        <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                            <span className="text-white text-xs font-semibold truncate">{g.title || 'Tanpa Judul'}</span>
                                            <button
                                                type="button"
                                                onClick={() => deleteGallery(g.id)}
                                                className="self-end p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Belum ada foto galeri yang diunggah.</p>
                        )}
                    </div>
                </div>

            </div>

            {/* MODAL CARD UNTUK NOTIFIKASI BERHASIL */}
            <ModalCard
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                onConfirm={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
                confirmText="OK"
                cancelText={null}
                type="success"
            />
        </Sidebar>
    );
}