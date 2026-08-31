<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Laporan extends Model
{
    use HasFactory;

    // Konstanta Status Laporan
    const STATUS_PENDING  = 'pending';
    const STATUS_DIPROSES = 'diproses';
    const STATUS_SELESAI  = 'selesai';
    const STATUS_DITOLAK  = 'ditolak';

    protected $fillable = [
        'user_id',
        'assigned_to',
        'judul',
        'kategori',
        'deskripsi',
        'lokasi',
        'foto',
        'status',
        'alasan_penolakan', 
    ];

    // Relasi ke tabel User (Pelapor)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke tabel User (Pengurus RT yang memproses/menangani)
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Relasi ke komentar/balasan laporan
    public function komentars()
    {
        return $this->hasMany(LaporanKomentar::class);
    }

    /**
     * Scope: Filter data yang bisa dilihat berdasarkan Role User
     */
    public function scopeVisibleTo($query, $user)
    {
        // Ketua RT & Super Admin: Bisa melihat SEMUA laporan
        if ($user->isKetuaRt() || $user->isSuperAdmin()) {
            return $query;
        }

        // Bendahara: Hanya melihat laporan dengan kategori keuangan/iuran
        if ($user->isBendahara()) {
            return $query->where('kategori', 'keuangan');
        }

        // Sekretaris: Hanya melihat laporan SELAIN keuangan/iuran
        if ($user->isSekretaris()) {
            return $query->where('kategori', '!=', 'keuangan');
        }

        // Warga biasa: Hanya melihat laporannya sendiri
        return $query->where('user_id', $user->id);
    }

    /**
     * Scope: Filter berdasarkan inputan filter kategori dari Frontend
     */
    public function scopeKategori($query, $kategori)
    {
        if ($kategori && $kategori !== 'semua') {
            return $query->where('kategori', $kategori);
        }
        return $query;
    }
}