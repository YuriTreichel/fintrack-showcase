<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->decimal('original_amount', 15, 2)->nullable()->after('amount');
            $table->boolean('is_negotiated')->default(false)->after('original_amount');
            $table->decimal('interest_rate', 5, 2)->default(0.00)->comment('Monthly interest rate (%)')->after('is_negotiated');
        });

        // Populate original_amount for existing records
        DB::table('debts')->update(['original_amount' => DB::raw('amount')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->dropColumn(['original_amount', 'is_negotiated', 'interest_rate']);
        });
    }
};
