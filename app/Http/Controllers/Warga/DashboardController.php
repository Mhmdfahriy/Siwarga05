<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\News;
use App\Models\Due;
use App\Models\DuesPayment;
use App\Models\Laporan;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $houseId = $user->house_id;

        // 1. Data Rumah
        $houseInfo = $user->house ? [
            'block_number' => $user->house->block_number
        ] : null;

        // 2. Berita Terbaru (Dari Database)
        $recentNews = News::whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(fn($news) => [
                'id'       => $news->id,
                'title'    => $news->title,
                'category' => $news->category ?? 'Informasi',
                'date'     => $news->published_at->isoFormat('D MMMM Y'),
            ]);

        $totalNewsCount = News::where('published_at', '<=', now())->count();

        // 3. Status Iuran (Ambil tagihan terakhir dan tanggal bayar dari DuesPayment yang diverifikasi)
        $latestDue = Due::where('house_id', $houseId)
            ->latest('period_year')
            ->latest('period_month')
            ->first();

        // Ambil riwayat pembayaran iuran terakhir rumah ini yang statusnya diverifikasi/sukses
        $latestPayment = DuesPayment::where('house_id', $houseId)
            ->where('status', 'diverifikasi')
            ->latest('updated_at')
            ->first();

        $iuranBulanan = $latestDue ? [
            'label'   => method_exists($latestDue, 'statusLabel') ? $latestDue->statusLabel() : ucfirst($latestDue->status),
            'isPaid'  => in_array($latestDue->status, ['lunas', 'diverifikasi']),
            'title'   => $latestDue->title,
            'nominal' => 'Rp ' . number_format($latestDue->amount, 0, ',', '.'),
            'bulan'   => method_exists($latestDue, 'periodLabel') ? $latestDue->periodLabel() : $latestDue->period_month,
            // Tanggal pembayaran diambil dari updated_at saat pembayaran sukses diverifikasi
            'tanggal' => $latestPayment ? $latestPayment->updated_at->format('d M Y') : '-',
        ] : null;

        // 4. Status Laporan (Ambil laporan terakhir user menggunakan model Laporan)
        $latestLaporan = Laporan::where('user_id', $user->id)->latest()->first();

        $laporanStatus = $latestLaporan ? [
            'title'  => $latestLaporan->title ?? $latestLaporan->perihal ?? 'Laporan Warga',
            'status' => ucfirst(str_replace('_', ' ', $latestLaporan->status ?? 'diproses')),
        ] : null;

        // 5. Notifikasi (Dari Database)
        // 🔄 FIX: dibungkus closure agar scoping-nya benar —
        // sebelumnya "orWhere('recipient_role', ...)" tanpa kurung bisa
        // menampilkan notifikasi milik rumah lain yang kebetulan recipient_role-nya sama.
        $notifications = Notification::where(function ($q) use ($houseId, $user) {
                $q->where('house_id', $houseId)
                  ->orWhere(function ($q2) use ($user) {
                      $q2->whereNull('house_id')
                         ->where(function ($q3) use ($user) {
                             $q3->whereNull('recipient_role')
                                ->orWhere('recipient_role', $user->role);
                         });
                  });
            })
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($n) => [
                'title' => $n->title,
                'time'  => $n->created_at->diffForHumans(),
            ]);

        return Inertia::render('Warga/Dashboard', [
            'houseInfo'     => $houseInfo,
            'recentNews'    => $recentNews,
            'totalNewsCount'=> $totalNewsCount,
            'iuranBulanan'  => $iuranBulanan,
            'laporanStatus' => $laporanStatus,
            'notifications' => $notifications,
        ]);
    }
}