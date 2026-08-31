<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'digits:16'],
            'whatsapp' => ['required', 'digits_between:11,12'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string'],
        ], [
            'nik.digits' => 'NIK harus terdiri dari 16 digit.',
            'whatsapp.digits_between' => 'Nomor WhatsApp harus 11-12 digit.',
        ]);

        $nikHash = hash('sha256', $validated['nik']);

        if (User::where('nik_hash', $nikHash)->exists()) {
            throw ValidationException::withMessages([
                'nik' => 'NIK ini sudah terdaftar.',
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'nik' => $validated['nik'],
            'no_hp' => $validated['whatsapp'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_WARGA,
            'status' => User::STATUS_AKTIF,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('warga.dashboard')
            ->with('status', 'Pendaftaran berhasil! Selamat datang di SiWarga05.');
    }
}