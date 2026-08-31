<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['bulanan', 'insidental']);
            $table->unsignedTinyInteger('period_month')->nullable();
            $table->unsignedSmallInteger('period_year')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['belum_bayar', 'menunggu_verifikasi', 'lunas'])->default('belum_bayar');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['house_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dues');
    }
};