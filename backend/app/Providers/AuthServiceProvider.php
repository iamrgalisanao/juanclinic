<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // GLOBAL_ADMIN from the System Root tenant bypasses all policy checks.
        // This is the canonical Laravel super-admin pattern using Gate::before().
        Gate::before(function ($user, $ability) {
            if ($user->role === 'GLOBAL_ADMIN' && (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                return true;
            }
        });
    }
}
