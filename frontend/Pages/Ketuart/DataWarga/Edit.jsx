import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, User, Save } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';

export default function Edit({ user, warga }) {
  const { data, setData, put, processing, errors } = useForm({
    status: warga.status,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    put(route(`${prefix}.data-warga.update-status`, warga.id), {
      onFinish: () => setIsModalOpen(false),
    });
  };

  return (
    <Sidebar currentRole={user.role} activeMenu="data-warga">
      <Head title={`Edit Status: ${warga.name}`} />

      <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header Navigasi & Notifikasi */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <Link
                href={route(`${prefix}.data-warga.index`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Data Warga
              </Link>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                <NotifikasiBell prefix={prefix} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 shadow-xs">
                {warga.photo ? (
                  <img src={warga.photo} className="w-full h-full object-cover" alt={warga.name} />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="truncate">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{warga.name}</h1>
                <p className="text-xs text-gray-500 truncate">{warga.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitClick} className="space-y-5">
              <div>
                <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Status Kewargaan</label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition shadow-xs ${
                    data.status === 'aktif' ? 'border-[#0D7A57] bg-emerald-50/30 ring-1 ring-[#0D7A57]' : 'border-gray-200 bg-white hover:bg-gray-50/50'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="aktif"
                      checked={data.status === 'aktif'}
                      onChange={() => setData('status', 'aktif')}
                      className="mt-0.5 accent-[#0D7A57]"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">Aktif</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Warga masih tinggal di lingkungan RT 05 dan bisa login normal.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3.5 p-4 border rounded-2xl cursor-pointer transition shadow-xs ${
                    data.status === 'pindah' ? 'border-red-400 bg-red-50/30 ring-1 ring-red-400' : 'border-gray-200 bg-white hover:bg-gray-50/50'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="pindah"
                      checked={data.status === 'pindah'}
                      onChange={() => setData('status', 'pindah')}
                      className="mt-0.5 accent-red-500"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">Pindah</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Warga sudah tidak tinggal di sini. Akun tidak bisa login lagi, dan seluruh data rumah beserta anggota keluarganya akan dihapus permanen.</p>
                    </div>
                  </label>
                </div>
                {errors.status && <p className="text-xs text-red-500 mt-2">{errors.status}</p>}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0D7A57] hover:bg-[#0A6145] text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
                <Link
                  href={route(`${prefix}.data-warga.index`)}
                  className="w-full sm:w-auto text-center px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition shadow-xs"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>

      <ModalCard
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Konfirmasi Perubahan Status"
        message={
          data.status === 'pindah' 
            ? 'Apakah kamu yakin ingin mengubah status? Seluruh data rumah dan anggota keluarga akan dihapus permanen.' 
            : 'Apakah kamu yakin ingin mengubah status warga ini?'
        }
        confirmText="Ya, Simpan"
        cancelText="Batal"
        type={data.status === 'pindah' ? 'danger' : 'warning'}
        processing={processing}
      />
      <Footer />
    </Sidebar>
  );
}