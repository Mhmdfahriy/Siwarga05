<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            // Relasi & Data Utama Warga/Pengurus
            $table->foreignId('house_id')->nullable()->constrained('houses')->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->text('nik')->nullable();            
            $table->string('nik_hash', 64)->unique()->nullable();
            $table->string('no_hp')->nullable();
            $table->string('occupation')->nullable();
            $table->string('photo')->nullable();
            
            // Autentikasi & Google Login
            $table->string('google_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            
            // Role & Status (Sudah menggabungkan file add_super_admin_role & add_pindah_status)
            $table->enum('role', ['ketua_rt', 'sekretaris', 'bendahara', 'warga', 'super_admin'])->default('warga');
            $table->enum('status', ['aktif', 'ditolak', 'pindah'])->default('aktif');
            $table->string('alasan_penolakan')->nullable();
            
            // Preferensi Notifikasi & Privasi
            $table->boolean('notif_berita')->default(true);
            $table->boolean('notif_iuran')->default(true);
            $table->boolean('notif_laporan')->default(true);
            $table->json('notification_preferences')->nullable();
            $table->json('privacy_settings')->nullable();
            
            // Keamanan (2FA) & Status Akun
            $table->boolean('two_factor_enabled')->default(false);
            $table->text('two_factor_secret')->nullable();
            $table->timestamp('deactivated_at')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};