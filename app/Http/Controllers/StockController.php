<?php

namespace App\Http\Controllers;

use App\Services\StockMarketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class StockController extends Controller
{
    protected $stockService;

    public function __construct(StockMarketService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Get the consolidated stock market data with local pagination.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getMarketStocks(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $category = $request->query('category', 'all'); // 'all', 'stock', 'fund', 'bdr', 'etf', 'index', 'currency'
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 20);

        $allData = $this->stockService->getStockMarketData();

        // 1. Filter by Search or Category
        $filtered = collect($allData)->filter(function ($item) use ($search, $category) {
            // Search filter
            if (!empty($search)) {
                $query = strtolower($search);
                $tickerMatch = str_contains(strtolower($item['stock'] ?? ''), $query);
                $nameMatch = str_contains(strtolower($item['name'] ?? ''), $query);
                if (!$tickerMatch && !$nameMatch) return false;
            }

            // Category filter
            if ($category !== 'all') {
                if (($item['category'] ?? '') !== $category) return false;
            }

            return true;
        });

        $total = $filtered->count();
        
        // 2. Paginate
        $paginatedItems = $filtered->slice(($page - 1) * $perPage, $perPage)->values();

        $paginated = new LengthAwarePaginator(
            $paginatedItems,
            $total,
            $perPage,
            $page,
            ['path' => $request->url()]
        );

        // 3. Format for Frontend
        $formattedItems = $paginatedItems->map(function ($item) {
            return [
                'ticker' => $item['stock'] ?? 'N/A',
                'name' => $item['name'] ?? ($item['stock'] ?? 'N/A'),
                'price' => $item['close'] ?? 0,
                'variation' => $item['change'] ?? 0,
                'category' => $item['category'] ?? 'stock',
                'sector' => $item['sector'] ?? '-',
                'volume' => $item['volume'] ?? 0,
                'market_cap' => $item['market_cap'] ?? null,
                'logo' => $item['logo'] ?? null,
                'type' => $item['type'] ?? ($item['category'] ?? 'stock'),
            ];
        });

        return response()->json([
            'data' => $formattedItems,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Search for assets on the market (Alias if needed, though getMarketStocks handles search now).
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([]);
        }

        $results = $this->stockService->searchAsset($query);

        $formattedResults = collect($results)->map(function ($stock) {
            return [
                'symbol' => $stock['stock'] ?? 'N/A',
                'name' => $stock['name'] ?? $stock['stock'],
                'type' => $stock['type'] ?? 'stock',
                'exchange' => 'B3',
                'logo' => $stock['logo'] ?? null,
            ];
        });

        return response()->json($formattedResults);
    }
}
