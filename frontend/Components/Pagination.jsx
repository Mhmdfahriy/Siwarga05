import React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Komponen Pagination reusable yang dipercantik.
 * Mendukung ikon panah untuk Next/Prev agar lebih modern, 
 * serta penanganan label teks bawaan Laravel.
 */
export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                {links.map((link, index) => {
                    // Cek apakah ini tombol Previous atau Next berdasarkan label bawaan Laravel
                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    return (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                            className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                                link.active
                                    ? 'bg-[#0D7A57] text-white shadow-sm shadow-emerald-900/20'
                                    : link.url
                                    ? 'bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
                                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            }`}
                        >
                            {isPrev ? (
                                <>
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                </>
                            ) : isNext ? (
                                <>
                                    <span className="hidden sm:inline">Berikutnya</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}