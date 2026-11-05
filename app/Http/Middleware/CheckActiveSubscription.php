<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->hasActivePlan()) {
            return response()->json([
                'message'                => 'Acesso negado. Você precisa de uma assinatura ativa para usar o FinTrack.',
                'requires_subscription'  => true,
            ], 403);
        }

        return $next($request);
    }
}
