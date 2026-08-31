<?php

namespace App\Policies;

use App\Models\Laporan;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LaporanPolicy
{
    use HandlesAuthorization;

    /**
     * Menentukan siapa yang boleh melihat daftar/halaman index laporan
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Menentukan siapa yang boleh melihat detail laporan tertentu
     */
    public function view(User $user, Laporan $laporan): bool
    {
        if ($user->isKetuaRt() || $user->isSuperAdmin()) {
            return true;
        }

        if ($user->isBendahara() && $laporan->kategori === 'keuangan') {
            return true;
        }

        if ($user->isSekretaris() && $laporan->kategori !== 'keuangan') {
            return true;
        }

        return $user->id === $laporan->user_id;
    }

    /**
     * Menentukan siapa yang boleh mengupdate status laporan
     */
    public function updateStatus(User $user, Laporan $laporan): bool
    {
        // Logika cek "locked" (selesai/ditolak) Dihapus dari sini 
        // dan dipindahkan ke Controller agar bisa memberikan pesan error yang jelas.

        // Hanya mengecek wewenang peran vs kategori laporan:
        if ($user->isKetuaRt() || $user->isSuperAdmin()) {
            return true;
        }

        if ($user->isBendahara() && $laporan->kategori === 'keuangan') {
            return true;
        }

        if ($user->isSekretaris() && $laporan->kategori !== 'keuangan') {
            return true;
        }

        return false;
    }

    /**
     * Menentukan siapa yang boleh membalas / komentar
     */
    public function komentar(User $user, Laporan $laporan): bool
    {
        if ($user->id === $laporan->user_id) {
            return true;
        }

        return $this->updateStatus($user, $laporan);
    }

    /**
     * Menentukan siapa yang boleh menghapus laporan
     */
    public function delete(User $user, Laporan $laporan): bool
    {
        if ($user->isKetuaRt() || $user->isSuperAdmin()) {
            return true;
        }

        // Asumsi Laporan::STATUS_PENDING adalah 'menunggu'
        return $user->id === $laporan->user_id && $laporan->status === 'menunggu'; 
    }
}