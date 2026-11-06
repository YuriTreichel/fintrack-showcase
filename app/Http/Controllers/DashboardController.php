<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $followedUserIds = $user->following()->pluck('users.id')->toArray();
            $userIds = array_merge([$user->id], $followedUserIds);

            $accounts = DB::table('accounts as a')
                ->whereIn('a.user_id', $userIds)
                ->leftJoin('users as u', 'a.user_id', '=', 'u.id')
                ->select('a.*', 'u.name as owner_name')
                ->get();
            $totalBalance = 0;

            foreach ($accounts as $account) {
                $income = DB::table('transactions')
                    ->where('ignore_in_reports', false)
                    ->where('account_id', $account->id)
                    ->whereNull('card_id')
                    ->where('type', 'Income')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $expense = DB::table('transactions')
                    ->where('ignore_in_reports', false)
                    ->where('account_id', $account->id)
                    ->whereNull('card_id')
                    ->whereIn('type', ['Expense', 'GoalDeposit'])
                    ->where('status', 'Paid')
                    ->sum('amount');

                $transferIn = DB::table('transactions')
                    ->where('ignore_in_reports', false)
                    ->where('to_account_id', $account->id)
                    ->where('type', 'Transfer')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $transferOut = DB::table('transactions')
                    ->where('ignore_in_reports', false)
                    ->where('account_id', $account->id)
                    ->where('type', 'Transfer')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $account->current_balance = $account->initial_balance + $income - $expense + $transferIn - $transferOut;
                $totalBalance += $account->current_balance;
            }

            $pendingIncome = DB::table('transactions')
                ->where('ignore_in_reports', false)
                ->whereIn('user_id', $userIds)
                ->where('type', 'Income')
                ->where('status', 'Pending')
                ->sum('amount');

            $pendingExpenses = DB::table('transactions')
                ->where('ignore_in_reports', false)
                ->whereIn('user_id', $userIds)
                ->whereNull('card_id')
                ->whereIn('type', ['Expense', 'GoalDeposit'])
                ->where('status', 'Pending')
                ->sum('amount');

            $forecast = $totalBalance + $pendingIncome - $pendingExpenses;

            $currentMonthExpenses = DB::table('transactions')
                ->where('ignore_in_reports', false)
                ->whereIn('user_id', $userIds)
                ->whereIn('type', ['Expense', 'GoalDeposit'])
                ->where('status', 'Paid')
                ->whereBetween('date', [
                    now()->startOfMonth()->toDateString(),
                    now()->endOfMonth()->toDateString(),
                ])
                ->sum('amount');

            $expensesByCategory = DB::table('transactions as t')
                ->join('categories as c', 't.category_id', '=', 'c.id')
                ->select('c.name', DB::raw('SUM(t.amount) as value'))
                ->where('t.ignore_in_reports', false)
                ->whereIn('t.user_id', $userIds)
                ->whereIn('t.type', ['Expense', 'GoalDeposit'])
                ->groupBy('c.name')
                ->get();

            $incomeByCategory = DB::table('transactions as t')
                ->join('categories as c', 't.category_id', '=', 'c.id')
                ->select('c.name', DB::raw('SUM(t.amount) as value'))
                ->where('t.ignore_in_reports', false)
                ->whereIn('t.user_id', $userIds)
                ->where('t.type', 'Income')
                ->groupBy('c.name')
                ->get();

            $transactions = DB::table('transactions as t')
                ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                ->select('t.*', 'c.name as category_name', 'c.icon as category_icon')
                ->where('t.ignore_in_reports', false)
                ->whereIn('t.user_id', $userIds)
                ->get();

            $driver = DB::getDriverName();
            $monthExpr = $driver === 'sqlite'
                ? "strftime('%Y-%m', date) as month"
                : "DATE_FORMAT(date, '%Y-%m') as month";

            $incomeVsExpenses = DB::table('transactions')
                ->select(
                    DB::raw($monthExpr),
                    DB::raw("SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type IN ('Expense', 'GoalDeposit') THEN amount ELSE 0 END) as expenses")
                )
                ->where('ignore_in_reports', false)
                ->whereIn('user_id', $userIds)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            return response()->json([
                'totalBalance' => $totalBalance,
                'forecast' => $forecast,
                'accounts' => $accounts,
                'transactions' => $transactions,
                'expensesByCategory' => $expensesByCategory,
                'incomeByCategory' => $incomeByCategory,
                'incomeVsExpenses' => $incomeVsExpenses,
                'currentMonthExpenses' => $currentMonthExpenses,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
