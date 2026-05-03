<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // GLOBAL_ADMIN or unassigned ADMIN from roots bypass all role restrictions
        if ($request->user() && in_array($request->user()->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            $user = $request->user();
            if (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                return $next($request);
            }
        }

        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Unauthorized role.'], 403);
        }

        return $next($request);
    }
}
