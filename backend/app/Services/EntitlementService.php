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

        $tenant = app('tenant');
        if (!$tenant) {
            return false;
        }

        // Cache the feature lookup for high-traffic clinical endpoints
        $cacheKey = "tenant_{$tenant->id}_feature_{$feature}";
        
        return Cache::remember($cacheKey, 3600, function () use ($tenant, $feature) {
            // Priority 1: Explicit Commercial Columns (Phase 12)
            if (isset($tenant->{$feature})) {
                return (bool) $tenant->{$feature};
            }

            // Priority 2: JSON Admin Settings fallback
            $settings = $tenant->admin_settings;
            return (bool) ($settings['features'][$feature] ?? false);
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
            $commonGates = ['pacs_enabled', 'pediatrics_enabled', 'empi_sync_enabled'];
            foreach ($commonGates as $gate) {
                Cache::forget("tenant_{$tenantId}_feature_{$gate}");
            }
        }
    }
}
