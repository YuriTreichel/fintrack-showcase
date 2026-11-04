<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FinancialLedgerService
{
    /**
     * Calculates user net worth and liquidity across all active accounts.
     *
     * @return array<string, mixed>
     */
    public function calculateOverview(User $user): array
    {
        $accounts = Account::where('user_id', $user->id)->get();
        $totalBalance = $accounts->sum(fn (Account $acc) => $acc->calculated_balance);

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();

        $monthTransactions = Transaction::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->where('status', 'Paid')
            ->where('ignore_in_reports', false)
            ->get();

        $monthlyIncome = (float) $monthTransactions->where('type', 'Income')->sum('amount');
        $monthlyExpense = (float) $monthTransactions->where('type', 'Expense')->sum('amount');
        $monthlySavings = $monthlyIncome - $monthlyExpense;
        $savingsRate = $monthlyIncome > 0 ? round(($monthlySavings / $monthlyIncome) * 100, 2) : 0;

        return [
            'net_worth' => round($totalBalance, 2),
            'monthly_income' => round($monthlyIncome, 2),
            'monthly_expense' => round($monthlyExpense, 2),
            'monthly_savings' => round($monthlySavings, 2),
            'savings_rate_pct' => $savingsRate,
            'accounts_count' => $accounts->count(),
        ];
    }

    /**
     * Aggregates expenses by category for visualization.
     *
     * @return Collection<int, array{name: string, color: string, total: float}>
     */
    public function getCategoryDistribution(User $user, ?int $month = null, ?int $year = null): Collection
    {
        $month = $month ?? Carbon::now()->month;
        $year = $year ?? Carbon::now()->year;

        $startDate = Carbon::create($year, $month, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();

        return Transaction::query()
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'Expense')
            ->where('transactions.status', 'Paid')
            ->where('transactions.ignore_in_reports', false)
            ->whereBetween('transactions.date', [$startDate, $endDate])
            ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => (string) $row->name,
                'color' => (string) ($row->color ?? '#6366f1'),
                'total' => (float) $row->total,
            ]);
    }
}
