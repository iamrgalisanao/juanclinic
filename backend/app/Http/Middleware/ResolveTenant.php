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
        // Bypass for Super Admin routes to avoid tenant resolution interference
        if ($request->is('api/sa/*')) {
            return $next($request);
        }

        $tenantId = $request->header('X-Tenant-ID');

        // Fallback 1: Input param
        if (!$tenantId) {
            $tenantId = $request->input('tenant_id');
        }

        // Fallback 2: Session
        if (!$tenantId && $request->hasSession()) {
            $tenantId = $request->session()->get('tenant_id');
        }

        $tenant = null;

        if ($tenantId) {
            $tenant = \App\Models\Tenant::find($tenantId);
        }

        // Fallback 3: Subdomain resolution (High priority for production/custom domains)
        if (!$tenant) {
            $host = $request->getHost();
            $parts = explode('.', $host);
            // Assuming subdomain.domain.com or subdomain.staging.domain.com
            // We'll take the first part as the slug
            if (count($parts) >= 2) {
                $slug = $parts[0];
                // Ignore common subdomains
                if (!in_array($slug, ['www', 'api', 'app', 'admin'])) {
                    $tenant = \App\Models\Tenant::where('slug', $slug)->first();
                }
            }
        }

        if ($tenant) {
            app()->instance('tenant', $tenant);
            if ($request->hasSession()) {
                session(['tenant_id' => $tenant->id]);
            }
        }

        // Proceed without binding if no tenant context found
        return $next($request);
    }
}
