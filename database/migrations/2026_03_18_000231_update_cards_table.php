<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Adiciona Limite e Bandeira
            $table->decimal('limit', 15, 2)->default(0)->after('name');
            $table->string('brand')->nullable()->after('limit');
            
            // Remove a ligação rígida com a conta bancária
            if (Schema::hasColumn('cards', 'account_id')) {
                $table->dropForeign(['account_id']);
                $table->dropColumn('account_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['limit', 'brand']);
            $table->foreignId('account_id')->nullable()->constrained('accounts')->onDelete('cascade');
        });
    }
};