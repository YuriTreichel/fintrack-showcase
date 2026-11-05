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
        Schema::create('user_asset_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_asset_id')->constrained('user_assets')->onDelete('cascade');
            $table->decimal('quantity', 20, 8);
            $table->decimal('purchase_price', 15, 2);
            $table->string('currency')->default('BRL'); // BRL or USD
            $table->decimal('exchange_rate', 15, 4)->nullable(); // USD to BRL rate at time of purchase
            $table->timestamp('purchase_date')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_asset_purchases');
    }
};
