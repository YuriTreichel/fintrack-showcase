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
        Schema::table('budgets', function (Blueprint $table) {
            $table->boolean('is_fixed')->default(false)->after('amount');
            $table->enum('type', ['value', 'percentage'])->default('value')->after('is_fixed');
            $table->decimal('percentage_value', 10, 2)->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn(['is_fixed', 'type', 'percentage_value']);
        });
    }
};
