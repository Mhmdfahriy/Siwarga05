<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\News;
use App\Models\User;
use App\Models\Notification;
use App\Notifications\LaporanStatusUpdatedNotification;
use App\Services\NotificationPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\LaporanBaruNotification;
use App\Notifications\LaporanKomentarNotification;

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $isKetuaOrSuperAdmin = $user->isKetuaRt() || $user->isSuperAdmin();

        // Mengganti 'petugas' dengan 'assignedTo' sesuai kolom baru
        $query = Laporan::with(['user:id,name', 'assignedTo:id,name', 'komentars.user:id,name,role'])
            ->visibleTo($user)
            ->kategori($request->query('kategori'));

        if ($request->filled('status') && $request->query('status') !== 'semua') {
            $query->where('status', $request->query('status'));
        }

        $laporans = $query->latest()
            ->paginate(5)
            ->withQueryString();

        $laporans->getCollection()->transform(function ($laporan) use ($user, $isKetuaOrSuperAdmin) {
            $laporan->can_update   = $user->can('updateStatus', $laporan);
            $laporan->can_delete   = $user->can('delete', $laporan);
            $laporan->can_komentar = $user->can('komentar', $laporan);
            
            $laporan->can_finalize = $isKetuaOrSuperAdmin;
            $laporan->is_locked    = in_array($laporan->status, [Laporan::STATUS_SELESAI, 'ditolak'], true);
            $laporan->is_ketua_rt  = $isKetuaOrSuperAdmin;
            return $laporan;
        });

        $stats = [
            'total'   => Laporan::visibleTo($user)->count(),
            'proses'  => Laporan::visibleTo($user)->where('status', Laporan::STATUS_DIPROSES)->count(),
            'selesai' => Laporan::visibleTo($user)->where('status', Laporan::STATUS_SELESAI)->count(),
        ];

        $recentNews = News::latest()->take(5)->get();

        return Inertia::render($this->resolveViewPath($user), [
            'laporans'   => $laporans,
            'stats'      => $stats,
            'filters'    => [
                'kategori' => $request->query('kategori', 'semua'),
                'status'   => $request->query('status', 'semua'),
            ],
            'canManage'  => $user->isPengurus() || $user->isSuperAdmin(),
            'recentNews' => $recentNews,
        ]);
    }

    private function resolveViewPath($user): string
    {
        return match (true) {
            $user->isKetuaRt()    => 'Ketuart/Laporanaja/Index',
            $user->isSekretaris() => 'Sekretaris/Laporanaja/Index',
            $user->isBendahara()  => 'Bendahara/Laporanaja/Index',
            default               => 'Warga/Laporanaja/Index',
        };
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'kategori'  => 'required|in:infrastruktur,keamanan,sosial,kebersihan,keuangan,lainnya',
            'deskripsi' => 'required|string|max:2000',
            'lokasi'    => 'nullable|string|max:255',
            'foto'      => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('laporan', 'public');
        }

        $user = $request->user();
        $validated['user_id'] = $user->id;
        $validated['status']  = Laporan::STATUS_PENDING;

        $laporan = Laporan::create($validated);

        $rolesPenerima = ($laporan->kategori === 'keuangan')
            ? ['bendahara', 'ketua_rt']
            : ['sekretaris', 'ketua_rt'];

        foreach ($rolesPenerima as $roleTarget) {
            Notification::create([
                'house_id'       => null,
                'recipient_role' => $roleTarget,
                'category'       => strtolower($laporan->kategori),
                'notifiable_id'  => $laporan->id,
                'title'          => 'Laporan Baru: ' . $laporan->judul,
                'message'        => $user->name . ' membuat laporan kategori ' . strtoupper($laporan->kategori) . '.',
                'actions'        => [
                    [
                        'label'   => 'Lihat Laporan',
                        'url'     => '#',
                        'primary' => true,
                    ]
                ],
            ]);
        }

        User::whereIn('role', $rolesPenerima)->get()->each(function ($staff) use ($laporan, $user) {
            if (NotificationPreferenceService::canSend($staff, 'laporan')) {
                $staff->notify(new LaporanBaruNotification($laporan, $user->name));
            }
        });

        return back()->with('success', 'Laporan berhasil dikirim.');
    }

    public function updateStatus(Request $request, Laporan $laporan): RedirectResponse
    {
        $this->authorize('updateStatus', $laporan);

        $user = $request->user();
        $isKetuaOrSuperAdmin = $user->isKetuaRt() || $user->isSuperAdmin();

        if (in_array($laporan->status, [Laporan::STATUS_SELESAI, 'ditolak'], true) && !$isKetuaOrSuperAdmin) {
            return back()->withErrors([
                'status' => 'Laporan ini sudah berstatus final (Terkunci). Hanya Ketua RT yang berhak membukanya kembali.',
            ]);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,diproses,selesai,ditolak',
            'alasan' => 'required_if:status,ditolak|nullable|string|max:500',
        ]);

        $updateData = [
            'status' => $validated['status'],
        ];

        if (Schema::hasColumn('laporans', 'alasan_penolakan')) {
            $updateData['alasan_penolakan'] = $validated['status'] === 'ditolak' ? $validated['alasan'] : null;
        }

        // Mengganti petugas_id dengan assigned_to
        if (Schema::hasColumn('laporans', 'assigned_to')) {
            $updateData['assigned_to'] = $user->id;
        }

        $laporan->update($updateData);

        if ($validated['status'] === 'ditolak' && !empty($validated['alasan'])) {
            $laporan->komentars()->create([
                'user_id' => $user->id,
                'pesan'   => 'Laporan ini ditolak. Alasan: "' . $validated['alasan'] . '"',
            ]);
        }

        if ($laporan->user && $laporan->user->house_id) {
            $statusLabel = ucfirst($validated['status']);
            $pesanNotif = 'Status laporan "' . $laporan->judul . '" kini berubah menjadi: ' . $statusLabel . '.';

            if ($validated['status'] === 'ditolak' && !empty($validated['alasan'])) {
                $pesanNotif .= ' Alasan: "' . $validated['alasan'] . '"';
            }

            $isFinishedOrRejected = in_array($validated['status'], ['selesai', 'ditolak']);
            $actionLabel = $isFinishedOrRejected ? 'Lihat Riwayat' : 'Lihat Laporan';

            Notification::create([
                'house_id'       => $laporan->user->house_id,
                'recipient_role' => null,
                'category'       => strtolower($laporan->kategori),
                'notifiable_id'  => $laporan->id,
                'title'          => 'Status Laporan Diperbarui',
                'message'        => $pesanNotif,
                'actions'        => [
                    [
                        'label'   => $actionLabel,
                        'url'     => '#',
                        'primary' => true,
                    ]
                ],
            ]);

            $alasanUntukPush = $validated['status'] === 'ditolak' ? ($validated['alasan'] ?? null) : null;
            $laporan->user->notify(new LaporanStatusUpdatedNotification($laporan, $statusLabel, $alasanUntukPush));
        }

        return back()->with('success', 'Status laporan diperbarui.');
    }

    public function komentar(Request $request, Laporan $laporan): RedirectResponse
    {
        $this->authorize('komentar', $laporan);

        $validated = $request->validate([
            'pesan' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        $komentar = $laporan->komentars()->create([
            'user_id' => $user->id,
            'pesan'   => $validated['pesan'],
        ]);

        broadcast(new \App\Events\KomentarBaru($komentar))->toOthers();

        if ($user->id === $laporan->user_id) {
            $rolesPenerima = ($laporan->kategori === 'keuangan') ? ['bendahara', 'ketua_rt'] : ['sekretaris', 'ketua_rt'];

            foreach ($rolesPenerima as $roleTarget) {
                Notification::create([
                    'house_id'       => null,
                    'recipient_role' => $roleTarget,
                    'category'       => strtolower($laporan->kategori),
                    'notifiable_id'  => $laporan->id,
                    'title'          => 'Balasan Chat Laporan',
                    'message'        => $user->name . ' membalas aduan: "' . $laporan->judul . '"',
                    'actions'        => [
                        [
                            'label'   => 'Buka Chat',
                            'url'     => '#',
                            'primary' => true,
                        ]
                    ],
                ]);
            }

            User::whereIn('role', $rolesPenerima)->get()->each(function ($staff) use ($laporan, $user) {
                if (NotificationPreferenceService::canSend($staff, 'laporan')) {
                    $staff->notify(new LaporanKomentarNotification(
                        $laporan,
                        'Balasan Chat Laporan',
                        $user->name . ' membalas aduan: "' . $laporan->judul . '"'
                    ));
                }
            });
        } else {
            if ($laporan->user && $laporan->user->house_id) {
                Notification::create([
                    'house_id'       => $laporan->user->house_id,
                    'recipient_role' => null,
                    'category'       => strtolower($laporan->kategori),
                    'notifiable_id'  => $laporan->id,
                    'title'          => 'Balasan Petugas RT',
                    'message'        => $user->name . ' membalas aduan Anda pada laporan "' . $laporan->judul . '".',
                    'actions'        => [
                        [
                            'label'   => 'Buka Laporan',
                            'url'     => '#',
                            'primary' => true,
                        ]
                    ],
                ]);

                if (NotificationPreferenceService::canSend($laporan->user, 'laporan')) {
                    $laporan->user->notify(new LaporanKomentarNotification(
                        $laporan,
                        'Balasan Petugas RT',
                        $user->name . ' membalas aduan Anda pada laporan "' . $laporan->judul . '".'
                    ));
                }
            }
        }

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function destroy(Request $request, Laporan $laporan): RedirectResponse
    {
        $this->authorize('delete', $laporan);
        $laporan->delete();

        return back()->with('success', 'Laporan berhasil dihapus.');
    }
}