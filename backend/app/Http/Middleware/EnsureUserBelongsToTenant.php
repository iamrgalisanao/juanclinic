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

        // Allow Global Admins with SYSTEM_ID to access any tenant as global admins
        if ($user && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN']) && (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
            return $next($request);
        }

        if (!app()->bound('tenant')) {
            return response()->json(['message' => 'Tenant context missing.'], 403);
        }

        $tenant = app('tenant');

        if (!$tenant || $user->tenant_id != $tenant->id) {
            \Log::warning("Tenant access denied: User ID {$user->id} (tenant {$user->tenant_id}) attempted to access Tenant " . ($tenant ? $tenant->id : 'null'));
            return response()->json(['message' => 'User does not belong to this tenant.'], 403);
        }

        // Load tenant-specific notification settings (SMTP, SMS API Keys, etc.)
        app(\App\Services\NotificationSettingsManager::class)->loadSettings();

        return $next($request);
    }
}
