<?php

namespace App\Notifications;

use App\Models\DuesPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class PaymentSubmittedNotification extends Notification
{
    use Queueable;

    protected $payment;

    public function __construct(DuesPayment $payment)
    {
        $this->payment = $payment;
    }

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $blockNumber = $this->payment->house?->block_number ?? 'Warga';
        $amount = number_format($this->payment->total_amount, 0, ',', '.');

        return (new WebPushMessage)
            ->title('Konfirmasi Pembayaran Baru')
            ->icon('/favicon.ico')
            ->body("Warga Blok {$blockNumber} kirim bukti bayar Rp {$amount}, menunggu verifikasi.")
            ->action('Verifikasi Sekarang', url('/bendahara/payment/verification'))
            ->options([
                'TTL' => 10000,
            ]);
    }
}