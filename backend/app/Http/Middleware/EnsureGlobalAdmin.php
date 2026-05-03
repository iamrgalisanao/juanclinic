<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGlobalAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $isMaster = false;
        if ($user && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            if (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                $isMaster = true;
            }
        }

        if (!$isMaster) {
            return response()->json(['message' => 'Super Admin access required.'], 403);
        }

        return $next($request);
    }
}
