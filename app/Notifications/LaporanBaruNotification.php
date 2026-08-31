<?php

namespace App\Notifications;

use App\Models\Laporan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class LaporanBaruNotification extends Notification
{
    use Queueable;

    protected $laporan;
    protected $pelapor;

    public function __construct(Laporan $laporan, string $pelapor)
    {
        $this->laporan = $laporan;
        $this->pelapor = $pelapor;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('Laporan Baru: ' . $this->laporan->judul)
            ->icon('/favicon.ico')
            ->body("{$this->pelapor} membuat laporan kategori " . strtoupper($this->laporan->kategori) . '.')
            ->action('Lihat Laporan', url('/laporan'))
            ->options([
                'TTL' => 10000,
            ]);
    }
}