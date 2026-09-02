<?php

namespace App\Http\Controllers;

use App\Models\DuesPayment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    private const ROLE_PREFIX = [
        'ketua_rt'   => 'ketuart',
        'sekretaris' => 'sekretaris',
        'bendahara'  => 'bendahara',
        'warga'      => 'warga',
    ];

    private function resolveActions(string $category, string $role, ?int $notifiableId, ?string $title = null, $paymentsMap = null): ?array
    {
        $prefix = self::ROLE_PREFIX[$role] ?? 'warga';
        $lowerTitle = strtolower($title ?? '');
        $isPengurus = in_array($role, ['bendahara', 'sekretaris', 'ketua_rt']);

        return match ($category) {
            'keuangan' => match (true) {
                // 1. KONDISI KHUSUS BENDAHARA: Saat ada konfirmasi pembayaran masuk dari warga
                $role === 'bendahara' && (str_contains($lowerTitle, 'konfirmasi pembayaran') || str_contains($lowerTitle, 'pembayaran baru')) => [
                    [
                        'label'   => 'Verifikasi Sekarang',
                        'url'     => route("{$prefix}.dues.verification", $notifiableId ? ['highlight' => $notifiableId] : []),
                        'primary' => true
                    ],
                ],

                // 2. KONDISI UNTUK PENGURUS LAIN (Ketua RT / Sekretaris) jika menerima notif konfirmasi
                $isPengurus && (str_contains($lowerTitle, 'konfirmasi pembayaran') || str_contains($lowerTitle, 'pembayaran baru')) => [
                    [
                        'label'   => 'Lihat Iuran',
                        'url'     => route("{$prefix}.dues.index"),
                        'primary' => true
                    ],
                ],

                // 3a. Bukti pembayaran ditolak oleh Bendahara
                str_contains($lowerTitle, 'pembayaran ditolak') => [
                    [
                        // 1. Bayar Ulang -> ke form pembayaran (bayar.jsx)
                        'label'   => 'Bayar Ulang',
                        'url'     => route("{$prefix}.dues.payment-form", $this->duesAndMethodQueryForPayment($notifiableId, $paymentsMap)),
                        'primary' => false,
                    ],
                    [
                        // 2. Lihat Detail -> Mengambil UUID payment yang benar agar tidak 404 ke invoice.jsx
                        'label'   => 'Lihat Detail',
                        'url'     => $this->getPaymentUuidUrl($prefix, $notifiableId, $paymentsMap),
                        'primary' => false,
                    ],
                    [
                        // 3. Upload Ulang Bukti Pembayaran -> Bendahara ke index tab antrian, Warga ke index biasa
                        'label'   => 'Upload Ulang Bukti Pembayaran',
                        'url'     => $role === 'bendahara'
                            ? route("{$prefix}.dues.index", ['tab' => 'antrean_verifikasi'])
                            : route("{$prefix}.dues.index"),
                        'primary' => true,
                    ],
                ],

                // 3b. Tagihan Baru / Pengingat
                str_contains($lowerTitle, 'tagihan') ||
                str_contains($lowerTitle, 'pengingat') => [
                    [
                        'label'   => 'Bayar Sekarang',
                        'url'     => route("{$prefix}.dues.payment-form", $notifiableId ? ['dues' => [$notifiableId]] : []),
                        'primary' => true,
                    ],
                    ['label' => 'Nanti Saja', 'url' => '#', 'primary' => false],
                ],

                // 4. KONDISI PEMBAYARAN LUNAS & DIVERIFIKASI
                str_contains($lowerTitle, 'lunas') ||
                str_contains($lowerTitle, 'diverifikasi') => [
                    [
                        'label'   => 'Lihat Riwayat',
                        'url'     => $this->getPaymentUuidUrl($prefix, $notifiableId, $paymentsMap),
                        'primary' => false,
                    ],
                ],

                default => $role === 'bendahara'
                    ? [['label' => 'Kelola Iuran', 'url' => route("{$prefix}.dues.manage"), 'primary' => true]]
                    : [['label' => 'Lihat Iuran', 'url' => route("{$prefix}.dues.index"), 'primary' => true]],
            },

            'laporan', 'infrastruktur', 'keamanan', 'sosial', 'kebersihan', 'lainnya' => match (true) {
                str_contains($lowerTitle, 'chat') || str_contains($lowerTitle, 'tanggapan') => [
                    [
                        'label'   => 'Buka Chat',
                        'url'     => route("{$prefix}.laporan.index", $notifiableId ? ['highlight' => $notifiableId, 'tab' => 'chat'] : ['tab' => 'chat']),
                        'primary' => true,
                    ],
                ],

                default => [
                    [
                        'label'   => 'Lihat Laporan',
                        'url'     => route("{$prefix}.laporan.index", $notifiableId ? ['highlight' => $notifiableId] : []),
                        'primary' => true,
                    ],
                ],
            },

            'berita' => [
                [
                    'label'   => 'Baca Berita',
                    'url'     => $notifiableId
                        ? route("{$prefix}.news.show", $notifiableId)
                        : route("{$prefix}.news.index"),
                    'primary' => true,
                ],
            ],

            'chat' => [
                [
                    'label'   => 'Buka Chat',
                    'url'     => route("{$prefix}.laporan.index", $notifiableId ? ['highlight' => $notifiableId, 'tab' => 'chat'] : ['tab' => 'chat']),
                    'primary' => true,
                ],
            ],

            default => null,
        };
    }

    // Helper aman untuk mengambil UUID payment agar route dues.success tidak 404
    // 🔄 Ambil dari $paymentsMap yang sudah di-eager-load, bukan query baru per notifikasi
    private function getPaymentUuidUrl(string $prefix, ?int $paymentId, $paymentsMap = null): string
    {
        if (!$paymentId) {
            return route("{$prefix}.dues.index");
        }

        $payment = $paymentsMap?->get($paymentId);

        if ($payment && $payment->uuid) {
            return route("{$prefix}.dues.success", $payment->uuid);
        }

        return route("{$prefix}.dues.index");
    }

    // 🔄 Ambil dari $paymentsMap (relasi 'dues' sudah eager-loaded), bukan query baru per notifikasi
    private function duesAndMethodQueryForPayment(?int $paymentId, $paymentsMap = null): array
    {
        if (!$paymentId) {
            return [];
        }

        $payment = $paymentsMap?->get($paymentId);
        if (!$payment) {
            return [];
        }

        $dueIds = $payment->dues->pluck('id')->all();
        $query = !empty($dueIds) ? ['dues' => $dueIds] : [];

        if ($payment->payment_method_id) {
            $query['method'] = $payment->payment_method_id;
        }

        return $query;
    }

    // 🆕 Kumpulkan semua notifiable_id kategori 'keuangan' dalam collection,
    // lalu ambil SEMUA DuesPayment yang dibutuhkan sekaligus (1 query, eager load 'dues')
    // sebelum melakukan mapping per item — menghindari N+1 di resolveActions().
    private function applyActions($collection, string $role)
    {
        $paymentIds = $collection
            ->where('category', 'keuangan')
            ->pluck('notifiable_id')
            ->filter()
            ->unique()
            ->values();

        $paymentsMap = DuesPayment::whereIn('id', $paymentIds)
            ->with('dues')
            ->get()
            ->keyBy('id');

        return $collection->map(function ($item) use ($role, $paymentsMap) {
            $resolved = $this->resolveActions($item->category, $role, $item->notifiable_id, $item->title, $paymentsMap);
            if ($resolved !== null) {
                $item->actions = $resolved;
            }
            return $item;
        });
    }

    private function scopeVisibility($query, $user)
    {
        if ($user->isWarga() || $user->house_id) {
            return $query->where(function ($q) use ($user) {
                if ($user->house_id) {
                    $q->where('house_id', $user->house_id)
                      ->orWhere('category', 'berita');
                } else {
                    $q->where('category', 'berita');
                }

                if (!$user->isWarga()) {
                    $q->orWhere(function ($subQ) use ($user) {
                        $subQ->whereNull('house_id')
                             ->where(function ($roleQ) use ($user) {
                                 $roleQ->whereNull('recipient_role')
                                       ->orWhere('recipient_role', $user->role);
                             });
                    });
                }
            });
        }

        return $query->where(function ($q) use ($user) {
            $q->where('category', 'berita')
              ->orWhere(function ($subQ) use ($user) {
                  $subQ->whereNull('house_id')
                       ->where(function ($roleQ) use ($user) {
                           $roleQ->whereNull('recipient_role')
                                 ->orWhere('recipient_role', $user->role);
                       });
              });
        });
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $category = $request->query('category', 'semua');

        $query = Notification::query();
        $this->scopeVisibility($query, $user);

        // Filter kategori secara fleksibel
        $notifications = $query->when($category !== 'semua', function ($q) use ($category) {
            if ($category === 'laporan') {
                $q->whereIn('category', ['laporan', 'infrastruktur', 'keamanan', 'sosial', 'kebersihan', 'lainnya']);
            } elseif ($category === 'keuangan') {
                $q->whereIn('category', ['keuangan', 'keuangan/ iuran rt']);
            } else {
                $q->where('category', $category);
            }
        })->latest()->paginate(10);

        $notifications->setCollection(
            $this->applyActions($notifications->getCollection(), $user->role)
        );

        $unreadQuery = Notification::query();
        $this->scopeVisibility($unreadQuery, $user);

        // Hitung unread counts secara spesifik per tab
        $unreadCounts = [
            'semua'    => (clone $unreadQuery)->unread()->count(),
            'keuangan'  => (clone $unreadQuery)->whereIn('category', ['keuangan', 'keuangan/ iuran rt'])->unread()->count(),
            'berita'    => (clone $unreadQuery)->where('category', 'berita')->unread()->count(),
            'laporan'   => (clone $unreadQuery)->whereIn('category', ['laporan', 'infrastruktur', 'keamanan', 'sosial', 'kebersihan', 'lainnya'])->unread()->count(),
        ];

        $componentMap = [
            'ketua_rt'   => 'Ketuart/Notifikasi/Index',
            'sekretaris' => 'Sekretaris/Notifikasi/Index',
            'bendahara'  => 'Bendahara/Notifikasi/Index',
            'warga'      => 'Warga/Notifikasi/Index',
        ];

        $component = $componentMap[$user->role] ?? 'Warga/Notifikasi/Index';

        return Inertia::render($component, [
            'notifications' => $notifications,
            'unreadCounts'  => $unreadCounts,
            'category'      => $category,
        ]);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();

        if ($notification->category === 'berita') {
            $notification->markAsRead();
            return back();
        }

        if ($user->isWarga() && $notification->house_id !== $user->house_id) {
            abort(403);
        }

        if (!$user->isWarga() && ($notification->house_id !== null && $notification->house_id !== $user->house_id) && ($notification->recipient_role !== null && $notification->recipient_role !== $user->role)) {
            abort(403);
        }

        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $query = Notification::query();
        $this->scopeVisibility($query, $user);

        $query->unread()->update(['read_at' => now()]);

        return back();
    }

    public function poll(Request $request)
    {
        $user = $request->user();
        $sinceId = (int) $request->query('since_id', 0);

        $queryNew = Notification::where('id', '>', $sinceId);
        $this->scopeVisibility($queryNew, $user);

        $newNotifications = $this->applyActions(
            $queryNew->orderBy('id')->get(['id', 'category', 'title', 'message', 'notifiable_id', 'created_at']),
            $user->role
        );

        $queryLatest = Notification::query();
        $queryUnread = Notification::query();
        $this->scopeVisibility($queryLatest, $user);
        $this->scopeVisibility($queryUnread, $user);

        $latestId = $queryLatest->max('id') ?? $sinceId;
        $unreadTotal = $queryUnread->unread()->count();

        return response()->json([
            'new'          => $newNotifications,
            'latest_id'    => $latestId,
            'unread_total' => $unreadTotal,
        ]);
    }
}