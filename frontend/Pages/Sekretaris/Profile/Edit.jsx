import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  User, Camera, Briefcase, Phone, Mail, Home, ShieldCheck, Calendar,
  ArrowLeft, Save
} from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Footer from '@/Components/Footer';

export default function Edit({ user, house }) {
  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  const { data, setData, post, processing, errors } = useForm({
    _method: 'put',
    name: user.name ?? '',
    email: user.email ?? '',
    no_hp: user.no_hp ?? '',
    occupation: user.occupation ?? '',
    photo: null,
    nik: '',
    block_number: house?.block_number ?? '',
    ownership_status: house?.ownership_status ?? 'milik_sendiri',
    land_size: house?.land_size ?? '',
    building_size: house?.building_size ?? '',
    resident_since: house?.resident_since ?? '',
  });

  const photoPreview = data.photo ? URL.createObjectURL(data.photo) : user.photo;
  const isOwned = data.ownership_status === 'milik_sendiri';

  const submit = (e) => {
    e.preventDefault();

    post(route(`${prefix}.profile.update`), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <Sidebar currentRole={user.role} activeMenu="profile">
      <Head title="Edit Profil Saya" />

      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto font-sans">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            href={route(`${prefix}.profile.index`)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Edit Profil Saya</h1>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* KOLOM KIRI — foto profil */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 shrink-0 mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                    {photoPreview ? (
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Foto profil" />
                    ) : (
                      <User className="w-9 h-9 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0D7A57] rounded-full flex items-center justify-center text-white border-2 border-white shadow cursor-pointer hover:bg-[#0a5e43] transition">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData('photo', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <h3 className="text-sm font-bold text-gray-900">Foto Profil</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan foto terbaru agar pengurus dan tetangga dapat mengenali Anda dengan mudah.
                </p>
                <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-[#0D7A57] text-[#0D7A57] rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-50 transition">
                  Unggah Foto Baru
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData('photo', e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
              </div>
            </div>

            {/* Tombol aksi — desktop */}
            <div className="hidden lg:flex flex-col gap-2">
              <button
                type="submit"
                disabled={processing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <Link
                href={route(`${prefix}.profile.index`)}
                className="text-center px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </Link>
            </div>
          </div>

          {/* KOLOM KANAN — form data */}
          <div className="lg:col-span-2 space-y-6">

            {/* INFORMASI PRIBADI */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#0D7A57] font-bold text-sm mb-5">
                <Briefcase className="w-4.5 h-4.5" />
                <span>Informasi Pribadi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">NIK (Nomor Induk Kependudukan)</label>
                  {user.has_nik ? (
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <div className="w-full text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 tracking-wider truncate">
                        {user.nik_masked}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={data.nik}
                        onChange={(e) => setData('nik', e.target.value.replace(/\D/g, ''))}
                        placeholder="Masukkan 16 digit NIK"
                        className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                      />
                    </div>
                  )}
                  {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
                  {!user.has_nik && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Isi 16 digit NIK. Setelah disimpan, hanya Ketua RT yang bisa mereset untuk perubahan.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Pekerjaan</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={data.occupation}
                      onChange={(e) => setData('occupation', e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                    />
                  </div>
                  {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
                </div>
              </div>
            </div>

            {/* INFORMASI KONTAK */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#0D7A57] font-bold text-sm mb-5">
                <Phone className="w-4.5 h-4.5" />
                <span>Informasi Kontak</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={data.no_hp}
                      onChange={(e) => setData('no_hp', e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                    />
                  </div>
                  {errors.no_hp && <p className="text-xs text-red-500 mt-1">{errors.no_hp}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* ALAMAT & PROPERTI */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#0D7A57] font-bold text-sm mb-5">
                <Home className="w-4.5 h-4.5" />
                <span>Alamat & Properti</span>
              </div>

              {house ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">Blok / No. Rumah</label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={data.block_number}
                        onChange={(e) => setData('block_number', e.target.value)}
                        className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                      />
                    </div>
                    {errors.block_number && <p className="text-xs text-red-500 mt-1">{errors.block_number}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">Status Hunian</label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={data.ownership_status}
                        onChange={(e) => setData('ownership_status', e.target.value)}
                        className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition appearance-none bg-white"
                      >
                        <option value="milik_sendiri">Milik Sendiri</option>
                        <option value="kost">Kost</option>
                        <option value="kontrakan">Kontrakan</option>
                      </select>
                    </div>
                    {errors.ownership_status && <p className="text-xs text-red-500 mt-1">{errors.ownership_status}</p>}
                  </div>

                  {isOwned && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 font-medium mb-1.5">Luas Tanah (m²)</label>
                        <input
                          type="number"
                          value={data.land_size}
                          onChange={(e) => setData('land_size', e.target.value)}
                          className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                        />
                        {errors.land_size && <p className="text-xs text-red-500 mt-1">{errors.land_size}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 font-medium mb-1.5">Luas Bangunan (m²)</label>
                        <input
                          type="number"
                          value={data.building_size}
                          onChange={(e) => setData('building_size', e.target.value)}
                          className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition"
                        />
                        {errors.building_size && <p className="text-xs text-red-500 mt-1">{errors.building_size}</p>}
                      </div>
                    </>
                  )}

                  <div className={isOwned ? '' : 'sm:col-span-2'}>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">Warga Sejak</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={data.resident_since}
                        onChange={(e) => setData('resident_since', e.target.value)}
                        className="w-full text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#0D7A57] focus:bg-white transition [color-scheme:light]"
                      />
                    </div>
                    {errors.resident_since && <p className="text-xs text-red-500 mt-1">{errors.resident_since}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Belum terhubung ke data rumah.</p>
              )}
            </div>

            {/* AKSI — mobile */}
            <div className="flex lg:hidden items-center gap-3 pt-2 pb-6">
              <Link
                href={route(`${prefix}.profile.index`)}
                className="flex-1 text-center px-5 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#0D7A57] hover:bg-[#0a5e43] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {processing ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>

          </div>
        </form>
      </div>
      <Footer />
    </Sidebar>
  );
}