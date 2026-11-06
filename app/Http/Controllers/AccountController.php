<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
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

            foreach ($accounts as $account) {
                $income = DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->whereNull('card_id')
                    ->where('type', 'Income')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $expense = DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->whereNull('card_id')
                    ->whereIn('type', ['Expense', 'GoalDeposit'])
                    ->where('status', 'Paid')
                    ->sum('amount');

                $transferIn = DB::table('transactions')
                    ->where('to_account_id', $account->id)
                    ->where('type', 'Transfer')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $transferOut = DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->where('type', 'Transfer')
                    ->where('status', 'Paid')
                    ->sum('amount');

                $account->current_balance = $account->initial_balance + $income - $expense + $transferIn - $transferOut;
            }

            return response()->json($accounts);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // Plano Básico: máximo de 2 contas
            if ($user->hasBasicPlan()) {
                $count = DB::table('accounts')->where('user_id', $user->id)->count();
                if ($count >= 2) {
                    return response()->json([
                        'message' => 'Você atingiu o limite de 2 contas bancárias do Plano Básico. Faça upgrade para o Plano Premium e cadastre contas ilimitadas!',
                        'requires_upgrade' => true,
                    ], 403);
                }
            }

            $data = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|in:Cash,Bank,Savings',
                'initial_balance' => 'numeric',
                'is_main' => 'sometimes|boolean',
            ]);
            $data['user_id'] = $user->id;

            $id = DB::transaction(function () use ($user, $data) {
                if (! empty($data['is_main'])) {
                    DB::table('accounts')->where('user_id', $user->id)->update(['is_main' => 0]);
                }

                return DB::table('accounts')->insertGetId($data);
            });

            return response()->json(['id' => $id]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|in:Cash,Bank,Savings',
                'initial_balance' => 'sometimes|numeric',
                'is_main' => 'sometimes|boolean',
            ]);

            DB::transaction(function () use ($id, $data) {
                if (isset($data['is_main']) && $data['is_main']) {
                    DB::table('accounts')->where('user_id', Auth::id())->update(['is_main' => 0]);
                }

                DB::table('accounts')
                    ->where('id', $id)
                    ->where('user_id', Auth::id())
                    ->update($data);
            });

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateBalance(Request $request, $id)
    {
        try {
            $data = $request->validate([
                'new_balance' => 'required|numeric',
                'create_transaction' => 'required|boolean',
            ]);

            $user = Auth::user();

            $account = DB::table('accounts')->where('id', $id)->where('user_id', $user->id)->first();
            if (! $account) {
                return response()->json(['error' => 'Account not found'], 404);
            }

            // Calculate current balance
            $income = DB::table('transactions')
                ->where('account_id', $id)
                ->whereNull('card_id')
                ->where('type', 'Income')
                ->where('status', 'Paid')
                ->sum('amount');

            $expense = DB::table('transactions')
                ->where('account_id', $id)
                ->whereNull('card_id')
                ->whereIn('type', ['Expense', 'GoalDeposit'])
                ->where('status', 'Paid')
                ->sum('amount');

            $transferIn = DB::table('transactions')
                ->where('to_account_id', $id)
                ->where('type', 'Transfer')
                ->where('status', 'Paid')
                ->sum('amount');

            $transferOut = DB::table('transactions')
                ->where('account_id', $id)
                ->where('type', 'Transfer')
                ->where('status', 'Paid')
                ->sum('amount');

            $current_balance = $account->initial_balance + $income - $expense + $transferIn - $transferOut;
            $difference = $data['new_balance'] - $current_balance;

            if (abs($difference) < 0.01) {
                return response()->json(['success' => true, 'message' => 'Saldo já está atualizado.']);
            }

            DB::transaction(function () use ($id, $user, $data, $difference, $account) {
                if ($data['create_transaction']) {
                    // Create adjustment transaction
                    DB::table('transactions')->insert([
                        'user_id' => $user->id,
                        'account_id' => $id,
                        'type' => $difference > 0 ? 'Income' : 'Expense',
                        'amount' => abs($difference),
                        'description' => 'Reajuste de Saldo',
                        'date' => now()->toDateString(),
                        'status' => 'Paid',
                        'is_recurring' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    // Just update initial balance so current_balance matches new_balance
                    DB::table('accounts')
                        ->where('id', $id)
                        ->update(['initial_balance' => $account->initial_balance + $difference]);
                }
            });

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('accounts')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->delete();

            if (! $deleted) {
                return response()->json(['error' => 'Account not found or unauthorized'], 404);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
