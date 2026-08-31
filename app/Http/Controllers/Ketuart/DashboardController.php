<?php

namespace App\Http\Controllers\Ketuart;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\HouseMember; // Asumsi tabel penghuni rumah
use App\Models\House;       // Asumsi tabel rumah
use App\Models\Laporan;     // Asumsi tabel laporan/aduan

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. Total KK (Hanya menghitung yang statusnya Kepala Keluarga)
        $totalKK = HouseMember::where('relation_type', 'kepala_keluarga')->count();

        // 2. Total Warga (Menghitung seluruh individu/jiwa yang terdaftar)
        $totalWarga = HouseMember::count(); 

        // 3. Total Rumah
        $totalRumah = House::count(); 

        // 4. Laporan Masuk (Menghitung laporan yang belum diproses)
        $laporanPending = Laporan::whereIn('status', ['pending', 'menunggu'])->count();

        // Mengambil data laporan terbaru untuk widget list (opsional)
        $recentReports = Laporan::with('user')->latest()->take(3)->get();

        return Inertia::render('Ketuart/Dashboard', [
            'stats' => [
                'totalKK' => $totalKK,
                'totalWarga' => $totalWarga,
                'totalRumah' => $totalRumah,
                'aduanWarga' => $laporanPending,
            ],
            'recentReports' => $recentReports
        ]);
    }
}