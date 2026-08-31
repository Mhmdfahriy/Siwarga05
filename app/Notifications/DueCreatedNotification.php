<?php

namespace App\Notifications;

use App\Models\Due;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class DueCreatedNotification extends Notification
{
    use Queueable;

    protected $due;

    public function __construct(Due $due)
    {
        $this->due = $due;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $isVoluntary = $this->due->type === 'insidental' && (float) $this->due->amount === 0.0;

        $formattedAmount = $isVoluntary
            ? 'secara sukarela (seikhlasnya)'
            : 'sebesar Rp ' . number_format($this->due->amount, 0, ',', '.');

        return (new WebPushMessage)
            ->title('Tagihan Iuran Baru')
            ->icon('/favicon.ico')
            ->body("Tagihan '{$this->due->title}' {$formattedAmount} telah diterbitkan.")
            ->action('Lihat Tagihan', url('/warga/dues'))
            ->options([
                'TTL' => 10000,
            ]);
    }
}