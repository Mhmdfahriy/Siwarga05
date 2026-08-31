import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react'; // useForm dihapus
import Sidebar from '@/Layouts/Sidebar'; 
import NotifikasiBell from '@/Components/Notifikasi/NotifikasiBell';
import Footer from '@/Components/Footer';
import { 
    Users, Home, MessageSquare, ArrowRight, 
    CreditCard, Megaphone, ChevronRight, UserX
} from 'lucide-react';

export default function Dashboard({ auth, stats, recentReports, recentPayments }) {
    const namaRT = auth?.user?.name || "Ketua RT";
    const nomorRT = auth?.user?.rt_number || "05";

    const [sapaan, setSapaan] = useState("Selamat Pagi");

    useEffect(() => {
        const jam = new Date().getHours();
        if (jam >= 4 && jam < 11) setSapaan("Selamat Pagi");
        else if (jam >= 11 && jam < 15) setSapaan("Selamat Siang");
        else if (jam >= 15 && jam < 18) setSapaan("Selamat Sore");
        else setSapaan("Selamat Malam");
    }, []);

    const tanggalHariIni = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka || 0);
    };

    return (
        <Sidebar currentRole="ketua_rt" activeMenu="dashboard">
            <Head title="Dashboard Ketua RT" />

            <div className="flex-1 flex flex-col justify-between min-w-0 font-sans antialiased text-[#1A202C]">
                <main className="p-4 md:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{sapaan}, Pak RT {namaRT}</h2>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">Panel Kendali Administrasi RT {nomorRT} • {tanggalHariIni}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotifikasiBell prefix="ketuart" />
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full shrink-0">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Mode Admin RT
                            </span>
                        </div>
                    </div>

                    {/* Baris 1: 4 Kotak Statistik Real-time */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Kotak 1: Total KK */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Kepala Keluarga</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalKK || "0"} KK</h3>
                                </div>
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500 font-medium">Data Kartu Keluarga</span>
                                <Link href={route('ketuart.data-warga.index')} className="text-xs text-blue-700 font-bold hover:underline">
                                    Kelola <ArrowRight className="w-3 h-3 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Kotak 2: Total Warga (Jiwa) */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Warga (Jiwa)</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalWarga || "0"} Jiwa</h3>
                                </div>
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500 font-medium">Seluruh Anggota Keluarga</span>
                                <Link href={route('ketuart.data-warga.index')} className="text-xs text-emerald-700 font-bold hover:underline">
                                    Lihat <ArrowRight className="w-3 h-3 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Kotak 3: Total Rumah */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Rumah Terdaftar</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalRumah || "0"} Rumah</h3>
                                </div>
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                    <Home className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-gray-500 font-medium">Data Fisik Bangunan</span>
                                <Link href={route('ketuart.house.index')} className="text-xs text-amber-700 font-bold hover:underline">
                                    Kelola <ArrowRight className="w-3 h-3 inline" />
                                </Link>
                            </div>
                        </div>

                        {/* Kotak 4: Laporan Masuk */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Aduan Warga Pending</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats?.aduanWarga || "0"} Laporan</h3>
                                </div>
                                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[11px] text-rose-500 font-medium animate-pulse">Butuh penanganan</span>
                                <Link href={route('ketuart.laporan.index')} className="text-xs text-rose-700 font-bold hover:underline">
                                    Proses <ArrowRight className="w-3 h-3 inline" />
                                </Link>
                            </div>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Kolom Kiri & Tengah - Daftar Data Dinamis */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Widget 1: Aduan Warga Terbaru */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 text-sm">Aduan & Kendala Warga Terbaru</h3>
                                    <Link href={route('ketuart.laporan.index')} className="text-xs text-[#0D7A57] font-semibold hover:underline">Kelola Semua</Link>
                                </div>
                                <div className="space-y-4">
                                    {recentReports && recentReports.length > 0 ? (
                                        recentReports.map((report) => (
                                            <div key={report.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-start gap-4">
                                                <div>
                                                    <h5 className="text-xs font-bold text-gray-800">{report.judul} <span className="font-normal text-gray-400">({report.kategori})</span></h5>
                                                    <p className="text-[11px] text-gray-500 mt-1">"{report.deskripsi}"</p>
                                                    <span className="text-[10px] text-gray-400 block mt-2">
                                                        Oleh: {report.user?.name || "Warga"} • {new Date(report.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-full shrink-0 uppercase">
                                                    {report.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                                            <p className="text-xs font-medium text-gray-500">Lingkungan aman terkendali.</p>
                                            <p className="text-[11px] text-gray-400 mt-1">Belum ada aduan masuk dari warga saat ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Widget 2: Pantauan Kas Masuk */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 text-sm">Pemasukan Iuran Terakhir</h3>
                                    <Link href={route('ketuart.dues.index')} className="text-xs text-[#0D7A57] font-semibold hover:underline">Lihat Detail</Link>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentPayments && recentPayments.length > 0 ? (
                                        recentPayments.map((payment) => (
                                            <div key={payment.id} className="py-3 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <CreditCard className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{payment.user?.name || "Warga"}</p>
                                                        <p className="text-[10px] text-gray-500">Iuran Bulan {payment.month}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-emerald-600">+{formatRupiah(payment.amount)}</p>
                                                    <p className="text-[10px] text-gray-400">{new Date(payment.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center">
                                            <p className="text-xs text-gray-400">Belum ada transaksi iuran terbaru.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-6">
                            
                            {/* Widget Baru: Pantau Informasi RT (View-only) */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-emerald-50 text-[#0D7A57] rounded-lg flex items-center justify-center">
                                        <Megaphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">Informasi RT</h3>
                                        <p className="text-[10px] text-gray-400">Dikelola oleh Sekretaris</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <h5 className="text-xs font-bold text-gray-800">Pantau Berita Warga</h5>
                                        <p className="text-[11px] text-gray-500 mt-1">Cek pengumuman dan berita terbaru yang sedang tayang untuk warga RT {nomorRT}.</p>
                                    </div>
                                    <Link href={route('ketuart.news.index')} className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#0D7A57] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                                        Buka Menu Berita <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Menu Aksi Rutin Pengurus */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-800 text-sm mb-4">Aksi Rutin Pengurus</h4>
                                <div className="space-y-2">
                                    <Link href={route('ketuart.data-warga.index')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors">
                                        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Cek Data Warga Aktif</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                    <Link href={route('ketuart.laporan.index')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors">
                                        <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-amber-600" /> Pantau LaporanAja</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                    <Link href={route('ketuart.warganonaktif.index')} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors">
                                        <span className="flex items-center gap-2"><UserX className="w-4 h-4 text-rose-600" /> Tinjau Warga Nonaktif</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </Link>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </Sidebar>
    );
}