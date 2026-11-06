<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'date',
        'type',
        'status',
        'account_id',
        'to_account_id',
        'category_id',
        'card_id',
        'is_recurring',
        'frequency',
        'parent_id',
        'installment_number',
        'total_installments',
        'attachment_path',
        'goal_id',
        'debt_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date:Y-m-d',
        'is_recurring' => 'boolean',
        'installment_number' => 'integer',
        'total_installments' => 'integer',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function toAccount()
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }
}
