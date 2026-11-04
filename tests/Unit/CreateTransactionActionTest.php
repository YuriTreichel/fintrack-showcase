<?php

namespace Tests\Unit;

use App\Actions\Transactions\CreateTransactionAction;
use App\Models\Account;
use App\Models\Card;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateTransactionActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_atomic_installment_series_with_exact_split(): void
    {
        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Primary Checking',
            'type' => 'Bank',
            'initial_balance' => 1000.00,
            'currency' => 'USD',
        ]);

        $action = new CreateTransactionAction;

        $parent = $action->execute($user, [
            'description' => 'Smartphone Purchase',
            'amount' => 100.00,
            'date' => '2026-05-01',
            'type' => 'Expense',
            'status' => 'Paid',
            'account_id' => $account->id,
            'total_installments' => 3,
            'frequency' => 'monthly',
        ]);

        $installments = Transaction::where('parent_id', $parent->id)->orderBy('installment_number')->get();

        $this->assertCount(3, $installments);
        $this->assertEquals(33.34, (float) $installments[0]->amount); // Rounding adjustment on 1st
        $this->assertEquals(33.33, (float) $installments[1]->amount);
        $this->assertEquals(33.33, (float) $installments[2]->amount);
        $this->assertEquals('2026-05-01', $installments[0]->date->format('Y-m-d'));
        $this->assertEquals('2026-06-01', $installments[1]->date->format('Y-m-d'));
        $this->assertEquals('2026-07-01', $installments[2]->date->format('Y-m-d'));
    }

    public function test_credit_card_transaction_is_enforced_as_pending(): void
    {
        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Bank Account',
            'type' => 'Bank',
            'initial_balance' => 500,
        ]);
        $card = Card::create([
            'user_id' => $user->id,
            'name' => 'Gold Card',
            'credit_limit' => 2000,
            'closing_day' => 10,
            'due_day' => 17,
            'account_id' => $account->id,
        ]);

        $action = new CreateTransactionAction;

        $tx = $action->execute($user, [
            'description' => 'Coffee on Credit Card',
            'amount' => 15.00,
            'date' => '2026-05-02',
            'type' => 'Expense',
            'status' => 'Paid', // Intentionally requested as Paid
            'account_id' => $account->id,
            'card_id' => $card->id,
        ]);

        // Business rule asserts it must remain Pending until invoice liquidation
        $this->assertEquals('Pending', $tx->status);
    }
}
