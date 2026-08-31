import React from 'react';
import { AlertTriangle, X, MessageSquareText, CheckCircle2 } from 'lucide-react';

export default function ModalCard({
    isOpen,
    onClose,
    onConfirm,
    title = "Konfirmasi",
    message = "Apakah kamu yakin?",
    confirmText = "Simpan",
    cancelText = "Batal",
    type = "warning", // 'warning', 'danger', 'success', 'prompt'
    processing = false,
    imageUrl = null, // Untuk nampung foto preview

    // TAMBAHAN BARU: untuk modal bertipe "prompt" (isi teks, mis. alasan penolakan)
    inputValue = "",
    onInputChange = () => {},
    inputPlaceholder = "Tulis alasan di sini...",
    inputRequired = true,
}) {
    if (!isOpen) return null;

    const isDanger = type === "danger";
    const isSuccess = type === "success";
    const isPrompt = type === "prompt";

    const confirmDisabled = processing || (isPrompt && inputRequired && !inputValue.trim());

    const handleConfirm = () => {
        if (confirmDisabled) return;
        onConfirm(isPrompt ? inputValue : undefined);
    };

    return (
        /* Latar belakang gelap solid murni tanpa efek blur, klik di luar akan menutup modal */
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div 
                className={`bg-white rounded-2xl border border-gray-100 ${imageUrl ? 'max-w-2xl' : 'max-w-md'} w-full p-6 shadow-xl relative scale-100 transition-all`} 
                onClick={(e) => e.stopPropagation()}
            >

                {/* Tombol Close (X) di pojok kanan (Sekarang bergantung pada onClose, bukan cancelText) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-50 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* KONDISI 1: Jika ada imageUrl, tampilkan modal khusus gambar */}
                {imageUrl ? (
                    <div>
                        {/* Tambahan pr-10 agar teks judul tidak menabrak tombol X */}
                        <h3 className="text-base font-bold text-gray-900 mb-4 pr-10">{title}</h3>
                        <div className="overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center border border-gray-100">
                            <img
                                src={imageUrl}
                                alt="Preview Bukti"
                                className="w-full max-h-[75vh] object-contain"
                            />
                        </div>
                    </div>
                ) : isPrompt ? (
                    /* KONDISI 2: Modal Input Teks (pengganti window.prompt) */
                    <>
                        <div className="flex items-center gap-4 mb-4 pr-10">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500">
                                <MessageSquareText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                            {message}
                        </p>

                        <textarea
                            autoFocus
                            rows={3}
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            placeholder={inputPlaceholder}
                            disabled={processing}
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-50 mb-6"
                        />

                        <div className="flex items-center justify-end gap-3">
                            {cancelText && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={processing}
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={confirmDisabled}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition disabled:opacity-50 bg-red-600 hover:bg-red-700 cursor-pointer"
                            >
                                {processing ? 'Memproses...' : confirmText}
                            </button>
                        </div>
                    </>
                ) : (
                    /* KONDISI 3: Modal Konfirmasi Standar / Sukses */
                    <>
                        <div className="flex items-center gap-4 mb-4 pr-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                isDanger ? 'bg-red-50 text-red-500' : isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-50 text-[#0D7A57]'
                            }`}>
                                {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            {cancelText && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={processing}
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={processing}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer ${
                                    isDanger
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : isSuccess
                                        ? 'bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto'
                                        : 'bg-[#0D7A57] hover:bg-[#0a5e43]'
                                }`}
                            >
                                {processing ? 'Memproses...' : confirmText}
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}