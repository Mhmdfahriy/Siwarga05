<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporans', function (Blueprint $table) {
            $table->id();
            
            // Warga yang melapor
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Pengurus RT yang ditugaskan menangani laporan (cukup pilih salah satu: assigned_to atau petugas_id)
            $table->foreignId('assigned_to')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('judul');
            $table->enum('kategori', ['infrastruktur', 'keamanan', 'sosial', 'kebersihan', 'keuangan', 'lainnya']);
            $table->text('deskripsi');
            $table->string('foto')->nullable();
            $table->string('lokasi')->nullable();
            
            $table->enum('status', ['pending', 'diproses', 'selesai', 'ditolak'])
                  ->default('pending');
                  
            $table->text('alasan_penolakan')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporans');
    }
};