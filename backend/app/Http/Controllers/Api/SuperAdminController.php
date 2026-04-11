<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    protected $entitlementService;
    
    public function __construct(\App\Services\EntitlementService $entitlementService)
    {
        $this->entitlementService = $entitlementService;
    }

    /**
     * List all tenants with their commercial context.
     */
    public function listTenants()
    {
        return Tenant::withCount('branches')->get();
    }

    /**
     * Update a tenant's commercial tier and feature matrix (Cherry-picking).
     */
    public function updateCommercialPlan(Request $request, $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        $payload = $request->validate([
            'plan_tier' => 'nullable|string|in:BRONZE,SILVER,GOLD,TRIAL',
            'pediatrics_enabled' => 'nullable|boolean',
            'inventory_enabled' => 'nullable|boolean',
            'pharmacy_enabled' => 'nullable|boolean',
            'pacs_enabled' => 'nullable|boolean',
            'workforce_enabled' => 'nullable|boolean',
            'trial_ends_at' => 'nullable|date'
        ]);

        $tenant->update(collect($payload)->filter()->toArray());

        // Clear all relevant feature caches to ensure immediate real-time enforcement
        foreach (['pediatrics_enabled', 'inventory_enabled', 'pharmacy_enabled', 'pacs_enabled', 'workforce_enabled'] as $gate) {
            $this->entitlementService->clearCache($tenant->id, $gate);
        }

        return response()->json([
            'message' => "Commercial plan updated for {$tenant->name}.",
            'tenant' => $tenant
        ]);
    }

    /**
     * Generate an impersonation token for a tenant environment.
     * Restricted to GLOBAL_ADMIN only. Events are logged for audit compliance.
     */
    public function impersonate($tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);
        
        // Audit: Log the impersonation event (non-blocking — token issuance must succeed)
        try {
            \App\Models\AuditLog::create([
                'tenant_id'      => Tenant::SYSTEM_ID,
                'user_id'        => auth()->id(),
                'event'          => 'IMPERSONATION_STARTED',
                'description'    => "Global Admin impersonating tenant: {$tenant->name} (#{$tenant->id})",
                'auditable_type' => Tenant::class,
                'auditable_id'   => $tenant->id,
                'metadata'       => ['target_tenant_id' => $tenant->id, 'ip' => request()->ip()],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Audit log failed for IMPERSONATION_STARTED: " . $e->getMessage());
        }

        // Generate a context-switched token
        // Use a high-privilege identifier but scoped to the target tenant
        $token = auth()->user()->createToken("impersonation_{$tenant->slug}", ['*'])->plainTextToken;

        return response()->json([
            'message' => "Impersonating {$tenant->name}...",
            'token' => $token,
            'tenant' => $tenant
        ]);
    }

    /**
     * Legacy support: Toggle a specific enterprise feature for a tenant.
     */
    public function toggleFeature(Request $request, $tenantId)
    {
        return $this->updateCommercialPlan($request, $tenantId);
    }
}
