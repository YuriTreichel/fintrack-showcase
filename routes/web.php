<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// For showcase demonstration: authenticate default demo user if not logged in
Route::get('/{any?}', function () {
    if (! Auth::check()) {
        $demoUser = User::first();
        if ($demoUser) {
            Auth::login($demoUser);
        }
    }

    return view('app');
})->where('any', '.*');
