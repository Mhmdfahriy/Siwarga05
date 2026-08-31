import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
  MapPin, Edit3, Plus, X, Check, Trash2, 
  Home, ShieldCheck, ShieldAlert
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

function getRelationLabel(value) {
  return RELATIONS.find((r) => r.value === value)?.label || 'Anggota Keluarga';
}

function HouseEditModal({ house, onClose, prefix }) {
  const { data, setData, processing, errors } = useForm({
    block_number: house?.block_number || '',
    ownership_status: house?.ownership_status || 'milik_sendiri',
    land_size: house?.land_size || '',
    building_size: house?.building_size || '',
    resident_since: house?.resident_since || '',
    photo: null,
  });

  const isOwned = data.ownership_status === 'milik_sendiri';

  const submit = (e) => {
    e.preventDefault();
    router.post(route(`${prefix}.house.update`), {
      ...data,
      _method: 'put',
      land_size: isOwned ? data.land_size : '',
      building_size: isOwned ? data.building_size : '',
    }, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: onClose,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-sm">Perbarui Detail Properti</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Blok / Nomor Rumah</label>
            <input
              type="text"
              value={data.block_number}
              onChange={(e) => setData('block_number', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
            />
            {errors.block_number && <p className="text-xs text-red-500 mt-1">{errors.block_number}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Status Kepemilikan</label>
            <select
              value={data.ownership_status}
              onChange={(e) => setData('ownership_status', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white"
            >
              <option value="milik_sendiri">Milik Sendiri</option>
              <option value="kost">Kost</option>
              <option value="kontrakan">Kontrakan</option>
            </select>
            {errors.ownership_status && <p className="text-xs text-red-500 mt-1">{errors.ownership_status}</p>}
          </div>

          {isOwned && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Luas Tanah (m²)</label>
                <input
                  type="number"
                  value={data.land_size}
                  onChange={(e) => setData('land_size', e.target.value)}
                  className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
                />
                {errors.land_size && <p className="text-xs text-red-500 mt-1">{errors.land_size}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  value={data.building_size}
                  onChange={(e) => setData('building_size', e.target.value)}
                  className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
                />
                {errors.building_size && <p className="text-xs text-red-500 mt-1">{errors.building_size}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Warga Sejak</label>
            <input
              type="date"
              value={data.resident_since}
              onChange={(e) => setData('resident_since', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] [color-scheme:light]"
            />
            {errors.resident_since && <p className="text-xs text-red-500 mt-1">{errors.resident_since}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Foto Rumah</label>
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
            {isEdit ? 'Edit Anggota' : 'Tambah Anggota'}
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
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">NIK (Nomor Induk Kependudukan)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={data.nik}
              onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan 16 digit NIK..."
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
            />
            {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
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

export default function Datarumah({ user, house, members }) {
  const [editingHouse, setEditingHouse] = useState(false);
  const [memberForm, setMemberForm] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  // Mengambil array data dari paginator Laravel (members.data)
  const memberList = members.data || [];

  const sortedMembers = [...memberList].sort((a, b) => {
    if (a.relation_type === 'kepala_keluarga') return -1;
    if (b.relation_type === 'kepala_keluarga') return 1;
    return 0;
  });

  const openAddMember = () => { setMemberForm(null); setShowMemberForm(true); };
  const openEditMember = (m) => { setMemberForm(m); setShowMemberForm(true); };

  const confirmDeleteMember = (member) => {
    setMemberToDelete(member);
  };

  const executeDeleteMember = () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    router.delete(route(`${prefix}.house-members.destroy`, memberToDelete.id), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setMemberToDelete(null);
      }
    });
  };

  return (
    <Sidebar currentRole={user.role} activeMenu="house-mgmt">
      <Head title="Manajemen Rumah & Properti" />

      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 font-sans">

        {/* HEADER DENGAN LONCENG NOTIFIKASI */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Rumah & Properti</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Kelola informasi tempat tinggal dan anggota keluarga Anda.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotifikasiBell prefix={prefix} />
          </div>
        </div>

        {/* DETAIL PROPERTI */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 flex items-center justify-center shrink-0">
            {house?.photo ? (
              <img src={house.photo} alt="Rumah" className="w-full h-full object-cover" />
            ) : (
              <Home className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <div className="p-5 sm:p-6 flex-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              {house ? 'Lengkap' : 'Belum Lengkap'}
            </span>
            <div className="flex items-center gap-1.5 text-[#0D7A57] text-[11px] font-bold uppercase mt-3">
              <MapPin className="w-3.5 h-3.5" />
              Lokasi Properti
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-1">Blok {house?.block_number ?? '-'}</h2>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Tipe rumah</p>
                <p className="font-bold text-xs sm:text-sm truncate">{house?.ownership_label ?? '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Luas Tanah</p>
                <p className="font-bold text-xs sm:text-sm">{house?.land_size ?? '-'} m²</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Luas Bangunan</p>
                <p className="font-bold text-xs sm:text-sm">{house?.building_size ?? '-'} m²</p>
              </div>
            </div>

            <button
              onClick={() => setEditingHouse(true)}
              className="mt-6 w-full sm:w-auto border border-[#0D7A57] text-[#0D7A57] text-xs font-bold px-4 py-2.5 rounded-xl border-dashed hover:bg-emerald-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Perbarui Detail Properti
            </button>
          </div>
        </div>

        {/* ANGGOTA KELUARGA */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">Anggota Keluarga</h3>
                <p className="text-xs text-gray-400 mt-0.5">{members.total || 0} Anggota terdaftar di alamat ini.</p>
              </div>
              <button
                onClick={openAddMember}
                className="bg-[#0D7A57] hover:bg-[#0a5e43] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Anggota
              </button>
            </div>

            <div className="space-y-3">
              {sortedMembers.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  Belum ada anggota keluarga.
                </div>
              )}
              {sortedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-2xl hover:border-gray-200 transition bg-white shadow-2xs gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
                      member.is_primary ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-600'
                    }`}>
                      {member.photo ? (
                        <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                      ) : (
                        <Home className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{member.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          {member.relation_label || getRelationLabel(member.relation_type)}
                        </span>
                        {member.has_nik ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 shrink-0" /> NIK Terisi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3 shrink-0" /> NIK Belum
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => openEditMember(member)} 
                      className="p-2 text-gray-400 hover:text-[#0D7A57] hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!member.is_primary && (
                      <button 
                        onClick={() => confirmDeleteMember(member)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {members.links && members.links.length > 3 && (
            <div className="bg-[#F1F5F9] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 mt-6 px-4 sm:px-6 py-3 border-t border-gray-200 rounded-b-3xl overflow-x-auto">
              <Pagination links={members.links} />
            </div>
          )}
        </div>

      </div>

      {editingHouse && (
        <HouseEditModal house={house} onClose={() => setEditingHouse(false)} prefix={prefix} />
      )}

      {showMemberForm && (
        <MemberFormModal member={memberForm} onClose={() => setShowMemberForm(false)} prefix={prefix} />
      )}

      <ModalCard
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={executeDeleteMember}
        title="Hapus Anggota Keluarga"
        message={`Apakah kamu yakin ingin menghapus ${memberToDelete?.name} dari daftar anggota keluarga?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        processing={isDeleting}
      />
      <Footer />
    </Sidebar>
  );
}