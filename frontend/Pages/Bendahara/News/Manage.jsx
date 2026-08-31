import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Sidebar from '@/Layouts/Sidebar';
import { Plus, Eye, Edit3, Trash2, ArrowLeft, Calendar, Folder, ShieldAlert } from 'lucide-react';
import ModalCard from '@/Components/ModalCard';
import Pagination from '@/Components/Pagination'; 
import Footer from '@/Components/Footer';

export default function Manage({ auth, articles, can }) {
    const user = auth.user;

    // State untuk kontrol Modal Hapus
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getRolePrefix = () => {
        if (user.role === 'sekretaris' || user.isSekretaris) return 'sekretaris';
        if (user.role === 'bendahara' || user.isBendahara) return 'bendahara';
        if (user.role === 'ketuart' || user.isKetuaRt) return 'ketuart';
        return 'warga';
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        router.delete(route(`${getRolePrefix()}.news.destroy`, itemToDelete), {
            onFinish: () => {
                setIsDeleting(false);
                setItemToDelete(null);
            }
        });
    };

    // Ekstrak tautan paginasi dari objek Laravel
    const articlesLinks = articles?.links || null;

    // Helper untuk render badge status
    const getStatusBadge = (status) => {
        const config = {
            published: { label: 'Published', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
            scheduled: { label: 'Scheduled', dot: 'bg-sky-500',    badge: 'bg-sky-50 text-sky-700' },
            draft:     { label: 'Draft',     dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700' },
        };
        const s = config[status] || config.draft;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.badge}`}>
                <span className={`w-1 h-1 rounded-full ${s.dot}`}></span>
                {s.label}
            </span>
        );
    };

    return (
        <Sidebar currentRole={getRolePrefix()} activeMenu="news">
            <Head title="Manajemen Data Berita & Laporan" />

            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
                
                {/* Header & Aksi */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="space-y-3">
                        <Link 
                            href={route(`${getRolePrefix()}.news.index`)}
                            className="inline-flex w-fit items-center gap-2.5 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl text-xs font-bold text-gray-500 hover:text-[#0D7A57] hover:border-[#0D7A57]/20 hover:bg-emerald-50 transition-all duration-300 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Kembali</span>
                        </Link>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Manajemen Data Berita</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Kelola seluruh data informasi, pengumuman, dan laporan keuangan lingkungan RT.
                            </p>
                        </div>
                    </div>

                    {can?.create && (
                        <Link
                            href={route(`${getRolePrefix()}.news.create`)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0a6145] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all h-fit cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> <span>Tambah Data Baru</span>
                        </Link>
                    )}
                </div>

                {/* Tabel Data */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                    <th className="py-4 px-6">Judul Laporan / Berita</th>
                                    <th className="py-4 px-4">Tanggal Publikasi</th>
                                    <th className="py-4 px-4">Kategori</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {articles.data && articles.data.length > 0 ? (
                                    articles.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 max-w-xs md:max-w-md">
                                                <div className="font-bold text-gray-900 truncate">{item.title}</div>
                                                <div className="text-gray-400 text-[11px] mt-0.5 truncate">{item.excerpt || 'Tidak ada deskripsi singkat.'}</div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-500 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-300" /> {item.date}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                                                    item.category === 'Keuangan' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                }`}>
                                                    {item.category || 'Informasi'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route(`${getRolePrefix()}.news.show`, item.id)}
                                                        className="p-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-all shadow-xs"
                                                        title="Pratinjau Halaman"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>

                                                    {item.can_edit ? (
                                                        <Link
                                                            href={route(`${getRolePrefix()}.news.edit`, item.id)}
                                                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl transition-all shadow-xs"
                                                            title="Ubah Data"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </Link>
                                                    ) : (
                                                        <span className="p-2 bg-gray-50 text-gray-300 border border-gray-200 rounded-xl cursor-not-allowed" title="Tidak diizinkan mengedit">
                                                            <ShieldAlert className="w-3.5 h-3.5" />
                                                        </span>
                                                    )}

                                                    {item.can_delete && (
                                                        <button
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer"
                                                            title="Hapus Data"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center text-gray-400">
                                            <Folder className="w-10 h-10 mx-auto opacity-20 mb-2" />
                                            <p className="text-xs font-medium">Tidak ada data berita atau laporan tersedia.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Komponen Pagination Terpusat */}
                {articlesLinks && articlesLinks.length > 3 && (
                    <div className="pt-2 flex justify-center">
                        <Pagination links={articlesLinks} />
                    </div>
                )}

            </div>

            {/* Modal Konfirmasi Hapus Data Berita/Laporan */}
            <ModalCard
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Hapus Data Berita & Laporan"
                message="Apakah Anda yakin ingin menghapus data laporan/berita ini secara permanen?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                processing={isDeleting}
            />
            <Footer />
        </Sidebar>
    );
}