<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CardController extends Controller
{
    public function index()
    {
        try {
            $cards = DB::table('cards')->where('user_id', Auth::id())->get();
            
            // Adiciona informações de status da fatura atual para cada cartão
            $currentMonth = (int) date('m');
            $currentYear = (int) date('Y');
            $today = Carbon::today();

            foreach ($cards as $card) {
                $dates = $this->getCycleDates($card, $currentMonth, $currentYear);
                $endDate = $dates['end'];

                $isClosed = $card->closing_day ? $today->greaterThanOrEqualTo($endDate->copy()->addDay()) : $today->day > ($card->due_day ?? 31);
                
                // Verificar se está paga
                $isPaid = DB::table('transactions')
                    ->where('card_id', $card->id)
                    ->where('user_id', Auth::id())
                    ->where('type', 'Expense')
                    ->whereBetween('date', [$dates['start']->format('Y-m-d'), $dates['end']->format('Y-m-d')])
                    ->where('status', 'Pending')
                    ->count() === 0;
                
                $hasTransactions = DB::table('transactions')
                    ->where('card_id', $card->id)
                    ->where('user_id', Auth::id())
                    ->where('type', 'Expense')
                    ->whereBetween('date', [$dates['start']->format('Y-m-d'), $dates['end']->format('Y-m-d')])
                    ->exists();

                $card->is_paid = $hasTransactions && $isPaid;
                $card->is_closed = $isClosed;
                $card->invoice_status = $card->is_paid ? 'Paid' : ($isClosed ? 'Closed' : 'Open');
            }

            return response()->json($cards);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // Plano Básico: máximo de 1 cartão
            if ($user->hasBasicPlan()) {
                $count = DB::table('cards')->where('user_id', $user->id)->count();
                if ($count >= 1) {
                    return response()->json([
                        'message'          => 'Você atingiu o limite de 1 cartão de crédito do Plano Básico. Faça upgrade para o Plano Premium e cadastre cartões ilimitados!',
                        'requires_upgrade' => true,
                    ], 403);
                }
            }

            $data = $request->validate([
                'name' => 'required|string|max:255',
                'limit' => 'required|numeric|min:0',
                'brand' => 'nullable|string|max:50',
                'closing_day' => 'nullable|integer|min:1|max:31',
                'due_day' => 'nullable|integer|min:1|max:31',
            ]);
            
            $data['user_id'] = $user->id;
            
            // CORREÇÃO 1: Adicionando as datas manualmente para evitar erro no banco
            $data['created_at'] = now(); 
            $data['updated_at'] = now();
            
            $id = DB::table('cards')->insertGetId($data);
            return response()->json(['id' => $id]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            // CORREÇÃO 2: Se faltar algum dado, devolve o erro real para o React
            return response()->json(['error' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'limit' => 'sometimes|required|numeric|min:0',
                'brand' => 'nullable|string|max:50',
                'closing_day' => 'nullable|integer|min:1|max:31',
                'due_day' => 'nullable|integer|min:1|max:31',
            ]);
            
            $data['updated_at'] = now();

            $updated = DB::table('cards')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->update($data);
                
            if (!$updated) return response()->json(['error' => 'Cartão não encontrado'], 404);
            return response()->json(['success' => true]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('cards')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->delete();
                
            if (!$deleted) return response()->json(['error' => 'Cartão não encontrado'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // --- CORREÇÃO 3: A FUNÇÃO DA FATURA AGORA ESTÁ AQUI! ---
    // --- CORREÇÃO 3: A FUNÇÃO DA FATURA AGORA ESTÁ AQUI! ---
    public function payInvoice(Request $request, $id)
    {
        try {
            $data = $request->validate([
                'account_id' => 'required|exists:accounts,id',
                'amount' => 'required|numeric',
                'date' => 'required|date',
                'month' => 'required|integer',
                'year' => 'required|integer',
            ]);

            $card = DB::table('cards')->where('id', $id)->where('user_id', Auth::id())->first();
            if (!$card) return response()->json(['error' => 'Cartão não encontrado'], 404);

            $dates = $this->getCycleDates($card, $data['month'], $data['year']);

            // Marcar todas as transações deste ciclo como pagas
            DB::table('transactions')
                ->where('card_id', $id)
                ->where('user_id', Auth::id())
                ->where('type', 'Expense')
                ->whereBetween('date', [$dates['start']->format('Y-m-d'), $dates['end']->format('Y-m-d')])
                ->update(['status' => 'Paid', 'updated_at' => now()]);

            // Cria uma "Transferência" que tira saldo do banco para pagar o cartão
            $transactionId = DB::table('transactions')->insertGetId([
                'user_id' => Auth::id(),
                'account_id' => $data['account_id'],
                'to_account_id' => null, 
                'category_id' => null,
                'card_id' => null, 
                'type' => 'Transfer',
                'status' => 'Paid',
                'description' => 'Pagamento de Fatura - ' . str_pad($data['month'], 2, '0', STR_PAD_LEFT) . '/' . $data['year'],
                'amount' => $data['amount'],
                'date' => $data['date'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Fatura paga com sucesso!',
                'transaction_id' => $transactionId
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getInvoice(Request $request, $id)
    {
        try {
            $month = (int) $request->query('month', date('m'));
            $year = (int) $request->query('year', date('Y'));

            $card = DB::table('cards')->where('id', $id)->where('user_id', Auth::id())->first();
            if (!$card) return response()->json(['error' => 'Cartão não encontrado'], 404);

            $dates = $this->getCycleDates($card, $month, $year);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            $query = DB::table('transactions as t')
                ->leftJoin('categories as c', 't.category_id', '=', 'c.id')
                ->where('t.card_id', $id)
                ->where('t.type', 'Expense')
                ->select('t.*', 'c.name as category_name', 'c.icon as category_icon');

            if ($card->closing_day) {
                $query->whereBetween('t.date', [
                    $startDate->format('Y-m-d'),
                    $endDate->format('Y-m-d')
                ]);
            } else {
                $query->whereMonth('t.date', $month)
                      ->whereYear('t.date', $year);
            }

            $transactions = $query->orderBy('t.date', 'desc')->get();

            // Calcula o total da fatura deste período
            $invoiceTotal = $transactions->sum('amount');

            // Verifica se a fatura está paga (se todas as transações do ciclo estão pagas)
            // E se existe pelo menos uma transação no ciclo
            $isPaid = $transactions->count() > 0 && $transactions->every(function($tx) {
                return $tx->status === 'Paid';
            });

            // Determina se a fatura está aberta ou fechada
            $today = Carbon::today();
            $isClosed = $card->closing_day ? $today->greaterThanOrEqualTo($endDate->copy()->addDay()) : $today->day > ($card->due_day ?? 31);
            
            // Se for um mês futuro, está aberta
            $viewedDate = Carbon::create($year, $month, 1);
            if ($viewedDate->isFuture() && !$viewedDate->isCurrentMonth()) {
                $isClosed = false;
            }

            // ===== CÁLCULO DO LIMITE UTILIZADO (PRÉVIA DO MÊS VISUALIZADO) =====
            // Lógica: mostra o limite como se as faturas anteriores estivessem pagas
            // 1) Fatura do mês visualizado: soma TUDO (fixas, parceladas, avulsas)
            // 2) Despesas FUTURAS não-fixas (após esse ciclo): reservam limite
            //    (parceladas, compras avulsas já registradas, etc.)
            // 3) Despesas fixas futuras (Netflix etc): NÃO reservam limite,
            //    só debitam quando a cobrança efetivamente acontece no ciclo
            
            if ($card->closing_day) {
                $viewedCycleEnd = $endDate;
                
                // 1) Total do ciclo visualizado (já é o $invoiceTotal calculado acima)
                $viewedCycleTotal = $invoiceTotal;
                
                // 2) Todas as despesas futuras NÃO-FIXAS (após o ciclo visualizado)
                $futureNonFixed = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->where('date', '>', $viewedCycleEnd->format('Y-m-d'))
                    ->where(function ($q) {
                        $q->where('is_fixed', false)->orWhereNull('is_fixed');
                    })
                    ->sum('amount');
                
                $usedLimit = $viewedCycleTotal + $futureNonFixed;
            } else {
                $viewedEnd = Carbon::create($year, $month, 1)->endOfMonth();
                
                // 1) Total do mês visualizado (já é o $invoiceTotal)
                $viewedMonthTotal = $invoiceTotal;
                
                // 2) Todas as despesas futuras não-fixas (após o mês visualizado)
                $futureNonFixed = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->where('date', '>', $viewedEnd->format('Y-m-d'))
                    ->where(function ($q) {
                        $q->where('is_fixed', false)->orWhereNull('is_fixed');
                    })
                    ->sum('amount');
                
                $usedLimit = $viewedMonthTotal + $futureNonFixed;
            }
            // ===== LIMITE DISPONÍVEL REAL (baseado em HOJE) =====
            // Calcula quanto de limite sobra AGORA, independente do mês visualizado
            $currentMonth = (int) date('m');
            $currentYear = (int) date('Y');
            
            $realDates = $this->getCycleDates($card, $currentMonth, $currentYear);
            $realCycleStart = $realDates['start'];
            $realCycleEnd = $realDates['end'];
            
            if ($card->closing_day) {
                // Fatura atual real + futuras não-fixas
                $realCycleTotal = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->whereBetween('date', [
                        $realCycleStart->format('Y-m-d'),
                        $realCycleEnd->format('Y-m-d')
                    ])
                    ->sum('amount');
                
                $realFutureNonFixed = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->where('date', '>', $realCycleEnd->format('Y-m-d'))
                    ->where(function ($q) {
                        $q->where('is_fixed', false)->orWhereNull('is_fixed');
                    })
                    ->sum('amount');
                
                $currentUsedLimit = $realCycleTotal + $realFutureNonFixed;
            } else {
                $realStart = $today->copy()->startOfMonth();
                $realEnd = $today->copy()->endOfMonth();
                
                $realMonthTotal = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->whereBetween('date', [
                        $realStart->format('Y-m-d'),
                        $realEnd->format('Y-m-d')
                    ])
                    ->sum('amount');
                
                $realFutureNonFixed = DB::table('transactions')
                    ->where('card_id', $id)
                    ->where('type', 'Expense')
                    ->where('date', '>', $realEnd->format('Y-m-d'))
                    ->where(function ($q) {
                        $q->where('is_fixed', false)->orWhereNull('is_fixed');
                    })
                    ->sum('amount');
                
                $currentUsedLimit = $realMonthTotal + $realFutureNonFixed;
            }
            
            $cardLimit = (float) ($card->limit ?? 0);
            $currentAvailable = max(0, $cardLimit - $currentUsedLimit);

            return response()->json([
                'transactions' => $transactions,
                'invoiceTotal' => $invoiceTotal,
                'usedLimit' => $usedLimit,
                'currentAvailable' => $currentAvailable,
                'cardLimit' => $cardLimit,
                'month' => $month,
                'year' => $year,
                'closing_day' => $card->closing_day,
                'is_paid' => $isPaid,
                'is_closed' => $isClosed,
                'status' => $isPaid ? 'Paid' : ($isClosed ? 'Closed' : 'Open'),
                'cycle_start' => $startDate->format('Y-m-d'),
                'cycle_end' => $endDate->format('Y-m-d')
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getCycleDates($card, $month, $year)
    {
        if (!$card->closing_day) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = (clone $start)->endOfMonth();
            return ['start' => $start, 'end' => $end];
        }

        $closingInPreviousMonth = $card->closing_day >= ($card->due_day ?? 1);
        
        if ($closingInPreviousMonth) {
            $end = Carbon::create($year, $month, $card->closing_day)->subMonth()->subDay();
            $start = (clone $end)->subMonth()->addDay();
        } else {
            $end = Carbon::create($year, $month, $card->closing_day)->subDay();
            $start = (clone $end)->subMonth()->addDay();
        }

        return ['start' => $start, 'end' => $end];
    }
}