<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarketDataService
{
    protected $baseUrl = 'https://api.coingecko.com/api/v3';

    /**
     * Get real-time quotes for specific crypto IDs in BRL and USD.
     * Cached for 15 minutes (900 seconds) for dynamic sets, 1 hour for default.
     */
    public function getCryptoPrices($ids = ['bitcoin', 'ethereum'])
    {
        $idsString = is_array($ids) ? implode(',', $ids) : $ids;
        $cacheKey = 'crypto_prices_'.md5($idsString);
        $ttl = ($idsString === 'bitcoin,ethereum') ? 3600 : 900;

        return Cache::remember($cacheKey, $ttl, function () use ($idsString) {
            try {
                $response = Http::get("{$this->baseUrl}/simple/price", [
                    'ids' => $idsString,
                    'vs_currencies' => 'brl,usd',
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error('MarketDataService: Failed to fetch crypto prices', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'ids' => $idsString,
                ]);
            } catch (\Exception $e) {
                Log::error('MarketDataService: Exception fetching crypto prices', [
                    'message' => $e->getMessage(),
                ]);
            }

            return [];
        });
    }

    /**
     * Get real-time conversion rate for USD to BRL.
     * Using a simple public API or mock for now as CoinGecko is mainly for crypto.
     * Alternatively, we can use CoinGecko to get USD price in BRL if possible.
     */
    public function getUsdToBrl()
    {
        return Cache::remember('usd_to_brl', 3600, function () {
            try {
                // CoinGecko can give us USD price in BRL by checking 'tether' or similar stablecoin
                $response = Http::get("{$this->baseUrl}/simple/price", [
                    'ids' => 'tether',
                    'vs_currencies' => 'brl',
                ]);

                if ($response->successful()) {
                    return $response->json()['tether']['brl'] ?? 5.00; // Default fallback
                }
            } catch (\Exception $e) {
                Log::error('MarketDataService: Exception fetching USD to BRL', [
                    'message' => $e->getMessage(),
                ]);
            }

            return 5.10; // Realistic default fallback for BRL/USD
        });
    }

    /**
     * Get coins ordered by market cap with pagination.
     * Cached for 1 hour (3600 seconds) per page.
     */
    public function getMarketCoins($page = 1, $perPage = 100)
    {
        $cacheKey = "crypto_market_p{$page}_s{$perPage}";

        return Cache::remember($cacheKey, 3600, function () use ($page, $perPage) {
            try {
                $response = Http::get("{$this->baseUrl}/coins/markets", [
                    'vs_currency' => 'brl',
                    'order' => 'market_cap_desc',
                    'per_page' => $perPage,
                    'page' => $page,
                    'sparkline' => 'true',
                    'price_change_percentage' => '1h,24h,7d',
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error('MarketDataService: Failed to fetch market coins', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'page' => $page,
                ]);
            } catch (\Exception $e) {
                Log::error('MarketDataService: Exception fetching market coins', [
                    'message' => $e->getMessage(),
                ]);
            }

            return [];
        });
    }

    /**
     * Search for coins across the entire market.
     * 1. Uses CoinGecko /search to find matching IDs.
     * 2. Uses CoinGecko /coins/markets to get full metrics for those IDs.
     */
    public function searchMarketCoins($query)
    {
        if (empty($query)) {
            return [];
        }

        $cacheKey = 'crypto_search_'.md5(strtolower($query));

        return Cache::remember($cacheKey, 1800, function () use ($query) {
            try {
                // Step 1: Search for coins
                $searchResponse = Http::get("{$this->baseUrl}/search", [
                    'query' => $query,
                ]);

                if (! $searchResponse->successful()) {
                    return [];
                }

                $searchResults = $searchResponse->json()['coins'] ?? [];

                // Limit to top 20 matches for performance
                $ids = collect($searchResults)->take(20)->pluck('id')->implode(',');

                if (empty($ids)) {
                    return [];
                }

                // Step 2: Get market data for these specific IDs
                $marketResponse = Http::get("{$this->baseUrl}/coins/markets", [
                    'vs_currency' => 'brl',
                    'ids' => $ids,
                    'order' => 'market_cap_desc',
                    'sparkline' => 'true',
                    'price_change_percentage' => '1h,24h,7d',
                ]);

                if ($marketResponse->successful()) {
                    return $marketResponse->json();
                }

            } catch (\Exception $e) {
                Log::error('MarketDataService: Exception in searchMarketCoins', [
                    'message' => $e->getMessage(),
                    'query' => $query,
                ]);
            }

            return [];
        });
    }
}
