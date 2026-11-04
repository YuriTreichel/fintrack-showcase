<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\CreateTransactionAction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    /**
     * Display a paginated list of the user's ledger transactions.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user() ?? User::firstOrFail();

        $transactions = Transaction::query()
            ->where('user_id', $user->id)
            ->with(['account', 'toAccount', 'category', 'card'])
            ->when($request->query('month'), function ($query, $month) use ($request) {
                $year = $request->query('year', now()->year);
                $query->whereYear('date', $year)->whereMonth('date', $month);
            })
            ->when($request->query('type'), fn ($query, $type) => $query->where('type', $type))
            ->when($request->query('status'), fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 25));

        return TransactionResource::collection($transactions);
    }

    /**
     * Store a new transaction using atomic Single-Responsibility Action.
     */
    public function store(StoreTransactionRequest $request, CreateTransactionAction $createAction): JsonResponse
    {
        $transaction = $createAction->execute($request->user(), $request->validated());

        return (new TransactionResource($transaction->load(['account', 'toAccount', 'category', 'card'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Delete a transaction. If it belongs to an installment series, optionally deletes descendants.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->boolean('delete_all_installments') && $transaction->parent_id) {
            Transaction::where('parent_id', $transaction->parent_id)->delete();
        } else {
            $transaction->delete();
        }

        return response()->json(['message' => 'Transaction removed successfully.']);
    }
}
