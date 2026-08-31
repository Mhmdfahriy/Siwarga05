<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// "implements ShouldBroadcastNow" supaya event langsung dikirim tanpa antri queue
class KomentarBaru implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $komentar;

    /**
     * Create a new event instance.
     */
    public function __construct($komentar)
    {
        // Menyimpan data komentar yang dikirim dari LaporanController
        $this->komentar = $komentar;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Ini nama channel-nya. Kita buat unik berdasarkan ID Laporan.
        return [
            new PrivateChannel('laporan.' . $this->komentar->laporan_id),
        ];
    }

    /**
     * Nama event yang akan dipanggil di React nanti
     */
    public function broadcastAs(): string
    {
        return 'Komentar.Dikirim';
    }

    /**
     * Data yang benar-benar dikirim ke frontend.
     * Wajib eksplisit isi user (name, role) karena LaporanCard.jsx
     * butuh komentar.user.name dan komentar.user.role untuk render bubble chat.
     */
    public function broadcastWith(): array
    {
        return [
            'komentar' => [
                'id'         => $this->komentar->id,
                'user_id'    => $this->komentar->user_id,
                'pesan'      => $this->komentar->pesan,
                'created_at' => $this->komentar->created_at,
                'user'       => [
                    'name' => $this->komentar->user->name,
                    'role' => $this->komentar->user->role,
                ],
            ],
        ];
    }
}