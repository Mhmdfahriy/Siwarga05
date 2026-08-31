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
        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->string('block_number');
            $table->decimal('land_size', 8, 2)->nullable();
            $table->decimal('building_size', 8, 2)->nullable();
            
            // Pilihan final langsung bersih tanpa default
            $table->enum('ownership_status', ['milik_sendiri', 'kontrakan', 'kost'])->nullable();
            
            $table->date('resident_since')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('houses');
    }
};