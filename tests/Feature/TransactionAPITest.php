<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionAPITest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_transaction_via_api(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Main Bank',
            'type' => 'Bank',
            'initial_balance' => 2000,
            'currency' => 'USD',
        ]);

        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Groceries',
            'type' => 'Expense',
        ]);

        $payload = [
            'description' => 'Weekly Supermarket',
            'amount' => 125.50,
            'date' => now()->toDateString(),
            'type' => 'Expense',
            'status' => 'Paid',
            'account_id' => $account->id,
            'category_id' => $category->id,
        ];

        $response = $this->postJson('/api/transactions', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.description', 'Weekly Supermarket')
            ->assertJsonPath('data.amount', 125.5)
            ->assertJsonPath('data.account.name', 'Main Bank')
            ->assertJsonPath('data.category.name', 'Groceries');

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'description' => 'Weekly Supermarket',
            'amount' => 125.50,
        ]);
    }

    public function test_ai_parser_endpoint_returns_structured_fallback_when_offline(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/ai/parse', [
            'text' => 'Uber ride to airport $45.00',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'parsed')
            ->assertJsonPath('transaction.amount', 45);
    }
}
