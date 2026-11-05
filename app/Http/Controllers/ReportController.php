<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    private function checkPremium()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPremiumPlan()) {
            abort(403, 'Esta funcionalidade é exclusiva para o Plano Premium.');
        }
    }

    public function budgetReport()
    {
        try {
            $this->checkPremium();
            $user = Auth::user();
            $now = Carbon::now();

            $budgets = Budget::where('user_id', $user->id)
                ->where(function ($query) use ($now) {
                    $query->where('is_fixed', true)
                        ->orWhere(function ($q) use ($now) {
                            $q->where('month', $now->month)
                                ->where('year', $now->year);
                        });
                })
                ->with('category')
                ->get();

            // Total income for the month (used for percentage-based budgets)
            $totalIncome = Transaction::where('user_id', $user->id)
                ->where('type', 'Income')
                ->whereMonth('date', $now->month)
                ->whereYear('date', $now->year)
                ->sum('amount');

            $report = $budgets->map(function ($budget) use ($user, $now, $totalIncome) {
                $budgetAmount = $budget->type === 'percentage' 
                    ? ($totalIncome * ($budget->percentage_value / 100))
                    : (float) $budget->amount;

                $categoryIds = [$budget->category_id];
                if ($budget->category_id) {
                    $childrenIds = \App\Models\Category::where('parent_id', $budget->category_id)->pluck('id')->toArray();
                    $categoryIds = array_merge($categoryIds, $childrenIds);
                }

                $actualSpent = Transaction::where('user_id', $user->id)
                    ->whereIn('category_id', $categoryIds)
                    ->where('type', 'Expense')
                    ->whereMonth('date', $now->month)
                    ->whereYear('date', $now->year)
                    ->sum('amount');

                return [
                    'id' => $budget->id,
                    'category_id' => $budget->category_id,
                    'category_name' => $budget->category->name ?? 'Sem Categoria',
                    'budget_amount' => round($budgetAmount, 2),
                    'actual_spent' => (float) $actualSpent,
                    'percentage' => $budgetAmount > 0 ? round(($actualSpent / $budgetAmount) * 100, 2) : 0,
                    'remaining' => (float) ($budgetAmount - $actualSpent),
                    'is_fixed' => $budget->is_fixed,
                    'type' => $budget->type,
                    'percentage_rule' => $budget->percentage_value,
                ];
            });

            return response()->json($report);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function goalsReport()
    {
        try {
            $this->checkPremium();
            $user = Auth::user();

            $goals = Goal::where('user_id', $user->id)->get();

            $report = $goals->map(function ($goal) {
                $percentage = $goal->target_amount > 0 
                    ? round(($goal->current_amount / $goal->target_amount) * 100, 2) 
                    : 0;

                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'target_amount' => (float) $goal->target_amount,
                    'current_amount' => (float) $goal->current_amount,
                    'percentage' => $percentage,
                    'is_completed' => $goal->is_completed,
                    'deadline' => $goal->deadline ? $goal->deadline->format('Y-m-d') : null,
                    'color' => $goal->color,
                    'icon' => $goal->icon,
                ];
            });

            return response()->json($report);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
