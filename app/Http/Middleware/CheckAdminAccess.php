<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->is_admin || $request->user()->email !== 'demo@fintrack.dev') {
            return response()->json([
                'error' => 'Acesso negado. Apenas o Superadmin principal pode realizar esta ação.',
            ], 403);
        }

        return $next($request);
    }
}
