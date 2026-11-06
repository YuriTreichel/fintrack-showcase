<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TraceUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            // Silenciosamente atualiza a data da última atividade
            // Desativamos timestamps para não alterar o 'updated_at' global do sistema
            $user->timestamps = false;
            $user->last_activity_at = now();
            $user->save();
        }

        return $next($request);
    }
}
