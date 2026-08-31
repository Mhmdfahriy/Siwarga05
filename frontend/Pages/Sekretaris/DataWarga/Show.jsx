import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
  ArrowLeft, User, Mail, Phone, Briefcase, ShieldCheck, ShieldAlert,
  Home, MapPin, Layers, Calendar, Users, RotateCcw
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';

export default function Show({ user, warga, house, members, canResetNik }) {
  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  // State untuk ModalCard konfirmasi reset NIK yang bersih
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const handleResetNik = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reset NIK Warga',
      message: `Reset NIK milik ${warga.name}? Warga tersebut perlu mengisi ulang NIK dari halaman profilnya.`,
      type: 'warning',
      onConfirm: () => {
        router.put(route(`${prefix}.data-warga.reset-nik`, warga.id), {}, { 
          preserveScroll: true,
          onSuccess: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
        });
      }
    });
  };

  return (
    <Sidebar currentRole={user.role} activeMenu="data-warga">
      <Head title={`Detail Warga: ${warga.name}`} />

      <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">

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

          {/* PROFIL HEADER */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 shadow-xs">
              {warga.photo ? (
                <img src={warga.photo} className="w-full h-full object-cover" alt={warga.name} />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{warga.name}</h1>
              <p className="text-xs text-gray-500">Warga RT 05 • ID: {warga.resident_id}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className={`w-2 h-2 rounded-full ${warga.status === 'aktif' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{warga.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* KOLOM KIRI */}
            <div className="lg:col-span-7 space-y-6">

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-[#0D7A57] font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
                  <User className="w-4 h-4" />
                  <span>Informasi Pribadi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">NIK</span>
                    {warga.has_nik ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-gray-800 tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {warga.nik_masked}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
                        <ShieldAlert className="w-3.5 h-3.5" /> Belum diisi
                      </span>
                    )}
                    {canResetNik && warga.has_nik && (
                      <button
                        type="button"
                        onClick={handleResetNik}
                        className="flex items-center gap-1.5 font-bold text-red-500 hover:text-red-600 transition mt-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset NIK
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Pekerjaan</span>
                    <span className="font-bold text-gray-800">{warga.occupation ?? '-'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    <span className="font-bold text-gray-800 break-all">{warga.email}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Nomor HP
                    </span>
                    <span className="font-bold text-gray-800">{warga.no_hp ?? '-'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#0D7A57] font-bold text-xs uppercase tracking-wider border-b border-gray-100 pb-3">
                  <Users className="w-4 h-4" />
                  <span>Anggota Keluarga ({members.length} Jiwa)</span>
                </div>

                <div className="space-y-3">
                  {members.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Belum ada data anggota keluarga.</p>
                  )}
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl gap-3">
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs ${
                          m.is_primary ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                        }`}>
                          {m.photo ? (
                            <img src={m.photo} className="w-full h-full object-cover" alt={m.name} />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">{m.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{m.relation_label}</p>
                        </div>
                      </div>
                      {m.is_primary && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-[#0D7A57] text-[9px] font-extrabold uppercase rounded-lg tracking-wider shrink-0">
                          Kepala Keluarga
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* KOLOM KANAN — Data Rumah */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {house?.photo && (
                    <img src={house.photo} className="w-full h-full object-cover" alt="Rumah" />
                  )}
                  {house?.block_number && (
                    <div className="absolute top-4 left-4 bg-[#0D7A57] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                      Blok {house.block_number}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b border-gray-100 pb-3">Detail Rumah</h3>

                  {house ? (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Home className="w-4 h-4 text-[#0D7A57] mt-0.5 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status Kepemilikan</span>
                          <span className="font-bold text-gray-800">{house.ownership_label}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Layers className="w-4 h-4 text-[#0D7A57] mt-0.5 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Luas Tanah / Bangunan</span>
                          <span className="font-bold text-gray-800">
                            {house.land_size ?? '-'} m² / {house.building_size ?? '-'} m²
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[#0D7A57] mt-0.5 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Warga Sejak</span>
                          <span className="font-bold text-gray-800">{house.resident_since ?? '-'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Belum terhubung ke data rumah.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ModalCard Global untuk Konfirmasi Reset NIK */}
      <ModalCard
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="Ya, Reset"
        cancelText="Batal"
      />
      <Footer />
    </Sidebar>
  );
}