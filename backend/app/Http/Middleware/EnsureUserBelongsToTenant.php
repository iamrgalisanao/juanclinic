<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 2. Master Admin bypass: Role ADMIN or GLOBAL_ADMIN with either null tenant_id or SYSTEM_ID (888)
        // This bypasses both the binding check and the ownership check
        if ($user && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            if (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                return $next($request);
            }
        }

        if (!app()->bound('tenant')) {
            // Attempt recovery if user has a tenant_id
            if ($user && $user->tenant_id) {
                $tenantModel = \App\Models\Tenant::find($user->tenant_id);
                if ($tenantModel) {
                    app()->instance('tenant', $tenantModel);
                    \Log::info("Recovery: Bound tenant from user ID {$user->id} in EnsureUserBelongsToTenant");
                } else {
                    return response()->json(['message' => 'Tenant context missing and recovery failed.'], 403);
                }
            } else {
                return response()->json(['message' => 'Tenant context missing.'], 403);
            }
        }

        $tenant = app('tenant');

        // 3. Ownership Check: User must belong to the tenant they are accessing
        if (!$tenant || $user->tenant_id != $tenant->id) {
            \Log::warning("Tenant access denied: User ID {$user->id} (User Tenant: " . ($user->tenant_id ?? 'NULL') . ") attempted to access Tenant Context: " . ($tenant ? $tenant->id : 'null'));
            return response()->json([
                'message' => 'User does not belong to this tenant.',
                'debug_context' => [
                    'user_tenant' => $user->tenant_id,
                    'active_tenant' => $tenant ? $tenant->id : null
                ]
            ], 403);
        }

        // Load tenant-specific notification settings (SMTP, SMS API Keys, etc.)
        app(\App\Services\NotificationSettingsManager::class)->loadSettings();

        return $next($request);
    }
}
