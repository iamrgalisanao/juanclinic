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
        $tenant = app('tenant');
        $user = $request->user();

        // Allow Admins with null tenant_id to access any tenant as global admins
        if ($user->role === 'ADMIN' && is_null($user->tenant_id)) {
            return $next($request);
        }

        if (!$tenant || $user->tenant_id != $tenant->id) {
            \Log::warning("Tenant access denied: User ID {$user->id} (tenant {$user->tenant_id}) attempted to access Tenant " . ($tenant ? $tenant->id : 'null'));
            return response()->json(['message' => 'User does not belong to this tenant.'], 403);
        }

        return $next($request);
    }
}
