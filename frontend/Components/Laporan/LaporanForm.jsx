import React from 'react';
import { useForm } from '@inertiajs/react';

export default function LaporanForm({ onClose, routePrefix }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        judul: '',
        kategori: 'infrastruktur',
        deskripsi: '',
        lokasi: '',
        foto: null,
    });

    const handleKategoriChange = (e) => {
        const val = e.target.value;
        if (val === 'keuangan') {
            setData({ ...data, kategori: val, lokasi: '' });
        } else {
            setData('kategori', val);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Pastikan nama route ini sudah benar sesuai di web.php kamu ya
        post(route(`${routePrefix}.laporan.store`), {
            preserveScroll: true,
            forceFormData: true, // Tambahan untuk memastikan upload foto lancar
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-fadeIn">
            
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
                
                {/* Header Modal */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Buat Laporan Baru</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Sampaikan aspirasi untuk lingkungan RT kita.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                {/* FORM SEKARANG MEMBUNGKUS AREA INPUT DAN TOMBOL */}
                <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
                    
                    {/* Area Input yang bisa di-scroll */}
                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                        
                        {/* Judul Laporan */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Judul Laporan <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Contoh: Lampu Jalan Mati di RT 05"
                                value={data.judul} 
                                onChange={e => setData('judul', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm outline-none"
                            />
                            {errors.judul && <div className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.judul}</div>}
                        </div>

                        {/* Grid Kategori & Lokasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            <div className={data.kategori === 'keuangan' ? 'sm:col-span-2 transition-all duration-300' : 'transition-all duration-300'}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Kategori <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={data.kategori} 
                                    onChange={handleKategoriChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm outline-none cursor-pointer appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="infrastruktur">Infrastruktur</option>
                                    <option value="keamanan">Keamanan</option>
                                    <option value="sosial">Sosial</option>
                                    <option value="kebersihan">Kebersihan</option>
                                    <option value="keuangan">Keuangan / Iuran RT</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                                {errors.kategori && <div className="text-rose-500 text-xs mt-1.5 font-medium">{errors.kategori}</div>}
                            </div>

                            {data.kategori !== 'keuangan' && (
                                <div className="animate-fadeIn">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Lokasi / Patokan
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: Depan Pos Ronda"
                                        value={data.lokasi} 
                                        onChange={e => setData('lokasi', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm outline-none"
                                    />
                                    {errors.lokasi && <div className="text-rose-500 text-xs mt-1.5 font-medium">{errors.lokasi}</div>}
                                </div>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Deskripsi Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <textarea 
                                rows="3" 
                                placeholder="Ceritakan detail masalah yang ingin dilaporkan secara jelas..."
                                value={data.deskripsi} 
                                onChange={e => setData('deskripsi', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm outline-none resize-none"
                            />
                            {errors.deskripsi && <div className="text-rose-500 text-xs mt-1.5 font-medium">{errors.deskripsi}</div>}
                        </div>

                        {/* Upload Foto */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Bukti Foto <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                    <div className={`p-2 rounded-full mb-2 transition-colors ${data.foto ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm'}`}>
                                        {data.foto ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium">
                                        {data.foto ? (
                                            <span className="text-emerald-600 font-bold">{data.foto.name}</span>
                                        ) : (
                                            <>Klik untuk unggah file</>
                                        )}
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={e => setData('foto', e.target.files[0])}
                                />
                            </label>
                            {errors.foto && <div className="text-rose-500 text-xs mt-1.5 font-medium">{errors.foto}</div>}
                        </div>
                    </div>

                    {/* Footer Actions (SEKARANG SUDAH DI DALAM TAG FORM) */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 rounded-b-3xl shrink-0">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Laporan'
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}