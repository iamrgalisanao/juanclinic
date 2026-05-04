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
        if (app()->bound('tenant')) {
            $tenant = app('tenant');
            
            if ($tenant->plan_tier === 'SUSPENDED') {
                return response()->json([
                    'message' => 'Your tenant has been suspended. Please contact administration.',
                    'error_code' => 'TENANT_SUSPENDED'
                ], 403);
            }
        }

        return $next($request);
    }
}
