<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ResidentProfileController extends Controller
{
    /**
     * Peta role -> namespace folder page Inertia.
     */
    private function roleNamespace(string $role): string
    {
        return match ($role) {
            'warga'      => 'Warga',
            'sekretaris' => 'Sekretaris',
            'bendahara'  => 'Bendahara',
            'ketua_rt'   => 'Ketuart',
            default      => abort(403),
        };
    }

    private function getProfileRoute(string $role): string
    {
        return match ($role) {
            'warga'      => 'warga.profile.index',
            'sekretaris' => 'sekretaris.profile.index',
            'bendahara'  => 'bendahara.profile.index',
            'ketua_rt'   => 'ketuart.profile.index',
            default      => 'dashboard',
        };
    }

    private function userPayload(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'nik_masked'  => $user->maskedNik(),
            'has_nik'     => (bool) $user->nik,
            'email'       => $user->email,
            'no_hp'       => $user->no_hp,
            'occupation'  => $user->occupation,
            'photo'       => $user->photo ? asset('storage/' . $user->photo) : null,
            'status'      => $user->status,
            'role'        => $user->role,
            'role_label'  => $user->roleLabel(),
            'resident_id' => $user->residentId(),
        ];
    }

    private function housePayload(?\App\Models\House $house): ?array
    {
        return $house ? [
            'id'              => $house->id,
            'block_number'    => $house->block_number,
            'photo'           => $house->photo ? asset('storage/' . $house->photo) : null,
            'ownership_status'=> $house->ownership_status,
            'ownership_label' => $house->ownershipLabel(),
            'land_size'       => $house->land_size,
            'building_size'   => $house->building_size,
            'resident_since'  => $house->resident_since?->format('Y-m-d'),
        ] : null;
    }

    /**
     * [PATCHED] Menggunakan Laravel Paginator (paginate & through) 
     * agar menghasilkan data.links dan data.data yang dibutuhkan oleh komponen Pagination.jsx
     */
    private function membersPayload(?House $house)
    {
        if (!$house) {
            return HouseMember::whereRaw('1 = 0')->paginate(4);
        }

        return $house->members()
            ->orderBy('id')
            ->paginate(4)
            ->withQueryString()
            ->through(fn (HouseMember $m) => [
                'id'             => $m->id,
                'name'           => $m->name,
                'relation_type'  => $m->relation_type,
                'relation_label' => $m->relationLabel(),
                'is_primary'     => $m->isPrimary(),
                'nik_masked'     => $m->maskedNik(),
                'has_nik'        => (bool) $m->nik,
                'photo'          => $m->photoUrl(),
            ]);
    }

    public function index()
    {
        // [PATCHED] Menghapus '.members' dari eager load karena sudah ditangani langsung via paginate() di membersPayload
        $user = Auth::user()->fresh()->load(['house']);
        $ns = $this->roleNamespace($user->role);

        return Inertia::render("{$ns}/Profile/Index", [
            'user'    => $this->userPayload($user),
            'house'   => $this->housePayload($user->house),
            'members' => $this->membersPayload($user->house),
        ]);
    }

    public function edit()
    {
        // [PATCHED] Menghapus '.members' dari eager load
        $user = Auth::user()->fresh()->load(['house']);
        $ns   = $this->roleNamespace($user->role);

        return Inertia::render("{$ns}/Profile/Edit", [
            'user'    => $this->userPayload($user),
            'house'   => $this->housePayload($user->house),
            'members' => $this->membersPayload($user->house),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'       => ['sometimes', 'required', 'string', 'max:255'],
            'email'      => ['sometimes', 'required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'no_hp'      => ['nullable', 'string', 'max:20'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'photo'      => ['nullable', 'image', 'max:2048'],
            'nik'        => [
                'nullable',
                'string',
                'digits:16',
                new \App\Rules\UniqueNikAcrossTables(ignoreUserId: $user->id),
            ],
        ], [
            'nik.digits' => 'NIK harus terdiri dari tepat 16 digit angka.',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('profile-photos', 'public');
        }

        // NIK cuma boleh diisi sekali kalau sebelumnya kosong — gak bisa diubah lagi sendiri
        if ($request->filled('nik') && !$user->nik) {
            $validated['nik'] = $request->nik;
        } else {
            unset($validated['nik']);
        }

        $user->update($validated);

        return redirect()
            ->route($this->getProfileRoute($user->fresh()->role))
            ->with('status', 'Profile berhasil diperbarui.');
    }

    public function updateMemberPhoto(Request $request, HouseMember $member)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        abort_unless($member->house_id === Auth::user()->house_id, 403);

        $member->update([
            'photo' => $request->file('photo')->store('member-photos', 'public'),
        ]);

        return back()->with('status', 'Foto ' . $member->name . ' berhasil diperbarui.');
    }
}