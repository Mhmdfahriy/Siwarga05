<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PengurusController extends Controller
{
    private const PENGURUS_ROLES = ['ketua_rt', 'sekretaris', 'bendahara'];

    /**
     * Halaman kelola pengurus — daftar pengurus aktif & form buat akun pengurus baru.
     */
    public function index(Request $request)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        $pengurus = User::whereIn('role', self::PENGURUS_ROLES)
            ->orderBy('role')
            ->get()
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'role_label' => $this->roleLabel($u->role),
                'photo'      => $u->photo ? asset('storage/' . $u->photo) : null,
            ]);

        return Inertia::render('SuperAdmin/Pengurus/Index', [
            'user'     => ['role' => Auth::user()->role],
            'pengurus' => $pengurus,
        ]);
    }

    /**
     * Buat akun pengurus baru dari nol dengan validasi jabatan (menolak jika sudah terisi).
     */
    public function store(Request $request)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'role'     => ['required', Rule::in(self::PENGURUS_ROLES)],
            'password' => ['required', 'string', 'min:8'],
        ]);

        // Validasi Profesional: Cek apakah jabatan tersebut masih diisi orang lain
        $isRoleFilled = User::where('role', $validated['role'])->exists();

        if ($isRoleFilled) {
            return back()->withErrors([
                'role' => 'Jabatan ' . $this->roleLabel($validated['role']) . ' saat ini masih terisi. Harap turunkan pengurus lama terlebih dahulu sebelum membuat akun baru.'
            ])->withInput();
        }

        User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'role'     => $validated['role'],
            'status'   => 'aktif',
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', "Akun pengurus {$validated['name']} berhasil dibuat sebagai " . $this->roleLabel($validated['role']) . '.');
    }

    /**
     * Turunkan pengurus kembali jadi warga biasa.
     */
    public function demote(User $targetUser)
    {
        abort_unless(Auth::user()->isSuperAdmin(), 403);
        abort_unless(in_array($targetUser->role, self::PENGURUS_ROLES), 404);

        $targetUser->update(['role' => 'warga']);

        return back()->with('status', "{$targetUser->name} berhasil diturunkan kembali menjadi warga.");
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'ketua_rt'   => 'Ketua RT',
            'sekretaris' => 'Sekretaris',
            'bendahara'  => 'Bendahara',
            default      => ucfirst($role),
        };
    }
}