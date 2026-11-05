<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    private function checkPremium()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasPremiumPlan()) {
            abort(403, 'Esta funcionalidade é exclusiva para o Plano Premium.');
        }
    }

    public function index()
    {
        try {
            $this->checkPremium();
            $budgets = DB::table('budgets as b')
                ->where('b.user_id', Auth::id())
                ->leftJoin('categories as c', 'b.category_id', '=', 'c.id')
                ->select('b.*', 'c.name as category_name')
                ->get();
            return response()->json($budgets);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $this->checkPremium();
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'category_id' => 'nullable|exists:categories,id',
                'period' => 'required|string',
                'month' => 'nullable|integer|between:1,12',
                'year' => 'nullable|integer',
                'is_fixed' => 'boolean',
                'type' => 'nullable|string|in:value,percentage',
                'percentage_value' => 'nullable|numeric|between:0,100',
            ]);
            $data['user_id'] = Auth::id();
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            $id = DB::table('budgets')->insertGetId($data);
            return response()->json(['id' => $id]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $this->checkPremium();
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'amount' => 'sometimes|required|numeric',
                'category_id' => 'nullable|exists:categories,id',
                'period' => 'sometimes|required|string',
                'month' => 'nullable|integer|between:1,12',
                'year' => 'nullable|integer',
                'is_fixed' => 'sometimes|boolean',
                'type' => 'sometimes|string|in:value,percentage',
                'percentage_value' => 'nullable|numeric|between:0,100',
            ]);
            $data['updated_at'] = now();

            $updated = DB::table('budgets')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->update($data);

            if (!$updated) return response()->json(['error' => 'Budget not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->checkPremium();
            $deleted = DB::table('budgets')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->delete();

            if (!$deleted) return response()->json(['error' => 'Budget not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }
}
