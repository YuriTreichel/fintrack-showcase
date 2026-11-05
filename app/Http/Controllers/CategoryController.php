<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $followedUserIds = $user->following()->pluck('users.id')->toArray();
            $userIds = array_merge([$user->id], $followedUserIds);

            $categories = DB::table('categories as c')
                ->whereIn('c.user_id', $userIds)
                ->leftJoin('users as u', 'c.user_id', '=', 'u.id')
                ->select('c.*', 'u.name as owner_name')
                ->get();
            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id',
                'type' => 'required|in:Income,Expense',
                'icon' => 'nullable|string|max:50'
            ]);
            $data['user_id'] = Auth::id();
            $id = DB::table('categories')->insertGetId($data);
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
                'parent_id' => 'nullable|exists:categories,id',
                'type' => 'sometimes|required|in:Income,Expense',
                'icon' => 'nullable|string|max:50'
            ]);

            $updated = DB::table('categories')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->update($data);

            if (!$updated) return response()->json(['error' => 'Category not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = DB::table('categories')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->delete();

            if (!$deleted) return response()->json(['error' => 'Category not found or unauthorized'], 404);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
