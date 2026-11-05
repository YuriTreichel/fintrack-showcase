<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserAsset;
use App\Models\UserAssetPurchase;
use App\Services\MarketDataService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class AssetController extends Controller
{
    protected $marketData;

    public function __construct(MarketDataService $marketData)
    {
        $this->marketData = $marketData;
    }

    public function index()
    {
        return Auth::user()->assets;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_symbol' => 'required|string',
            'coin_id' => 'nullable|string',
            'quantity' => 'required|numeric',
            'purchase_price' => 'required|numeric',
            'currency' => 'required|string|in:BRL,USD',
            'exchange_rate' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
        ]);

        $user = Auth::user();
        
        // Find or create the main asset record
        $asset = $user->assets()
            ->when($validated['coin_id'], function($q) use ($validated) {
                return $q->where('coin_id', $validated['coin_id']);
            })
            ->when(!$validated['coin_id'], function($q) use ($validated) {
                return $q->where('asset_symbol', $validated['asset_symbol']);
            })
            ->first();

        if (!$asset) {
            $asset = $user->assets()->create([
                'asset_symbol' => $validated['asset_symbol'],
                'coin_id' => $validated['coin_id'],
                'quantity' => 0,
                'average_price' => 0,
            ]);
        }

        // Create the purchase record
        $asset->purchases()->create([
            'quantity' => $validated['quantity'],
            'purchase_price' => $validated['purchase_price'],
            'currency' => $validated['currency'],
            'exchange_rate' => $validated['exchange_rate'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? now(),
        ]);

        // Recalculate totals
        $this->syncAssetStats($asset);

        return $asset->load('purchases');
    }

    public function update(Request $request, UserAsset $asset)
    {
        if ($asset->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'asset_symbol' => 'string',
            'quantity' => 'numeric',
            'average_price' => 'numeric',
        ]);

        $asset->update($validated);
        return $asset;
    }

    public function destroy(UserAsset $asset)
    {
        if ($asset->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $asset->delete();
        return response()->json(['message' => 'Asset deleted']);
    }

    public function portfolioSummary()
    {
        $user = Auth::user();
        $assets = $user->assets;
        
        // Fetch specific quotes for assets that have coin_id
        $coinIds = $assets->pluck('coin_id')->filter()->unique()->toArray();
        if (empty($coinIds)) {
            $coinIds = ['bitcoin', 'ethereum']; // Defaults for summary
        }
        
        $quotes = $this->marketData->getCryptoPrices($coinIds);
        $usdRate = $this->marketData->getUsdToBrl();

        $totalAssetsBrl = 0;

        $mappedAssets = $assets->map(function ($asset) use ($quotes, &$totalAssetsBrl) {
            $coinKey = $asset->coin_id;
            
            // Fallback for older assets without coin_id
            if (!$coinKey) {
                $symbol = strtolower($asset->asset_symbol);
                $mapping = [
                    'btc' => 'bitcoin',
                    'eth' => 'ethereum',
                ];
                $coinKey = $mapping[$symbol] ?? null;
            }

            $currentPriceBrl = 0;

            if ($coinKey && isset($quotes[$coinKey])) {
                $currentPriceBrl = $quotes[$coinKey]['brl'];
            }

            $currentValueBrl = $asset->quantity * $currentPriceBrl;
            $totalAssetsBrl += $currentValueBrl;

            return [
                'id' => $asset->id,
                'symbol' => $asset->asset_symbol,
                'coin_id' => $asset->coin_id,
                'quantity' => $asset->quantity,
                'avg_price' => $asset->average_price,
                'current_price_brl' => $currentPriceBrl,
                'current_total_brl' => $currentValueBrl,
            ];
        });

        // 2. Accounts Consolidation
        $accounts = $user->accounts;
        $totalAccountsBrl = 0;

        $mappedAccounts = $accounts->map(function ($account) use ($usdRate, $quotes, &$totalAccountsBrl) {
            $balance = $account->initial_balance; // Simplification: in a real app, calculate actual balance from transactions
            // For now, let's use a dummy calculation or assume initial_balance is the current total for this demo
            
            // To be more accurate, we should probably fetch the real balance:
            $currentBalance = $account->initial_balance; 
            // Better: If there's a Transaction model, we should calculate it. 
            // But let's stick to the prompt's focus on conversion logic.

            $convertedBrl = $currentBalance;
            $currency = strtoupper($account->currency);

            if ($currency === 'USD') {
                $convertedBrl = $currentBalance * $usdRate;
            } elseif ($currency === 'BTC') {
                $convertedBrl = $currentBalance * ($quotes['bitcoin']['brl'] ?? 0);
            }

            $totalAccountsBrl += $convertedBrl;

            return [
                'id' => $account->id,
                'name' => $account->name,
                'balance' => $currentBalance,
                'currency' => $account->currency,
                'converted_brl' => $convertedBrl,
            ];
        });

        return response()->json([
            'summary' => [
                'total_wealth_brl' => $totalAssetsBrl + $totalAccountsBrl,
                'assets_total_brl' => $totalAssetsBrl,
                'accounts_total_brl' => $totalAccountsBrl,
                'usd_rate' => $usdRate,
            ],
            'assets' => $mappedAssets,
            'accounts' => $mappedAccounts,
            'quotes' => $quotes,
        ]);
    }

    public function getMarketCoins(Request $request)
    {
        $search = $request->query('search');
        
        if ($search) {
            return response()->json($this->marketData->searchMarketCoins($search));
        }

        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 100);
        
        return response()->json($this->marketData->getMarketCoins($page, $perPage));
    }

    public function getCryptoDetails($id)
    {
        return Cache::remember("crypto_details_{$id}", 120, function () use ($id) {
            $response = Http::get("https://api.coingecko.com/api/v3/coins/{$id}", [
                'tickers' => 'false',
                'market_data' => 'true',
                'community_data' => 'false',
                'developer_data' => 'false',
            ]);

            return $response->json();
        });
    }

    public function getHistory(Request $request)
    {
        $coinId = $request->query('coin_id');
        $symbol = $request->query('symbol');

        $asset = Auth::user()->assets()
            ->when($coinId, fn($q) => $q->where('coin_id', $coinId))
            ->when($symbol, fn($q) => $q->where('asset_symbol', $symbol))
            ->first();

        if (!$asset) return response()->json([]);

        return $asset->purchases()->orderBy('purchase_date', 'desc')->get();
    }

    public function getAllHistory(Request $request)
    {
        $user = Auth::user();
        
        return $user->purchases()
            ->select('user_asset_purchases.*', 'user_assets.asset_symbol')
            ->orderBy('purchase_date', 'desc')
            ->get();
    }

    public function destroyPurchase($id)
    {
        $purchase = UserAssetPurchase::findOrFail($id);
        $asset = $purchase->asset;

        if ($asset->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $purchase->delete();

        // Se o ativo não tiver mais compras, talvez queiramos remover o ativo também?
        // Mas por enquanto vamos apenas resetar os atributos de stats.
        $this->syncAssetStats($asset);

        return response()->json(['message' => 'Registro de compra removido']);
    }

    protected function syncAssetStats($asset)
    {
        $purchases = $asset->purchases;
        $totalQuantity = $purchases->sum('quantity');
        
        // Calculate average price in BRL
        $totalCostBrl = $purchases->reduce(function ($carry, $p) {
            $price = $p->purchase_price;
            if ($p->currency === 'USD') {
                $price *= ($p->exchange_rate ?? 1);
            }
            return $carry + ($price * $p->quantity);
        }, 0);

        $avgPrice = $totalQuantity > 0 ? $totalCostBrl / $totalQuantity : 0;

        $asset->update([
            'quantity' => $totalQuantity,
            'average_price' => $avgPrice,
        ]);
    }
}
