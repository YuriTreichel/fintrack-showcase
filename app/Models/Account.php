<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'initial_balance',
        'currency',
        'is_main',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'is_main' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    /**
     * Calculate current actual balance derived from initial balance + settled transactions.
     */
    public function getCalculatedBalanceAttribute(): float
    {
        $incomes = (float) $this->transactions()
            ->where('status', 'Paid')
            ->where('type', 'Income')
            ->sum('amount');

        $expenses = (float) $this->transactions()
            ->where('status', 'Paid')
            ->where('type', 'Expense')
            ->sum('amount');

        $transfersOut = (float) $this->transactions()
            ->where('status', 'Paid')
            ->where('type', 'Transfer')
            ->sum('amount');

        $transfersIn = (float) Transaction::where('to_account_id', $this->id)
            ->where('status', 'Paid')
            ->where('type', 'Transfer')
            ->sum('amount');

        return (float) $this->initial_balance + $incomes - $expenses - $transfersOut + $transfersIn;
    }
}
