<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class HouseController extends Controller
{
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

    private function getRouteFor(string $role, string $name): string
    {
        $prefix = match ($role) {
            'warga'      => 'warga.',
            'sekretaris' => 'sekretaris.',
            'bendahara'  => 'bendahara.',
            'ketua_rt'   => 'ketuart.',
            default      => abort(403),
        };
        return $prefix . $name;
    }

    private function housePayload(?House $house): ?array
    {
        return $house ? [
            'id'               => $house->id,
            'block_number'     => $house->block_number,
            'photo'            => $house->photo ? asset('storage/' . $house->photo) : null,
            'ownership_status' => $house->ownership_status,
            'ownership_label'  => $house->ownershipLabel(),
            'land_size'        => $house->land_size,
            'building_size'    => $house->building_size,
            'resident_since'   => $house->resident_since?->format('Y-m-d'),
        ] : null;
    }

    private function membersPayload(?House $house)
    {
        if (!$house) {
            return [];
        }

        // Menggunakan paginate alih-alih collection biasa agar menghasilkan objek paginator lengkap dengan links()
        $paginator = $house->members()->paginate(4);

        // Transform data di dalam paginator
        $paginator->setCollection(
            $paginator->getCollection()->map(fn (HouseMember $m) => [
                'id'             => $m->id,
                'name'           => $m->name,
                'relation_type'  => $m->relation_type,
                'relation_label' => $m->relationLabel(),
                'is_primary'     => $m->isPrimary(),
                'nik_masked'     => $m->maskedNik(),
                'has_nik'        => (bool) $m->nik,
                'photo'          => $m->photoUrl(),
            ])
        );

        return $paginator;
    }

    /**mem
     * Halaman Manajemen Rumah & Anggota (utk user yg sudah punya rumah)
     */
    public function index()
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);

        if (!$user->house_id) {
            return redirect()->route($this->getRouteFor($user->role, 'house.create'));
        }

        $house = $user->house()->first();

        return Inertia::render("{$ns}/Datarumah/Index", [
            'user' => [
                'role' => $user->role,
            ],
            'house'   => $this->housePayload($house),
            'members' => $this->membersPayload($house), // Sekarang mengirimkan objek paginator lengkap dengan links
        ]);
    }

    /**
     * Form Lengkapi Data Rumah (khusus user yang belum punya house)
     */
    public function create()
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);

        if ($user->house_id) {
            return redirect()->route($this->getProfileRoute($user->role));
        }

        return Inertia::render("{$ns}/Datarumah/Setup", [
            'user' => [
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Simpan Data Rumah baru + jadikan user sbg kepala keluarga
     */
    public function store(Request $request)
{
    $user = Auth::user();

    abort_if($user->house_id, 409);

    $validated = $request->validate([
        'block_number'     => ['required', 'string', 'max:20'],
        'ownership_status' => ['required', Rule::in(['milik_sendiri', 'kost', 'kontrakan'])],
        'resident_since'   => ['nullable', 'date'],
        'land_size'        => ['nullable', 'numeric'],
        'building_size'    => ['nullable', 'numeric'],
        'photo'            => ['nullable', 'image', 'max:2048'],
        'relation_type'    => ['required', 'in:kepala_keluarga,suami,istri,anak,kakek,nenek,kakak,adik,lainnya'],
    ]);

    if ($request->hasFile('photo')) {
        $validated['photo'] = $request->file('photo')->store('house-photos', 'public');
    }

    $relationType = $validated['relation_type'];
    unset($validated['relation_type']);

    $house = House::create($validated);

    $user->update(['house_id' => $house->id]);

    HouseMember::create([
        'house_id'      => $house->id,
        'name'          => $user->name,
        'relation_type' => $relationType,
    ]);

    return redirect()
        ->route($this->getProfileRoute($user->role))
        ->with('status', 'Data rumah berhasil disimpan.');
}

    /**
     * Update Detail Rumah
     */
    public function update(Request $request)
    {
        $house = Auth::user()->house;

        abort_if(!$house, 404);

        $validated = $request->validate([
            'block_number'     => ['nullable', 'string', 'max:20'],
            'ownership_status' => ['required', Rule::in(['milik_sendiri', 'kost', 'kontrakan'])],
            'resident_since'   => ['nullable', 'date'],
            'land_size'        => ['nullable', 'numeric'],
            'building_size'    => ['nullable', 'numeric'],
            'photo'            => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            if ($house->photo) {
                Storage::disk('public')->delete($house->photo);
            }
            $validated['photo'] = $request->file('photo')->store('house-photos', 'public');
        }

        $house->update($validated);

        return back()->with('status', 'Detail rumah berhasil diperbarui.');
    }
}