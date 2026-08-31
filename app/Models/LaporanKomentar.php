<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class LaporanKomentar extends Model
{
    // Pastikan ini sesuai dengan nama tabel di file migration kamu. 
    // Jika di migration namanya 'laporan_komentar' (tanpa s), maka hapus huruf 's' di bawah ini.
    protected $table = 'laporan_komentars';

    protected $fillable = [
        'laporan_id',
        'user_id',
        'pesan',
    ];

    /**
     * Laporan tempat komentar ini berada
     */
    public function laporan(): BelongsTo
    {
        return $this->belongsTo(Laporan::class);
    }

    /**
     * User yang menulis komentar (bisa pelapor atau petugas)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Jam komentar dalam format "10:45" (Sesuai zona waktu Jakarta)
     */
    protected function waktu(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at
                ?->timezone('Asia/Jakarta')
                ->format('H:i'),
        );
    }

    /**
     * Helper: apakah komentar ini dari pengurus (bukan dari pelapor sendiri)
     */
    public function isDariPengurus(): bool
    {
        return $this->user?->isPengurus() ?? false;
    }
}