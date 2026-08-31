<?php

use Illuminate\Support\Facades\Broadcast;

// Bawaan Laravel (untuk user pribadi)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// --- TAMBAHKAN INI UNTUK CHAT LAPORAN ---
Broadcast::channel('laporan.{id}', function ($user, $id) {
    
    $laporan = \App\Models\Laporan::find($id);

    if (!$laporan) {
        return false;
    }
    return $user->isSuperAdmin() || 
           $user->isKetuaRt() || 
           $user->isSekretaris() || 
           $user->isBendahara() || 
           $user->id === $laporan->user_id;
});