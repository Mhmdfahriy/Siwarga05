<?php

namespace App\Notifications;

use App\Models\Laporan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class LaporanStatusUpdatedNotification extends Notification
{
    use Queueable;

    protected $laporan;
    protected $statusLabel;
    protected $alasan;

    public function __construct(Laporan $laporan, string $statusLabel, ?string $alasan = null)
    {
        $this->laporan = $laporan;
        $this->statusLabel = $statusLabel;
        $this->alasan = $alasan;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $body = "Status laporan '{$this->laporan->judul}' kini: {$this->statusLabel}.";

        if ($this->alasan) {
            $body .= " Alasan: \"{$this->alasan}\"";
        }

        return (new WebPushMessage)
            ->title('Status Laporan Diperbarui')
            ->icon('/favicon.ico')
            ->body($body)
            ->action('Lihat Laporan', url('/warga/laporan'))
            ->options([
                'TTL' => 10000,
            ]);
    }
}