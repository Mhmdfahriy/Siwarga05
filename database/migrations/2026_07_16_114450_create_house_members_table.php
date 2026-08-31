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
        Schema::create('house_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained('houses')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Kolom Data Diri Anggota Keluarga
            $table->string('name');
            $table->string('photo')->nullable();
            
            $table->enum('relation_type', [
                'kepala_keluarga', 'istri', 'suami', 'anak', 
                'kakek', 'nenek', 'kakak', 'adik', 'lainnya'
            ]);
            
            $table->text('nik')->nullable(); 
            $table->string('nik_hash')->nullable()->unique(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('house_members');
    }
};