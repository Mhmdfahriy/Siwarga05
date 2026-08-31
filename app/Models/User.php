<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use NotificationChannels\WebPush\HasPushSubscriptions; // [BARU] Import trait WebPush

class User extends Authenticatable
{
    // [BARU] Tambahkan HasPushSubscriptions ke dalam use statement
    use HasFactory, Notifiable, HasPushSubscriptions;

    protected $fillable = [
        'name',
        'nik',
        'email',
        'no_hp',
        'password',
        'google_id',
        'role',
        'status',
        'alasan_penolakan',
        'occupation',
        'photo',
        'house_id',
        'two_factor_enabled',        // [BARU]
        'two_factor_secret',         // [BARU]
        'notification_preferences',  // [BARU]
        'privacy_settings',          // [BARU]
        'deactivated_at',            // [BARU]
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'nik',
        'nik_hash',
        'google_id',
        'two_factor_secret', // [BARU] jangan pernah ikut ke response JSON/Inertia
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'nik' => 'encrypted',
            'two_factor_enabled' => 'boolean',        // [BARU]
            'notification_preferences' => 'array',    // [BARU]
            'privacy_settings' => 'array',             // [BARU]
            'deactivated_at' => 'datetime',            // [BARU]
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if ($user->isDirty('nik') && $user->nik) {
                $user->nik_hash = hash('sha256', $user->nik);
            }
        });
    }

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_KETUA_RT = 'ketua_rt';
    const ROLE_SEKRETARIS = 'sekretaris';
    const ROLE_BENDAHARA = 'bendahara';
    const ROLE_WARGA = 'warga';

    const STATUS_AKTIF = 'aktif';
    const STATUS_DITOLAK = 'ditolak';
    const STATUS_PINDAH = 'pindah';

    public function isPindah(): bool
    {
        return $this->status === self::STATUS_PINDAH;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isKetuaRt(): bool
    {
        return $this->role === self::ROLE_KETUA_RT;
    }

    public function isSekretaris(): bool
    {
        return $this->role === self::ROLE_SEKRETARIS;
    }

    public function isBendahara(): bool
    {
        return $this->role === self::ROLE_BENDAHARA;
    }

    public function isWarga(): bool
    {
        return $this->role === self::ROLE_WARGA;
    }

    public function isPengurus(): bool
    {
        return in_array($this->role, [
            self::ROLE_KETUA_RT,
            self::ROLE_SEKRETARIS,
            self::ROLE_BENDAHARA,
        ]);
    }

    public function hasRole(string|array $roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        return in_array($this->role, $roles);
    }

    public function isAktif(): bool
    {
        return $this->status === self::STATUS_AKTIF;
    }

    public function isDitolak(): bool
    {
        return $this->status === self::STATUS_DITOLAK;
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    /**
     * NIK yang sudah disamarkan untuk ditampilkan di UI, contoh: 32750*********002
     * $this->nik otomatis ke-decrypt oleh cast 'encrypted' saat diakses.
     */
    public function maskedNik(): ?string
    {
        if (! $this->nik) {
            return null;
        }

        $nik = $this->nik;
        $len = strlen($nik);

        if ($len <= 8) {
            return $nik;
        }

        return substr($nik, 0, 5) . str_repeat('*', $len - 8) . substr($nik, -3);
    }

    /**
     * Label role yang ramah tampilan untuk halaman profile.
     */
    public function roleLabel(): string
    {
        return match ($this->role) {
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_KETUA_RT    => 'Ketua RT05',
            self::ROLE_SEKRETARIS  => 'Sekretaris RT05',
            self::ROLE_BENDAHARA   => 'Bendahara RT05',
            self::ROLE_WARGA       => 'Warga RT05',
            default                => ucfirst($this->role),
        };
    }

    /**
     * ID resmi warga, contoh: RT05-004-16-07-2026.
     */
    public function residentId(): string
    {
        return 'RT05-' . str_pad((string) $this->id, 3, '0', STR_PAD_LEFT) . '-' . $this->created_at->format('d-m-Y');
    }

    public function getIsHeadOfFamilyAttribute(): bool
    {
        return $this->house?->members()
            ->where('user_id', $this->id)
            ->where('relation_type', 'kepala_keluarga')
            ->exists() ?? false;
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(Laporan::class);
    }

    /**
     * Laporan yang ditugaskan ke user ini (sebagai petugas penanganan)
     */
    public function laporanDitugaskan(): HasMany
    {
        return $this->hasMany(Laporan::class, 'assigned_to');
    }

    /**
     * Komentar/balasan yang pernah dibuat user ini di laporan manapun
     */
    public function laporanKomentars(): HasMany
    {
        return $this->hasMany(LaporanKomentar::class);
    }

    // ================= [BARU] Account Settings helpers =================

    /**
     * Cek apakah akun sedang dinonaktifkan sendiri oleh user (Danger Zone).
     * Beda dengan status approval (aktif/ditolak/pindah).
     */
    public function isDeactivated(): bool
    {
        return ! is_null($this->deactivated_at);
    }

    public function hasPassword(): bool
    {
        return ! is_null($this->password);
    }

    public static function defaultNotificationPreferences(): array
    {
        // [UPDATE] Disesuaikan agar sinkron dengan pengaturan di frontend yang baru
        return [
            'types' => [
                'news_announcements' => true,
                'financial_reminders' => true,
                'report_updates' => false,
            ],
            'channels' => [
                'push' => true,
            ],
        ];
    }

    public static function defaultPrivacySettings(): array
    {
        return [
            'show_phone_to_residents' => false,
            'show_house_number_in_directory' => true,
        ];
    }
}