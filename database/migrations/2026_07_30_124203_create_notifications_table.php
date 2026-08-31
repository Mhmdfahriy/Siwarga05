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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            // house_id sudah langsung dibuat nullable di sini
            $table->foreignId('house_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('category'); // keuangan | berita | laporan | sistem
            $table->string('title');
            $table->text('message');

            $table->nullableMorphs('notifiable'); // relasi opsional ke Iuran/Laporan/dll

            // Kolom recipient_role dipindah ke sini agar rapi sebelum indeks
            $table->string('recipient_role')->nullable(); 

            $table->json('actions')->nullable(); // tombol aksi dinamis

            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Kumpulan Index
            $table->index(['house_id', 'category']);
            $table->index(['house_id', 'read_at']);
            $table->index(['recipient_role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};