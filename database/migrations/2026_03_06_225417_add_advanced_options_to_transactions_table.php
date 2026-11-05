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
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_fixed')->default(false);
            $table->boolean('is_repeated')->default(false);
            $table->integer('repeat_frequency')->nullable();
            $table->enum('repeat_period', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $table->integer('repeat_times')->nullable();
            $table->text('notes')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('ignore_in_reports')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'is_fixed',
                'is_repeated',
                'repeat_frequency',
                'repeat_period',
                'repeat_times',
                'notes',
                'tags',
                'ignore_in_reports'
            ]);
        });
    }
};
