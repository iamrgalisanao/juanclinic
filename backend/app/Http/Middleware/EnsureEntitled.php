<?php

namespace App\Http\Middleware;

use App\Services\EntitlementService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEntitled
{
    protected $entitlementService;

    public function __construct(EntitlementService $entitlementService)
    {
        $this->entitlementService = $entitlementService;
    }

    /**
     * Handle an incoming request.
     * Check if the tenant is entitled to a specific feature.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string $feature
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (!$this->entitlementService->hasFeature($feature)) {
            return response()->json([
                'message' => "Module '{$feature}' is locked. Upgrade to Enterprise to enable this feature.",
                'error_code' => 'ENTITLEMENT_LOCKED',
                'feature' => $feature,
                'upgrade_url' => '/settings/billing' // Example redirect for the frontend
            ], 403);
        }

        return $next($request);
    }
}
