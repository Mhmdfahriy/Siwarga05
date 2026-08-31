<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'type',
        'provider_name',
        'account_number',
        'account_holder',
        'qris_image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function qrisImageUrl(): ?string
    {
        return $this->qris_image ? asset('storage/' . $this->qris_image) : null;
    }

    public function typeLabel(): string
    {
        return match ($this->type) {
            'bank'    => 'Transfer Bank',
            'qris'    => 'QRIS',
            'ewallet' => 'E-Wallet',
            default   => ucfirst($this->type),
        };
    }
}