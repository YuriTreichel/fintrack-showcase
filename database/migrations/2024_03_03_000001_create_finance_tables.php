<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $account) {
            $account->id();
            $account->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $account->string('name');
            $account->enum('type', ['Cash', 'Bank', 'Savings']);
            $account->decimal('initial_balance', 15, 2)->default(0);
            $account->timestamps();
        });

        Schema::create('categories', function (Blueprint $category) {
            $category->id();
            $category->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $category->string('name');
            $category->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $category->timestamps();
        });

        Schema::create('cards', function (Blueprint $card) {
            $card->id();
            $card->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $card->string('name');
            $card->integer('closing_day')->nullable();
            $card->integer('due_day')->nullable();
            $card->foreignId('account_id')->constrained('accounts')->onDelete('cascade');
            $card->timestamps();
        });

        Schema::create('transactions', function (Blueprint $transaction) {
            $transaction->id();
            $transaction->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $transaction->string('description');
            $transaction->decimal('amount', 15, 2);
            $transaction->date('date');
            $transaction->enum('type', ['Income', 'Expense', 'Transfer']);
            $transaction->enum('status', ['Paid', 'Pending']);
            $transaction->foreignId('account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $transaction->foreignId('to_account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $transaction->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $transaction->foreignId('card_id')->nullable()->constrained('cards')->onDelete('set null');
            $transaction->boolean('is_recurring')->default(false);
            $transaction->enum('frequency', ['daily', 'weekly', 'monthly', 'yearly'])->nullable();
            $transaction->foreignId('parent_id')->nullable()->constrained('transactions')->onDelete('cascade');
            $transaction->integer('installment_number')->nullable();
            $transaction->integer('total_installments')->nullable();
            $transaction->string('attachment_path')->nullable();
            $transaction->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('cards');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('accounts');
    }
};
