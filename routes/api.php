<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionAIController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Showcase API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Financial Insights & Aggregations
    Route::get('/dashboard', DashboardController::class);

    // Ledger Transactions
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'destroy']);

    // Real-Time AI Financial Assistant
    Route::prefix('ai')->group(function () {
        Route::post('/parse', [TransactionAIController::class, 'parse']);
        Route::post('/confirm', [TransactionAIController::class, 'confirm']);
    });
});
