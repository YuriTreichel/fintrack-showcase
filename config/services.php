<?php

return [
    // ... outros serviços ...
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'plans' => [
            'basic_monthly' => env('CASHIER_PRICE_BASIC_MONTHLY'),
            'premium_monthly' => env('CASHIER_PRICE_PREMIUM_MONTHLY'),
            'premium_annual' => env('CASHIER_PRICE_PREMIUM_ANNUAL'),
        ],
    ],
    'brapi' => [
        'key' => env('BRAPI_API_KEY'),
    ],
];
