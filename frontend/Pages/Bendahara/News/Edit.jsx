import React, { useEffect, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { ArrowLeft, Save } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ModalCard from '@/Components/ModalCard'; 
import Footer from '@/Components/Footer';

export default function Edit({ news }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', 
        title: news?.title || '',
        category: 'Keuangan',
        excerpt: news?.excerpt || '',
        content: news?.main_content || news?.content || '', 
        image: null,
        status: 'published',
        publish_type: news?.publish_type || 'now',
        published_at: news?.published_at || '',
    });

    // State untuk kontrol Modal Sukses Edit
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Inisialisasi Tiptap Editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: data.content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] p-4 text-xs sm:text-sm font-sans text-gray-700',
            },
        },
        onUpdate: ({ editor }) => {
            setData('content', editor.getHTML());
        },
    });

    // Sinkronisasi data jika component mendapat update state
    useEffect(() => {
        if (editor && data.content !== editor.getHTML()) {
            editor.commands.setContent(data.content);
        }
    }, [data.content, editor]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('bendahara.news.update', news.id), {
            forceFormData: true,
            transform: (data) => ({
                ...data,
                published_at: data.publish_type === 'now' ? '' : data.published_at,
            }),
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: (errors) => console.log("Terjadi error validasi:", errors)
        });
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        window.location.href = route('bendahara.news.manage');
    };

    return (
        <Sidebar currentRole="bendahara" activeMenu="news">
            <Head title="Koreksi Laporan Keuangan - Bendahara" />

            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 font-sans">
                
                {/* Header Formulir */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
                    <Link 
                        href={route('bendahara.news.manage')} 
                        className="p-2.5 bg-white rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-xs cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg">KOREKSI DATA</span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">Edit Laporan Keuangan</h1>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    
                    {/* Judul Laporan */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Judul Laporan / Berita
                        </label>
                        <input 
                            type="text" 
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full text-xs sm:text-sm p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] transition-all"
                            required
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
                    </div>

                    {/* Ringkasan Singkat */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Ringkasan Singkat
                        </label>
                        <input 
                            type="text" 
                            value={data.excerpt}
                            onChange={e => setData('excerpt', e.target.value)}
                            className="w-full text-xs sm:text-sm p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] transition-all"
                        />
                        {errors.excerpt && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.excerpt}</p>}
                    </div>

                    {/* Editor Tiptap */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Rincian Buku Kas / Catatan Laporan
                        </label>
                        <div className="w-full border border-gray-200 rounded-2xl bg-gray-50/30 overflow-hidden focus-within:ring-1 focus-within:ring-[#0D7A57] focus-within:border-[#0D7A57] transition-all">
                            <EditorContent editor={editor} />
                        </div>
                        {errors.content && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.content}</p>}
                    </div>

                    {/* Preview Bukti Transaksi Saat Ini */}
                    {news?.image && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Bukti Transaksi Saat Ini
                            </label>
                            <img 
                                src={news.image} 
                                alt="Nota Transaksi" 
                                className="w-36 h-auto rounded-2xl border border-gray-200 p-1.5 object-cover bg-gray-50"
                            />
                        </div>
                    )}

                    {/* Upload Foto Nota Baru */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Ganti Foto Nota / Bukti Transaksi (Kosongkan jika tidak diganti)
                        </label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#0D7A57]/50 rounded-2xl p-5 transition-all bg-gray-50/30 text-center">
                            <input 
                                type="file" 
                                onChange={e => setData('image', e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#0D7A57] hover:file:bg-emerald-100 transition-all cursor-pointer"
                            />
                        </div>
                        {errors.image && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.image}</p>}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-3">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3.5 bg-[#0D7A57] hover:bg-[#0a6145] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" /> 
                            <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal Sukses Perubahan Disimpan */}
            <ModalCard
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                onConfirm={handleSuccessClose}
                title="Perubahan Berhasil Disimpan!"
                message="Data laporan realisasi keuangan RT telah berhasil diperbarui di dalam sistem."
                confirmText="OK, Mengerti"
                cancelText=""
                type="success"
            />
            <Footer />
        </Sidebar>
    );
}