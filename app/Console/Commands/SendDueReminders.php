<?php

namespace App\Console\Commands;

use App\Models\Due;
use App\Notifications\DueReminderNotification;
use App\Services\NotificationPreferenceService;
use Illuminate\Console\Command;

class SendDueReminders extends Command
{
    /**
     * Jalankan manual untuk testing: php artisan dues:remind-h3
     */
    protected $signature = 'dues:remind-h3';

    protected $description = 'Kirim pengingat push notification H-3 sebelum jatuh tempo iuran (created_at + 7 hari)';

    public function handle(): int
    {
        // Jatuh tempo = created_at + 7 hari.
        // H-3 sebelum jatuh tempo berarti tagihan yang dibuat tepat 4 hari lalu.
        $targetDate = now()->subDays(4)->toDateString();

        $dues = Due::whereIn('status', ['belum_bayar', 'ditolak'])
            ->whereDate('created_at', $targetDate)
            ->with('house.users')
            ->get();

        $totalSent = 0;

        foreach ($dues as $due) {
            if (! $due->house) {
                continue;
            }

            $sent = NotificationPreferenceService::notifyHouse(
                $due->house,
                'iuran',
                new DueReminderNotification($due)
            );

            $totalSent += $sent;
        }

        $this->info("Selesai. {$dues->count()} tagihan diproses, {$totalSent} notifikasi push terkirim.");

        return self::SUCCESS;
    }
}