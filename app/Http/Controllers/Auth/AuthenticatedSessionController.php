<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route as RouteFacade;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => RouteFacade::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($credentials['email']).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = 60; 
            
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        $isEmail = filter_var($credentials['email'], FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'no_hp';

        $user = User::where($field, $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password ?? '')) {
            RateLimiter::hit($throttleKey, 60);

            $attemptsLeft = RateLimiter::remaining($throttleKey, 5);

            if ($attemptsLeft > 0) {
                throw ValidationException::withMessages([
                    'email' => "Email/nomor telepon atau kata sandi salah. Sisa percobaan: {$attemptsLeft} kali lagi.",
                ]);
            } else {
                throw ValidationException::withMessages([
                    'email' => "Terlalu banyak percobaan login. Coba lagi dalam 60 detik.",
                ]);
            }
        }

        RateLimiter::clear($throttleKey);

        // Mencegah akun yang sudah dinonaktifkan untuk melakukan login kembali
        if ($user->deactivated_at !== null) {
            Auth::guard('web')->logout();
            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah dinonaktifkan. Silakan hubungi pengurus RT untuk mengaktifkannya kembali.',
            ]);
        }

        if ($user->isDitolak()) {
            throw ValidationException::withMessages([
                'email' => 'Akunmu sudah dikeluarkan dari sistem. Alasan: '.($user->alasan_penolakan ?? 'tidak disebutkan').'.',
            ]);
        }

        if ($user->isPindah()) {
            throw ValidationException::withMessages([
                'email' => 'Akunmu berstatus pindah dan tidak lagi terdaftar sebagai warga aktif. Hubungi pengurus RT.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route($this->dashboardRouteFor($user)));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function dashboardRouteFor(User $user): string
    {
        return match (true) {
            $user->isSuperAdmin() => 'superadmin.pengurus.index',
            $user->isKetuaRt() => 'ketuart.dashboard',
            $user->isSekretaris() => 'sekretaris.dashboard',
            $user->isBendahara() => 'bendahara.dashboard',
            default => 'warga.dashboard',
        };
    }
}