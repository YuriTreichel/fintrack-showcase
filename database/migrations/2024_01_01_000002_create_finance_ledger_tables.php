<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['Cash', 'Bank', 'Savings', 'Investment'])->default('Bank');
            $table->decimal('initial_balance', 15, 2)->default(0.00);
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_main')->default(false);
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['Income', 'Expense'])->default('Expense');
            $table->string('icon', 50)->nullable();
            $table->string('color', 20)->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('credit_limit', 15, 2)->default(0.00);
            $table->unsignedTinyInteger('closing_day');
            $table->unsignedTinyInteger('due_day');
            $table->foreignId('account_id')->constrained('accounts')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0.00);
            $table->date('deadline')->nullable();
            $table->string('color', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->enum('type', ['Income', 'Expense', 'Transfer', 'GoalDeposit']);
            $table->enum('status', ['Paid', 'Pending'])->default('Paid');

            // Relational references
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('to_account_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('card_id')->nullable()->constrained('cards')->nullOnDelete();
            $table->foreignId('goal_id')->nullable()->constrained('goals')->nullOnDelete();

            // Installments and recurring patterns
            $table->foreignId('parent_id')->nullable()->constrained('transactions')->cascadeOnDelete();
            $table->boolean('is_recurring')->default(false);
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $table->unsignedInteger('installment_number')->nullable();
            $table->unsignedInteger('total_installments')->nullable();
            $table->boolean('ignore_in_reports')->default(false);
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for fast analytical aggregation & ledger queries
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'status']);
            $table->index(['card_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('goals');
        Schema::dropIfExists('cards');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('accounts');
    }
};
