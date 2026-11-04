<?php

namespace Database\Seeders;

use App\Actions\Transactions\CreateTransactionAction;
use App\Models\Account;
use App\Models\Card;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Alexandre Vance',
            'email' => 'demo@fintrack.dev',
            'password' => Hash::make('secret123'),
            'currency' => 'USD',
        ]);

        // Main Accounts
        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Chase Premier Checking',
            'type' => 'Bank',
            'initial_balance' => 5400.00,
            'currency' => 'USD',
            'is_main' => true,
        ]);

        $savings = Account::create([
            'user_id' => $user->id,
            'name' => 'High-Yield Savings (HYSA)',
            'type' => 'Savings',
            'initial_balance' => 12500.00,
            'currency' => 'USD',
            'is_main' => false,
        ]);

        // Categories
        $categories = [
            ['name' => 'Salary & Consulting', 'type' => 'Income', 'color' => '#10b981', 'icon' => 'banknotes'],
            ['name' => 'Housing & Rent', 'type' => 'Expense', 'color' => '#ef4444', 'icon' => 'home'],
            ['name' => 'Dining & Groceries', 'type' => 'Expense', 'color' => '#f59e0b', 'icon' => 'shopping-cart'],
            ['name' => 'Tech & Subscriptions', 'type' => 'Expense', 'color' => '#6366f1', 'icon' => 'laptop'],
            ['name' => 'Investments', 'type' => 'Expense', 'color' => '#06b6d4', 'icon' => 'chart-bar'],
        ];

        $createdCats = [];
        foreach ($categories as $cat) {
            $createdCats[$cat['name']] = Category::create(array_merge($cat, ['user_id' => $user->id]));
        }

        // Credit Card
        $card = Card::create([
            'user_id' => $user->id,
            'name' => 'Amex Platinum',
            'credit_limit' => 15000.00,
            'closing_day' => 20,
            'due_day' => 27,
            'account_id' => $checking->id,
        ]);

        // Seed realistic ledger transactions via Action
        $action = new CreateTransactionAction;

        // 1. Regular Monthly Income
        $action->execute($user, [
            'description' => 'Principal Software Engineer Contract',
            'amount' => 7500.00,
            'date' => now()->startOfMonth()->toDateString(),
            'type' => 'Income',
            'status' => 'Paid',
            'account_id' => $checking->id,
            'category_id' => $createdCats['Salary & Consulting']->id,
        ]);

        // 2. Fixed Housing Expense
        $action->execute($user, [
            'description' => 'Apartment Lease Payment',
            'amount' => 2100.00,
            'date' => now()->startOfMonth()->addDays(2)->toDateString(),
            'type' => 'Expense',
            'status' => 'Paid',
            'account_id' => $checking->id,
            'category_id' => $createdCats['Housing & Rent']->id,
        ]);

        // 3. 3-Month Installment via Card
        $action->execute($user, [
            'description' => 'MacBook Pro M3 Max (3x Installment)',
            'amount' => 3600.00,
            'date' => now()->subDays(5)->toDateString(),
            'type' => 'Expense',
            'status' => 'Pending',
            'account_id' => $checking->id,
            'card_id' => $card->id,
            'category_id' => $createdCats['Tech & Subscriptions']->id,
            'total_installments' => 3,
            'frequency' => 'monthly',
        ]);
    }
}
