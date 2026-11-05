<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVipAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        // Administrador principal sempre tem acesso
        if ($request->user() && $request->user()->email === 'yuriinfo15@gmail.com') {
            return $next($request);
        }

        // Verifica se o usuário está logado E se NÃO é VIP
        if ($request->user() && ! $request->user()->is_vip) {
            
            // Retorna um erro 403 (Proibido) em formato JSON para o React
            return response()->json([
                'message' => 'Acesso negado. Esta funcionalidade é exclusiva para usuários VIP.',
                'requires_upgrade' => true
            ], 403);
        }

        // Se for VIP, deixa a requisição passar normalmente
        return $next($request);
    }
}
