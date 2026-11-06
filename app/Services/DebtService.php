<?php

namespace App\Services;

use App\Models\Debt;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DebtService
{
    /**
     * Get debts ordered by a specific strategy.
     *
     * @param  string  $strategy  'snowball' or 'avalanche'
     */
    public function getOrderedDebts(User $user, string $strategy): Collection
    {
        $query = $user->debts();

        switch ($strategy) {
            case 'snowball':
                // Smallest balance first
                $query->orderBy('amount', 'asc');
                break;
            case 'avalanche':
                // Highest interest rate first
                $query->orderBy('interest_rate', 'desc')
                    ->orderBy('amount', 'desc');
                break;
            default:
                // Default ordering
                $query->orderBy('date', 'desc');
                break;
        }

        return $query->get();
    }

    /**
     * Calculate the impact of an extra payment on a debt.
     * Uses a more realistic amortization approach.
     */
    public function calculateImpact(Debt $debt, float $extraAmount): array
    {
        $balance = (float) $debt->amount;
        $annualRate = (float) ($debt->interest_rate ?? 0) / 100;
        $monthlyRate = $annualRate / 12;

        if ($balance <= 0) {
            return ['time_saved' => 0, 'interest_saved' => 0, 'new_balance' => 0];
        }

        $remainingInstallments = 1;
        if ($debt->total_installments && $debt->installment_number) {
            $remainingInstallments = max(1, $debt->total_installments - $debt->installment_number + 1);
        }

        // 1. Calculate current monthly payment (Price Table / Amortization)
        // PMT = P * [r * (1 + r)^n] / [(1 + r)^n - 1]
        if ($monthlyRate > 0) {
            $pmt = $balance * ($monthlyRate * pow(1 + $monthlyRate, $remainingInstallments)) / (pow(1 + $monthlyRate, $remainingInstallments) - 1);
        } else {
            $pmt = $balance / $remainingInstallments;
        }

        // 2. Simulate without extra payment to get total interest
        $totalInterestWithoutExtra = 0;
        $simBalance = $balance;
        for ($i = 0; $i < $remainingInstallments; $i++) {
            $interest = $simBalance * $monthlyRate;
            $totalInterestWithoutExtra += $interest;
            $simBalance = $simBalance + $interest - $pmt;
            if ($simBalance <= 0) {
                break;
            }
        }

        // 3. Simulate with extra payment applied at month 0/1
        $totalInterestWithExtra = 0;
        $simBalance = max(0, $balance - $extraAmount);
        $monthsWithExtra = 0;
        while ($simBalance > 0.01 && $monthsWithExtra < 600) {
            $monthsWithExtra++;
            $interest = $simBalance * $monthlyRate;
            $totalInterestWithExtra += $interest;
            $payment = min($simBalance + $interest, $pmt);
            $simBalance = $simBalance + $interest - $payment;
        }

        $timeSaved = max(0, $remainingInstallments - $monthsWithExtra);
        $interestSaved = max(0, $totalInterestWithoutExtra - $totalInterestWithExtra);

        return [
            'time_saved' => (int) $timeSaved,
            'interest_saved' => round($interestSaved, 2),
            'new_balance' => max(0, $balance - $extraAmount),
        ];
    }
}
