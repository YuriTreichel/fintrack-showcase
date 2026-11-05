<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = ['user_id', 'name', 'type', 'currency', 'initial_balance', 'is_main'];

    protected $casts = [
        'is_main' => 'boolean',
    ];
}
