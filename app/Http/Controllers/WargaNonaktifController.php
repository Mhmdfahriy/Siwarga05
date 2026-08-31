<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WargaNonaktifController extends Controller
{
    /**
     * Menampilkan daftar warga yang akunnya sedang dinonaktifkan.
     */
    public function index(Request $request)
    {
        $query = User::whereNotNull('deactivated_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        $users = $query->latest('deactivated_at')->paginate(10)->withQueryString();

        return Inertia::render('Ketuart/WargaNonaktif/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Mengaktifkan kembali akun warga yang sebelumnya nonaktif.
     */
    public function activate($id)
    {
        $user = User::findOrFail($id);

        $user->update([
            'deactivated_at' => null,
        ]);

        return redirect()->back()->with('success', "Akun atas nama {$user->name} berhasil diaktifkan kembali.");
    }
}