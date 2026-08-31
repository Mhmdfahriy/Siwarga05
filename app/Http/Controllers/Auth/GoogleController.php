<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'role' => User::ROLE_WARGA,
                'status' => User::STATUS_AKTIF,
            ]);

            Auth::login($user);

            return redirect()->route('warga.dashboard')
                ->with('status', 'Akun Google berhasil dibuat! Lengkapi NIK & No. WhatsApp di halaman profil.');
        }

        // Super Admin tidak login lewat Google — arahkan ke form email+password
        if ($user->isSuperAdmin()) {
            return redirect()->route('login')
                ->with('status', 'Akun Super Admin harus login menggunakan email & password, bukan Google.');
        }

        if (! $user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        if ($user->isDitolak()) {
            return redirect()->route('login')
                ->with('status', 'Akunmu sudah dikeluarkan dari sistem. Hubungi pengurus RT.');
        }

        if ($user->isPindah()) {
            return redirect()->route('login')
                ->with('status', 'Akunmu berstatus pindah dan tidak lagi terdaftar sebagai warga aktif. Hubungi pengurus RT.');
        }

        Auth::login($user, true);

        return redirect()->intended(route($this->dashboardRouteFor($user)));
    }

    private function dashboardRouteFor(User $user): string
    {
        return match (true) {
            $user->isKetuaRt() => 'ketuart.dashboard',
            $user->isSekretaris() => 'sekretaris.dashboard',
            $user->isBendahara() => 'bendahara.dashboard',
            default => 'warga.dashboard',
        };
    }
}