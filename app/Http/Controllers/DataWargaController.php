<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DataWargaController extends Controller
{
    private function roleNamespace(string $role): string
    {
        return match ($role) {
            'sekretaris' => 'Sekretaris',
            'bendahara'  => 'Bendahara',
            'ketua_rt'   => 'Ketuart',
            default      => abort(403),
        };
    }

    public function index(Request $request)
{
    $user = Auth::user();
    $ns = $this->roleNamespace($user->role);

    $totalWarga = HouseMember::count();
    $search = $request->input('search');

    $houseQuery = House::with(['members', 'users']);

    if ($search) {
        $houseQuery->where(function ($hq) use ($search) {
            $hq->where('block_number', 'like', "%{$search}%")
              ->orWhereHas('members', function ($mq) use ($search) {
                  $mq->where('name', 'like', "%{$search}%");
              })
              ->orWhereHas('users', function ($uq) use ($search) {
                  $uq->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
              });
        });
    }

    $houses = $houseQuery->get()->map(function ($house) {
        $kepala = $house->members->firstWhere('relation_type', 'kepala_keluarga');

        // Cari user dengan role warga secara spesifik, bukan asal user pertama
        $primaryUser = $house->users->firstWhere('role', 'warga');

        $namaKK = $kepala ? $kepala->name : ($primaryUser?->name ?? 'Belum ada Kepala Keluarga');
        $noHpKK = $kepala?->no_hp ?? ($primaryUser?->no_hp ?? '-');

        $membersList = $house->members->map(function ($m) {
            return [
                'id'            => $m->id,
                'name'          => $m->name,
                'relation_type' => $m->relation_type,
                'nik_masked'    => $m->maskedNik(),
                'has_nik'       => (bool) $m->nik,
                'photo'         => $m->photoUrl(),
            ];
        });

        return [
            'house_id'        => $house->id,
            'block_number'    => $house->block_number,
            'kepala_keluarga' => $namaKK,
            'no_hp'           => $noHpKK,
            'user_id'         => $primaryUser?->id,
            'user_status'     => $primaryUser?->status,
            'has_nik_user'    => (bool) $primaryUser?->nik,
            'nik_masked_user' => $primaryUser?->maskedNik(),
            'total_anggota'   => $house->members->count(),
            'members'         => $membersList,
        ];
    });

    $combined = $houses->sortBy('block_number')->values();

    $perPage = 8;
    $page = $request->input('page', 1);
    $items = $combined->forPage($page, $perPage)->values();

    $warga = new LengthAwarePaginator(
        $items,
        $combined->count(),
        $perPage,
        $page,
        ['path' => $request->url(), 'query' => $request->query()]
    );

    return Inertia::render("{$ns}/DataWarga/Index", [
        'user'        => ['role' => $user->role],
        'warga'       => $warga,
        'totalWarga'  => $totalWarga,
        'filters'     => $request->only(['search']),
        'canResetNik' => $user->isKetuaRt(),
    ]);
}

    public function show(User $targetUser)
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);

        abort_unless($targetUser->role === 'warga', 404);

        $targetUser->load('house.members');

        return Inertia::render("{$ns}/DataWarga/Show", [
            'user'        => ['role' => $user->role],
            'canResetNik' => $user->isKetuaRt(),
            'warga'       => [
                'id'          => $targetUser->id,
                'name'        => $targetUser->name,
                'email'       => $targetUser->email,
                'no_hp'       => $targetUser->no_hp,
                'occupation'  => $targetUser->occupation,
                'nik_masked'  => $targetUser->maskedNik(),
                'has_nik'     => (bool) $targetUser->nik,
                'status'      => $targetUser->status,
                'photo'       => $targetUser->photo ? asset('storage/' . $targetUser->photo) : null,
                'resident_id' => $targetUser->residentId(),
            ],
            'house' => $targetUser->house ? [
                'block_number'    => $targetUser->house->block_number,
                'photo'           => $targetUser->house->photo ? asset('storage/' . $targetUser->house->photo) : null,
                'ownership_label' => $targetUser->house->ownershipLabel(),
                'land_size'       => $targetUser->house->land_size,
                'building_size'   => $targetUser->house->building_size,
                'resident_since'  => $targetUser->house->resident_since?->translatedFormat('F Y'),
            ] : null,
            'members' => $targetUser->house
                ? $targetUser->house->members->map(fn ($m) => [
                    'id'             => $m->id,
                    'name'           => $m->name,
                    'relation_label' => $m->relationLabel(),
                    'is_primary'     => $m->isPrimary(),
                    'nik_masked'     => $m->maskedNik(),
                    'has_nik'        => (bool) $m->nik,
                    'photo'          => $m->photoUrl(),
                ])->all()
                : [],
        ]);
    }

    public function edit(User $targetUser)
    {
        $user = Auth::user();
        abort_unless($user->isKetuaRt(), 403);
        abort_unless($targetUser->role === 'warga', 404);

        return Inertia::render('Ketuart/DataWarga/Edit', [
            'user'  => ['role' => $user->role],
            'warga' => [
                'id'     => $targetUser->id,
                'name'   => $targetUser->name,
                'email'  => $targetUser->email,
                'photo'  => $targetUser->photo ? asset('storage/' . $targetUser->photo) : null,
                'status' => $targetUser->status,
            ],
        ]);
    }

    public function resetNik(User $targetUser)
    {
        abort_unless(Auth::user()->isKetuaRt(), 403);
        abort_unless($targetUser->role === 'warga', 404);

        $targetUser->update(['nik' => null, 'nik_hash' => null]);

        return back()->with('status', "NIK milik {$targetUser->name} berhasil direset. Warga tersebut bisa mengisi ulang NIK dari halaman profilnya.");
    }

    public function updateStatus(Request $request, User $targetUser)
    {
        abort_unless(Auth::user()->isKetuaRt(), 403);
        abort_unless($targetUser->role === 'warga', 404);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['aktif', 'pindah'])],
        ]);

        if ($validated['status'] === 'pindah') {

            if ($targetUser->house_id) {
                $house = $targetUser->house;

                foreach ($house->members as $member) {
                    if ($member->photo) {
                        Storage::disk('public')->delete($member->photo);
                    }
                    $member->delete();
                }

                $targetUser->update(['house_id' => null]);

                if ($house->photo) {
                    Storage::disk('public')->delete($house->photo);
                }
                $house->delete();
            }

            if ($targetUser->photo) {
                Storage::disk('public')->delete($targetUser->photo);
            }

            $targetUser->update([
                'photo'      => null,
                'occupation' => null,
                'no_hp'      => null,
                'nik'        => null,
                'nik_hash'   => null,
                'status'     => 'pindah',
            ]);
        } else {
            $targetUser->update(['status' => 'aktif']);
        }

        $label = $validated['status'] === 'pindah' ? 'Pindah' : 'Aktif';

        return redirect()
            ->route('ketuart.data-warga.index')
            ->with('status', "Status {$targetUser->name} berhasil diubah menjadi {$label}." . ($validated['status'] === 'pindah' ? ' Seluruh data pribadi, rumah, dan anggota keluarga telah dihapus.' : ''));
    }

    public function resetMemberNik(\App\Models\HouseMember $member)
{
    abort_unless(Auth::user()->isKetuaRt(), 403);
    abort_unless($member->user_id === null, 404); // cuma buat anggota tanpa akun

    $member->update(['nik' => null, 'nik_hash' => null]);

    return back()->with('status', "NIK milik {$member->name} berhasil direset.");
}

    
}