<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Due extends Model
{
    protected $fillable = [
        'house_id',
        'title',
        'type',
        'period_month',
        'period_year',
        'amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'amount'  => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function paymentItems()
    {
        return $this->hasMany(DuesPaymentItem::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'lunas';
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'belum_bayar'          => 'Belum Bayar',
            'menunggu_verifikasi'  => 'Menunggu Verifikasi',
            'lunas'                => 'Lunas',
            default                => ucfirst($this->status),
        };
    }

    public function periodLabel(): string
    {
        if ($this->type === 'insidental') {
            return $this->title;
        }

        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return ($months[$this->period_month] ?? '-') . ' ' . $this->period_year;
    }
}