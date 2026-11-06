<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Card;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Criar Usuário
        $user = User::updateOrCreate(
            ['email' => 'demo@fintrack.com.br'],
            [
                'name' => 'Usuário Demo',
                'password' => Hash::make('password123'),
                'plan' => 'premium',
                'trial_ends_at' => Carbon::now()->addDays(14),
                'subscription_status' => 'active',
                'tour_completed' => true,
            ]
        );

        // Limpar dados antigos
        $user->transactions()->delete();
        $user->cards()->delete();
        $user->accounts()->delete();
        $user->categories()->delete();
        $user->goals()->delete();
        $user->budgets()->delete();

        // 2. Contas
        $nubank = Account::create(['user_id' => $user->id, 'name' => 'Nubank', 'type' => 'Bank', 'initial_balance' => 2500.50, 'currency' => 'BRL']);
        $itau = Account::create(['user_id' => $user->id, 'name' => 'Itaú', 'type' => 'Bank', 'initial_balance' => 8400.00, 'currency' => 'BRL']);
        $cash = Account::create(['user_id' => $user->id, 'name' => 'Dinheiro', 'type' => 'Cash', 'initial_balance' => 350.00, 'currency' => 'BRL']);

        // 3. Categorias
        $categories = [
            ['name' => 'Alimentação', 'type' => 'Expense', 'icon' => 'Utensils'],
            ['name' => 'Transporte', 'type' => 'Expense', 'icon' => 'Car'],
            ['name' => 'Lazer', 'type' => 'Expense', 'icon' => 'Gamepad2'],
            ['name' => 'Saúde', 'type' => 'Expense', 'icon' => 'Heart'],
            ['name' => 'Educação', 'type' => 'Expense', 'icon' => 'Book'],
            ['name' => 'Moradia', 'type' => 'Expense', 'icon' => 'Home'],
            ['name' => 'Salário', 'type' => 'Income', 'icon' => 'Wallet'],
            ['name' => 'Investimentos', 'type' => 'Income', 'icon' => 'TrendingUp'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['name']] = Category::create([
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
                'icon' => $cat['icon'],
            ]);
        }

        // 4. Cartões
        $card = Card::create([
            'user_id' => $user->id,
            'name' => 'Visa Platinum',
            'brand' => 'Visa',
            'limit' => 5000,
            'closing_day' => 5,
            'due_day' => 12,
        ]);

        // 5. Metas
        Goal::create([
            'user_id' => $user->id,
            'name' => 'Viagem Europa',
            'target_amount' => 15000,
            'current_amount' => 4500,
            'deadline' => Carbon::now()->addYear(),
            'color' => '#98e5dd',
            'icon' => 'Plane',
        ]);

        // 6. Planejamento (Budgets)
        Budget::create([
            'user_id' => $user->id,
            'category_id' => $catModels['Alimentação']->id,
            'name' => 'Alimentação Mensal',
            'amount' => 1200,
            'period' => 'monthly',
        ]);

        // 7. Transações fictícias
        // Receita
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $itau->id,
            'category_id' => $catModels['Salário']->id,
            'description' => 'Salário Mensal',
            'amount' => 12000,
            'date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
            'type' => 'Income',
            'status' => 'Paid',
        ]);

        // Despesas Fixas
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $nubank->id,
            'category_id' => $catModels['Moradia']->id,
            'description' => 'Aluguel Apartamento',
            'amount' => 2500,
            'date' => Carbon::now()->startOfMonth()->addDays(5)->format('Y-m-d'),
            'type' => 'Expense',
            'status' => 'Paid',
        ]);

        // Despesas Variáveis
        $descriptions = ['Mercado Extra', 'Uber', 'Ifood', 'Posto Shell', 'Farmácia', 'Cinema', 'Netflix', 'Spotify'];
        for ($i = 0; $i < 15; $i++) {
            $desc = $descriptions[array_rand($descriptions)];
            $catName = 'Lazer';
            if (str_contains($desc, 'Mercado') || str_contains($desc, 'Ifood')) {
                $catName = 'Alimentação';
            }
            if (str_contains($desc, 'Uber') || str_contains($desc, 'Posto')) {
                $catName = 'Transporte';
            }

            Transaction::create([
                'user_id' => $user->id,
                'account_id' => rand(0, 1) ? $nubank->id : $itau->id,
                'category_id' => $catModels[$catName]->id,
                'description' => $desc,
                'amount' => rand(20, 450),
                'date' => Carbon::now()->subDays(rand(1, 25))->format('Y-m-d'),
                'type' => 'Expense',
                'status' => 'Paid',
            ]);
        }
    }
}
