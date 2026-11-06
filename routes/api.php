<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\StockController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransactionAIController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckVipAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas do Blog (Públicas)
Route::get('/blog/posts', [BlogController::class, 'indexPublic']);
Route::get('/blog/posts/{slug}', [BlogController::class, 'showPublic']);
Route::get('/blog/categories', [BlogController::class, 'indexCategories']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rota pública para checkout direto (via link assinado gerado pelo admin)
Route::get('/checkout/direct', [SubscriptionController::class, 'directCheckout'])->name('checkout.direct');

// Stripe Webhook (Deve ser público, o Stripe passará a sua própria assinatura)
Route::post('/stripe/webhook', [SubscriptionController::class, 'webhook']);

// Rotas apenas autenticadas (não exigem plano ativo)
Route::middleware(['web', 'activity'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Retorna o plano atual para o Frontend redirecionar (com fallback para 'none')
    Route::get('/plan', function (Request $request) {
        $user = $request->user();
        if ($user->hasPremiumPlan()) {
            return response()->json(['plan' => 'premium']);
        }
        if ($user->hasBasicPlan()) {
            return response()->json(['plan' => 'basic']);
        }

        return response()->json(['plan' => 'none']);
    });

    // Rota de checkout, limpa e independente do Cashier
    Route::post('/checkout', [SubscriptionController::class, 'createCheckoutSession']);
    Route::get('/checkout-session', [SubscriptionController::class, 'getSubscriptionStatus']);
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancelSubscription']);
    Route::post('/subscription/portal', [SubscriptionController::class, 'billingPortal']);

    // Perfil e Senha (Em web para permitir acesso mesmo sem plano ativo)
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::put('/user/theme-color', [AuthController::class, 'updateThemeColor']);
    Route::put('/user/complete-tour', [AuthController::class, 'completeTour']);
});

// Rotas de Administração (Superadmin)
Route::middleware(['web', 'activity', 'admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::put('/admin/users/{id}/subscription', [AdminController::class, 'updateSubscription']);
    Route::post('/admin/users/{id}/impersonate', [AdminController::class, 'impersonate']);
    Route::put('/admin/users/{id}/suspend', [AdminController::class, 'suspend']);
    Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'destroy']);
    Route::post('/admin/users/{id}/generate-checkout-link', [AdminController::class, 'generateCheckoutLink']);

    // Rotas do Blog (Admin)
    Route::get('/admin/blog/posts', [BlogController::class, 'indexAdmin']);
    Route::post('/admin/blog/posts', [BlogController::class, 'store']);
    Route::put('/admin/blog/posts/{id}', [BlogController::class, 'update']);
    Route::delete('/admin/blog/posts/{id}', [BlogController::class, 'destroy']);
    Route::post('/admin/blog/upload-image', [BlogController::class, 'uploadImage']);

    Route::get('/admin/blog/categories', [BlogController::class, 'indexCategories']);
    Route::post('/admin/blog/categories', [BlogController::class, 'storeCategory']);
    Route::delete('/admin/blog/categories/{id}', [BlogController::class, 'destroyCategory']);
});

// Rotas autenticadas + Exigem Assinatura Ativa (Plano Básico ou Premium)
Route::middleware(['web', 'activity', 'subscription'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/ai', [TransactionAIController::class, 'store']);
    Route::post('/ai/parse', [TransactionAIController::class, 'parse']);
    Route::delete('/transactions/bulk', [TransactionController::class, 'bulkDestroy']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    Route::get('/accounts', [AccountController::class, 'index']);
    Route::post('/accounts', [AccountController::class, 'store']);
    Route::post('/accounts/{id}/balance', [AccountController::class, 'updateBalance']);
    Route::put('/accounts/{id}', [AccountController::class, 'update']);
    Route::delete('/accounts/{id}', [AccountController::class, 'destroy']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::get('/cards', [CardController::class, 'index']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    Route::delete('/cards/{id}', [CardController::class, 'destroy']);
    Route::get('/cards/{id}/invoice', [CardController::class, 'getInvoice']);
    Route::post('/cards/{id}/pay-invoice', [CardController::class, 'payInvoice']);

    // Recurso Premium (VIP)
    Route::middleware([CheckVipAccess::class])->group(function () {
        // Dívidas (Agora disponível para Premium)
        Route::get('/debts', [DebtController::class, 'index']);
        Route::post('/debts', [DebtController::class, 'store']);
        Route::put('/debts/{debt}', [DebtController::class, 'update']);
        Route::delete('/debts/{debt}', [DebtController::class, 'destroy']);
        Route::post('/debts/{debt}/calculate-impact', [DebtController::class, 'calculateImpact']);
        Route::post('/debts/{debt}/pay', [DebtController::class, 'pay']);

        // Compartilhamento Familiar
        Route::get('/share/code', [ShareController::class, 'getCode']);
        Route::post('/share/follow', [ShareController::class, 'follow']);
        Route::delete('/share/unfollow/{id}', [ShareController::class, 'unfollow']);
        Route::get('/share/following', [ShareController::class, 'getFollowing']);

        // Planejamentos (Budgets)
        Route::get('/budgets', [BudgetController::class, 'index']);
        Route::post('/budgets', [BudgetController::class, 'store']);
        Route::put('/budgets/{id}', [BudgetController::class, 'update']);
        Route::delete('/budgets/{id}', [BudgetController::class, 'destroy']);

        // Metas (Goals)
        Route::get('/goals', [GoalController::class, 'index']);
        Route::post('/goals', [GoalController::class, 'store']);
        Route::put('/goals/{id}', [GoalController::class, 'update']);
        Route::delete('/goals/{id}', [GoalController::class, 'destroy']);

        // Patrimônio & Portfolio
        Route::get('/assets', [AssetController::class, 'index']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::put('/assets/{asset}', [AssetController::class, 'update']);
        Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);
        Route::get('/assets/history', [AssetController::class, 'getHistory']);
        Route::get('/assets/all-history', [AssetController::class, 'getAllHistory']);
        Route::get('/portfolio-summary', [AssetController::class, 'portfolioSummary']);
        Route::delete('/assets/purchase/{id}', [AssetController::class, 'destroyPurchase']);

        // Relatórios Premium
        Route::get('/reports/budget', [ReportController::class, 'budgetReport']);
        Route::get('/reports/goals', [ReportController::class, 'goalsReport']);

        // Mercado e Cotações
        Route::get('/market/crypto', [AssetController::class, 'getMarketCoins']);
        Route::get('/market/crypto/{id}', [AssetController::class, 'getCryptoDetails']);
        Route::get('/market/stocks', [StockController::class, 'getMarketStocks']);
        Route::get('/market/stocks/search', [StockController::class, 'search']);
    });
});
