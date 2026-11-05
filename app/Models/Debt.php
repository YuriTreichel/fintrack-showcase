<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    protected $fillable = [
        'user_id',
        'description',
        'creditor',
        'amount',
        'original_amount',
        'is_negotiated',
        'interest_rate',
        'date',
        'status',
        'observations',
        'parent_id',
        'installment_number',
        'total_installments',
    ];

    protected $appends = ['total_savings'];

    public function getTotalSavingsAttribute()
    {
        return max(0, ($this->original_amount ?? $this->amount) - $this->amount);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
