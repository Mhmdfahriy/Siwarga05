<?php

namespace App\Http\Controllers;

use App\Models\Due;
use App\Models\DuesPayment;
use App\Models\House;
use App\Models\PaymentMethod;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\NotificationPreferenceService;
use App\Notifications\DueCreatedNotification;
use App\Notifications\DueReminderNotification;
use App\Notifications\PaymentSubmittedNotification;

class PaymentController extends Controller
{
    private function roleNamespace(string $role): string
    {
        return match ($role) {
            'warga'      => 'Warga',
            'sekretaris' => 'Sekretaris',
            'bendahara'  => 'Bendahara',
            'ketua_rt'   => 'Ketuart',
            default      => abort(403),
        };
    }

    private function paymentMethodLabel(?PaymentMethod $method): string
    {
        if (!$method) {
            return 'Belum tercatat';
        }

        return $method->provider_name ?: $method->typeLabel();
    }

    private function routePrefix(?string $role): string
    {
        $role = $role ?? 'warga';
        return $role === 'ketua_rt' ? 'ketuart' : $role;
    }

    /* =========================================================
     * SISI WARGA & PENGURUS
     * ========================================================= */

    public function index(Request $request)
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);
        $search = $request->search;
        
        $stats = []; 
        $myPaymentHistory = [];

        if ($user->isBendahara()) {
            
            $stats = [
                'total_terkumpul'   => DuesPayment::whereIn('status', ['diverifikasi', 'lunas', 'success'])->sum('total_amount'),
                'total_pending'     => DuesPayment::where('status', 'menunggu_verifikasi')->sum('total_amount'),
                'total_belum_bayar' => Due::whereIn('status', ['belum_bayar', 'ditolak'])->sum('amount'),
                'pending_count'     => DuesPayment::where('status', 'menunggu_verifikasi')->count(),
                'unpaid_count'      => Due::whereIn('status', ['belum_bayar', 'ditolak'])->count(),
                'is_increase'       => true,
                'percentage_change' => 10,
            ];

            $duesQuery = Due::with(['house.users', 'house'])->orderByDesc('created_at');
            
            if (!empty($search)) {
                $duesQuery->where(function ($q) use ($search) {
                    $q->whereHas('house', fn ($h) => $h->where('block_number', 'like', "%{$search}%"))
                      ->orWhereHas('house.users', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                      ->orWhere('title', 'like', "%{$search}%");
                });
            }

            $dues = $duesQuery->paginate(10)
                ->withQueryString()
                ->through(fn (Due $d) => [
                    'id'             => $d->id,
                    'title'          => $d->title,
                    'type'           => $d->type,
                    'period_label'   => $d->periodLabel(),
                    'amount'         => $d->amount,
                    'status'         => $d->status,
                    'status_label'   => $d->statusLabel(),
                    'block_number'   => $d->house?->block_number ?? 'Blok -',
                    'resident_name'  => $d->house?->users->first()?->name ?? 'Warga',
                    'resident_email' => $d->house?->users->first()?->email ?? '-',
                ]);

            // Riwayat Pembayaran Global (Semua status dimuat agar kalkulasi total terkumpul akurat)
            $paymentHistoryQuery = DuesPayment::with(['house.users', 'dues', 'paymentMethod']);
            
            if (!empty($search)) {
                $paymentHistoryQuery->where(function ($q) use ($search) {
                    $q->whereHas('house.users', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                      ->orWhereHas('dues', fn ($d) => $d->where('title', 'like', "%{$search}%"));
                });
            }

            $paymentHistory = $paymentHistoryQuery->latest()
                ->paginate(10)
                ->withQueryString()
                ->through(fn (DuesPayment $p) => [
                    'id'                   => $p->id,
                    'total_amount'         => $p->total_amount,
                    'status'               => $p->status,
                    'status_label'         => $p->statusLabel(),
                    'proof_photo'          => $p->proofPhotoUrl(),
                    'rejection_reason'     => $p->rejection_reason,
                    'created_at'           => $p->created_at->format('d M Y H:i'),
                    'dues_ids'             => $p->dues->pluck('id')->all(),
                    'dues_titles'          => $p->dues->pluck('title')->all(),
                    'resident_name'        => $p->house?->users->first()?->name ?? 'Warga',
                    'payment_method_label' => $this->paymentMethodLabel($p->paymentMethod),
                ]);

            // Riwayat Pembayaran Pribadi Bendahara
            if ($user->house_id) {
                $myHistoryQuery = DuesPayment::with(['house.users', 'dues', 'paymentMethod'])
                    ->where('house_id', $user->house_id);

                $myPaymentHistory = $myHistoryQuery->latest()->get()->map(fn (DuesPayment $p) => [
                    'id'                   => $p->id,
                    'total_amount'         => $p->total_amount,
                    'status'               => $p->status,
                    'status_label'         => $p->statusLabel(),
                    'proof_photo'          => $p->proofPhotoUrl(),
                    'rejection_reason'     => $p->rejection_reason,
                    'created_at'           => $p->created_at->format('d M Y H:i'),
                    'dues_ids'             => $p->dues->pluck('id')->all(),
                    'dues_titles'          => $p->dues->pluck('title')->all(),
                    'resident_name'        => $p->house?->users->first()?->name ?? 'Warga',
                    'payment_method_label' => $this->paymentMethodLabel($p->paymentMethod),
                ]);
            }

        } else {
            $dues = $user->house_id
                ? Due::where('house_id', $user->house_id)
                    ->orderByDesc('period_year')
                    ->orderByDesc('period_month')
                    ->get()
                    ->map(fn (Due $d) => [
                        'id'             => $d->id,
                        'title'          => $d->title,
                        'type'           => $d->type,
                        'period_label'   => $d->periodLabel(),
                        'amount'         => $d->amount,
                        'status'         => $d->status,
                        'status_label'   => $d->statusLabel(),
                    ])
                : collect();

            $paymentHistoryQuery = DuesPayment::with(['house.users', 'dues', 'paymentMethod'])
                ->where('house_id', $user->house_id);

            if (!empty($search)) {
                $paymentHistoryQuery->where(function ($q) use ($search) {
                    $q->where('total_amount', 'like', "%{$search}%")
                      ->orWhereHas('dues', fn ($d) => $d->where('title', 'like', "%{$search}%"));
                });
            }

            $paymentHistory = $paymentHistoryQuery->latest()
                ->paginate(5)
                ->withQueryString()
                ->through(fn (DuesPayment $p) => [
                    'id'                   => $p->id,
                    'total_amount'         => $p->total_amount,
                    'status'               => $p->status,
                    'status_label'         => $p->statusLabel(),
                    'proof_photo'          => $p->proofPhotoUrl(),
                    'rejection_reason'     => $p->rejection_reason,
                    'created_at'           => $p->created_at->format('d M Y H:i'),
                    'dues_ids'             => $p->dues->pluck('id')->all(),
                    'dues_titles'          => $p->dues->pluck('title')->all(),
                    'resident_name'        => $p->house?->users->first()?->name ?? 'Warga',
                    'payment_method_label' => $this->paymentMethodLabel($p->paymentMethod),
                ]);

            $myPaymentHistory = $paymentHistory;
        }

        $paymentMethods = PaymentMethod::latest()->get()->map(fn (PaymentMethod $m) => [
            'id'             => $m->id,
            'type'           => $m->type,
            'type_label'     => $m->typeLabel(),
            'provider_name'  => $m->provider_name,
            'account_number' => $m->account_number,
            'account_holder' => $m->account_holder,
            'qris_image'     => $m->qrisImageUrl(),
            'is_active'      => (bool) $m->is_active,
        ]);

        return Inertia::render("{$ns}/Payment/Index", [
            'user'             => [
                'role'     => $user->role,
                'name'     => $user->name,
                'house_id' => $user->house_id,
                'id'       => $user->id,
            ],
            'dues'             => $dues,
            'paymentMethods'   => $paymentMethods,
            'paymentHistory'   => $paymentHistory,
            'myPaymentHistory' => $myPaymentHistory,
            'stats'            => $stats,
            'filters'          => $request->only(['search']), 
        ]);
    }

    public function paymentForm(Request $request)
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);
        $prefix = $this->routePrefix($user->role);

        if (!$user->house_id && !in_array($user->role, ['bendahara', 'sekretaris', 'ketua_rt'])) {
            return redirect()->route("{$prefix}.house.index")
                ->with('warning', 'Silakan daftarkan data rumah Anda terlebih dahulu.');
        }

        $selectedIds = $request->input('dues', []);

        $query = Due::whereIn('status', ['belum_bayar', 'ditolak']);

        if (!$user->isBendahara() && $user->house_id) {
            $query->where('house_id', $user->house_id);
        }

        if (!empty($selectedIds)) {
            $query->whereIn('id', $selectedIds);
        }

        $dues = $query->get()->unique(fn ($item) => $item->house_id . '-' . $item->title)->values();

        if ($dues->isEmpty()) {
            return redirect()->route("{$prefix}.dues.index")->with('status', 'Tidak ada tagihan yang dipilih untuk dibayar.');
        }

        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render("{$ns}/Payment/Bayar", [
            'user'           => [
                'role'     => $user->role,
                'house_id' => $user->house_id,
            ],
            'dues'           => $dues,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function submitPayment(Request $request)
    {
        $user = Auth::user();
        $prefix = $this->routePrefix($user->role);

        if (!$user->house_id && !$user->isBendahara()) {
            return redirect()->route("{$prefix}.house.index")
                ->with('warning', 'Silakan daftarkan data rumah Anda terlebih dahulu.');
        }

        $validated = $request->validate([
            'due_ids'           => ['required', 'array', 'min:1'],
            'due_ids.*'         => ['exists:dues,id'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'proof_photo'       => ['required', 'image', 'max:2048'],
            'custom_amounts'    => ['nullable', 'array'],
            'custom_amounts.*'  => ['numeric', 'min:0'],
        ]);

        $dues = Due::whereIn('id', $validated['due_ids'])
            ->whereIn('status', ['belum_bayar', 'ditolak'])
            ->get();

        abort_if($dues->isEmpty(), 422, 'Tidak ada tagihan valid yang dipilih.');

        $proofPath = $request->file('proof_photo')->store('dues-proofs', 'public');

        $payment = DB::transaction(function () use ($user, $dues, $proofPath, $validated) {
            $totalAmount = 0;

            foreach ($dues as $due) {
                $isVoluntary = $due->type === 'insidental' && (float) $due->amount === 0.0;

                if ($isVoluntary) {
                    $customAmt = $validated['custom_amounts'][$due->id] ?? 0;
                    $totalAmount += $customAmt;
                } else {
                    $totalAmount += $due->amount;
                }
            }

            $createdPayment = DuesPayment::create([
                'uuid'              => (string) Str::uuid(),
                'house_id'          => $user->house_id ?? $dues->first()->house_id,
                'payment_method_id' => $validated['payment_method_id'],
                'total_amount'      => $totalAmount,
                'proof_photo'       => $proofPath,
                'status'            => 'menunggu_verifikasi',
            ]);

            foreach ($dues as $due) {
                $createdPayment->items()->create(['due_id' => $due->id]);

                $isVoluntary = $due->type === 'insidental' && (float) $due->amount === 0.0;

                if ($isVoluntary) {
                    $due->update([
                        'status' => 'menunggu_verifikasi',
                        'amount' => $validated['custom_amounts'][$due->id] ?? 0,
                    ]);
                } else {
                    $due->update(['status' => 'menunggu_verifikasi']);
                }
            }

            return $createdPayment;
        });

        $payment->loadMissing('house');
        $blockNumber = $payment->house?->block_number ?? '-';

        if ($user->house_id === $payment->house_id) {
            $roleLabel = match ($user->role) {
                'bendahara'  => 'Bendahara',
                'sekretaris' => 'Sekretaris',
                'ketua_rt'   => 'Ketua RT',
                default      => 'Warga',
            };
            $senderMessage = "{$roleLabel} ({$user->name}) dari Blok {$blockNumber}";
        } else {
            $senderMessage = "Warga dari Blok {$blockNumber} (Diinput oleh Bendahara: {$user->name})";
        }

        Notification::create([
            'house_id'       => null,
            'notifiable_id'  => $payment->id,
            'recipient_role' => 'bendahara',
            'title'          => 'Konfirmasi Pembayaran Baru',
            'message'        => "{$senderMessage} telah mengirim bukti pembayaran sebesar Rp " . number_format($payment->total_amount, 0, ',', '.') . " dan menunggu verifikasi.",
            'category'       => 'keuangan',
        ]);

        User::where('role', User::ROLE_BENDAHARA)->get()->each(function ($bendahara) use ($payment) {
            if (NotificationPreferenceService::canSend($bendahara, 'iuran')) {
                $bendahara->notify(new PaymentSubmittedNotification($payment));
            }
        });

        return redirect()->route("{$prefix}.dues.index")
            ->with('status', 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi bendahara.');
    }

    public function store(Request $request)
    {
        return $this->submitPayment($request);
    }

    public function reuploadPayment(Request $request, $id)
    {
        $user = Auth::user();
        $prefix = $this->routePrefix($user->role);

        $payment = DuesPayment::findOrFail($id);
        
        abort_if(!$user->isBendahara() && $payment->house_id !== $user->house_id, 403);
        abort_if($payment->status !== 'ditolak', 422, 'Hanya pembayaran yang ditolak yang dapat diunggah ulang.');

        $validated = $request->validate([
            'proof_photo' => ['required', 'image', 'max:2048'],
        ]);

        if ($payment->proof_photo) {
            Storage::disk('public')->delete($payment->proof_photo);
        }

        $proofPath = $request->file('proof_photo')->store('dues-proofs', 'public');

        DB::transaction(function () use ($payment, $proofPath) {
            $payment->update([
                'proof_photo'      => $proofPath,
                'status'           => 'menunggu_verifikasi',
                'rejection_reason' => null,
            ]);

            $payment->dues()->update(['status' => 'menunggu_verifikasi']);
        });

        $payment->loadMissing('house');
        $blockNumber = $payment->house?->block_number ?? '-';

        Notification::create([
            'house_id'       => null,
            'notifiable_id'  => $payment->id,
            'recipient_role' => 'bendahara',
            'title'          => 'Unggah Ulang Bukti Pembayaran',
            'message'        => "Warga dari Blok {$blockNumber} telah mengunggah ulang bukti pembayaran senilai Rp " . number_format($payment->total_amount, 0, ',', '.') . " dan menunggu verifikasi.",
            'category'       => 'keuangan',
        ]);

        return back()->with('status', 'Bukti pembayaran berhasil diunggah ulang dan menunggu verifikasi.');
    }

    /* =========================================================
     * SISI BENDAHARA — Metode Pembayaran
     * ========================================================= */

    public function paymentMethods()
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $methods = PaymentMethod::latest()->get()->map(fn (PaymentMethod $m) => [
            'id'             => $m->id,
            'type'           => $m->type,
            'type_label'     => $m->typeLabel(),
            'provider_name'  => $m->provider_name,
            'account_number' => $m->account_number,
            'account_holder' => $m->account_holder,
            'qris_image'     => $m->qrisImageUrl(),
            'is_active'      => (bool) $m->is_active,
        ]);

        return Inertia::render('Bendahara/Payment/Index', [
            'user'    => ['role' => $user->role],
            'methods' => $methods,
        ]);
    }

    public function storePaymentMethod(Request $request)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $validated = $request->validate([
            'type'           => ['required', Rule::in(['bank', 'qris', 'ewallet'])],
            'provider_name'  => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_holder' => ['nullable', 'string', 'max:255'],
            'qris_image'     => ['nullable', 'image', 'max:2048'],
            'is_active'      => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('qris_image')) {
            $validated['qris_image'] = $request->file('qris_image')->store('payment-methods', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;

        PaymentMethod::create($validated);

        return back()->with('status', 'Metode pembayaran berhasil ditambahkan.');
    }

    public function updatePaymentMethod(Request $request, PaymentMethod $method)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $validated = $request->validate([
            'type'           => ['required', Rule::in(['bank', 'qris', 'ewallet'])],
            'provider_name'  => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_holder' => ['nullable', 'string', 'max:255'],
            'qris_image'     => ['nullable', 'image', 'max:2048'],
            'is_active'      => ['required', 'boolean'],
        ]);

        if ($request->hasFile('qris_image')) {
            if ($method->qris_image) Storage::disk('public')->delete($method->qris_image);
            $validated['qris_image'] = $request->file('qris_image')->store('payment-methods', 'public');
        }

        $method->update($validated);

        return back()->with('status', 'Metode pembayaran berhasil diperbarui.');
    }

    public function destroyPaymentMethod(PaymentMethod $method)
    {
        abort_unless(Auth::user()->isBendahara(), 403);

        if ($method->qris_image) Storage::disk('public')->delete($method->qris_image);
        $method->delete();

        return back()->with('status', 'Metode pembayaran berhasil dihapus.');
    }

    /* =========================================================
     * SISI BENDAHARA — Kelola Tagihan
     * ========================================================= */

    public function manageDues(Request $request)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $query = Due::with(['house.users', 'house']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('house', fn ($h) => $h->where('block_number', 'like', "%{$search}%"))
                    ->orWhereHas('house.users', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        if ($request->filled('month')) {
            $query->where('period_month', $request->month);
        }

        $dues = $query->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Due $d) => [
                'id'             => $d->id,
                'title'          => $d->title,
                'type'           => $d->type,
                'period_label'   => $d->periodLabel(),
                'amount'         => $d->amount,
                'status'         => $d->status,
                'status_label'   => $d->statusLabel(),
                'block_number'   => $d->house?->block_number ?? '-',
                'resident_name'  => $d->house?->users->first()?->name ?? 'Warga',
                'resident_email' => $d->house?->users->first()?->email ?? '-',
                'due_date'       => $d->created_at->addDays(7)->format('d M Y'),
            ]);

        $totalTagihanBulanIni = Due::sum('amount');
        $totalTerkumpul = Due::where('status', 'lunas')->sum('amount');
        $belumTerbayar = Due::whereIn('status', ['belum_bayar', 'ditolak'])->sum('amount');

        $currentMonthRevenue = DuesPayment::where('status', 'diverifikasi')
            ->whereYear('updated_at', now()->year)
            ->whereMonth('updated_at', now()->month)
            ->sum('total_amount');

        $lastMonthRevenue = DuesPayment::where('status', 'diverifikasi')
            ->whereYear('updated_at', now()->subMonth()->year)
            ->whereMonth('updated_at', now()->subMonth()->month)
            ->sum('total_amount');

        $percentageChange = 0;
        if ($lastMonthRevenue > 0) {
            $percentageChange = (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
        } elseif ($currentMonthRevenue > 0) {
            $percentageChange = 100;
        }

        $houses = House::with('users')
            ->get()
            ->map(fn (House $h) => [
                'id'            => $h->id,
                'block_number'  => $h->block_number ?? '-',
                'resident_name' => $h->users->first()?->name ?? 'Belum ada penghuni',
            ]);

        return Inertia::render('Bendahara/Payment/Manage', [
            'user'    => ['role' => $user->role],
            'dues'    => $dues,
            'houses'  => $houses,
            'stats'   => [
                'total_tagihan'     => $totalTagihanBulanIni,
                'terkumpul'         => $totalTerkumpul,
                'belum_bayar'       => $belumTerbayar,
                'count_tertunda'    => Due::whereIn('status', ['belum_bayar', 'ditolak'])->count(),
                'percentage_change' => round($percentageChange, 1),
                'is_increase'       => $percentageChange >= 0,
            ],
            'filters' => $request->only(['search', 'status', 'month']),
        ]);
    }

    public function generateMonthly(Request $request)
{
    $user = Auth::user();
    abort_unless($user->isBendahara(), 403);

    $validated = $request->validate([
        'period_month' => ['required', 'integer', 'min:1', 'max:12'],
        'period_year'  => ['required', 'integer', 'min:2020', 'max:2100'],
        'amount'       => ['required', 'numeric', 'min:0'],
    ]);

    // Eager load users di awal, sebelum loop
    $houses = House::with('users')->get();

    // Ambil SEKALI semua house_id yang sudah punya tagihan bulan ini,
    // biar nggak perlu query ->exists() per rumah di dalam loop
    $existingHouseIds = Due::where('type', 'bulanan')
        ->where('period_month', $validated['period_month'])
        ->where('period_year', $validated['period_year'])
        ->pluck('house_id')
        ->all();

    $created = 0;

    foreach ($houses as $house) {
        // Cek di memory (array PHP), bukan query database lagi
        if (in_array($house->id, $existingHouseIds)) {
            continue;
        }

        $months = [1=>'Januari',2=>'Februari',3=>'Maret',4=>'April',5=>'Mei',6=>'Juni',7=>'Juli',8=>'Agustus',9=>'September',10=>'Oktober',11=>'November',12=>'Desember'];
        $title = "Iuran Bulan {$months[$validated['period_month']]} {$validated['period_year']}";

        $due = Due::create([
            'house_id'     => $house->id,
            'title'        => $title,
            'type'         => 'bulanan',
            'period_month' => $validated['period_month'],
            'period_year'  => $validated['period_year'],
            'amount'       => $validated['amount'],
            'status'       => 'belum_bayar',
        ]);

        Notification::create([
            'house_id'      => $house->id,
            'notifiable_id' => $due->id,
            'title'         => 'Tagihan Iuran Baru',
            'message'       => "Tagihan baru '{$title}' sebesar Rp " . number_format($validated['amount'], 0, ',', '.') . " telah diterbitkan. Mohon segera melakukan pembayaran.",
            'category'      => 'keuangan',
        ]);

        NotificationPreferenceService::notifyHouse($house, 'iuran', new DueCreatedNotification($due));

        $created++;
    }

    return back()->with('status', "Tagihan bulanan berhasil dibuat untuk {$created} rumah.");
}

    public function storeIncidental(Request $request)
{
    $user = Auth::user();
    abort_unless($user->isBendahara(), 403);

    $validated = $request->validate([
        'title'       => ['required', 'string', 'max:255'],
        'amount_type' => ['required', Rule::in(['fixed', 'voluntary'])],
        'amount'      => ['required_if:amount_type,fixed', 'nullable', 'numeric', 'min:0'],
        'target'      => ['required', Rule::in(['semua', 'tertentu'])],
        'house_ids'   => ['required_if:target,tertentu', 'array'],
        'house_ids.*' => ['exists:houses,id'],
    ]);

    $amount = $validated['amount_type'] === 'voluntary' ? 0 : $validated['amount'];

    $houseIds = $validated['target'] === 'semua'
        ? House::pluck('id')
        : collect($validated['house_ids']);

    // Ambil semua rumah + relasinya SEKALIGUS sebelum loop, lalu index by id
    $houses = House::with('users')->whereIn('id', $houseIds)->get()->keyBy('id');

    foreach ($houseIds as $houseId) {
        $due = Due::create([
            'house_id' => $houseId,
            'title'    => $validated['title'],
            'type'     => 'insidental',
            'amount'   => $amount,
            'status'   => 'belum_bayar',
        ]);

        $formattedAmount = $amount > 0 ? "sebesar Rp " . number_format($amount, 0, ',', '.') : "secara sukarela (seikhlasnya)";
        Notification::create([
            'house_id'      => $houseId,
            'notifiable_id' => $due->id,
            'title'         => 'Tagihan Khusus / Insidental Baru',
            'message'       => "Tagihan baru '{$validated['title']}' {$formattedAmount} telah diterbitkan.",
            'category'      => 'keuangan',
        ]);

        // Ambil dari map yang sudah di-eager-load, bukan loadMissing lagi
        $house = $houses->get($houseId);
        if ($house) {
            NotificationPreferenceService::notifyHouse($house, 'iuran', new DueCreatedNotification($due));
        }
    }

    return back()->with('status', "Tagihan insidental berhasil dibuat untuk {$houseIds->count()} rumah.");
}

    public function destroyDue(Due $due)
    {
        abort_unless(Auth::user()->isBendahara(), 403);
        abort_if($due->status !== 'belum_bayar', 422, 'Tagihan yang sudah diproses tidak bisa dihapus.');

        $due->delete();

        return back()->with('status', 'Tagihan berhasil dihapus.');
    }

    /* =========================================================
     * SISI BENDAHARA — Verifikasi Pembayaran
     * ========================================================= */

    public function verificationQueue(Request $request)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $payments = DuesPayment::with(['house.users', 'dues', 'paymentMethod'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->whereHas('house.users', fn ($q2) => $q2->where('name', 'like', '%' . $request->search . '%'));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (DuesPayment $p) => [
                'id'                   => $p->id,
                'resident_name'        => $p->house?->users->first()?->name ?? 'Warga',
                'block_number'         => $p->house?->block_number ?? '-',
                'total_amount'         => $p->total_amount,
                'status'               => $p->status,
                'status_label'         => $p->statusLabel(),
                'proof_photo'          => $p->proofPhotoUrl(),
                'dues_titles'          => $p->dues->pluck('title')->all(),
                'created_at'           => $p->created_at->format('d M Y, H:i'),
                'payment_method_label' => $this->paymentMethodLabel($p->paymentMethod),
            ]);

        $stats = [
            'pending'  => DuesPayment::where('status', 'menunggu_verifikasi')->count(),
            'approved' => DuesPayment::where('status', 'diverifikasi')->whereDate('updated_at', today())->count(),
            'rejected' => DuesPayment::where('status', 'ditolak')->whereDate('updated_at', today())->count(),
        ];

        return Inertia::render('Bendahara/Payment/Verification', [
            'user'        => [
                'role' => $user->role,
                'name' => $user->name,
            ],
            'payments'    => $payments,
            'stats'       => $stats,
            'filters'     => $request->only(['status', 'search']),
            'highlightId' => $request->filled('highlight') ? (int) $request->query('highlight') : null,
        ]);
    }

    public function verifyPayment($id)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $payment = DuesPayment::findOrFail($id);
        abort_if($payment->status !== 'menunggu_verifikasi', 422);

        DB::transaction(function () use ($payment, $user) {
            $payment->update([
                'status'      => 'diverifikasi', 
                'verified_by' => $user->id,
                'verified_at' => now(),
            ]);

            $payment->dues()->update(['status' => 'lunas', 'paid_at' => now()]);
        });

        Notification::create([
            'house_id'      => $payment->house_id,
            'notifiable_id' => $payment->id,
            'title'         => 'Pembayaran Lunas & Diverifikasi',
            'message'       => "Pembayaran iuran Anda senilai Rp " . number_format($payment->total_amount, 0, ',', '.') . " telah disetujui dan dinyatakan lunas oleh Bendahara.",
            'category'      => 'keuangan',
        ]);

        return back()->with('status', 'Pembayaran berhasil diverifikasi.');
    }
    
    public function rejectPayment(Request $request, $id)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        $payment = DuesPayment::findOrFail($id);
        abort_if($payment->status !== 'menunggu_verifikasi', 422);

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($payment, $validated) {
            $payment->update([
                'status'           => 'ditolak',
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            $payment->dues()->update(['status' => 'belum_bayar']);
        });

        $dueIds = $payment->dues()->select('dues.id')->pluck('id')->toArray();

        $payment->loadMissing('house.users');
        $residentRole = $payment->house?->users->first()?->role;
        $prefix = $this->routePrefix($residentRole);

        Notification::create([
            'house_id'      => $payment->house_id,
            'notifiable_id' => $payment->id,
            'title'         => 'Pembayaran Ditolak',
            'message'       => "Maaf, bukti pembayaran Anda ditolak. Alasan: {$validated['rejection_reason']}. Silakan unggah ulang bukti yang valid.",
            'category'      => 'keuangan',
            'actions'       => [
                [
                    'label'   => 'Bayar Ulang',
                    'url'     => route("{$prefix}.dues.index"),
                    'primary' => false,
                ],
                [
                    'label'   => 'Lihat Detail',
                    'url'     => route("{$prefix}.dues.success", $payment->uuid),
                    'primary' => false,
                ],
                [
                    'label'   => 'Upload Ulang Bukti Pembayaran',
                    // Diarahkan langsung ke Index.jsx utama (tab Antrian & Riwayat Pembayaran)
                    'url'     => route("{$prefix}.dues.index"),
                    'primary' => true,
                ],
            ],
        ]);

        return back()->with('status', 'Pembayaran ditolak, tagihan dikembalikan ke status belum bayar.');
    }

    public function success(DuesPayment $payment)
    {
        $user = Auth::user();
        $ns = $this->roleNamespace($user->role);

        abort_if(!$user->isBendahara() && $payment->house_id !== $user->house_id, 403);

        $payment->load(['house', 'dues']);

        return Inertia::render("{$ns}/Payment/Invoice", [
            'user'    => ['role' => $user->role],
            'payment' => [
                'id'               => $payment->id,
                'uuid'             => $payment->uuid,
                'total_amount'     => $payment->total_amount,
                'status'           => $payment->status,
                'status_label'     => $payment->statusLabel(),
                'rejection_reason' => $payment->rejection_reason,
                'proof_photo'      => $payment->proofPhotoUrl(),
                'created_at'       => $payment->created_at->format('d M Y, H:i') . ' WIB',
                'created_at_year'  => $payment->created_at->format('Y'),
                'dues'             => $payment->dues->map(fn($d) => [
                    'id'     => $d->id,
                    'title'  => $d->title,
                    'amount' => $d->amount,
                ]),
            ],
        ]);
    }

    /* =========================================================
     * SISI BENDAHARA — Notifikasi Pembayaran
     * ========================================================= */

    public function remindDue(Due $due)
    {
        $user = Auth::user();
        abort_unless($user->isBendahara(), 403);

        if ($due->status === 'lunas' || $due->status === 'diverifikasi') {
            return back()->with('status', 'Tagihan ini sudah lunas.');
        }

        $isVoluntary = $due->type === 'insidental' && (float) $due->amount === 0.0;
        $formattedAmount = $isVoluntary
            ? "secara sukarela (seikhlasnya)"
            : "sebesar Rp " . number_format($due->amount, 0, ',', '.');

        Notification::create([
            'house_id'      => $due->house_id,
            'notifiable_id' => $due->id,
            'title'         => 'Pengingat Pembayaran Iuran',
            'message'       => "Halo, tagihan '{$due->title}' {$formattedAmount} belum dibayar. Mohon segera melakukan pembayaran.",
            'category'      => 'keuangan',
        ]);

        $due->loadMissing('house.users');
        NotificationPreferenceService::notifyHouse($due->house, 'iuran', new DueReminderNotification($due));

        return back()->with('status', 'Berhasil mengirim pengingat ke warga.');
    }

   public function remindAllDues()
{
    $user = Auth::user();
    abort_unless($user->isBendahara(), 403);

    // Eager load house.users di awal, sebelum loop
    $unpaidDues = Due::with('house.users')
        ->whereIn('status', ['belum_bayar', 'ditolak'])
        ->get();

    $count = 0;

    foreach ($unpaidDues as $due) {
        $isVoluntary = $due->type === 'insidental' && (float) $due->amount === 0.0;
        $formattedAmount = $isVoluntary
            ? "secara sukarela (seikhlasnya)"
            : "senilai Rp " . number_format($due->amount, 0, ',', '.');

        Notification::create([
            'house_id'      => $due->house_id,
            'notifiable_id' => $due->id,
            'title'         => 'Pengingat Pembayaran Iuran RT 05',
            'message'       => "Pengingat: Tagihan '{$due->title}' Anda {$formattedAmount} berstatus belum lunas. Segera lakukan pembayaran.",
            'category'      => 'keuangan',
        ]);

        NotificationPreferenceService::notifyHouse($due->house, 'iuran', new DueReminderNotification($due));

        $count++;
    }

    return back()->with('status', "Berhasil mengirim pengingat massal ke {$count} tagihan yang belum lunas.");
}
}