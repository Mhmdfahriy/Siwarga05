<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Ketuart\DashboardController as KetuartDashboardController;
use App\Http\Controllers\Bendahara\DashboardController as BendaharaDashboardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\Sekretaris\DashboardController as SekretarisDashboardController;
use App\Http\Controllers\Warga\DashboardController as WargaDashboardController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\HouseMemberController;
use App\Http\Controllers\ResidentProfileController;
use App\Http\Controllers\DataWargaController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\WargaNonaktifController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\SuperAdmin\LandingSettingController;
use App\Http\Controllers\SuperAdmin\PengurusController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingController::class, 'index'])->name('landing');

// super admin
Route::middleware(['auth', 'role:super_admin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/pengurus', [PengurusController::class, 'index'])->name('pengurus.index');
    Route::post('/pengurus', [PengurusController::class, 'store'])->name('pengurus.store');
    Route::put('/pengurus/{targetUser}/demote', [PengurusController::class, 'demote'])->name('pengurus.demote');

    // Rute Kelola Landing Page & Galeri
    Route::get('/landing-settings', [LandingSettingController::class, 'index'])->name('landing.index');
    Route::post('/landing-settings/home', [LandingSettingController::class, 'updateHome'])->name('landing.home');
    Route::post('/landing-settings/gallery', [LandingSettingController::class, 'storeGallery'])->name('landing.gallery.store');
    Route::delete('/landing-settings/gallery/{gallery}', [LandingSettingController::class, 'destroyGallery'])->name('landing.gallery.destroy');
});

