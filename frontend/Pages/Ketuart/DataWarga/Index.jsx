import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, RotateCcw, User, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, Edit3, Home, Users } from 'lucide-react';
import Sidebar from '@/Layouts/Sidebar';
import Pagination from '@/Components/Pagination';
import ModalCard from '@/Components/ModalCard';
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';

const MEMBERS_PER_PAGE = 6;

export default function DataWarga({ user, warga, filters, canResetNik, totalWarga }) {
  const [search, setSearch] = useState(filters.search || '');
  const [expandedRows, setExpandedRows] = useState({});
  const [memberPages, setMemberPages] = useState({});
  const [resetTarget, setResetTarget] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const isFirstRender = useRef(true);

  // Menentukan prefix role untuk komponen notifikasi dan route
  const prefix = user.role === 'ketua_rt' ? 'ketuart' : user.role;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(route(`${prefix}.data-warga.index`), { search }, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const toggleRow = (houseId) => {
    setExpandedRows(prev => ({
      ...prev,
      [houseId]: !prev[houseId]
    }));
  };

  const setMemberPage = (houseId, page) => {
    setMemberPages(prev => ({ ...prev, [houseId]: page }));
  };

  const confirmResetUserNik = (userId, name) => {
    setResetTarget({ scope: 'user', id: userId, name });
  };

  const confirmResetMemberNik = (memberId, name) => {
    setResetTarget({ scope: 'member', id: memberId, name });
  };

  const executeReset = () => {
    if (!resetTarget) return;
    setIsResetting(true);

    const url = resetTarget.scope === 'user'
      ? route(`${prefix}.data-warga.reset-nik`, resetTarget.id)
      : route(`${prefix}.data-warga.reset-member-nik`, resetTarget.id);

    router.put(url, {}, {
      preserveScroll: true,
      onFinish: () => {
        setIsResetting(false);
        setResetTarget(null);
      },
    });
  };

  const wargaLinks = warga?.links || null;

  return (
    <Sidebar currentRole={user.role} activeMenu="data-warga">
      <Head title="Data Warga & Rumah" />

      <div className="py-4 sm:py-8 bg-[#F8FAFC] min-h-screen font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header Atas */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Data Warga &amp; Rumah</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Manajemen database kependudukan berdasarkan Kartu Keluarga (KK).</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                <NotifikasiBell prefix={prefix} />
              </div>

              <div className="bg-[#0D7A57] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm whitespace-nowrap">
                <span>Total Jiwa: {totalWarga}</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Daftar Kartu Keluarga ({warga?.total || warga?.data?.length || 0})
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari blok, kepala keluarga, atau anggota..."
                className="w-full bg-white border border-gray-200 rounded-xl text-xs pl-10 pr-3.5 py-3 focus:ring-1 focus:ring-[#0D7A57] focus:border-[#0D7A57] outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Main Content Box dengan Tabel Responsif */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-wider bg-[#F4F6FC]">
                    <th className="px-4 py-3">Blok Rumah</th>
                    <th className="px-4 py-3">Kepala Keluarga</th>
                    <th className="px-4 py-3">No. HP</th>
                    <th className="px-4 py-3">Jumlah Anggota</th>
                    <th className="px-4 py-3">Aksi Akun</th>
                    <th className="px-4 py-3 text-center">Detail Anggota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {warga.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                        Tidak ada data keluarga ditemukan.
                      </td>
                    </tr>
                  )}
                  {warga.data.map((house) => {
                    const isExpanded = !!expandedRows[house.house_id];
                    const currentMemberPage = memberPages[house.house_id] || 1;
                    const totalMemberPages = Math.ceil(house.members.length / MEMBERS_PER_PAGE);
                    const memberStartIndex = (currentMemberPage - 1) * MEMBERS_PER_PAGE;
                    const currentMembersSlice = house.members.slice(memberStartIndex, memberStartIndex + MEMBERS_PER_PAGE);

                    return (
                      <React.Fragment key={house.house_id}>
                        {/* Baris Utama Kartu Keluarga */}
                        <tr className="text-xs sm:text-sm hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                              <Home className="w-3.5 h-3.5 text-gray-400" /> {house.block_number ?? '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                            {house.kepala_keluarga}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{house.no_hp}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <Users className="w-3 h-3" /> {house.total_anggota} Jiwa
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {house.user_id ? (
                              <div className="flex items-center gap-3">
                                <Link
                                  href={route(`${prefix}.data-warga.show`, house.user_id)}
                                  className="text-gray-400 hover:text-[#0D7A57] transition"
                                  title="Lihat Akun"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={route(`${prefix}.data-warga.edit`, house.user_id)}
                                  className="text-gray-400 hover:text-[#0D7A57] transition"
                                  title="Edit Status Akun"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Link>
                                {canResetNik && house.has_nik_user && (
                                  <button
                                    onClick={() => confirmResetUserNik(house.user_id, house.kepala_keluarga)}
                                    className="text-red-500 hover:text-red-600 transition cursor-pointer"
                                    title="Reset NIK"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tanpa akun login</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => toggleRow(house.house_id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D7A57] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              {isExpanded ? 'Tutup' : 'Lihat Anggota'}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Baris Dropdown / Accordion Anggota Keluarga */}
                        {isExpanded && (
                          <tr className="bg-[#F8FAFC]">
                            <td colSpan={6} className="px-4 sm:px-6 py-4">
                              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-inner space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-[#0D7A57]" /> Daftar Anggota Keluarga Rumah {house.block_number}
                                    <span className="text-gray-400 font-normal">({house.members.length} Jiwa)</span>
                                  </p>
                                </div>

                                {house.members.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">Belum ada data anggota keluarga yang diinput untuk rumah ini.</p>
                                ) : (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {currentMembersSlice.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 gap-2">
                                          <div className="flex items-center gap-2.5 truncate">
                                            <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 shadow-xs">
                                              {member.photo ? (
                                                <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                                              ) : (
                                                member.name?.[0]
                                              )}
                                            </div>
                                            <div className="truncate">
                                              <p className="text-xs font-bold text-gray-900 truncate">{member.name}</p>
                                              <p className="text-[10px] text-gray-500 capitalize">
                                                {member.relation_type?.replace('_', ' ')}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {member.has_nik ? (
                                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <ShieldCheck className="w-3 h-3" /> {member.nik_masked}
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <ShieldAlert className="w-3 h-3" /> NIK Kosong
                                              </span>
                                            )}
                                            {canResetNik && member.has_nik && (
                                              <button
                                                onClick={() => confirmResetMemberNik(member.id, member.name)}
                                                className="text-red-400 hover:text-red-600 transition cursor-pointer p-1"
                                                title="Reset NIK"
                                              >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {totalMemberPages > 1 && (
                                      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-2">
                                        <p className="text-[11px] text-gray-400">
                                          {memberStartIndex + 1}-{Math.min(memberStartIndex + MEMBERS_PER_PAGE, house.members.length)} dari {house.members.length} anggota
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => setMemberPage(house.house_id, Math.max(currentMemberPage - 1, 1))}
                                            disabled={currentMemberPage === 1}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer shadow-xs"
                                          >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                          </button>
                                          <span className="text-xs font-bold text-gray-700 px-1">
                                            {currentMemberPage} / {totalMemberPages}
                                          </span>
                                          <button
                                            onClick={() => setMemberPage(house.house_id, Math.min(currentMemberPage + 1, totalMemberPages))}
                                            disabled={currentMemberPage === totalMemberPages}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer shadow-xs"
                                          >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Komponen Pagination Terpusat */}
            {wargaLinks && wargaLinks.length > 3 && (
              <div className="py-4 px-4 bg-[#F4F6FC] border-t border-gray-100 flex justify-center">
                <Pagination links={wargaLinks} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ModalCard Global untuk Konfirmasi Reset NIK */}
      <ModalCard
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={executeReset}
        title="Reset NIK"
        message={
          resetTarget
            ? `Reset NIK milik ${resetTarget.name}? ${
                resetTarget.scope === 'user'
                  ? 'Warga tersebut perlu mengisi ulang NIK dari halaman profilnya.'
                  : 'NIK bisa diisi ulang lewat form edit anggota keluarga.'
              }`
            : ''
        }
        confirmText="Ya, Reset"
        cancelText="Batal"
        type="danger"
        processing={isResetting}
      />
      <Footer />
    </Sidebar>
  );
}