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
        Schema::table('user_assets', function (Blueprint $table) {
            $table->string('coin_id')->nullable()->after('asset_symbol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_assets', function (Blueprint $table) {
            $table->dropColumn('coin_id');
        });
    }
};