/*
|--------------------------------------------------------------------------
| Ketua RT
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'approved', 'role:ketua_rt'])
    ->prefix('ketuart')
    ->name('ketuart.')
    ->group(function () {

        Route::get('/dashboard', [KetuartDashboardController::class, 'index'])
            ->name('dashboard');

        // Berita
        Route::get('berita', [NewsController::class, 'index'])->name('news.index');
        Route::get('berita/{news}', [NewsController::class, 'show'])->name('news.show');
        Route::delete('berita/{news}', [NewsController::class, 'destroy'])->name('news.destroy');

        // Profile
        Route::get('/profile', [ResidentProfileController::class, 'index'])
            ->name('profile.index');
        Route::get('/profile/edit', [ResidentProfileController::class, 'edit'])
            ->name('profile.edit');
        Route::put('/profile', [ResidentProfileController::class, 'update'])
            ->name('profile.update');

        // House
        Route::put('/rumah', [HouseController::class, 'update'])->name('house.update');
        Route::get('/rumah/tambah', [HouseController::class, 'create'])->name('house.create');
        Route::post('/rumah', [HouseController::class, 'store'])->name('house.store');
        Route::get('/rumah', [HouseController::class, 'index'])->name('house.index');

        // House Member
        Route::post('/house-members', [HouseMemberController::class, 'store'])
            ->name('house-members.store');
        Route::put('/house-members/{member}', [HouseMemberController::class, 'update'])
            ->name('house-members.update');
        Route::delete('/house-members/{member}', [HouseMemberController::class, 'destroy'])
            ->name('house-members.destroy');

        // Data Warga
        Route::get('/data-warga', [DataWargaController::class, 'index'])->name('data-warga.index');
        Route::get('/data-warga/{targetUser}', [DataWargaController::class, 'show'])->name('data-warga.show');
        Route::get('/data-warga/{targetUser}/edit', [DataWargaController::class, 'edit'])->name('data-warga.edit');
        Route::put('/data-warga/{targetUser}/status', [DataWargaController::class, 'updateStatus'])->name('data-warga.update-status');
        Route::put('/data-warga/{targetUser}/reset-nik', [DataWargaController::class, 'resetNik'])->name('data-warga.reset-nik');
        Route::put('/data-warga/members/{member}/reset-nik', [DataWargaController::class, 'resetMemberNik'])->name('data-warga.reset-member-nik');

        // Payment - Bayar iuran
        Route::get('/iuran', [PaymentController::class, 'index'])->name('dues.index');
        Route::get('/iuran/bayar', [PaymentController::class, 'paymentForm'])->name('dues.payment-form'); 
        Route::post('/iuran/bayar', [PaymentController::class, 'submitPayment'])->name('dues.submit-payment');
        Route::get('/iuran/status/{payment:uuid}', [PaymentController::class, 'success'])->name('dues.success');
        Route::put('/dues/{id}/reupload-payment', [PaymentController::class, 'reuploadPayment'])->name('dues.reupload-payment');

        // Laporanaja
        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');
        Route::patch('/laporan/{laporan}/status', [LaporanController::class, 'updateStatus'])->name('laporan.status');
        Route::post('/laporan/{laporan}/komentar', [LaporanController::class, 'komentar'])->name('laporan.komentar');
        Route::delete('/laporan/{laporan}', [LaporanController::class, 'destroy'])->name('laporan.destroy');

        //Notifikasi
        Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
        Route::post('/notifikasi/{notification}/baca', [NotificationController::class, 'markAsRead'])->name('notifikasi.baca');
        Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.baca-semua');
        Route::get('/notifikasi/cek-baru', [NotificationController::class, 'poll'])->name('notifikasi.cek-baru');

         //Warga Nonaktif
            Route::get('/warga-nonaktif', [WargaNonaktifController::class, 'index'])->name('warganonaktif.index');
            Route::put('/warga-nonaktif/{id}/aktifkan', [WargaNonaktifController::class, 'activate'])->name('warganonaktif.activate');

        // Pengaturan Akun
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/', [PengaturanController::class, 'index'])->name('index');
            Route::post('/profil', [PengaturanController::class, 'updateProfile'])->name('profil.update');
            Route::post('/foto', [PengaturanController::class, 'updatePhoto'])->name('foto.update');
            Route::put('/password', [PengaturanController::class, 'updatePassword'])->name('password.update');
            Route::put('/2fa', [PengaturanController::class, 'toggleTwoFactor'])->name('2fa.toggle');
            Route::put('/preferensi', [PengaturanController::class, 'updatePreferences'])->name('preferensi.update');
            Route::delete('/nonaktifkan', [PengaturanController::class, 'deactivate'])->name('nonaktifkan');
            //notif push
            Route::post('/push-subscribe', [PengaturanController::class, 'updatePushSubscription'])->name('push.subscribe');
            Route::post('/push-unsubscribe', [PengaturanController::class, 'deletePushSubscription'])->name('push.unsubscribe');
        });
    });

/*
|--------------------------------------------------------------------------
| Sekretaris
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'approved', 'role:sekretaris'])
    ->prefix('sekretaris')
    ->name('sekretaris.')
    ->group(function () {

        Route::get('/dashboard', [SekretarisDashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('berita', [NewsController::class, 'index'])->name('news.index');
        Route::get('/berita/manage', [NewsController::class, 'manage'])->name('news.manage');
        Route::get('berita/tambah', [NewsController::class, 'create'])->name('news.create');
        Route::post('berita', [NewsController::class, 'store'])->name('news.store');
        Route::get('berita/{news}', [NewsController::class, 'show'])->name('news.show');
        Route::get('berita/{news}/edit', [NewsController::class, 'edit'])->name('news.edit');
        Route::put('berita/{news}', [NewsController::class, 'update'])->name('news.update');
        Route::delete('berita/{news}', [NewsController::class, 'destroy'])->name('news.destroy');
        
        // Profile
        Route::get('/profile', [ResidentProfileController::class, 'index'])
            ->name('profile.index');
        Route::get('/profile/edit', [ResidentProfileController::class, 'edit'])
            ->name('profile.edit');
        Route::put('/profile', [ResidentProfileController::class, 'update'])
            ->name('profile.update');

        // House
        Route::put('/rumah', [HouseController::class, 'update'])->name('house.update');
        Route::get('/rumah/tambah', [HouseController::class, 'create'])->name('house.create');
        Route::post('/rumah', [HouseController::class, 'store'])->name('house.store');
        Route::get('/rumah', [HouseController::class, 'index'])->name('house.index');

        // House Member
        Route::post('/house-members', [HouseMemberController::class, 'store'])->name('house-members.store');
        Route::put('/house-members/{member}', [HouseMemberController::class, 'update'])->name('house-members.update');
        Route::delete('/house-members/{member}', [HouseMemberController::class, 'destroy'])->name('house-members.destroy');

        // Data warga
        Route::get('/data-warga', [DataWargaController::class, 'index'])->name('data-warga.index');
        Route::get('/data-warga/{targetUser}', [DataWargaController::class, 'show'])->name('data-warga.show');
        Route::get('/data-warga/{targetUser}/edit', [DataWargaController::class, 'edit'])->name('data-warga.edit');
        Route::put('/data-warga/{targetUser}/status', [DataWargaController::class, 'updateStatus'])->name('data-warga.update-status');
        Route::put('/data-warga/{targetUser}/reset-nik', [DataWargaController::class, 'resetNik'])->name('data-warga.reset-nik');

        // Payment - Bayar iuran
        Route::get('/iuran', [PaymentController::class, 'index'])->name('dues.index');
        Route::get('/iuran/bayar', [PaymentController::class, 'paymentForm'])->name('dues.payment-form'); 
        Route::post('/iuran/bayar', [PaymentController::class, 'submitPayment'])->name('dues.submit-payment');
        Route::get('/iuran/status/{payment:uuid}', [PaymentController::class, 'success'])->name('dues.success');
        Route::put('/dues/{id}/reupload-payment', [PaymentController::class, 'reuploadPayment'])->name('dues.reupload-payment');

        // Laporanaja
        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');
        Route::patch('/laporan/{laporan}/status', [LaporanController::class, 'updateStatus'])->name('laporan.status');
        Route::post('/laporan/{laporan}/komentar', [LaporanController::class, 'komentar'])->name('laporan.komentar');
        Route::delete('/laporan/{laporan}', [LaporanController::class, 'destroy'])->name('laporan.destroy');

        // Notifikasi
        Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
        Route::post('/notifikasi/{notification}/baca', [NotificationController::class, 'markAsRead'])->name('notifikasi.baca');
        Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.baca-semua');
        Route::get('/notifikasi/cek-baru', [NotificationController::class, 'poll'])->name('notifikasi.cek-baru');

        // Pengaturan Akun
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/', [PengaturanController::class, 'index'])->name('index');
            Route::post('/profil', [PengaturanController::class, 'updateProfile'])->name('profil.update');
            Route::post('/foto', [PengaturanController::class, 'updatePhoto'])->name('foto.update');
            Route::put('/password', [PengaturanController::class, 'updatePassword'])->name('password.update');
            Route::put('/2fa', [PengaturanController::class, 'toggleTwoFactor'])->name('2fa.toggle');
            Route::put('/preferensi', [PengaturanController::class, 'updatePreferences'])->name('preferensi.update');
            Route::delete('/nonaktifkan', [PengaturanController::class, 'deactivate'])->name('nonaktifkan');
            //notif push
            Route::post('/push-subscribe', [PengaturanController::class, 'updatePushSubscription'])->name('push.subscribe');
            Route::post('/push-unsubscribe', [PengaturanController::class, 'deletePushSubscription'])->name('push.unsubscribe');
        });
    });

/*
|--------------------------------------------------------------------------
| Bendahara
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'approved', 'role:bendahara'])
    ->prefix('bendahara')
    ->name('bendahara.')
    ->group(function () {

        Route::get('/dashboard', [BendaharaDashboardController::class, 'index'])
            ->name('dashboard');

        // berita
        Route::get('/berita', [NewsController::class, 'index'])->name('news.index');
        Route::get('/berita/manage', [NewsController::class, 'manage'])->name('news.manage');
        Route::get('/berita/tambah-berita', [NewsController::class, 'create'])->name('news.create');
        Route::post('/berita', [NewsController::class, 'store'])->name('news.store');
        Route::get('/berita/{news}', [NewsController::class, 'show'])->name('news.show');
        Route::get('/berita/{news}/edit', [NewsController::class, 'edit'])->name('news.edit');
        Route::put('/berita/{news}', [NewsController::class, 'update'])->name('news.update');
        Route::delete('/berita/{news}', [NewsController::class, 'destroy'])->name('news.destroy');

        // Profile
        Route::get('/profile', [ResidentProfileController::class, 'index'])
            ->name('profile.index');
        Route::get('/profile/edit', [ResidentProfileController::class, 'edit'])
            ->name('profile.edit');
        Route::put('/profile', [ResidentProfileController::class, 'update'])
            ->name('profile.update');

        // House
        Route::put('/house', [HouseController::class, 'update'])->name('house.update');
        Route::get('/rumah/tambah', [HouseController::class, 'create'])->name('house.create');
        Route::post('/rumah', [HouseController::class, 'store'])->name('house.store');
        Route::get('/rumah', [HouseController::class, 'index'])->name('house.index');

        // House Member
        Route::post('/house-members', [HouseMemberController::class, 'store'])->name('house-members.store');
        Route::put('/house-members/{member}', [HouseMemberController::class, 'update'])->name('house-members.update');
        Route::delete('/house-members/{member}', [HouseMemberController::class, 'destroy'])->name('house-members.destroy');

        // Data warga
        Route::get('/data-warga', [DataWargaController::class, 'index'])->name('data-warga.index');
        Route::get('/data-warga/{targetUser}', [DataWargaController::class, 'show'])->name('data-warga.show');
        Route::get('/data-warga/{targetUser}/edit', [DataWargaController::class, 'edit'])->name('data-warga.edit');
        Route::put('/data-warga/{targetUser}/status', [DataWargaController::class, 'updateStatus'])->name('data-warga.update-status');

        // Payment - Bayar Iuran (Untuk Bendahara Sendiri)
        Route::get('/iuran', [PaymentController::class, 'index'])->name('dues.index');
        Route::get('/iuran/bayar', [PaymentController::class, 'paymentForm'])->name('dues.payment-form'); 
        Route::post('/iuran/bayar', [PaymentController::class, 'submitPayment'])->name('dues.submit-payment');
        Route::get('/iuran/status/{payment:uuid}', [PaymentController::class, 'success'])->name('dues.success');
        Route::put('/dues/{id}/reupload-payment', [PaymentController::class, 'reuploadPayment'])->name('dues.reupload-payment');

        // Payment - Kelola dan Verifikasi (Khusus Admin Bendahara)
        Route::get('/iuran/metode', [PaymentController::class, 'paymentMethods'])->name('dues.payment-methods');
        Route::post('/iuran/metode', [PaymentController::class, 'storePaymentMethod'])->name('dues.payment-methods.store');
        Route::put('/iuran/metode/{method}', [PaymentController::class, 'updatePaymentMethod'])->name('dues.payment-methods.update');
        Route::delete('/iuran/metode/{method}', [PaymentController::class, 'destroyPaymentMethod'])->name('dues.payment-methods.destroy');

        Route::get('/iuran/kelola', [PaymentController::class, 'manageDues'])->name('dues.manage');
        Route::post('/iuran/generate-bulanan', [PaymentController::class, 'generateMonthly'])->name('dues.generate-monthly');
        Route::post('/iuran/insidental', [PaymentController::class, 'storeIncidental'])->name('dues.store-incidental');
        Route::delete('/iuran/{due}', [PaymentController::class, 'destroyDue'])->name('dues.destroy');

        Route::get('/iuran/verifikasi', [PaymentController::class, 'verificationQueue'])->name('dues.verification');
        Route::put('/iuran/verifikasi/{payment}/verify', [PaymentController::class, 'verifyPayment'])->name('dues.verify');
        Route::put('/iuran/verifikasi/{payment}/tolak', [PaymentController::class, 'rejectPayment'])->name('dues.reject');

        Route::post('/dues/remind-all', [PaymentController::class, 'remindAllDues'])->name('dues.remind-all');
        Route::post('/dues/{due}/remind', [PaymentController::class, 'remindDue'])->name('dues.remind');

        // Laporanaja
        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');
        Route::patch('/laporan/{laporan}/status', [LaporanController::class, 'updateStatus'])->name('laporan.status');
        Route::post('/laporan/{laporan}/komentar', [LaporanController::class, 'komentar'])->name('laporan.komentar');
        Route::delete('/laporan/{laporan}', [LaporanController::class, 'destroy'])->name('laporan.destroy');

        // Notifikasi
        Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
        Route::post('/notifikasi/{notification}/baca', [NotificationController::class, 'markAsRead'])->name('notifikasi.baca');
        Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.baca-semua');
        Route::get('/notifikasi/cek-baru', [NotificationController::class, 'poll'])->name('notifikasi.cek-baru');

        // Pengaturan Akun
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/', [PengaturanController::class, 'index'])->name('index');
            Route::post('/profil', [PengaturanController::class, 'updateProfile'])->name('profil.update');
            Route::post('/foto', [PengaturanController::class, 'updatePhoto'])->name('foto.update');
            Route::put('/password', [PengaturanController::class, 'updatePassword'])->name('password.update');
            Route::put('/2fa', [PengaturanController::class, 'toggleTwoFactor'])->name('2fa.toggle');
            Route::put('/preferensi', [PengaturanController::class, 'updatePreferences'])->name('preferensi.update');
            Route::delete('/nonaktifkan', [PengaturanController::class, 'deactivate'])->name('nonaktifkan');
            //notif push
            Route::post('/push-subscribe', [PengaturanController::class, 'updatePushSubscription'])->name('push.subscribe');
            Route::post('/push-unsubscribe', [PengaturanController::class, 'deletePushSubscription'])->name('push.unsubscribe');
        });
    });

/*
|--------------------------------------------------------------------------
| Warga
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'approved', 'role:warga'])
    ->prefix('warga')
    ->name('warga.')
    ->group(function () {

        Route::get('/dashboard', [WargaDashboardController::class, 'index'])
            ->name('dashboard');

        //berita
        Route::get('/Berita/semuaberita', [NewsController::class, 'all'])
            ->name('news.all');
        Route::get('/Berita', [NewsController::class, 'index'])
            ->name('news.index');
        Route::get('/Berita/{news}', [NewsController::class, 'show'])
            ->name('news.show');

        // Kalender Komunitas & Agenda Warga
        Route::get('/kalender', function () {
            return Inertia::render('Warga/News/Calender');
        })->name('calendar.index');

        Route::get('/kalender/data', [CalendarController::class, 'getCalendarData'])
            ->name('calendar.data');

        Route::post('/kalender', [CalendarController::class, 'storePersonalAgenda'])
            ->name('calendar.store');

        // Profile
        Route::get('/profile', [ResidentProfileController::class, 'index'])
            ->name('profile.index');
        Route::get('/profile/edit', [ResidentProfileController::class, 'edit'])
            ->name('profile.edit');
        Route::put('/profile', [ResidentProfileController::class, 'update'])
            ->name('profile.update');

        // House
        Route::put('/rumah', [HouseController::class, 'update'])->name('house.update');
        Route::get('/rumah/tambah', [HouseController::class, 'create'])->name('house.create');
        Route::post('/rumah', [HouseController::class, 'store'])->name('house.store');
        Route::get('/rumah', [HouseController::class, 'index'])->name('house.index');

        // House Member
        Route::post('/house-members', [HouseMemberController::class, 'store'])->name('house-members.store');
        Route::put('/house-members/{member}', [HouseMemberController::class, 'update'])->name('house-members.update');
        Route::delete('/house-members/{member}', [HouseMemberController::class, 'destroy'])->name('house-members.destroy');

        // Payment - Bayar iuran
        Route::get('/iuran', [PaymentController::class, 'index'])->name('dues.index');
        Route::get('/iuran/bayar', [PaymentController::class, 'paymentForm'])->name('dues.payment-form'); 
        Route::post('/iuran/bayar', [PaymentController::class, 'submitPayment'])->name('dues.submit-payment');
        Route::get('/iuran/status/{payment:uuid}', [PaymentController::class, 'success'])->name('dues.success');
        Route::put('/dues/{id}/reupload-payment', [PaymentController::class, 'reuploadPayment'])->name('dues.reupload-payment');

        // Laporan Warga
        Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::post('/laporan', [LaporanController::class, 'store'])->name('laporan.store');
        Route::patch('/laporan/{laporan}/status', [LaporanController::class, 'updateStatus'])->name('laporan.status');
        Route::post('/laporan/{laporan}/komentar', [LaporanController::class, 'komentar'])->name('laporan.komentar');
        Route::delete('/laporan/{laporan}', [LaporanController::class, 'destroy'])->name('laporan.destroy');

        // Notifikasi
        Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifikasi.index');
        Route::post('/notifikasi/{notification}/baca', [NotificationController::class, 'markAsRead'])->name('notifikasi.baca');
        Route::post('/notifikasi/baca-semua', [NotificationController::class, 'markAllAsRead'])->name('notifikasi.baca-semua');
        Route::get('/notifikasi/cek-baru', [NotificationController::class, 'poll'])->name('notifikasi.cek-baru');

        // Pengaturan Akun
        Route::prefix('pengaturan')->name('pengaturan.')->group(function () {
            Route::get('/', [PengaturanController::class, 'index'])->name('index');
            Route::post('/profil', [PengaturanController::class, 'updateProfile'])->name('profil.update');
            Route::post('/foto', [PengaturanController::class, 'updatePhoto'])->name('foto.update');
            Route::put('/password', [PengaturanController::class, 'updatePassword'])->name('password.update');
            Route::put('/2fa', [PengaturanController::class, 'toggleTwoFactor'])->name('2fa.toggle');
            Route::put('/preferensi', [PengaturanController::class, 'updatePreferences'])->name('preferensi.update');
            Route::delete('/nonaktifkan', [PengaturanController::class, 'deactivate'])->name('nonaktifkan');

            //notif push
            Route::post('/push-subscribe', [PengaturanController::class, 'updatePushSubscription'])->name('push.subscribe');
            Route::post('/push-unsubscribe', [PengaturanController::class, 'deletePushSubscription'])->name('push.unsubscribe');
        });
    });

/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleController::class, 'redirect'])
        ->name('auth.google');

    Route::get('auth/google/callback', [GoogleController::class, 'callback'])
        ->name('auth.google.callback');
});

require __DIR__ . '/auth.php';