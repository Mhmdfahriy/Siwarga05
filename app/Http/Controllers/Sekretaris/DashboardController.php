<?php

namespace App\Http\Controllers\Sekretaris;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\Laporan;
use App\Models\News;
use App\Models\Kalender;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        Carbon::setLocale('id');

        $user = Auth::user();

        // 1. Ambil data ringkasan (Stats)
        $beritaCount = News::count();
        $laporanCount = Laporan::count();
        $kegiatanCount = Kalender::whereMonth('date', now()->month)->count();
        $wargaCount = User::where('role', 'warga')->count();

        // 🔄 FIX: hitung notifikasi belum dibaca berdasarkan recipient_role/house_id,
        // BUKAN notifiable_id — kolom itu bagian dari polymorphic relation ke model
        // terkait (News/Laporan/DuesPayment), tidak menyimpan ID penerima sama sekali.
        $notifikasiCount = Notification::whereNull('house_id')
            ->where(function ($q) use ($user) {
                $q->whereNull('recipient_role')
                  ->orWhere('recipient_role', $user->role);
            })
            ->whereNull('read_at')
            ->count();

        // 2. Ambil data status Laporan
        $statusLaporan = [
            'baru' => Laporan::whereIn('status', ['baru', 'pending'])->count(),
            'diproses' => Laporan::where('status', 'diproses')->count(),
            'selesai' => Laporan::where('status', 'selesai')->count(),
        ];

        // 3. Ambil 3 Berita Terbaru
        $beritaTerbaru = News::latest()->take(3)->get()->map(function ($news) {
            return [
                'kategori' => $news->category ?? 'Umum',
                'tanggal' => Carbon::parse($news->created_at)->translatedFormat('d M Y'),
                'judul' => $news->title
            ];
        });

        // 4. Ambil 3 Agenda Kegiatan Terdekat
        $agendaKegiatan = Kalender::whereDate('date', '>=', now())
            ->orderBy('date', 'asc')
            ->take(3)
            ->get()
            ->map(function ($agenda) {
                $tanggal = Carbon::parse($agenda->date);
                $waktu = $agenda->time ? Carbon::parse($agenda->time)->format('H.i') . ' WIB' : '00.00 WIB';

                return [
                    'bulan' => $tanggal->translatedFormat('M'),
                    'tanggal' => $tanggal->format('d'),
                    'judul' => $agenda->title,
                    'waktu' => $waktu
                ];
            });

        // 5. Log Aktivitas Terbaru (Diambil langsung dari tabel notifications)
        // 🔄 FIX: sama seperti di atas — pakai recipient_role/house_id, bukan notifiable_id.
        // orWhere juga dibungkus closure agar tidak bocor ke notifikasi rumah tertentu.
        $aktivitasTerbaru = Notification::whereNull('house_id')
            ->where(function ($q) use ($user) {
                $q->whereNull('recipient_role')
                  ->orWhere('recipient_role', $user->role);
            })
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($notif) {
                return [
                    'deskripsi' => $notif->title,
                    'waktuLalu' => Carbon::parse($notif->created_at)->diffForHumans()
                ];
            });

        return Inertia::render('Sekretaris/Dashboard', [
            'user' => [
                'name' => $user->name ?? 'Sekretaris',
                'role' => 'RT 05'
            ],
            'stats' => [
                'berita' => $beritaCount,
                'laporan' => $laporanCount,
                'kegiatan' => $kegiatanCount,
                'notifikasi' => $notifikasiCount,
                'warga' => $wargaCount,
            ],
            'statusLaporan' => $statusLaporan,
            'beritaTerbaru' => $beritaTerbaru,
            'agendaKegiatan' => $agendaKegiatan,
            'aktivitasTerbaru' => $aktivitasTerbaru,
        ]);
    }
}