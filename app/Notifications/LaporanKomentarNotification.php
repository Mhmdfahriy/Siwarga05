<?php

namespace App\Notifications;

use App\Models\Laporan;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class LaporanKomentarNotification extends Notification
{
    use Queueable;

    protected $laporan;
    protected $title;
    protected $body;

    public function __construct(Laporan $laporan, string $title, string $body)
    {
        $this->laporan = $laporan;
        $this->title = $title;
        $this->body = $body;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/favicon.ico')
            ->body($this->body)
            ->action('Buka Laporan', url('/laporan'))
            ->options([
                'TTL' => 10000,
            ]);
    }
}