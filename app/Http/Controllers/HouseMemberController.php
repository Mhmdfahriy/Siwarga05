<?php

namespace App\Http\Controllers;

use App\Models\HouseMember;
use App\Rules\UniqueNikAcrossTables;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class HouseMemberController extends Controller
{
    private const MAX_KEPALA_KELUARGA = 2;

    public function store(Request $request)
    {
        $user = Auth::user();
        abort_if(!$user->house, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relation_type' => [
                'required',
                'in:kepala_keluarga,suami,istri,anak,kakek,nenek,kakak,adik,lainnya',
                Rule::when(
                    $request->relation_type === 'kepala_keluarga',
                    [$this->maxKepalaKeluargaRule($user->house_id)]
                ),
            ],
            'nik' => ['nullable', 'digits:16', new UniqueNikAcrossTables()],
            'photo' => ['nullable', 'image', 'max:2048'],
        ], [
            'nik.digits' => 'NIK harus terdiri dari tepat 16 digit angka.',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('member-photos', 'public');
        }

        $validated['house_id'] = $user->house_id;
        HouseMember::create($validated);

        return back()->with('status', 'Anggota keluarga berhasil ditambahkan.');
    }

    public function update(Request $request, HouseMember $member)
    {
        abort_unless($member->house_id === Auth::user()->house_id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relation_type' => [
                'required',
                'in:kepala_keluarga,suami,istri,anak,kakek,nenek,kakak,adik,lainnya',
                Rule::when(
                    $request->relation_type === 'kepala_keluarga',
                    [$this->maxKepalaKeluargaRule($member->house_id, ignoreMemberId: $member->id)]
                ),
            ],
            'nik' => ['nullable', 'digits:16', new UniqueNikAcrossTables(ignoreMemberId: $member->id)],
            'photo' => ['nullable', 'image', 'max:2048'],
        ], [
            'nik.digits' => 'NIK harus terdiri dari tepat 16 digit angka.',
        ]);

        if ($request->hasFile('photo')) {
            if ($member->photo) Storage::disk('public')->delete($member->photo);
            $validated['photo'] = $request->file('photo')->store('member-photos', 'public');
        }

        $member->update($validated);
        return back()->with('status', 'Anggota keluarga berhasil diperbarui.');
    }

    public function destroy(HouseMember $member)
    {
        abort_unless($member->house_id === Auth::user()->house_id, 403);

        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }
        $member->delete();

        return back()->with('status', 'Anggota keluarga berhasil dihapus.');
    }

    /**
     * Rule closure buat batasi maksimal 2 Kepala Keluarga per rumah.
     */
    private function maxKepalaKeluargaRule(int $houseId, ?int $ignoreMemberId = null)
    {
        return function ($attribute, $value, $fail) use ($houseId, $ignoreMemberId) {
            $count = HouseMember::where('house_id', $houseId)
                ->where('relation_type', 'kepala_keluarga')
                ->when($ignoreMemberId, fn ($q) => $q->where('id', '!=', $ignoreMemberId))
                ->count();

            if ($count >= self::MAX_KEPALA_KELUARGA) {
                $fail('Rumah ini sudah memiliki ' . self::MAX_KEPALA_KELUARGA . ' Kepala Keluarga. Tidak bisa menambah lagi.');
            }
        };
    }
}