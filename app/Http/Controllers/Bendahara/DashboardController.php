<?php

namespace App\Http\Controllers\Bendahara;

use App\Http\Controllers\Controller;
use App\Models\Due;
use App\Models\DuesPayment;
use App\Models\Laporan;
use App\Models\News;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $totalIuranTerkumpul = DuesPayment::where('status', 'diverifikasi')->sum('total_amount');
        $tagihanBelumLunas   = Due::where('status', '!=', 'lunas')->sum('amount');
        $danaInsidental      = DuesPayment::where('status', 'diverifikasi')->sum('total_amount');

        $totalWarga = User::where('role', 'warga')->count();
        $wargaSudahBayar = User::where('role', 'warga')->whereHas('house.duesPayments', function ($q) {
            $q->where('status', 'diverifikasi')->whereMonth('created_at', now()->month);
        })->count();

        // Query transaksi dengan filter pencarian live search
        $transactionQuery = DuesPayment::with(['house.headOfFamily', 'house.users'])->latest();

        if (!empty($search)) {
            $transactionQuery->where(function ($query) use ($search) {
                $query->orWhereHas('house.headOfFamily', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('house.users', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('house', function ($q) use ($search) {
                    $q->where('block_number', 'like', "%{$search}%");
                });
            });
        }

        $recentTransactions = $transactionQuery->take(5)->get()->map(function ($payment) {
            $wargaName = $payment->house->headOfFamily->name
                ?? $payment->house->users->first()->name
                ?? 'Warga RT 05';

            return [
                'id'     => $payment->id,
                'uuid'   => $payment->uuid,
                'name'   => $wargaName,
                'block'  => 'Blok ' . ($payment->house->block_number ?? '-'),
                'date'   => $payment->created_at->translatedFormat('d M Y'),
                'amount' => $payment->total_amount,
                'status' => $payment->status,
            ];
        });

        // Berita terbaru — dipakai untuk card ringkasan DAN panel bawah
        $recentNews = News::latest()->take(2)->get()->map(function ($news) {
            return [
                'id'       => $news->id,
                'title'    => $news->title,
                'category' => $news->category ?? 'Umum',
                'date'     => $news->created_at->diffForHumans(),
                'image'    => $news->thumbnail ? asset('storage/' . $news->thumbnail) : null,
            ];
        });

        // Laporan warga terbaru — kategori keuangan (relevan untuk bendahara)
        $recentLaporanQuery = Laporan::with('user')
            ->where('kategori', 'keuangan')
            ->latest();

        $recentLaporan = (clone $recentLaporanQuery)->take(2)->get()->map(function ($laporan) {
            return [
                'id'       => $laporan->id,
                'judul'    => $laporan->judul,
                'deskripsi'=> $laporan->deskripsi,
                'status'   => $laporan->status,
                'author'   => $laporan->user->name ?? 'Warga',
            ];
        });

        $laporanBaruCount = (clone $recentLaporanQuery)
            ->where('status', Laporan::STATUS_PENDING)
            ->count();

        // Data chart 6 bulan terakhir (bulan berjalan dan 5 bulan sebelumnya)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            $bulanan = Due::where('type', 'bulanan')
                ->where('status', 'lunas')
                ->whereYear('paid_at', $date->year)
                ->whereMonth('paid_at', $date->month)
                ->sum('amount');

            $insidental = Due::where('type', 'insidental')
                ->where('status', 'lunas')
                ->whereYear('paid_at', $date->year)
                ->whereMonth('paid_at', $date->month)
                ->sum('amount');

            $chartData[] = [
                'month'      => $date->translatedFormat('M'),
                'bulanan'    => (float) $bulanan,
                'insidental' => (float) $insidental,
            ];
        }

        return Inertia::render('Bendahara/Dashboard', [
            'financialSummary' => [
                'total_iuran'          => $totalIuranTerkumpul,
                'tagihan_belum_lunas'  => $tagihanBelumLunas,
                'dana_insidental'      => $danaInsidental,
                'warga_sudah_bayar'    => $wargaSudahBayar,
                'total_warga'          => $totalWarga,
            ],
            'recentTransactions' => $recentTransactions,
            'recentNews'         => $recentNews,
            'recentLaporan'      => $recentLaporan,
            'laporanBaruCount'   => $laporanBaruCount,
            'chartData'          => $chartData,
            'filters'            => $request->only(['search']),
        ]);
    }
}