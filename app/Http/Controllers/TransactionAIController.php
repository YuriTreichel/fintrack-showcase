<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TransactionAIService;
use App\Models\Category;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionAIController extends Controller
{
    /**
     * Parse text via AI and create transaction(s).
     */
    public function store(Request $request, TransactionAIService $aiService)
    {
        $request->validate([
            'text' => 'required|string',
            'history' => 'nullable|array'
        ]);

        $result = $aiService->parseTextToTransaction($request->text, $request->history ?? []);

        if (!$result) {
            return response()->json(['error' => 'Falha ao processar o texto com a Inteligência Artificial.'], 500);
        }

        // Se a IA tiver uma pergunta de esclarecimento, retornamos para a UI
        if (!empty($result['question'])) {
            return response()->json(['question' => $result['question']]);
        }

        // Tentar encontrar uma categoria correspondente para o usuário
        $category = Category::where('user_id', Auth::id())
            ->where('name', 'LIKE', '%' . ($result['suggested_category'] ?? '') . '%')
            ->first();

        // Tentar encontrar a conta principal ou a primeira disponível
        $account = Account::where('user_id', Auth::id())->where('is_main', true)->first()
                ?? Account::where('user_id', Auth::id())->first();

        if (!$account) {
            return response()->json(['error' => 'Nenhuma conta encontrada para o usuário.'], 400);
        }

        // Validação básica dos dados obrigatórios retornados pela IA
        if (!isset($result['amount']) && empty($result['question'])) {
            return response()->json(['question' => 'Entendi o que você quer fazer, mas qual seria o valor dessa transação?']);
        }

        // Preparar os dados para inserção
        $data = [
            'user_id' => Auth::id(),
            'description' => $result['description'] ?? 'Transação via IA',
            'amount' => $result['amount'] ?? 0,
            'date' => $result['date'] ?? now()->format('Y-m-d'),
            'type' => ucfirst($result['type'] ?? 'Expense'),
            'status' => ucfirst($result['status'] ?? 'Paid'),
            'category_id' => $category?->id,
            'account_id' => $account->id,
            'is_fixed' => $result['is_fixed'] ?? false,
            'total_installments' => $result['total_installments'] ?? 1,
            'notes' => $result['notes'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        try {
            DB::beginTransaction();

            // Logica para transações fixas (Repetir 120 meses)
            if ($data['is_fixed']) {
                $groupId = time() . rand(100, 999);
                $installments = [];
                for ($i = 1; $i <= 120; $i++) {
                    $multiplier = ($i - 1);
                    $date = date('Y-m-d', strtotime($data['date'] . " + {$multiplier} months"));
                    $installments[] = array_merge($data, [
                        'date' => $date,
                        'status' => $i === 1 ? $data['status'] : 'Pending',
                        'installment_number' => $i,
                        'total_installments' => 120,
                        'parent_id' => $groupId,
                    ]);
                }
                DB::table('transactions')->insert($installments);
                DB::commit();

                // Retornar a primeira para a UI (com joins necessários)
                $firstTx = DB::table('transactions as t')
                    ->where('t.parent_id', $groupId)
                    ->leftJoin('accounts as a', 't.account_id', '=', 'a.id')
                    ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                    ->select('t.*', 'a.name as account_name', 'c.name as category_name')
                    ->first();

                return response()->json(['transaction' => $firstTx, 'message' => 'Lançamento fixo criado.']);
            }

            // Lógica para parcelamentos
            if ($data['total_installments'] > 1) {
                $groupId = time();
                $installments = [];
                for ($i = 1; $i <= $data['total_installments']; $i++) {
                    $date = date('Y-m-d', strtotime($data['date'] . " + " . ($i - 1) . " months"));
                    $installments[] = array_merge($data, [
                        'date' => $date,
                        'installment_number' => $i,
                        'parent_id' => $groupId,
                    ]);
                }
                DB::table('transactions')->insert($installments);
                DB::commit();

                $firstTx = DB::table('transactions as t')
                    ->where('t.parent_id', $groupId)
                    ->leftJoin('accounts as a', 't.account_id', '=', 'a.id')
                    ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                    ->select('t.*', 'a.name as account_name', 'c.name as category_name')
                    ->first();

                return response()->json(['transaction' => $firstTx, 'message' => 'Parcelamento criado.']);
            }

            // Lógica para transação única
            $id = DB::table('transactions')->insertGetId($data);
            $transaction = DB::table('transactions as t')
                ->where('t.id', $id)
                ->leftJoin('accounts as a', 't.account_id', '=', 'a.id')
                ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                ->select('t.*', 'a.name as account_name', 'c.name as category_name')
                ->first();

            DB::commit();

            return response()->json(['transaction' => $transaction]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Falha ao salvar a transação: ' . $e->getMessage()], 500);
        }
    }
}
