<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    /**
     * Menampilkan halaman utama Pengaturan.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notificationPreferences = $user->notification_preferences ?? User::defaultNotificationPreferences();

        $roleMap = [
            'ketua_rt'   => 'Ketuart',
            'sekretaris' => 'Sekretaris',
            'bendahara'  => 'Bendahara',
            'warga'      => 'Warga'
        ];

        $folder = $roleMap[$user->role] ?? 'Warga'; 

        return Inertia::render("{$folder}/Pengaturan/Index", [
            'resident_id'             => $user->residentId(),
            'notificationPreferences' => $notificationPreferences,
            'has_password'            => $user->hasPassword(),
            
            // 👇 INI VARIABEL YANG DITAMBAHKAN AGAR TIDAK UNDEFINED DI REACT 👇
            'vapid_public_key'        => config('webpush.vapid.public_key'),
        ]);
    }

    /**
     * Memperbarui informasi profil dasar (Nama, Email, No HP, Pekerjaan).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'no_hp'      => ['nullable', 'string', 'min:10', 'max:15', 'regex:/^[0-9]+$/'],
            'occupation' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Informasi profil berhasil diperbarui.');
    }

    /**
     * Memperbarui foto profil.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => [
                'required', 
                'image', 
                'mimes:jpeg,png,jpg,webp', 
                'mimetypes:image/jpeg,image/png,image/webp', 
                'max:2048'
            ],
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            if ($user->photo && !str_starts_with($user->photo, 'http')) {
                Storage::disk('public')->delete($user->photo);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->update(['photo' => $path]);
        }

        return redirect()->back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    /**
     * Memperbarui Password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $rules = [
            'password' => ['required', 'min:8', 'confirmed'],
        ];

        if ($user->hasPassword()) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $validated = $request->validate($rules);

        $isFirstTimeSet = ! $user->hasPassword();

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with(
            'success',
            $isFirstTimeSet ? 'Kata sandi berhasil dibuat.' : 'Password berhasil diperbarui.'
        );
    }

    /**
     * Mengubah status 2FA.
     */
    public function toggleTwoFactor(Request $request)
    {
        $validated = $request->validate([
            'two_factor_enabled' => ['required', 'boolean'],
        ]);

        $request->user()->update([
            'two_factor_enabled' => $validated['two_factor_enabled'],
        ]);

        return redirect()->back()->with('success', 'Status 2FA berhasil diperbarui.');
    }

    /**
     * Memperbarui preferensi notifikasi.
     */
    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'notification_preferences' => ['required', 'array'],
        ]);

        if (isset($validated['notification_preferences']['types'])) {
            $validated['notification_preferences']['types']['emergency_alerts'] = true;
        }

        $user->update([
            'notification_preferences' => $validated['notification_preferences'],
        ]);

        return redirect()->back()->with('success', 'Preferensi notifikasi berhasil disimpan.');
    }

    /**
     * Menonaktifkan akun pengguna.
     */
    public function deactivate(Request $request)
    {
        $user = $request->user();
        $user->update([
            'deactivated_at' => now(),
        ]);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun Anda telah dinonaktifkan.');
    }

    /**
     * Menyimpan token Push Notification dari Browser ke Database.
     */
    public function updatePushSubscription(Request $request)
    {
        $request->validate([
            'endpoint'    => 'required',
            'keys.auth'   => 'required',
            'keys.p256dh' => 'required'
        ]);

        $request->user()->updatePushSubscription(
            $request->endpoint,
            $request->keys['p256dh'],
            $request->keys['auth']
        );

        return response()->json(['success' => true]);
    }

    /**
     * Menghapus token Push Notification dari Database saat user menonaktifkan toggle.
    */
    public function deletePushSubscription(Request $request)
    {
        $request->validate([
            'endpoint' => 'required',
        ]);

        $request->user()->pushSubscriptions()
            ->where('endpoint', $request->endpoint)
            ->delete();

        return response()->json(['success' => true]);
    }
}