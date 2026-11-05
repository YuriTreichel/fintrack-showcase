<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Debt;
use App\Services\DebtService;
use Carbon\Carbon;

class DebtController extends Controller
{
    protected $debtService;

    public function __construct(DebtService $debtService)
    {
        $this->debtService = $debtService;
    }

    public function index(Request $request)
    {
        $strategy = $request->query('strategy', 'default');
        return $this->debtService->getOrderedDebts($request->user(), $strategy);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'creditor' => 'nullable|string',
            'amount' => 'required|numeric',
            'original_amount' => 'nullable|numeric',
            'is_negotiated' => 'nullable|boolean',
            'interest_rate' => 'nullable|numeric',
            'date' => 'required|date',
            'status' => 'required|in:Paid,Pending',
            'observations' => 'nullable|string',
            'total_installments' => 'nullable|integer|min:1',
        ]);

        $totalInstallments = $validated['total_installments'] ?? 1;
        $user = $request->user();

        // Default original_amount to amount if not provided
        if (!isset($validated['original_amount'])) {
            $validated['original_amount'] = $validated['amount'];
        }

        if ($totalInstallments > 1) {
            $parentDebt = null;
            $debts = [];
            $date = Carbon::parse($validated['date']);

            for ($i = 1; $i <= $totalInstallments; $i++) {
                $debtData = [
                    'user_id' => $user->id,
                    'description' => $validated['description'],
                    'creditor' => $validated['creditor'],
                    'amount' => $validated['amount'],
                    'original_amount' => $validated['original_amount'] / $totalInstallments, // Pro-rated
                    'is_negotiated' => $validated['is_negotiated'] ?? false,
                    'interest_rate' => $validated['interest_rate'] ?? 0,
                    'date' => $date->copy()->addMonths($i - 1)->toDateString(),
                    'status' => $validated['status'],
                    'observations' => $validated['observations'],
                    'installment_number' => $i,
                    'total_installments' => $totalInstallments,
                    'parent_id' => $parentDebt ? $parentDebt->id : null,
                ];

                $debt = Debt::create($debtData);

                if ($i === 1) {
                    $parentDebt = $debt;
                }

                $debts[] = $debt;
            }

            return response()->json($debts, 201);
        }

        $debt = $user->debts()->create($validated);
        return response()->json($debt, 201);
    }

    public function update(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'description' => 'sometimes|string',
            'creditor' => 'sometimes|string|nullable',
            'amount' => 'sometimes|numeric',
            'original_amount' => 'sometimes|numeric|nullable',
            'is_negotiated' => 'sometimes|boolean',
            'interest_rate' => 'sometimes|numeric',
            'date' => 'sometimes|date',
            'status' => 'sometimes|in:Paid,Pending',
            'observations' => 'sometimes|string|nullable',
        ]);

        $debt->update($validated);
        return response()->json($debt);
    }

    public function calculateImpact(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'extra_amount' => 'required|numeric|min:0.01',
        ]);

        $impact = $this->debtService->calculateImpact($debt, $validated['extra_amount']);

        return response()->json($impact);
    }

    public function pay(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'card_id' => 'nullable|exists:cards,id',
            'notes' => 'nullable|string',
        ]);

        $transaction = \App\Models\Transaction::create([
            'user_id' => $request->user()->id,
            'description' => "Pagamento: {$debt->description}",
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'type' => 'Expense',
            'status' => 'Paid',
            'account_id' => $validated['account_id'],
            'category_id' => $validated['category_id'],
            'card_id' => $validated['card_id'] ?? null,
            'notes' => $validated['notes'] ?? "Pagamento registrado via Simulador de Dívidas.",
            'debt_id' => $debt->id,
        ]);

        // Se o valor pago for igual ou maior que o saldo, marca como pago
        if ($validated['amount'] >= $debt->amount) {
            $debt->update(['status' => 'Paid']);
        }

        return response()->json([
            'message' => 'Pagamento registrado com sucesso',
            'transaction' => $transaction,
            'debt' => $debt
        ]);
    }

    public function destroy(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $debt->delete();
        return response()->json(['message' => 'Debt deleted']);
    }
}
