<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
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
            $goals = DB::table('goals')
                ->where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($goals);
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
                'target_amount' => 'required|numeric',
                'current_amount' => 'nullable|numeric',
                'deadline' => 'nullable|date',
                'color' => 'nullable|string|max:7',
                'icon' => 'nullable|string|max:50',
            ]);
            $data['user_id'] = Auth::id();
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            $id = DB::table('goals')->insertGetId($data);
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
                'target_amount' => 'sometimes|required|numeric',
                'current_amount' => 'sometimes|nullable|numeric',
                'deadline' => 'nullable|date',
                'is_completed' => 'sometimes|boolean',
                'color' => 'nullable|string|max:7',
                'icon' => 'nullable|string|max:50',
            ]);
            $data['updated_at'] = now();

            $updated = DB::table('goals')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->update($data);

            if (!$updated) return response()->json(['error' => 'Goal not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->checkPremium();
            $deleted = DB::table('goals')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->delete();

            if (!$deleted) return response()->json(['error' => 'Goal not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() == 403 ? 403 : 500);
        }
    }
}
