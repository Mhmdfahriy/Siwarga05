<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller; // Wajib di-import karena beda folder
use App\Models\Gallery;
use App\Models\LandingSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingSettingController extends Controller
{
    // Menampilkan halaman kelola landing page
    public function index()
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        $setting = LandingSetting::firstOrCreate(['id' => 1]);
        
        $galleries = Gallery::latest()->get()->map(fn ($g) => [
            'id' => $g->id,
            'title' => $g->title,
            'image_url' => asset('storage/' . $g->image_path),
        ]);

        return Inertia::render('SuperAdmin/LandingSetting/Index', [
            'setting' => $setting,
            'galleries' => $galleries,
        ]);
    }

    // Mengupdate teks, highlight warna, dan background beranda
    public function updateHome(Request $request)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        $request->validate([
            'hero_title'           => ['nullable', 'string'],
            'hero_highlight'       => ['nullable', 'string', 'max:255'],
            'hero_highlight_color' => ['nullable', 'string', 'max:50'],
            'hero_subtitle'        => ['nullable', 'string', 'max:255'],
            'hero_bg_image'        => ['nullable', 'image', 'max:2048'],
        ]);

        $setting = LandingSetting::firstOrCreate(['id' => 1]);
        
        $data = $request->only([
            'hero_title', 
            'hero_highlight', 
            'hero_highlight_color', 
            'hero_subtitle'
        ]);

        if ($request->hasFile('hero_bg_image')) {
            if ($setting->hero_bg_image) {
                Storage::disk('public')->delete($setting->hero_bg_image);
            }
            $data['hero_bg_image'] = $request->file('hero_bg_image')->store('landing', 'public');
        }

        $setting->update($data);

        return back()->with('status', 'Pengaturan Beranda berhasil diperbarui.');
    }

    // Menyimpan foto galeri baru
    public function storeGallery(Request $request)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('image')->store('galleries', 'public');

        Gallery::create([
            'title' => $request->title,
            'image_path' => $path,
        ]);

        return back()->with('status', 'Foto galeri berhasil diunggah.');
    }

    // Menghapus foto galeri
    public function destroyGallery(Gallery $gallery)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        if ($gallery->image_path) {
            Storage::disk('public')->delete($gallery->image_path);
        }
        
        $gallery->delete();

        return back()->with('status', 'Foto galeri berhasil dihapus.');
    }
}