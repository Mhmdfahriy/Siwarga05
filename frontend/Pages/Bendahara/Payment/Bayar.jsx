import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    CheckCircle2, 
    UploadCloud, 
    Wallet,
    Info,
    AlertCircle,
    HeartHandshake,
    Copy,       
    Check       
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar'; 
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';

export default function Bayar({ user, dues = [], paymentMethods = [] }) {
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [copied, setCopied] = useState(false); 

   
    const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

    // Filter tagihan yang masih aktif (belum dibayar)
    const activeDues = dues;

    // State nominal custom untuk tagihan bertipe 'seikhlasnya' atau yang nominalnya 0
    const [customAmounts, setCustomAmounts] = useState({});

    const getDueAmount = (due) => {
        if (due.type === 'seikhlasnya' || Number(due.amount) === 0) {
            return Number(customAmounts[due.id] || 0);
        }
        return Number(due.amount);
    };

    const totalPayment = activeDues.reduce((sum, item) => sum + getDueAmount(item), 0);

    const hasEmptySeikhlasnya = activeDues.some(
        (due) => (due.type === 'seikhlasnya' || Number(due.amount) === 0) && (!customAmounts[due.id] || Number(customAmounts[due.id]) <= 0)
    );

    const { data, setData, post, processing, errors } = useForm({
        due_ids: activeDues.map(d => d.id),
        payment_method_id: '',
        custom_amounts: {},
        proof_photo: null
    });

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka || 0);
    };

    const qrisMethods = paymentMethods.filter(m => m.type === 'qris');
    const bankMethods = paymentMethods.filter(m => m.type === 'bank');
    const ewalletMethods = paymentMethods.filter(m => m.type === 'ewallet');

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
        setData('payment_method_id', method.id);
    };

    const handleCustomAmountChange = (dueId, value) => {
        const next = { ...customAmounts, [dueId]: value };
        setCustomAmounts(next);
        setData('custom_amounts', next);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('proof_photo', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Fungsi untuk menyalin teks ke clipboard
    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset status tersalin setelah 2 detik
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route(`${prefix}.dues.submit-payment`), {
            preserveScroll: true,
        });
    };

    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <Head title="Pilih Metode Pembayaran" />

            <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
                    
                    {/* Header Navigasi & Notifikasi */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                        <div className="flex items-center gap-3">
                            {step === 1 ? (
                                <Link 
                                    href={route(`${prefix}.dues.index`)} 
                                    className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 transition shadow-xs"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)} 
                                    className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-600 transition shadow-xs cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            )}
                            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                {step === 1 ? 'Pilih Metode Pembayaran' : 'Instruksi & Upload Bukti'}
                            </h1>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                            <NotifikasiBell prefix={prefix} />
                        </div>
                    </div>

                    {/* SUMMARY CARD */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pembayaran Dipilih</span>
                            <span className="bg-emerald-50 text-[#0D7A57] px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border border-emerald-100">
                                {activeDues.length} Item Tagihan
                            </span>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D7A57] tracking-tight">
                                {formatRupiah(totalPayment)}
                            </h2>
                        </div>

                        <div className="space-y-3 pt-2">
                            {activeDues.map((due) => (
                                <div key={due.id} className={(due.type === 'seikhlasnya' || Number(due.amount) === 0) ? 'space-y-2' : 'flex justify-between items-center text-xs'}>
                                    {(due.type === 'seikhlasnya' || Number(due.amount) === 0) ? (
                                        <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <HeartHandshake className="w-4 h-4 text-[#0D7A57] shrink-0" />
                                                <span className="text-gray-900 font-bold text-xs">{due.title}</span>
                                                <span className="ml-auto text-[9px] font-extrabold text-[#0D7A57] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-wider">
                                                    Seikhlasnya
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    inputMode="numeric"
                                                    placeholder="Masukkan nominal sesuai keikhlasan"
                                                    value={customAmounts[due.id] || ''}
                                                    onChange={(e) => handleCustomAmountChange(due.id, e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-gray-600 font-medium">{due.title}</span>
                                            <span className="font-bold text-gray-900">{formatRupiah(due.amount)}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {hasEmptySeikhlasnya && (
                            <p className="text-amber-600 text-xs font-bold mt-2 flex items-center gap-1.5 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                Mohon isi nominal tagihan seikhlasnya di atas terlebih dahulu.
                            </p>
                        )}
                    </div>

                    {/* ================= STEP 1: PILIH METODE ================= */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {qrisMethods.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rekomendasi (QRIS)</h3>
                                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                                        {qrisMethods.map(method => (
                                            <div 
                                                key={method.id}
                                                onClick={() => handleSelectMethod(method)}
                                                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-50 last:border-none ${
                                                    selectedMethod?.id === method.id ? 'bg-emerald-50/30' : 'hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-9 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-[10px] font-extrabold text-gray-500 shadow-xs">
                                                        QRIS
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">QRIS ({method.provider_name})</h4>
                                                        <p className="text-[11px] text-[#0D7A57] font-bold mt-0.5">sipaling sat set</p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                    selectedMethod?.id === method.id ? 'border-[#0D7A57] bg-emerald-50' : 'border-gray-300'
                                                }`}>
                                                    {selectedMethod?.id === method.id && <div className="w-2 h-2 bg-[#0D7A57] rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bankMethods.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Virtual Account / Transfer Bank</h3>
                                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-50">
                                        {bankMethods.map(method => (
                                            <div 
                                                key={method.id}
                                                onClick={() => handleSelectMethod(method)}
                                                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${
                                                    selectedMethod?.id === method.id ? 'bg-emerald-50/30' : 'hover:bg-gray-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-9 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                                                        VA
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{method.provider_name}</h4>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                    selectedMethod?.id === method.id ? 'border-[#0D7A57] bg-emerald-50' : 'border-gray-300'
                                                }`}>
                                                    {selectedMethod?.id === method.id && <div className="w-2 h-2 bg-[#0D7A57] rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ewalletMethods.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">E-Wallet</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ewalletMethods.map(method => (
                                            <div 
                                                key={method.id}
                                                onClick={() => handleSelectMethod(method)}
                                                className={`p-4 bg-white border rounded-3xl flex items-center justify-between cursor-pointer transition shadow-xs ${
                                                    selectedMethod?.id === method.id ? 'border-[#0D7A57] bg-emerald-50/30 ring-1 ring-[#0D7A57]' : 'border-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className="w-10 h-8 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 flex items-center justify-center text-[9px] font-extrabold shrink-0 shadow-xs">
                                                        WALLET
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-xs truncate">{method.provider_name}</h4>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                    selectedMethod?.id === method.id ? 'border-[#0D7A57] bg-emerald-50' : 'border-gray-300'
                                                }`}>
                                                    {selectedMethod?.id === method.id && <div className="w-2 h-2 bg-[#0D7A57] rounded-full" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.payment_method_id && <p className="text-red-500 text-xs font-bold">{errors.payment_method_id}</p>}
                        </div>
                    )}

                    {/* ================= STEP 2: INSTRUKSI & UPLOAD ================= */}
                    {step === 2 && selectedMethod && (
                        <div className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 space-y-4">
                                <h3 className="text-[#0D7A57] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Instruksi Pembayaran:
                                </h3>
                                
                                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
                                    <p className="text-xs text-gray-500 font-medium">
                                        {selectedMethod.type === 'qris' ? 'Scan QRIS berikut menggunakan aplikasi m-banking atau e-wallet Anda:' : `Transfer melalui rekening ${selectedMethod.provider_name}:`}
                                    </p>
                                    
                                    {selectedMethod.type === 'qris' ? (
                                        <div className="flex justify-center my-2">
                                            <div className="w-48 h-48 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 p-2 shadow-xs">
                                                {selectedMethod.qris_image ? (
                                                    <img src={`/storage/${selectedMethod.qris_image}`} alt="QRIS" className="w-full h-full object-contain rounded-xl" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Gambar QRIS tidak tersedia</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // BAGIAN INI DITAMBAHKAN TOMBOL SALIN DI SEBELAH KANAN
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-wider">
                                                    {selectedMethod.account_number || '-'}
                                                </p>
                                                <p className="text-xs text-gray-500 font-semibold mt-1">
                                                    Atas Nama: <span className="text-gray-900">{selectedMethod.account_holder || '-'}</span>
                                                </p>
                                            </div>

                                            {selectedMethod.account_number && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyText(selectedMethod.account_number)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] border border-emerald-200 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer shadow-xs"
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>Tersalin!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Salin</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-900 space-y-1">
                                    <p className="font-bold">Catatan Penting:</p>
                                    <p>1. Pastikan nominal transfer sesuai total tagihan terpilih yaitu <strong className="font-bold">{formatRupiah(totalPayment)}</strong>.</p>
                                    <p>2. Unggah foto bukti transfer/struk pembayaran yang sah di bawah ini untuk diverifikasi bendahara.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Upload Bukti Transfer</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Pastikan nominal dan tanggal transaksi pada struk terlihat jelas.</p>
                                </div>

                                <label className={`block w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                                    previewImage ? 'border-[#0D7A57] bg-emerald-50/10' : 'border-gray-200 hover:border-[#0D7A57] bg-gray-50/50'
                                }`}>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    
                                    {previewImage ? (
                                        <div className="flex flex-col items-center">
                                            <img src={previewImage} alt="Preview" className="h-44 rounded-xl object-contain mb-3 shadow-xs border border-gray-200 bg-white p-1" />
                                            <span className="text-xs text-[#0D7A57] font-bold hover:underline">Ganti Foto Bukti</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-4 space-y-2">
                                            <UploadCloud className="w-10 h-10 text-[#0D7A57]" />
                                            <p className="text-xs font-bold text-gray-700">Klik untuk upload foto struk transfer</p>
                                            <p className="text-[10px] text-gray-400">Format: JPG, PNG (Maks. 2MB)</p>
                                        </div>
                                    )}
                                </label>
                                {errors.proof_photo && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><Info className="w-3 h-3"/>{errors.proof_photo}</p>}
                            </div>
                        </div>
                    )}

                    {/* Fixed Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-100 p-4 sm:px-8 shadow-lg z-20">
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Metode Dipilih:</p>
                                <p className={`text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-xs ${selectedMethod ? 'text-[#0D7A57]' : 'text-gray-400'}`}>
                                    {selectedMethod ? `${selectedMethod.type.toUpperCase()} - ${selectedMethod.provider_name}` : 'Belum dipilih'}
                                </p>
                            </div>

                            {step === 1 ? (
                                <button 
                                    type="button"
                                    disabled={!selectedMethod || hasEmptySeikhlasnya}
                                    onClick={() => setStep(2)}
                                    className="bg-[#0D7A57] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0A6145] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer shrink-0"
                                >
                                    Lanjut Pembayaran
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    disabled={!data.proof_photo || processing || hasEmptySeikhlasnya}
                                    onClick={handleSubmit}
                                    className="bg-[#0D7A57] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0A6145] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer shrink-0"
                                >
                                    {processing ? 'Memproses...' : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Kirim Pembayaran</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </Sidebar>
    );
}