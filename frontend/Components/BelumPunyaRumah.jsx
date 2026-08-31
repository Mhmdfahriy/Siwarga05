import React from 'react';
import { Link } from '@inertiajs/react';
import { Home, ArrowRight } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';

export default function BelumPunyaRumah({ user, prefix }) {
    return (
        <Sidebar currentRole={user.role} activeMenu="finance">
            <div className="py-12 bg-[#F8FAFC] min-h-screen font-sans flex items-center justify-center">
                <div className="mx-auto max-w-md px-4 text-center space-y-6">
                    
                    {/* Icon Ilustrasi */}
                    <div className="w-20 h-20 bg-emerald-50 text-[#0D7A57] rounded-3xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Home className="w-10 h-10" />
                    </div>

                    {/* Teks Validasi / Informasi */}
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            Data Rumah Belum Terdaftar
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            Oops! Anda belum memiliki data rumah atau belum terhubung ke unit rumah manapun di RT 05. Silakan daftarkan data rumah Anda terlebih dahulu untuk mengakses menu iuran dan keuangan.
                        </p>
                    </div>

                    {/* Tombol Redirect / Aksi */}
                    <div>
                        <Link 
                            href={route(`${prefix}.house.index`)}
                            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-[#0D7A57] text-white rounded-2xl font-bold text-xs sm:text-sm hover:bg-[#0A6145] transition shadow-md cursor-pointer"
                        >
                            <span>Isi Data Rumah Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </Sidebar>
    );
}