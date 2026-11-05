<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAssetPurchase extends Model
{
    protected $fillable = [
        'user_asset_id',
        'quantity',
        'purchase_price',
        'currency',
        'exchange_rate',
        'purchase_date',
    ];

    public function asset()
    {
        return $this->belongsTo(UserAsset::class, 'user_asset_id');
    }
}
