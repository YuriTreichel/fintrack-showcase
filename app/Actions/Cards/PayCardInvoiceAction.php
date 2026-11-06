<?php

namespace App\Actions\Cards;

use App\Models\Card;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PayCardInvoiceAction
{
    /**
     * Settles pending credit card transactions for a billing cycle
     * and generates an outflow Expense on the settlement account.
     *
     * @return array{settled_count: int, total_amount: float, payment_transaction: Transaction}
     */
    public function execute(User $user, Card $card, int $month, int $year, ?int $accountId = null): array
    {
        if ($card->user_id !== $user->id) {
            throw new InvalidArgumentException('Unauthorized card settlement attempt.');
        }

        $payingAccountId = $accountId ?? $card->account_id ?? $user->accounts()->first()?->id;

        return DB::transaction(function () use ($user, $card, $month, $year, $payingAccountId) {
            $startDate = Carbon::create($year, $month, $card->closing_day)->subMonth()->addDay();
            $endDate = Carbon::create($year, $month, $card->closing_day);

            $pendingTransactions = Transaction::where('card_id', $card->id)
                ->where('status', 'Pending')
                ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
                ->lockForUpdate()
                ->get();

            $totalAmount = (float) $pendingTransactions->sum('amount');

            if ($totalAmount <= 0) {
                throw new InvalidArgumentException('No pending transactions found for this billing cycle.');
            }

            // Mark card items as Paid
            $settledCount = Transaction::whereIn('id', $pendingTransactions->pluck('id'))
                ->update(['status' => 'Paid']);

            // Create ledger entry paying the invoice from the card's linked bank account
            $paymentTransaction = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $payingAccountId,
                'description' => "Invoice Payment - {$card->name} ({$month}/{$year})",
                'amount' => $totalAmount,
                'date' => now()->toDateString(),
                'type' => 'Expense',
                'status' => 'Paid',
                'ignore_in_reports' => false,
                'notes' => "Automatic invoice settlement for cycle {$startDate->format('M d')} to {$endDate->format('M d')}.",
            ]);

            return [
                'settled_count' => $settledCount,
                'total_amount' => $totalAmount,
                'payment_transaction' => $paymentTransaction,
            ];
        });
    }
}
