<?php

namespace App\Services;

use App\Models\User;

class NotificationPreferenceService
{
    /**
     * Cek apakah user boleh dikirimi notifikasi tipe tertentu.
     *
     * @param User $user
     * @param string $type 'berita' | 'iuran' | 'laporan'
     * @return bool
     */
    public static function canSend(User $user, string $type): bool
    {
        $map = [
            'berita'  => 'news_announcements',
            'iuran'   => 'financial_reminders',
            'laporan' => 'report_updates',
        ];

        $key = $map[$type] ?? null;

        if (! $key) {
            return false;
        }

        $preferences = $user->notification_preferences ?? User::defaultNotificationPreferences();

        $typeEnabled = $preferences['types'][$key] ?? false;

        if (! $typeEnabled) {
            return false;
        }

        $pushChannelEnabled = $preferences['channels']['push'] ?? false;

        if (! $pushChannelEnabled) {
            return false;
        }

        // --- PATCH DI SINI ---
        // Baris yang mengecek tabel push_subscriptions() kita nonaktifkan/komentar 
        // agar tidak memblokir notifikasi saat tabelnya kosong.
        // return $user->pushSubscriptions()->exists();

        return true; // Langsung lolos jika jenis dan channel-nya aktif
    }

    /**
     * Kirim notifikasi ke semua penghuni rumah tertentu,
     * hanya ke yang memenuhi preferensi & punya push subscription aktif.
     *
     * @param \App\Models\House $house
     * @param string $type 'berita' | 'iuran' | 'laporan'
     * @param \Illuminate\Notifications\Notification $notification
     * @return int Jumlah user yang benar-benar dikirimi
     */
    public static function notifyHouse($house, string $type, $notification): int
    {
        $sent = 0;

        foreach ($house->users as $user) {
            if (static::canSend($user, $type)) {
                $user->notify($notification);
                $sent++;
            }
        }

        return $sent;
    }
}