<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseMember extends Model
{
    protected $fillable = [
        'house_id',
        'user_id',
        'name',
        'photo',
        'relation_type',
        'nik',
    ];

    protected $hidden = [
        'nik',
        'nik_hash',
    ];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (HouseMember $member) {
            if ($member->isDirty('nik') && $member->nik) {
                $member->nik_hash = hash('sha256', $member->nik);
            }
        });
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relationLabel(): string
    {
        return match ($this->relation_type) {
            'kepala_keluarga' => 'Kepala Keluarga',
            'istri'           => 'Istri',
            'suami'           => 'Suami',
            'anak'            => 'Anak',
            'kakek'           => 'Kakek',
            'nenek'           => 'Nenek',
            'kakak'           => 'Kakak',
            'adik'            => 'Adik',
            default           => 'Anggota Keluarga',
        };
    }

    public function isPrimary(): bool
    {
        return $this->relation_type === 'kepala_keluarga';
    }

    public function photoUrl(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }

    public function maskedNik(): ?string
    {
        if (! $this->nik) {
            return null;
        }

        $nik = $this->nik;
        $len = strlen($nik);

        if ($len <= 8) {
            return $nik;
        }

        return substr($nik, 0, 5) . str_repeat('*', $len - 8) . substr($nik, -3);
    }
}