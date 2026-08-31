<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dues_payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dues_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('due_id')->constrained('dues')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['dues_payment_id', 'due_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dues_payment_items');
    }
};