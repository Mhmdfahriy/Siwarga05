<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'recipient_role', // <-- Diubah dari target_role menjadi recipient_role
        'category',
        'title',
        'message',
        'notifiable_id',
        'notifiable_type',
        'actions',
        'read_at',
    ];

    protected $casts = [
        'actions' => 'array',
        'read_at' => 'datetime',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function notifiable()
    {
        return $this->morphTo();
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeCategory($query, $category)
    {
        return $category === 'semua' ? $query : $query->where('category', $category);
    }

    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }
}