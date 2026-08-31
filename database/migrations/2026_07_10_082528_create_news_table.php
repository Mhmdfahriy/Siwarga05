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
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            
            // Kolom tanggal acara
            $table->date('event_date')->nullable();
            $table->string('event_time')->nullable();
            $table->string('event_location')->nullable();
            
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('thumbnail')->nullable();
            
            // Ditambahkan untuk mengatasi error kolom published_at yang dicari oleh kueri
            $table->timestamp('published_at')->nullable();
            
            // Kolom status
            $table->string('status')->default('published');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};