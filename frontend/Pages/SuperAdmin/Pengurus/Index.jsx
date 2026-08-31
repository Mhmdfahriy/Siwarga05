import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { UserPlus, ShieldAlert, Mail, Lock, User, Briefcase } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';

export default function PengurusIndex({ auth, pengurus }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'ketua_rt',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('superadmin.pengurus.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleDemote = (userId) => {
        if (confirm('Yakin ingin menurunkan pengurus ini kembali menjadi warga biasa? Posisi jabatan akan menjadi kosong.')) {
            router.put(route('superadmin.pengurus.demote', userId));
        }
    };

    return (
        <Sidebar currentRole={auth.user.role} activeMenu="kelola-pengurus">
            <Head title="Kelola Pengurus - Siwarga05" />

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
                
                {/* Header Halaman */}
                <div className="border-b border-gray-100 pb-5">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Kelola Pengurus RT</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Buat dan kelola akun khusus pengurus lingkungan RT 05.
                    </p>
                </div>

                {/* Daftar Pengurus Aktif */}
                <div className="bg-white overflow-hidden shadow-sm rounded-3xl border border-gray-100 p-5 sm:p-6 lg:p-8 space-y-4">
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Pengurus Aktif Saat Ini
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pengurus.map((p) => (
                            <div key={p.id} className="border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-gray-50/60 to-white hover:shadow-sm transition-all">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 bg-emerald-100 text-[#006948] font-bold text-[10px] rounded-full uppercase tracking-wider">
                                            {p.role_label}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{p.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{p.email}</p>
                                </div>
                                
                                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleDemote(p.id)}
                                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Turunkan Jadi Warga
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pengurus.length === 0 && (
                            <p className="text-xs sm:text-sm text-gray-500 col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                Belum ada pengurus yang terdaftar.
                            </p>
                        )}
                    </div>
                </div>

                {/* Form Tambah Akun Pengurus Baru */}
                <div className="bg-white overflow-hidden shadow-sm rounded-3xl border border-gray-100 p-5 sm:p-6 lg:p-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-emerald-50 text-[#006948] rounded-xl shrink-0">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-gray-800">Tambah Akun Pengurus Baru</h3>
                                <p className="text-xs text-gray-500">Buat kredensial login baru untuk posisi Ketua RT, Sekretaris, atau Bendahara.</p>
                            </div>
                        </div>

                        <hr className="my-5 border-gray-100" />
                        
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Nama Lengkap */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <User className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:bg-white focus:border-[#006948] focus:ring-1 focus:ring-[#006948] transition-all"
                                            placeholder="Contoh: Budi Santoso"
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>}
                                </div>

                                {/* Email Pengurus */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Pengurus</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Mail className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:bg-white focus:border-[#006948] focus:ring-1 focus:ring-[#006948] transition-all"
                                            placeholder="budi@siwarga05.com"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Jabatan / Peran */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Jabatan / Peran</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Briefcase className="w-4 h-4" />
                                        </span>
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:bg-white focus:border-[#006948] focus:ring-1 focus:ring-[#006948] transition-all cursor-pointer"
                                        >
                                            <option value="ketua_rt">Ketua RT</option>
                                            <option value="sekretaris">Sekretaris</option>
                                            <option value="bendahara">Bendahara</option>
                                        </select>
                                    </div>
                                    {errors.role && (
                                        <div className="flex items-start gap-1.5 mt-2 p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                                            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span>{errors.role}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Kata Sandi */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kata Sandi</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 bg-gray-50/50 text-xs sm:text-sm focus:bg-white focus:border-[#006948] focus:ring-1 focus:ring-[#006948] transition-all"
                                            placeholder="Minimal 8 karakter"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password}</p>}
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#006948] hover:bg-[#005137] text-white px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>{processing ? 'Menyimpan...' : 'Buat Akun Pengurus'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </Sidebar>
    );
}