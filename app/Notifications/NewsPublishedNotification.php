<?php

namespace App\Notifications;

use App\Models\News;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class NewsPublishedNotification extends Notification
{
    use Queueable;

    protected $news;

    public function __construct(News $news)
    {
        $this->news = $news;
    }

    // Menentukan channel mana saja yang akan digunakan
    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    // Desain notifikasi Web Push
    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('Pengumuman RT Baru!')
            ->icon('/favicon.ico')
            ->body($this->news->title)
            ->action('Baca Berita', url('/warga/berita/' . $this->news->id)) // Tombol aksi
            ->options([
                'TTL' => 10000, 
            ]);
    }
}