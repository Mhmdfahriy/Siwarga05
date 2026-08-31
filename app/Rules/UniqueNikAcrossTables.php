<?php

namespace App\Rules;

use App\Models\HouseMember;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueNikAcrossTables implements ValidationRule
{
    public function __construct(
        protected ?int $ignoreUserId = null,
        protected ?int $ignoreMemberId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $hash = hash('sha256', $value);

        $existsInUsers = User::where('nik_hash', $hash)
            ->when($this->ignoreUserId, fn ($q) => $q->where('id', '!=', $this->ignoreUserId))
            ->exists();

        $existsInMembers = HouseMember::where('nik_hash', $hash)
            ->when($this->ignoreMemberId, fn ($q) => $q->where('id', '!=', $this->ignoreMemberId))
            ->exists();

        if ($existsInUsers || $existsInMembers) {
            $fail('NIK ini sudah terdaftar pada akun atau anggota keluarga lain.');
        }
    }
}