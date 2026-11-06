<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'whatsapp',
        'is_admin',
        'is_suspended',
        'password',
        'sharing_code',
        'theme_color',
        'stripe_id',
        'subscription_status',
        'trial_ends_at',
        'subscription_ends_at',
        'plan',
        'tour_completed',
        'last_login_at',
        'last_activity_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_suspended' => 'boolean',
            'subscription_ends_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'tour_completed' => 'boolean',
            'last_login_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            if (! $user->sharing_code) {
                $user->sharing_code = static::generateUniqueSharingCode();
            }
        });

        static::created(function ($user) {
            $user->createDefaultCategories();
        });
    }

    public static function generateUniqueSharingCode()
    {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12));
        } while (static::where('sharing_code', $code)->exists());

        return $code;
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'user_shares', 'follower_id', 'user_id');
    }

    /**
     * Verifica se o utilizador tem QUALQUER plano ativo (Basic ou Premium ou Trial).
     */
    public function hasActivePlan(): bool
    {
        // Se estiver no período de Trial, tem acesso
        if ($this->trial_ends_at && $this->trial_ends_at->isFuture()) {
            return true;
        }

        // Se o status não for ativo, já negamos
        if ($this->subscription_status !== 'active') {
            return false;
        }

        // Se houver uma data de término (cancelamento agendado), verificamos se já passamos dela
        if ($this->subscription_ends_at && $this->subscription_ends_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Verifica se o utilizador tem o Plano Básico.
     */
    public function hasBasicPlan(): bool
    {
        return $this->hasActivePlan() && $this->plan === 'basic';
    }

    /**
     * Verifica se o utilizador tem o Plano Premium.
     */
    public function hasPremiumPlan(): bool
    {
        // Trial sempre libera Premium
        if ($this->trial_ends_at && $this->trial_ends_at->isFuture()) {
            return true;
        }

        return $this->hasActivePlan() && $this->plan === 'premium';
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'user_shares', 'user_id', 'follower_id');
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function assets()
    {
        return $this->hasMany(UserAsset::class);
    }

    public function purchases()
    {
        return $this->hasManyThrough(UserAssetPurchase::class, UserAsset::class);
    }

    public function debts()
    {
        return $this->hasMany(Debt::class);
    }

    /**
     * Assessor para verificar se o utilizador é VIP (Plano Premium).
     * Usado pelo middleware CheckVipAccess.
     */
    public function getIsVipAttribute(): bool
    {
        return $this->hasPremiumPlan();
    }

    /**
     * Cria categorias padrão para o novo usuário.
     */
    public function createDefaultCategories()
    {
        $defaults = [
            ['name' => 'Alimentação', 'type' => 'Expense', 'icon' => 'Utensils'],
            ['name' => 'Transporte', 'type' => 'Expense', 'icon' => 'Car'],
            ['name' => 'Moradia', 'type' => 'Expense', 'icon' => 'Home'],
            ['name' => 'Saúde', 'type' => 'Expense', 'icon' => 'Heart'],
            ['name' => 'Lazer', 'type' => 'Expense', 'icon' => 'Gamepad2'],
            ['name' => 'Educação', 'type' => 'Expense', 'icon' => 'GraduationCap'],
            ['name' => 'Compras', 'type' => 'Expense', 'icon' => 'ShoppingBag'],
            ['name' => 'Salário', 'type' => 'Income', 'icon' => 'Wallet'],
            ['name' => 'Investimentos', 'type' => 'Income', 'icon' => 'HandCoins'],
            ['name' => 'Outros', 'type' => 'Expense', 'icon' => 'Tag'],
        ];

        try {
            foreach ($defaults as $category) {
                $this->categories()->create($category);
            }
        } catch (\Exception $e) {
            Log::error("Erro ao criar categorias padrão para o usuário {$this->id}: ".$e->getMessage());
        }
    }
}
