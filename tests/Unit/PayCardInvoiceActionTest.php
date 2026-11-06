<?php

namespace Tests\Unit;

use App\Actions\Cards\PayCardInvoiceAction;
use App\Models\Account;
use App\Models\Card;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class PayCardInvoiceActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_settles_pending_transactions_and_creates_invoice_payment_entry(): void
    {
        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Main Checking',
            'type' => 'Bank',
            'initial_balance' => 5000.00,
            'currency' => 'USD',
        ]);

        $card = Card::create([
            'user_id' => $user->id,
            'name' => 'Sapphire Preferred',
            'limit' => 10000.00,
            'closing_day' => 15,
            'due_day' => 25,
        ]);

        // Transactions inside the cycle (closing day 15, month 5 -> cycle: April 16 to May 15)
        Transaction::create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'description' => 'Restaurant Dinner',
            'amount' => 120.50,
            'date' => '2026-05-02',
            'type' => 'Expense',
            'status' => 'Pending',
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'description' => 'Online Electronics',
            'amount' => 379.50,
            'date' => '2026-05-10',
            'type' => 'Expense',
            'status' => 'Pending',
        ]);

        // Transaction outside the cycle (after May 15)
        Transaction::create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'description' => 'Supermarket Next Month',
            'amount' => 85.00,
            'date' => '2026-05-18',
            'type' => 'Expense',
            'status' => 'Pending',
        ]);

        $action = new PayCardInvoiceAction;
        $result = $action->execute($user, $card, 5, 2026);

        $this->assertEquals(2, $result['settled_count']);
        $this->assertEquals(500.00, $result['total_amount']);
        $this->assertInstanceOf(Transaction::class, $result['payment_transaction']);
        $this->assertEquals(500.00, (float) $result['payment_transaction']->amount);
        $this->assertEquals('Paid', $result['payment_transaction']->status);
        $this->assertEquals($account->id, $result['payment_transaction']->account_id);

        // Assert pending items in the cycle were marked as Paid
        $this->assertEquals(2, Transaction::where('card_id', $card->id)->where('status', 'Paid')->count());

        // Assert transaction outside the cycle remains Pending
        $this->assertEquals(1, Transaction::where('card_id', $card->id)->where('status', 'Pending')->count());
    }

    public function test_it_throws_exception_when_unauthorized_user_attempts_settlement(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $account = Account::create([
            'user_id' => $owner->id,
            'name' => 'Owner Checking',
            'type' => 'Bank',
            'initial_balance' => 1000.00,
        ]);

        $card = Card::create([
            'user_id' => $owner->id,
            'name' => 'Owner Card',
            'limit' => 2000.00,
            'closing_day' => 10,
            'due_day' => 20,
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unauthorized card settlement attempt.');

        $action = new PayCardInvoiceAction;
        $action->execute($attacker, $card, 5, 2026);
    }

    public function test_it_throws_exception_when_no_pending_transactions_exist(): void
    {
        $user = User::factory()->create();
        $account = Account::create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'Bank',
            'initial_balance' => 1000.00,
        ]);

        $card = Card::create([
            'user_id' => $user->id,
            'name' => 'Card Without Expenses',
            'limit' => 2000.00,
            'closing_day' => 10,
            'due_day' => 20,
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('No pending transactions found for this billing cycle.');

        $action = new PayCardInvoiceAction;
        $action->execute($user, $card, 5, 2026);
    }
}
