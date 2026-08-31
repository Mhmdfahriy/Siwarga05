<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dues_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->nullable()->unique();
            
            // Relasi Rumah & Metode Pembayaran
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            
            // Detail Pembayaran
            $table->decimal('total_amount', 12, 2);
            $table->string('proof_photo')->nullable();
            
            // Status & Verifikasi oleh Pengurus RT (Bendahara/Admin)
            $table->enum('status', ['menunggu_verifikasi', 'diverifikasi', 'ditolak'])->default('menunggu_verifikasi');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dues_payments');
    }
};