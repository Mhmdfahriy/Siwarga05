import React, { useEffect, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { ArrowLeft, Save, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import ModalCard from '@/Components/ModalCard';
import Footer from '@/Components/Footer';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: 'Keuangan', 
        excerpt: '',
        pemasukan_input: '',
        pengeluaran_input: '',
        saldo_input: 0,
        rincian_input: "1. \n2. \n3. ",
        content: '',
        image: null, 
        status: 'published',
        publish_type: 'now',  
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const pem = parseInt(data.pemasukan_input) || 0;
        const peng = parseInt(data.pengeluaran_input) || 0;
        setData('saldo_input', pem - peng);
    }, [data.pemasukan_input, data.pengeluaran_input]);

    const formatRincianToHtml = (text) => {
        if (!text) return '';
        return text.split('\n')
            .map(line => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`)
            .join('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
        
        const htmlContent = `
            <h3><strong>=== LAPORAN REALISASI KEUANGAN ===</strong></h3>
            <p>Total Pemasukan : ${formatRupiah(data.pemasukan_input || 0)}</p>
            <p>Total Pengeluaran : ${formatRupiah(data.pengeluaran_input || 0)}</p>
            <p>__________________________________</p>
            <p><strong>Saldo Kas Bersih : ${formatRupiah(data.saldo_input || 0)}</strong></p>
            <br/>
            <p><strong>Rincian Alokasi Dana:</strong></p>
            <ol>${formatRincianToHtml(data.rincian_input)}</ol>
        `;

        data.content = htmlContent;
        
        post(route('bendahara.news.store'), {
            forceFormData: true,
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
            <Head title="Buat Laporan Keuangan - Bendahara" />

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
                        <span className="text-[10px] font-bold text-[#0D7A57] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg">FORMULIR KEUANGAN</span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">Tulis Laporan Realisasi</h1>
                    </div>
                </div>

                {/* Main Form Card */}
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
                            placeholder="Contoh: Laporan Keuangan Kegiatan Agustusan RT 05"
                            className="w-full text-xs sm:text-sm p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] transition-all"
                            required
                        />
                    </div>

                    {/* Ringkasan Pendek (Excerpt) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Ringkasan Singkat (Muncul di Halaman Depan)
                        </label>
                        <input 
                            type="text" 
                            value={data.excerpt}
                            onChange={e => setData('excerpt', e.target.value)}
                            placeholder="Contoh: Transparansi rincian alokasi dana kegiatan..."
                            className="w-full text-xs sm:text-sm p-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] transition-all"
                        />
                    </div>

                    {/* INPUT KHUSUS NOMINAL ANGKA KAS */}
                    <div className="bg-[#F8FAFC] p-4 sm:p-5 border border-gray-200/80 rounded-2xl space-y-3">
                        <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Input Data Transaksi (Hanya Angka)
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Total Pemasukan
                                </label>
                                <input 
                                    type="number" 
                                    value={data.pemasukan_input}
                                    onChange={e => setData('pemasukan_input', e.target.value)}
                                    placeholder="Contoh: 90000"
                                    className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                                    <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" /> Total Pengeluaran
                                </label>
                                <input 
                                    type="number" 
                                    value={data.pengeluaran_input}
                                    onChange={e => setData('pengeluaran_input', e.target.value)}
                                    placeholder="Contoh: 20000"
                                    className="w-full text-xs sm:text-sm p-3 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                                    <Wallet className="w-3.5 h-3.5 text-blue-600" /> KAS BERSIH (OTOMATIS)
                                </label>
                                <div className="w-full text-xs sm:text-sm p-3 bg-blue-50/80 border border-blue-100 rounded-xl font-bold font-mono text-blue-700 flex items-center h-[42px]">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.saldo_input)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Text Catatan Alokasi Dana */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Rincian Alokasi Dana (Tekan Enter untuk Baris Baru)
                        </label>
                        <textarea 
                            rows="6"
                            value={data.rincian_input}
                            onChange={e => setData('rincian_input', e.target.value)}
                            placeholder="1. Pembelian bendera&#10;2. Konsumsi rapat&#10;3. Banner acara"
                            className="w-full text-xs sm:text-sm p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] transition-all leading-relaxed font-mono"
                            required
                        />
                        {errors.content && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.content}</p>}
                    </div>

                    {/* Upload Lampiran Bukti Transaksi dengan Live Preview */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Foto Nota / Lembar Rekap Transaksi (Opsional)
                        </label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#0D7A57]/50 rounded-2xl p-5 transition-all bg-gray-50/30 text-center space-y-3">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    setData('image', file);
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file));
                                    } else {
                                        setImagePreview(null);
                                    }
                                }}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#0D7A57] hover:file:bg-emerald-100 transition-all cursor-pointer"
                            />
                            
                            {imagePreview && (
                                <div className="pt-2 flex flex-col items-center">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pratinjau Foto Dipilih:</span>
                                    <img src={imagePreview} alt="Preview Bukti" className="w-36 h-auto rounded-xl border border-gray-200 object-cover shadow-xs" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-3">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-3.5 bg-[#0D7A57] hover:bg-[#0a6145] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" /> 
                            <span>{processing ? 'Memproses...' : 'Publikasikan Sekarang'}</span>
                        </button>
                    </div>

                </form>
            </div>

            {/* Modal Card Pemberitahuan Sukses */}
            <ModalCard
                isOpen={showSuccessModal}
                onClose={handleSuccessClose}
                onConfirm={handleSuccessClose}
                title="Berhasil Diterbitkan!"
                message="Laporan realisasi keuangan RT berhasil disimpan dan kini dapat diakses oleh warga."
                confirmText="OK, Mengerti"
                cancelText=""
                type="success"
            />
            <Footer />
        </Sidebar>
    );
}