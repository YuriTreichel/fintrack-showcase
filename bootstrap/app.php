<?php

use App\Http\Middleware\CheckActiveSubscription;
use App\Http\Middleware\CheckAdminAccess;
use App\Http\Middleware\TraceUserActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'stripe/*',
        ]);

        $middleware->alias([
            'subscription' => CheckActiveSubscription::class,
            'admin' => CheckAdminAccess::class,
            'activity' => TraceUserActivity::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
