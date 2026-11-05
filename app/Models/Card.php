<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = ['name', 'closing_day', 'due_day', 'account_id'];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
