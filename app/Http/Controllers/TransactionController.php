<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $followedUserIds = $user->following()->pluck('users.id')->toArray();
            $userIds = array_merge([$user->id], $followedUserIds);

            $transactions = DB::table('transactions as t')
                ->whereIn('t.user_id', $userIds)
                ->leftJoin('accounts as a', 't.account_id', '=', 'a.id')
                ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                ->leftJoin('cards as crd', 't.card_id', '=', 'crd.id')
                ->leftJoin('goals as g', 't.goal_id', '=', 'g.id')
                ->leftJoin('users as u', 't.user_id', '=', 'u.id')
                ->select('t.*', 'a.name as account_name', 'c.name as category_name', 'c.icon as category_icon', 'crd.name as card_name', 'u.name as owner_name', 'g.name as goal_name')
                ->orderBy('t.date', 'desc')
                ->get();

            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'description' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'date' => 'required|date',
                'type' => 'required|in:Income,Expense,Transfer,GoalDeposit',
                'status' => 'required|in:Paid,Pending',
                'account_id' => 'required|exists:accounts,id',
                'to_account_id' => 'nullable|required_if:type,Transfer|exists:accounts,id',
                'category_id' => 'nullable|required_if:type,Income,Expense|exists:categories,id',
                'card_id' => 'nullable|exists:cards,id',
                'is_recurring' => 'nullable|boolean',
                'frequency' => 'nullable|in:daily,weekly,monthly,yearly',
                'total_installments' => 'nullable|integer|min:1',
                'is_fixed' => 'nullable|boolean',
                'is_repeated' => 'nullable|boolean',
                'repeat_frequency' => 'nullable|integer|min:1',
                'repeat_period' => 'nullable|in:daily,weekly,monthly,yearly',
                'repeat_times' => 'nullable|integer|min:1',
                'notes' => 'nullable|string',
                'tags' => 'nullable|string',
                'attachment' => 'nullable|file',
                'ignore_in_reports' => 'nullable|boolean',
                'goal_id' => 'nullable|exists:goals,id',
            ]);

            // Enforce account ownership to prevent IDOR
            $accountOwned = DB::table('accounts')->where('id', $data['account_id'])->where('user_id', Auth::id())->exists();
            if (! $accountOwned) {
                return response()->json([
                    'message' => 'The selected account id is invalid.',
                    'errors' => ['account_id' => ['The selected account is invalid or unauthorized.']],
                ], 422);
            }

            $data['user_id'] = Auth::id();

            // Regra de Negócio: Transações de Cartão de Crédito sempre nascem como 'Pending'
            // Elas só se tornam 'Paid' quando a fatura é paga via CardController@payInvoice
            if (! empty($data['card_id'])) {
                $data['status'] = 'Pending';
            }

            if ($request->hasFile('attachment')) {
                $data['attachment_path'] = $request->file('attachment')->store('attachments', 'public');
            }
            unset($data['attachment']);

            $booleanFields = ['is_recurring', 'is_fixed', 'is_repeated', 'ignore_in_reports'];
            foreach ($booleanFields as $field) {
                if (array_key_exists($field, $data)) {
                    $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
                }
            }

            // Fixed transactions automatically create 120 monthly instances (10 years)
            // This ensures they appear in all months
            if (isset($data['is_fixed']) && $data['is_fixed'] && ! (isset($data['is_repeated']) && $data['is_repeated'])) {
                $baseDate = Carbon::parse($data['date']);

                // Insert first record to get parent_id
                $firstData = array_merge($data, [
                    'status' => $data['status'],
                    'installment_number' => 1,
                    'total_installments' => 120,
                    'is_recurring' => 0,
                    'is_repeated' => 1,
                    'repeat_times' => 120,
                    'repeat_period' => 'monthly',
                    'repeat_frequency' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $parentId = DB::table('transactions')->insertGetId($firstData);
                $installments = [];

                // Create remaining 119 monthly installments
                for ($i = 2; $i <= 120; $i++) {
                    $date = $baseDate->copy()->addMonths($i - 1)->toDateString();
                    $installments[] = array_merge($data, [
                        'date' => $date,
                        'status' => 'Pending',
                        'installment_number' => $i,
                        'total_installments' => 120,
                        'is_recurring' => 0,
                        'is_repeated' => 1,
                        'repeat_times' => 120,
                        'repeat_period' => 'monthly',
                        'repeat_frequency' => 1,
                        'parent_id' => $parentId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('transactions')->insert($installments);

                return response()->json(['message' => 'Fixed transaction created with 120 monthly instances']);
            }

            if (isset($data['is_repeated']) && $data['is_repeated'] && isset($data['repeat_times']) && $data['repeat_times'] > 1) {
                $baseDate = Carbon::parse($data['date']);
                $period = $data['repeat_period'] ?? 'monthly';
                $freq = $data['repeat_frequency'] ?? 1;

                // Insert first record to get parent_id
                $firstData = array_merge($data, [
                    'status' => $data['status'],
                    'installment_number' => 1,
                    'total_installments' => $data['repeat_times'],
                    'is_recurring' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $parentId = DB::table('transactions')->insertGetId($firstData);
                $installments = [];

                for ($i = 2; $i <= $data['repeat_times']; $i++) {
                    $multiplier = ($i - 1) * $freq;
                    $date = $baseDate->copy();

                    if ($period === 'daily') {
                        $date->addDays($multiplier);
                    } elseif ($period === 'weekly') {
                        $date->addWeeks($multiplier);
                    } elseif ($period === 'yearly') {
                        $date->addYears($multiplier);
                    } else {
                        $date->addMonths($multiplier);
                    } // monthly default

                    $installments[] = array_merge($data, [
                        'date' => $date->toDateString(),
                        'status' => 'Pending',
                        'installment_number' => $i,
                        'total_installments' => $data['repeat_times'],
                        'is_recurring' => 0,
                        'parent_id' => $parentId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('transactions')->insert($installments);

                return response()->json(['message' => 'Repeated transactions created']);
            } elseif (isset($data['total_installments']) && $data['total_installments'] > 1) {
                $baseDate = Carbon::parse($data['date']);

                // Insert first record to get parent_id
                $firstData = array_merge($data, [
                    'installment_number' => 1,
                    'is_recurring' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $parentId = DB::table('transactions')->insertGetId($firstData);
                $installments = [];

                for ($i = 2; $i <= $data['total_installments']; $i++) {
                    $date = $baseDate->copy()->addMonths($i - 1)->toDateString();
                    $installments[] = array_merge($data, [
                        'date' => $date,
                        'status' => 'Pending',
                        'installment_number' => $i,
                        'is_recurring' => 0,
                        'parent_id' => $parentId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('transactions')->insert($installments);

                return response()->json(['message' => 'Installments created']);
            }

            $id = DB::table('transactions')->insertGetId($data);

            if (isset($data['goal_id'])) {
                $this->updateGoalBalance($data['goal_id'], $data['amount']);
            }

            $tx = Transaction::with(['account', 'toAccount', 'category', 'card'])->find($id);

            return response()->json([
                'id' => $id,
                'data' => $tx ? (new TransactionResource($tx))->resolve() : null,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $mode = $request->query('mode', 'only');

            $transaction = DB::table('transactions')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (! $transaction) {
                return response()->json(['error' => 'Transaction not found or unauthorized'], 404);
            }

            $data = $request->validate([
                'description' => 'sometimes|required|string|max:255',
                'amount' => 'sometimes|required|numeric',
                'date' => 'sometimes|required|date',
                'type' => 'sometimes|required|in:Income,Expense,Transfer,GoalDeposit',
                'status' => 'sometimes|required|in:Paid,Pending',
                'account_id' => 'sometimes|required|exists:accounts,id',
                'to_account_id' => 'nullable|required_if:type,Transfer|exists:accounts,id',
                'category_id' => 'nullable|required_if:type,Income,Expense|exists:categories,id',
                'card_id' => 'nullable|exists:cards,id',
                'is_fixed' => 'nullable|boolean',
                'is_repeated' => 'nullable|boolean',
                'repeat_frequency' => 'nullable|integer|min:1',
                'repeat_period' => 'nullable|in:daily,weekly,monthly,yearly',
                'repeat_times' => 'nullable|integer|min:1',
                'notes' => 'nullable|string',
                'tags' => 'nullable|string',
                'attachment' => 'nullable|file',
                'ignore_in_reports' => 'nullable|boolean',
                'goal_id' => 'nullable|exists:goals,id',
            ]);

            if ($request->hasFile('attachment')) {
                $data['attachment_path'] = $request->file('attachment')->store('attachments', 'public');
            }
            unset($data['attachment']);

            $booleanFields = ['is_recurring', 'is_fixed', 'is_repeated', 'ignore_in_reports'];
            foreach ($booleanFields as $field) {
                if (array_key_exists($field, $data)) {
                    $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
                }
            }

            // Regra de Negócio: Transações de Cartão de Crédito sempre são 'Pending'
            if (! empty($data['card_id'])) {
                $data['status'] = 'Pending';
            }

            $updated = DB::table('transactions')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->update($data);

            if ($mode === 'all_pending' && $transaction->parent_id) {
                $bulkData = $data;
                unset($bulkData['date']);
                unset($bulkData['installment_number']);
                unset($bulkData['status']); // Keep statuses of others as they are (all are 'Pending' anyway due to the where clause below)

                DB::table('transactions')
                    ->where('parent_id', $transaction->parent_id)
                    ->where('user_id', Auth::id())
                    ->where('status', 'Pending')
                    ->where('date', '>=', $transaction->date)
                    ->where('id', '!=', $id)
                    ->update($bulkData);
            }

            // Update Goal balances if goal_id or amount changed
            if (isset($data['goal_id']) || isset($data['amount'])) {
                // If goal_id changed
                if (isset($data['goal_id']) && $data['goal_id'] != $transaction->goal_id) {
                    // Remove from old goal
                    if ($transaction->goal_id) {
                        $this->updateGoalBalance($transaction->goal_id, -$transaction->amount);
                    }
                    // Add to new goal
                    if ($data['goal_id']) {
                        $this->updateGoalBalance($data['goal_id'], $data['amount'] ?? $transaction->amount);
                    }
                }
                // If only amount changed and it's the same goal
                elseif (isset($data['amount']) && $transaction->goal_id && (! isset($data['goal_id']) || $data['goal_id'] == $transaction->goal_id)) {
                    $delta = $data['amount'] - $transaction->amount;
                    $this->updateGoalBalance($transaction->goal_id, $delta);
                }
            }

            return response()->json(['success' => true]);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $mode = $request->query('mode', 'only');

            $transaction = DB::table('transactions')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->first();

            if (! $transaction) {
                return response()->json(['error' => 'Not found or unauthorized'], 404);
            }

            if ($mode === 'all' && $transaction->parent_id) {
                DB::table('transactions')
                    ->where('parent_id', $transaction->parent_id)
                    ->where('user_id', Auth::id())
                    ->delete();
            } elseif ($mode === 'all_pending' && $transaction->parent_id) {
                DB::table('transactions')
                    ->where('parent_id', $transaction->parent_id)
                    ->where('user_id', Auth::id())
                    ->where('status', 'Pending')
                    ->where('date', '>=', $transaction->date)
                    ->delete();
            } else {
                DB::table('transactions')
                    ->where('id', $id)
                    ->where('user_id', Auth::id())
                    ->delete();

                if ($transaction->goal_id) {
                    $this->updateGoalBalance($transaction->goal_id, -$transaction->amount);
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $data = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'integer',
            ]);

            $userId = Auth::id();
            $ids = $data['ids'];

            DB::beginTransaction();

            // Buscar transações que pertencem ao usuário autenticado para processar metas antes de deletar
            $transactions = DB::table('transactions')
                ->whereIn('id', $ids)
                ->where('user_id', $userId)
                ->get();

            if ($transactions->isEmpty()) {
                DB::rollBack();

                return response()->json(['error' => 'Nenhuma transação encontrada ou autorizada para exclusão.'], 404);
            }

            // Atualizar saldo de metas se houver goal_id associado
            foreach ($transactions as $transaction) {
                if ($transaction->goal_id) {
                    $this->updateGoalBalance($transaction->goal_id, -$transaction->amount);
                }
            }

            $deletedCount = DB::table('transactions')
                ->whereIn('id', $transactions->pluck('id'))
                ->where('user_id', $userId)
                ->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'deleted_count' => $deletedCount,
                'message' => "{$deletedCount} transações excluídas com sucesso.",
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();

            return response()->json(['error' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function updateGoalBalance($goalId, $amountDelta)
    {
        if (! $goalId) {
            return;
        }

        DB::table('goals')
            ->where('id', $goalId)
            ->where('user_id', Auth::id())
            ->increment('current_amount', $amountDelta);
    }
}
