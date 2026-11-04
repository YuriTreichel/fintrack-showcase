<?php

namespace App\Actions\Transactions;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreateTransactionAction
{
    /**
     * Executes transaction creation inside an atomic database transaction.
     * Handles card logic, installments generation, and transfer consistency.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $data['user_id'] = $user->id;

            // Business Rule: Credit card transactions are ALWAYS born as 'Pending'
            // They are only settled when the credit card invoice is cleared.
            if (! empty($data['card_id'])) {
                $data['status'] = 'Pending';
            }

            $totalInstallments = isset($data['total_installments']) ? (int) $data['total_installments'] : 1;

            if ($totalInstallments > 1) {
                return $this->createInstallments($data, $totalInstallments);
            }

            return Transaction::create($data);
        });
    }

    /**
     * Creates master installment transaction and recurring future instances atomically.
     *
     * @param  array<string, mixed>  $data
     */
    private function createInstallments(array $data, int $totalInstallments): Transaction
    {
        $baseDate = Carbon::parse($data['date']);
        $originalAmount = (float) $data['amount'];
        $installmentAmount = round($originalAmount / $totalInstallments, 2);

        // Adjust rounding on first installment
        $roundingDiff = round($originalAmount - ($installmentAmount * $totalInstallments), 2);

        $firstData = array_merge($data, [
            'amount' => $installmentAmount + $roundingDiff,
            'installment_number' => 1,
            'total_installments' => $totalInstallments,
        ]);

        $parent = Transaction::create($firstData);
        $parent->update(['parent_id' => $parent->id]);

        $frequency = $data['frequency'] ?? 'monthly';

        for ($i = 2; $i <= $totalInstallments; $i++) {
            $installmentDate = match ($frequency) {
                'weekly' => $baseDate->copy()->addWeeks($i - 1),
                'yearly' => $baseDate->copy()->addYears($i - 1),
                default => $baseDate->copy()->addMonths($i - 1),
            };

            Transaction::create(array_merge($data, [
                'amount' => $installmentAmount,
                'date' => $installmentDate->toDateString(),
                'parent_id' => $parent->id,
                'installment_number' => $i,
                'total_installments' => $totalInstallments,
                'status' => ! empty($data['card_id']) ? 'Pending' : $data['status'],
            ]));
        }

        return $parent->fresh();
    }
}
