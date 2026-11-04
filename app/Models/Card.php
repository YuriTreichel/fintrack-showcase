<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'credit_limit',
        'closing_day',
        'due_day',
        'account_id',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'closing_day' => 'integer',
        'due_day' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get pending invoice balance for a specific billing cycle (month/year).
     */
    public function getCycleBalance(int $month, int $year): float
    {
        $startDate = Carbon::create($year, $month, $this->closing_day)->subMonth()->addDay();
        $endDate = Carbon::create($year, $month, $this->closing_day);

        return (float) $this->transactions()
            ->where('status', 'Pending')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->sum('amount');
    }
}
