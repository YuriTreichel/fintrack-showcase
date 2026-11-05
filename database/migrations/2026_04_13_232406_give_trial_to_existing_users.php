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
        // Concede 14 dias de teste para todos os usuários que não possuem assinatura ativa
        \App\Models\User::where(function($query) {
            $query->whereNull('subscription_status')
                  ->orWhere('subscription_status', '!=', 'active');
        })->update([
            'trial_ends_at' => now()->addDays(14),
            'subscription_status' => 'trialing',
            'plan' => 'premium'
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Opcional: remover o trial se necessário
    }
};
