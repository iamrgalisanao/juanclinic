<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;

class EntitlementService
{
    /**
     * Check if the current tenant has access to a specific feature.
     * Uses caching and System Tenant (888) bypass logic.
     */
    public function hasFeature(string $feature): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }

        // Global System Root (888) always has all features enabled
        if ($user->tenant_id === Tenant::SYSTEM_ID) {
            return true;
        }

        // Platform-wide Admins with null tenant always have all features enabled (Bypass multi-tenant isolation)
        if (in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN']) && is_null($user->tenant_id)) {
            return true;
        }

        $tenant = app()->bound('tenant') ? app('tenant') : null;
        if (!$tenant) {
            return false;
        }

        return $this->hasFeatureForTenant($tenant, $feature);
    }

    /**
     * Check if a specific tenant has access to a feature, regardless of current user.
     */
    public function hasFeatureForTenant(Tenant $tenant, string $feature): bool
    {
        // Cache the feature lookup for high-traffic clinical endpoints
        $cacheKey = "tenant_{$tenant->id}_feature_{$feature}";
        
        return Cache::remember($cacheKey, 60, function () use ($tenant, $feature) {
            // Priority 1: High-Tier & Active Trial Bypass (Enterprise Governance)
            if ($tenant->plan_tier === 'GOLD' || $tenant->plan_tier === 'TRIAL') {
                if ($tenant->plan_tier === 'TRIAL' && $tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
                    \Log::info("Entitlement: Feature '{$feature}' DENIED for Tenant #{$tenant->id} (Trial Expired)");
                    return false;
                }
                return true;
            }

            // Priority 2: Explicit Commercial Columns (Phase 12)
            if (isset($tenant->{$feature})) {
                $allowed = (bool) $tenant->{$feature};
                if (!$allowed) {
                    \Log::info("Entitlement: Feature '{$feature}' DENIED for Tenant #{$tenant->id} (Column flag is false)");
                }
                return $allowed;
            }

            // Priority 3: JSON Admin Settings fallback
            $settings = $tenant->admin_settings;
            $allowed = (bool) ($settings['features'][$feature] ?? false);
            if (!$allowed) {
                \Log::info("Entitlement: Feature '{$feature}' DENIED for Tenant #{$tenant->id} (No settings/fallback found)");
            }
            return $allowed;
        });
    }

    /**
     * Clear the feature entitlement cache for a specific tenant and feature.
     * Call this when upgrading a tenant's subscription.
     */
    public function clearCache(int $tenantId, ?string $feature = null): void
    {
        if ($feature) {
            Cache::forget("tenant_{$tenantId}_feature_{$feature}");
        } else {
            // If no feature specified, clear common specialty gates to be safe
            $commonGates = [
                'pacs_enabled', 'pediatrics_enabled', 'empi_sync_enabled', 
                'laboratory_enabled', 'radiology_enabled', 'pharmacy_enabled',
                'billing_enabled', 'portal_enabled', 'telehealth_enabled'
            ];
            foreach ($commonGates as $gate) {
                $this->clearCache($tenantId, $gate);
            }
        }
    }
}
