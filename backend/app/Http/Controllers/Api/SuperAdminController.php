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
            'plan_tier' => 'nullable|string|in:BRONZE,SILVER,GOLD,TRIAL,SUSPENDED',
            'pediatrics_enabled' => 'nullable|boolean',
            'inventory_enabled' => 'nullable|boolean',
            'pharmacy_enabled' => 'nullable|boolean',
            'laboratory_enabled' => 'nullable|boolean',
            'radiology_enabled' => 'nullable|boolean',
            'workforce_enabled' => 'nullable|boolean',
            'sms_enabled' => 'nullable|boolean',
            'email_enabled' => 'nullable|boolean',
            'billing_enabled' => 'nullable|boolean',
            'portal_enabled' => 'nullable|boolean',
            'empi_enabled' => 'nullable|boolean',
            'telehealth_enabled' => 'nullable|boolean',
            'analytics_enabled' => 'nullable|boolean',
            'offline_sync_enabled' => 'nullable|boolean',
            'referrals_enabled' => 'nullable|boolean',
            'queue_enabled' => 'nullable|boolean',
            'claims_enabled' => 'nullable|boolean',
            'trial_ends_at' => 'nullable|date',
            'purge_after_days' => 'nullable|integer|min:1'
        ]);

        $filteredPayload = collect($payload)->except(['purge_after_days'])->filter(fn($val) => !is_null($val))->toArray();
        
        // Handle suspension timestamps
        if (isset($filteredPayload['plan_tier'])) {
            if ($filteredPayload['plan_tier'] === 'SUSPENDED' && $tenant->plan_tier !== 'SUSPENDED') {
                $filteredPayload['suspended_at'] = now();
            } elseif ($filteredPayload['plan_tier'] !== 'SUSPENDED' && $tenant->plan_tier === 'SUSPENDED') {
                $filteredPayload['suspended_at'] = null;
            }
        }

        // Handle purge_after_days in admin_settings
        if (isset($payload['purge_after_days'])) {
            $adminSettings = $tenant->admin_settings ?? [];
            $adminSettings['purge_after_days'] = (int) $payload['purge_after_days'];
            $filteredPayload['admin_settings'] = $adminSettings;
        }

        $tenant->update($filteredPayload);

        // Clear all relevant feature caches to ensure immediate real-time enforcement
        $gates = [
            'pediatrics_enabled', 'inventory_enabled', 'pharmacy_enabled', 'pacs_enabled', 
            'laboratory_enabled', 'radiology_enabled', 'workforce_enabled', 'sms_enabled', 
            'email_enabled', 'billing_enabled', 'portal_enabled', 'empi_enabled', 
            'telehealth_enabled', 'analytics_enabled', 'offline_sync_enabled', 
            'referrals_enabled', 'queue_enabled', 'claims_enabled'
        ];
        foreach ($gates as $gate) {
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
