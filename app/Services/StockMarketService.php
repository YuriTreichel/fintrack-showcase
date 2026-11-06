<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StockMarketService
{
    /**
     * Fetch all stock market data from Brapi (Stocks, Funds, BDRs, Indexes and Currencies).
     * Caches the entire list for 180 seconds to avoid exceeding API limits.
     *
     * @return array
     */
    public function getStockMarketData()
    {
        $cacheKey = 'brapi_market_data_universal';
        $cacheTime = 180;

        return Cache::remember($cacheKey, $cacheTime, function () {
            try {
                $token = config('services.brapi.key');
                if (empty($token)) {
                    Log::error('StockMarketService: BRAPI_API_KEY is missing.');

                    return [];
                }

                // Fetch Quotes (Stocks, Funds, BDRs, Indexes)
                $quoteResponse = Http::timeout(15)->get('https://brapi.dev/api/quote/list', [
                    'limit' => 5000,
                    'sortBy' => 'volume',
                    'sortOrder' => 'desc',
                    'token' => $token,
                ]);

                // Fetch Currencies (Major pairs)
                $currencyResponse = Http::timeout(10)->get('https://brapi.dev/api/v2/currency', [
                    'currency' => 'USD-BRL,EUR-BRL,GBP-BRL,ARS-BRL,BTC-BRL',
                    'token' => $token,
                ]);

                $allData = [];

                if ($quoteResponse->successful()) {
                    $quoteData = $quoteResponse->json();

                    // Process Stocks/Funds/BDRs
                    foreach (($quoteData['stocks'] ?? []) as $item) {
                        $category = $this->categorizeStock($item);
                        $allData[] = array_merge($item, ['category' => $category]);
                    }

                    // Process Indexes
                    foreach (($quoteData['indexes'] ?? []) as $index) {
                        // Note: Indexes in quote/list are simplified, we keep them as is
                        $allData[] = [
                            'stock' => $index['stock'],
                            'name' => $index['name'],
                            'category' => 'index',
                            'close' => null, // Will need detail fetch or simplified view
                            'change' => null,
                        ];
                    }
                }

                if ($currencyResponse->successful()) {
                    $currencies = $currencyResponse->json()['currency'] ?? [];
                    foreach ($currencies as $curr) {
                        $allData[] = [
                            'stock' => $curr['fromCurrency'].'/'.$curr['toCurrency'],
                            'name' => $curr['name'],
                            'close' => $curr['bidPrice'],
                            'change' => $curr['variationPercentage'] ?? 0,
                            'category' => 'currency',
                            'logo' => null,
                        ];
                    }
                }

                return $allData;

            } catch (\Exception $e) {
                Log::error('StockMarketService: Exception fetching Brapi data', ['message' => $e->getMessage()]);
            }

            return [];
        });
    }

    /**
     * Categorize a stock item from Brapi.
     */
    protected function categorizeStock($item)
    {
        $ticker = $item['stock'] ?? '';
        $type = $item['type'] ?? '';

        if ($type === 'bdr') {
            return 'bdr';
        }

        if ($type === 'fund') {
            // Usually FIIs have '11' and are related to Real Estate or Funds
            // But some ETFs are also funds. Brapi sector helps.
            if (str_ends_with($ticker, '11')) {
                // If it's a common FII (Real Estate), categorize as 'fund' (FII)
                // Otherwise if it's an Index ETF (like BOVA11), it might be 'etf'
                return 'fund';
            }

            return 'etf';
        }

        // Default 'stock'
        return 'stock';
    }

    /**
     * Search for assets locally in the cached array.
     *
     * @return array
     */
    public function searchAsset(string $query)
    {
        $query = strtolower(trim($query));
        if (empty($query)) {
            return [];
        }

        $allStocks = $this->getStockMarketData();

        // Filter based on ticker or name matching the query
        $results = array_filter($allStocks, function ($stock) use ($query) {
            $tickerMatch = str_contains(strtolower($stock['stock'] ?? ''), $query);
            $nameMatch = str_contains(strtolower($stock['name'] ?? ''), $query);

            return $tickerMatch || $nameMatch;
        });

        // Take only top 20 results for search
        return array_slice(array_values($results), 0, 20);
    }
}
