<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'block_number',
        'photo',
        'ownership_status',
        'land_size',
        'building_size',
        'resident_since',
    ];

    protected $casts = [
        'resident_since' => 'date',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function members()
    {
        return $this->hasMany(HouseMember::class);
    }

    public function headOfFamily()
    {
        return $this->hasOne(HouseMember::class)->where('relation_type', 'kepala_keluarga');
    }

    public function ownershipLabel(): string
    {
            return match ($this->ownership_status) {
            'milik_sendiri' => 'Milik Sendiri',
            'kost'          => 'Kost',
            'kontrakan'     => 'Kontrakan',
            default         => ucfirst($this->ownership_status),
        };
    }

    //payment
    public function dues()
    {
        return $this->hasMany(Due::class);
    }

    public function duesPayments()
    {
        return $this->hasMany(DuesPayment::class);
    }

    //notif
    public function notifications()
{
    return $this->hasMany(Notification::class);
}
}