<?php

namespace App\Http\Controllers;

use App\Services\Finance\FinancialLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return comprehensive real-time financial metrics for the dashboard.
     */
    public function __invoke(Request $request, FinancialLedgerService $ledgerService): JsonResponse
    {
        $user = $request->user();
        $overview = $ledgerService->calculateOverview($user);
        $distribution = $ledgerService->getCategoryDistribution($user);

        return response()->json([
            'overview' => $overview,
            'category_distribution' => $distribution,
            'user' => [
                'name' => $user->name,
                'currency' => $user->currency,
            ],
        ]);
    }
}
