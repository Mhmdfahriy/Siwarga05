<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\News;
use App\Models\User;
use App\Models\Gallery;
use App\Models\LandingSetting;
use Illuminate\Support\Str;

class LandingController extends Controller
{
    public function index()
    {
        $totalWarga = User::where('role', 'warga')->count();
        $totalKK = class_exists(\App\Models\House::class) ? \App\Models\House::count() : User::where('is_kk', true)->count();

        // Ambil Pengaturan Home (Otomatis buat id=1 jika belum ada)
        $setting = LandingSetting::firstOrCreate(['id' => 1]);
        $homeData = [
            'hero_title'           => $setting->hero_title,
            'hero_highlight'       => $setting->hero_highlight,
            'hero_highlight_color' => $setting->hero_highlight_color,
            'hero_subtitle'        => $setting->hero_subtitle,
            'bg_image'             => $setting->hero_bg_image ? asset('storage/' . $setting->hero_bg_image) : null,
        ];

        // Ambil 4 Galeri Terbaru
        $galleries = Gallery::latest()->take(4)->get()->map(function ($g) {
            return [
                'id' => $g->id,
                'title' => $g->title,
                'image_url' => asset('storage/' . $g->image_path),
            ];
        });

        // Ambil Berita
        $news = News::with('author') 
            ->whereHas('author', function ($query) {
                $query->where('role', '!=', 'bendahara');
            })
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($item) {
                $imgPath = $item->thumbnail;
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'excerpt' => Str::limit(strip_tags($item->content), 100),
                    'date' => $item->created_at ? $item->created_at->translatedFormat('d F Y') : 'Baru saja',
                    'image_url' => $imgPath ? (filter_var($imgPath, FILTER_VALIDATE_URL) ? $imgPath : asset('storage/' . $imgPath)) : null,
                    'author_role' => $item->author->role ?? 'pengurus',
                    'slug' => $item->slug ?? $item->id,
                ];
            });

        return Inertia::render('Landing', [
            'news' => $news,
            'totalWarga' => $totalWarga,
            'totalKK' => $totalKK,
            'galleries' => $galleries,
            'homeData' => $homeData,
        ]);
    }
}