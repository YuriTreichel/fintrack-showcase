<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_status',
                'subscription_ends_at',
                'plan',
                'stripe_id',
                'pm_type',
                'pm_last_four',
                'trial_ends_at'
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Recria os campos caso precise dar um rollback na migration
            $table->string('subscription_status')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->string('plan')->nullable();
            $table->string('stripe_id')->nullable();
            $table->string('pm_type')->nullable();
            $table->string('pm_last_four', 4)->nullable();
            $table->timestamp('trial_ends_at')->nullable();
        });
    }
};