import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
  User, Edit3, Users, ChevronRight, Trash2, Plus, X, Check,
  Key, Bell, UserX, Home, Calendar, Layers
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import ModalCard from '@/Components/ModalCard'; 
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Pagination from '@/Components/Pagination';
import Footer from '@/Components/Footer';

const RELATIONS = [
  { value: 'kepala_keluarga', label: 'Kepala Keluarga' },
  { value: 'suami', label: 'Suami' },
  { value: 'istri', label: 'Istri' },
  { value: 'anak', label: 'Anak' },
  { value: 'kakek', label: 'Kakek' },
  { value: 'nenek', label: 'Nenek' },
  { value: 'kakak', label: 'Kakak' },
  { value: 'adik', label: 'Adik' },
  { value: 'lainnya', label: 'Lainnya' },
];

function MemberFormModal({ member, onClose, prefix }) {
  const isEdit = !!member;
  const { data, setData, post, transform, processing, errors, reset } = useForm({
    name: member?.name || '',
    relation_type: member?.relation_type || 'anak',
    nik: member?.nik || '',
    photo: null,
  });

  const submit = (e) => {
    e.preventDefault();

    const url = isEdit
      ? route(`${prefix}.house-members.update`, member.id)
      : route(`${prefix}.house-members.store`);

    if (isEdit) {
      transform((data) => ({ ...data, _method: 'put' }));
    }

    post(url, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => { reset(); onClose(); },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-sm">
            {isEdit ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Nama</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              NIK (Nomor Induk Kependudukan)
            </label>
            {member?.has_nik ? (
              <div className="w-full text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 tracking-wider truncate">
                {member.nik_masked}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={data.nik}
                onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 16 digit NIK..."
                className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
              />
            )}
            {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
            {!member?.has_nik && (
              <p className="text-[11px] text-gray-400 mt-1">
                Masukkan 16 digit NIK. Setelah disimpan, NIK akan dikunci demi keamanan.
              </p>
            )}
            {member?.has_nik && (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <Key className="w-3.5 h-3.5 shrink-0" /> NIK sudah terverifikasi dan terkunci.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Hubungan Keluarga</label>
            <select
              value={data.relation_type}
              onChange={(e) => setData('relation_type', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white"
            >
              {RELATIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.relation_type && <p className="text-xs text-red-500 mt-1">{errors.relation_type}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Foto (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setData('photo', e.target.files[0])}
              className="text-xs text-gray-600 w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold border border-gray-200 transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageMembersModal({ members, onClose, onAdd, onEdit, prefix }) {
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const memberList = members.data || [];

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
  };

  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    router.delete(route(`${prefix}.house-members.destroy`, memberToDelete.id), { 
      preserveScroll: true,
      preserveState: true,
      onFinish: () => {
        setIsDeleting(false);
        setMemberToDelete(null);
      }
    });
  };

  return (
    <>
      {!memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl flex flex-col max-h-[90vh]">
            
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden"></div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Kelola Anggota Keluarga</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto mb-3 flex-1 pr-1">
              {memberList.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada anggota keluarga.</p>
              )}
              {memberList.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl gap-2 bg-gray-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${
                      member.is_primary ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
                    }`}>
                      {member.photo ? (
                        <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                      ) : (
                        <User className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{member.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{member.relation_label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onEdit(member)} className="p-2 hover:bg-white rounded-xl text-gray-500 hover:text-emerald-600 transition cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(member)} className="p-2 hover:bg-white rounded-xl text-red-500 hover:text-red-700 transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {members.links && members.links.length > 3 && (
              <div className="bg-gray-100 -mx-5 sm:-mx-6 -mb-4 mt-2 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-2xl overflow-x-auto">
                <Pagination links={members.links} />
              </div>
            )}

            <button
              onClick={onAdd}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Anggota Baru
            </button>
          </div>
        </div>
      )}

      <ModalCard
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Anggota Keluarga"
        message={`Apakah kamu yakin ingin menghapus ${memberToDelete?.name} dari anggota keluarga?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        processing={isDeleting}
      />
    </>
  );
}

export default function Profile({ user, house, members }) {
  const [manageOpen, setManageOpen] = useState(false);
  const [formTarget, setFormTarget] = useState(null); 
  const [showForm, setShowForm] = useState(false);

  const memberList = members.data || [];
  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  const openAdd = () => { setManageOpen(false); setFormTarget(null); setShowForm(true); };
  const openEdit = (member) => { setManageOpen(false); setFormTarget(member); setShowForm(true); };
  const closeForm = () => setShowForm(false);

  return (
    <Sidebar currentRole={user.role} activeMenu="profile">
      <Head title="Profil Warga" />

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto font-sans">
        
        {/* HEADER PROFIL RESPONSIF */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                {user.photo ? (
                  <img src={user.photo} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{user.name}</h1>
                {user.status === 'aktif' && (
                  <span className="px-2.5 py-0.5 bg-[#008A5E] text-white text-[10px] font-semibold rounded-full shrink-0">
                    Terverifikasi
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {user.role_label} • ID: {user.resident_id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end sm:justify-start">
            <NotifikasiBell prefix={prefix} />
            <Link
              href={route(`${prefix}.profile.edit`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profil
            </Link>
          </div>
        </div>

        {/* GRID UTAMA RESPONSIF */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6">

          {/* KOLOM KIRI */}
          <div className="col-span-12 lg:col-span-8 space-y-5 sm:space-y-6">

            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#0D7A57] font-semibold text-sm mb-5 sm:mb-6">
                <User className="w-4 h-4 shrink-0" />
                <span>Informasi Pribadi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-5 gap-x-8">
                <div className="min-w-0">
                  <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Nama Lengkap</span>
                  <span className="text-sm font-bold text-gray-800 truncate block">{user.name}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">NIK</span>
                  <span className="text-sm font-bold text-gray-800 tracking-wider block">{user.nik_masked}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Nomor HP</span>
                  <span className="text-sm font-bold text-gray-800 block">{user.no_hp ?? '-'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Alamat Email</span>
                  <span className="text-sm font-bold text-gray-800 truncate block">{user.email}</span>
                </div>
                <div className="sm:col-span-2 min-w-0">
                  <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Pekerjaan</span>
                  <span className="text-sm font-bold text-gray-800 block">{user.occupation ?? '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center gap-2 text-[#0D7A57] font-semibold text-sm">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Anggota Keluarga</span>
                </div>
                <button
                  onClick={() => setManageOpen(true)}
                  className="text-[#0D7A57] text-xs font-bold hover:underline cursor-pointer"
                >
                  Kelola Anggota
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {memberList.length === 0 && (
                  <p className="text-xs text-gray-400">Belum ada anggota keluarga.</p>
                )}
                
                {memberList.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl transition border border-transparent hover:border-gray-100 gap-2">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${
                        member.is_primary ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
                      }`}>
                        {member.photo ? (
                          <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{member.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{member.relation_label}</p>
                      </div>
                    </div>
                    {member.is_primary ? (
                      <span className="px-2 py-1 bg-indigo-50 text-[#4F46E5] text-[9px] font-extrabold uppercase rounded shrink-0">
                        Pengguna Utama
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </div>
                ))}

                {members.links && members.links.length > 3 && (
                  <div className="bg-[#F1F5F9] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-4 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-2xl overflow-x-auto">
                    <Pagination links={members.links} />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN */}
          <div className="col-span-12 lg:col-span-4 space-y-5 sm:space-y-6">

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-40 sm:h-44 bg-slate-900 overflow-hidden">
                {house?.photo && (
                  <img src={house.photo} className="w-full h-full object-cover" alt="House" />
                )}
                {house?.block_number && (
                  <div className="absolute top-4 left-4 bg-[#015C3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {house.block_number}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">Detail Rumah</h3>

                {house ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Home className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-gray-400 uppercase font-medium">Status Kepemilikan</span>
                        <span className="text-xs font-bold text-gray-800">{house.ownership_label}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Layers className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-gray-400 uppercase font-medium">Luas Tanah / Bangunan</span>
                        <span className="text-xs font-bold text-gray-800">
                          {house.land_size ?? '-'} m² / {house.building_size ?? '-'} m²
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-gray-400 uppercase font-medium">Warga Sejak</span>
                        <span className="text-xs font-bold text-gray-800">{house.resident_since ?? '-'}</span>
                      </div>
                    </div>

                    <Link 
                      href={route(`${prefix}.house.index`)} 
                      className="block w-full mt-2 py-2.5 text-center text-xs font-bold text-[#0D7A57] border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                      Lihat Dokumen Rumah
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Belum terhubung ke data rumah.</p>
                )}
              </div>
            </div>

            {/* PENGATURAN AKUN */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 sm:mb-4">Pengaturan Akun</h3>
              <div className="space-y-1">
                <Link 
                  href={route(`${prefix}.pengaturan.index`)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Key className="w-4 h-4 text-gray-500 group-hover:text-gray-700 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 truncate">Ubah Kata Sandi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>

                <Link 
                  href={route(`${prefix}.pengaturan.index`)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell className="w-4 h-4 text-gray-500 group-hover:text-gray-700 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 truncate">Pengaturan Notifikasi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </Link>

                {/* Tombol Nonaktifkan Akun dengan warna teks merah agar menjadi perhatian khusus */}
                <Link 
                  href={route(`${prefix}.pengaturan.index`)} 
                  className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-xl transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserX className="w-4 h-4 text-red-500 group-hover:text-red-600 shrink-0" />
                    <span className="text-xs font-bold text-red-600 truncate">Nonaktifkan Akun</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {manageOpen && (
        <ManageMembersModal
          members={members}
          onClose={() => setManageOpen(false)}
          onAdd={openAdd}
          onEdit={openEdit}
          prefix={prefix}
        />
      )}

      {showForm && (
        <MemberFormModal member={formTarget} onClose={closeForm} prefix={prefix} />
      )}
      <Footer />  
    </Sidebar>
  );
}