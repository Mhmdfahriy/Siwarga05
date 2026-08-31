<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DuesPaymentItem extends Model
{
    protected $fillable = [
        'dues_payment_id',
        'due_id',
    ];

    public function duesPayment()
    {
        return $this->belongsTo(DuesPayment::class);
    }

    public function due()
    {
        return $this->belongsTo(Due::class);
    }
}