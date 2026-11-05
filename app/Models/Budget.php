<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'amount',
        'is_fixed',
        'type',
        'percentage_value',
        'period',
        'month',
        'year',
    ];

    protected $casts = [
        'is_fixed' => 'boolean',
        'amount' => 'decimal:2',
        'percentage_value' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
