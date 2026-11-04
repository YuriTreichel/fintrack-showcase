<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\CreateTransactionAction;
use App\Models\Account;
use App\Models\Category;
use App\Services\AI\TransactionAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionAIController extends Controller
{
    /**
     * Parse natural language input via AI and optionally persist it immediately.
     */
    public function parse(Request $request, TransactionAIService $aiService): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'max:500'],
            'history' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $categories = Category::where('user_id', $user->id)->pluck('name')->toArray();

        $result = $aiService->parseNaturalLanguage($validated['text'], $validated['history'] ?? [], $categories);

        if (! $result) {
            return response()->json([
                'error' => 'Unable to parse transaction using AI engine.',
            ], 422);
        }

        // If the LLM returned a clarification prompt back to user
        if (! empty($result['question'])) {
            return response()->json([
                'status' => 'needs_clarification',
                'question' => $result['question'],
                'draft' => $result,
            ]);
        }

        // Match category & default account
        $matchedCategory = ! empty($result['suggested_category'])
            ? Category::where('user_id', $user->id)
                ->where('name', 'LIKE', '%'.$result['suggested_category'].'%')
                ->first()
            : null;

        $defaultAccount = Account::where('user_id', $user->id)->where('is_main', true)->first()
            ?? Account::where('user_id', $user->id)->first();

        return response()->json([
            'status' => 'parsed',
            'transaction' => [
                'description' => $result['description'] ?? $validated['text'],
                'amount' => $result['amount'],
                'date' => $result['date'] ?? now()->toDateString(),
                'type' => $result['type'] ?? 'Expense',
                'category_id' => $matchedCategory?->id,
                'category_name' => $matchedCategory?->name,
                'account_id' => $defaultAccount?->id,
                'account_name' => $defaultAccount?->name,
            ],
        ]);
    }

    /**
     * Confirms and persists the parsed AI draft into the ledger.
     */
    public function confirm(Request $request, CreateTransactionAction $createAction): JsonResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
            'type' => ['required', 'in:Income,Expense'],
            'account_id' => ['required', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $validated['status'] = 'Paid';

        $transaction = $createAction->execute($request->user(), $validated);

        return response()->json([
            'message' => 'Transaction created from AI input successfully.',
            'transaction' => $transaction,
        ], 201);
    }
}
