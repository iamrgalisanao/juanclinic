<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For development, we'll allow setting tenant via header or session
        $tenantId = $request->header('X-Tenant-ID') ?: $request->session()->get('tenant_id');

        if ($tenantId) {
            session(['tenant_id' => $tenantId]);
        }

        return $next($request);
    }
}
