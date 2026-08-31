<?php

namespace App\Policies;

use App\Models\News;
use App\Models\User;

class NewsPolicy
{
    public function viewAny(User $user): bool
{
    if ($user->isSekretaris() || $user->isBendahara() || $user->isKetuaRt()) {
        return true;
    }
    
    // Warga hanya boleh akses list jika aktif
    return $user->isAktif();
}

    public function view(User $user, News $news): bool
{
    if ($user->isSekretaris() || $user->isBendahara() || $user->isKetuaRt()) {
        return true;
    }

    // Jika Warga biasa, hanya boleh lihat yang sudah waktunya tayang
    return in_array($news->status, ['published', 'scheduled'])
        && $news->published_at !== null
        && $news->published_at <= now();
}

    public function create(User $user): bool
    {
        return $user->isSekretaris() || $user->isBendahara();
    }

    public function update(User $user, News $news): bool
    {
        // Bendahara boleh edit jika kategorinya Keuangan ATAU dia yang membuat berita itu
        if ($user->isBendahara()) {
            return $news->category === 'Keuangan' || $news->user_id === $user->id;
        }

        // Sekretaris boleh edit jika bukan Keuangan ATAU dia yang membuat berita itu
        if ($user->isSekretaris()) {
            return $news->category !== 'Keuangan' || $news->user_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, News $news): bool
    {
        if ($user->isKetuaRt()) {
            return true; 
        }

        if ($user->isBendahara()) {
            return $news->category === 'Keuangan' || $news->user_id === $user->id;
        }

        if ($user->isSekretaris()) {
            return $news->category !== 'Keuangan' || $news->user_id === $user->id;
        }

        return false;
    }
}