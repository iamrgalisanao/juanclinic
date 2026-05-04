<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Platform Administrators bypass suspension checks to allow for recovery and un-suspension
        if ($user && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            if (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                return $next($request);
            }
        }

        if (app()->bound('tenant')) {
            $tenant = app('tenant');
            
            if ($tenant->plan_tier === 'SUSPENDED') {
                \Log::warning("Access denied: Tenant #{$tenant->id} ({$tenant->name}) is SUSPENDED. Requested: " . $request->fullUrl());
                return response()->json([
                    'message' => 'Your tenant has been suspended. Please contact administration.',
                    'error_code' => 'TENANT_SUSPENDED'
                ], 403);
            }
        }

        return $next($request);
    }
}
