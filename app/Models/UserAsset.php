<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAsset extends Model
{
    protected $fillable = [
        'user_id',
        'asset_symbol',
        'coin_id',
        'quantity',
        'average_price',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function purchases()
    {
        return $this->hasMany(UserAssetPurchase::class, 'user_asset_id');
    }
}
