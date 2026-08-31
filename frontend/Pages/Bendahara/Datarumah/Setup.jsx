import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Home, Check } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Footer from '@/Components/Footer';

export default function Setup({ user }) {
  // Menentukan prefix route secara dinamis (mengatasi 'ketua_rt' -> 'ketuart')
  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  const { data, setData, post, processing, errors } = useForm({
    block_number: '',
    ownership_status: 'milik_sendiri',
    land_size: '',
    building_size: '',
    resident_since: '',
    photo: null,
    relation_type: 'kepala_keluarga',
  });

  const isOwned = data.ownership_status === 'milik_sendiri';

  const submit = (e) => {
    e.preventDefault();
    post(route(`${prefix}.house.store`), {
      forceFormData: true,
      transform: (d) => ({
        ...d,
        land_size: isOwned ? d.land_size : '',
        building_size: isOwned ? d.building_size : '',
      }),
    });
  };

  return (
    <Sidebar currentRole={user.role} activeMenu="house-mgmt">
      <Head title="Lengkapi Data Rumah" />

      <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto font-sans">

        <div className="mb-6 sm:mb-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-6 h-6 text-[#0D7A57]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lengkapi Data Rumah</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Sebelum bisa mengelola anggota keluarga, isi dulu data tempat tinggal Anda.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 sm:space-y-5">

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              Blok / Nomor Rumah
            </label>
            <input
              type="text"
              value={data.block_number}
              onChange={(e) => setData('block_number', e.target.value)}
              placeholder="Contoh: A / 05"
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
            />
            {errors.block_number && <p className="text-xs text-red-500 mt-1">{errors.block_number}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              Status Anda dalam Keluarga
            </label>
            <select
              value={data.relation_type}
              onChange={(e) => setData('relation_type', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] bg-white"
            >
              <option value="kepala_keluarga">Kepala Keluarga</option>
              <option value="suami">Suami</option>
              <option value="istri">Istri</option>
              <option value="anak">Anak</option>
              <option value="kakek">Kakek</option>
              <option value="nenek">Nenek</option>
              <option value="kakak">Kakak</option>
              <option value="adik">Adik</option>
              <option value="lainnya">Lainnya</option>
            </select>
            {errors.relation_type && <p className="text-xs text-red-500 mt-1">{errors.relation_type}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              Status Kepemilikan
            </label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Luas Tanah (m²)
                </label>
                <input
                  type="number"
                  value={data.land_size}
                  onChange={(e) => setData('land_size', e.target.value)}
                  className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57]"
                />
                {errors.land_size && <p className="text-xs text-red-500 mt-1">{errors.land_size}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Luas Bangunan (m²)
                </label>
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
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              Warga Sejak
            </label>
            <input
              type="date"
              value={data.resident_since}
              onChange={(e) => setData('resident_since', e.target.value)}
              className="w-full text-sm font-bold text-gray-800 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] [color-scheme:light]"
            />
            {errors.resident_since && <p className="text-xs text-red-500 mt-1">{errors.resident_since}</p>}
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
              Foto Rumah (opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setData('photo', e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#0D7A57] hover:file:bg-emerald-100 cursor-pointer"
            />
            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 cursor-pointer mt-2"
          >
            <Check className="w-4 h-4" />
            {processing ? 'Menyimpan...' : 'Simpan Data Rumah'}
          </button>

        </form>

      </div>
      <Footer />
    </Sidebar>
  );
}