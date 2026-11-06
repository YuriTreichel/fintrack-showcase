<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = ['user_id', 'name', 'limit', 'brand', 'closing_day', 'due_day'];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
