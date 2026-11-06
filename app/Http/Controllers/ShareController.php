<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    /**
     * Bloqueia todas as rotas de compartilhamento para o Plano Básico.
     */
    private function denyBasicPlan(Request $request)
    {
        if ($request->user()->hasBasicPlan()) {
            return response()->json([
                'message' => 'Compartilhamento de perfil é exclusivo do Plano Premium. Faça upgrade para liberar esta funcionalidade!',
                'requires_upgrade' => true,
            ], 403);
        }

        return null;
    }

    public function getCode(Request $request)
    {
        if ($deny = $this->denyBasicPlan($request)) {
            return $deny;
        }

        return response()->json([
            'sharing_code' => $request->user()->sharing_code,
        ]);
    }

    public function follow(Request $request)
    {
        if ($deny = $this->denyBasicPlan($request)) {
            return $deny;
        }

        $request->validate([
            'sharing_code' => 'required|string|min:10',
        ]);

        $userToFollow = User::where('sharing_code', $request->sharing_code)->first();

        if (! $userToFollow) {
            return response()->json(['message' => 'Código de compartilhamento inválido.'], 404);
        }

        if ($userToFollow->id === $request->user()->id) {
            return response()->json(['message' => 'Você não pode seguir a si mesmo.'], 422);
        }

        $request->user()->following()->syncWithoutDetaching([$userToFollow->id]);

        return response()->json([
            'status' => 'success',
            'message' => 'Agora você está seguindo '.$userToFollow->name,
            'user' => [
                'id' => $userToFollow->id,
                'name' => $userToFollow->name,
            ],
        ]);
    }

    public function unfollow(Request $request, $id)
    {
        if ($deny = $this->denyBasicPlan($request)) {
            return $deny;
        }

        $request->user()->following()->detach($id);

        return response()->json(['message' => 'Você parou de seguir este usuário.']);
    }

    public function getFollowing(Request $request)
    {
        if ($deny = $this->denyBasicPlan($request)) {
            return $deny;
        }

        return response()->json(
            $request->user()->following()->select('users.id', 'users.name')->get()
        );
    }
}
