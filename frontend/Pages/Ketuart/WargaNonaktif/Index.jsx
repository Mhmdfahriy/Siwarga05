import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import { UserX, Search, CheckCircle, User, Phone, Mail } from 'lucide-react';
import Footer from '@/Components/Footer';

export default function WargaNonaktifIndex({ users, filters }) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Live search dengan efek jeda (debounce) agar tidak terlalu sering request ke server saat mengetik cepat
    useEffect(() => {
        const timer = setTimeout(() => {
            // Hanya jalankan jika nilai search berbeda dari props awal untuk menghindari infinite loop
            if (search !== (filters.search || '')) {
                router.get(
                    route('ketuart.warganonaktif.index'),
                    { search },
                    { 
                        preserveState: true, 
                        preserveScroll: true, 
                        replace: true 
                    }
                );
            }
        }, 300); // Jeda 300ms setelah user selesai mengetik huruf terakhir

        return () => clearTimeout(timer);
    }, [search]);

    // Fungsi konfirmasi aktivasi akun
    const confirmActivate = (user) => {
        setSelectedUser(user);
    };

    const handleActivate = () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        router.put(route('ketuart.warganonaktif.activate', selectedUser.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsProcessing(false);
                setSelectedUser(null);
            }
        });
    };

    return (
        <Sidebar currentRole={currentUser.role} activeMenu="warga-nonaktif">
            <Head title="Data Warga Nonaktif" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 font-sans">
                
                {/* Header & Deskripsi */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserX className="w-6 h-6 text-red-500" />
                            Data Warga Nonaktif
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Daftar akun warga RT 05 yang dinonaktifkan secara mandiri. Anda dapat mengaktifkannya kembali jika diperlukan.
                        </p>
                    </div>

                    {/* Form Pencarian Real-Time */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, email, no HP..."
                                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0D7A57] bg-white shadow-xs"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>
                </div>

                {/* Tabel Daftar Warga Nonaktif */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-3.5 px-4 sm:px-6">Warga</th>
                                    <th className="py-3.5 px-4">Kontak</th>
                                    <th className="py-3.5 px-4">Pekerjaan</th>
                                    <th className="py-3.5 px-4">Waktu Dinonaktifkan</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-400">
                                            Tidak ada data warga dengan akun nonaktif saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition">
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 overflow-hidden border border-red-100">
                                                        {user.photo ? (
                                                            <img src={user.photo_url || user.photo} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                        <p className="text-[11px] text-gray-400 truncate">ID: RT05-{String(user.id).padStart(3, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">
                                                <div className="space-y-0.5">
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {user.email}
                                                    </p>
                                                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {user.no_hp || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">
                                                {user.occupation || '-'}
                                            </td>
                                            <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                                                {user.deactivated_at ? new Date(user.deactivated_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '-'}
                                            </td>
                                            <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => confirmActivate(user)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Aktifkan Kembali
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal Konfirmasi Aktivasi */}
            <ModalCard
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onConfirm={handleActivate}
                title="Aktifkan Akun Warga"
                message={`Apakah Anda yakin ingin mengaktifkan kembali akun atas nama ${selectedUser?.name}? Akun ini akan diizinkan untuk login kembali ke sistem.`}
                confirmText="Ya, Aktifkan"
                cancelText="Batal"
                type="success"
                processing={isProcessing}
            />
            <Footer />
        </Sidebar>
    );
}