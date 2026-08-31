<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isDitolak()) {
            auth()->logout();

            return redirect()->route('login')
                ->with('status', 'Akunmu sudah dikeluarkan dari sistem oleh Ketua RT. Hubungi pengurus RT jika ini kesalahan.');
        }

        if ($user && $user->isPindah()) {
            auth()->logout();

            return redirect()->route('login')
                ->with('status', 'Akunmu berstatus pindah dan tidak lagi terdaftar sebagai warga aktif. Hubungi pengurus RT jika ini kesalahan.');
        }

        return $next($request);
    }
}