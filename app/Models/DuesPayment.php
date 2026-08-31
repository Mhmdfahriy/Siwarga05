<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DuesPayment extends Model
{
    protected $fillable = [
        'uuid',
        'house_id',
        'payment_method_id',
        'total_amount',
        'proof_photo',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'verified_at'  => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function items()
    {
        return $this->hasMany(DuesPaymentItem::class);
    }

    public function dues()
    {
        return $this->belongsToMany(Due::class, 'dues_payment_items', 'dues_payment_id', 'due_id');
    }

    public function proofPhotoUrl(): ?string
    {
        return $this->proof_photo ? asset('storage/' . $this->proof_photo) : null;
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'menunggu_verifikasi' => 'Menunggu Verifikasi',
            'diverifikasi'        => 'Diverifikasi',
            'ditolak'             => 'Ditolak',
            default               => ucfirst($this->status),
        };
    }
}