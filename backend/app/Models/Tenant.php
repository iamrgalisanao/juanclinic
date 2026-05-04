<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    const SYSTEM_ID = 888;

    protected $fillable = [
        'name', 
        'tin', 
        'registered_business_name', 
        'official_address', 
        'contact_number',
        'logo_path',
        'slug', 
        'admin_settings',
        'plan_tier',
        'pediatrics_enabled',
        'inventory_enabled',
        'pharmacy_enabled',
        'pacs_enabled',
        'laboratory_enabled',
        'radiology_enabled',
        'workforce_enabled',
        'sms_enabled',
        'email_enabled',
        'billing_enabled',
        'portal_enabled',
        'empi_enabled',
        'telehealth_enabled',
        'analytics_enabled',
        'offline_sync_enabled',
        'referrals_enabled',
        'queue_enabled',
        'claims_enabled',
        'subscription_data',
        'trial_ends_at',
        'suspended_at'
    ];

    protected $appends = ['logo_url', 'entitlements'];
    protected $hidden = ['admin_settings', 'subscription_data']; // Protect sensitive backend config

    public function getLogoUrlAttribute()
    {
        return $this->logo_path ? asset('storage/' . $this->logo_path) : null;
    }

    public function getEntitlementsAttribute()
    {
        $service = app(\App\Services\EntitlementService::class);
        $features = [
            'pediatrics_enabled', 'inventory_enabled', 'pharmacy_enabled', 'pacs_enabled', 
            'laboratory_enabled', 'radiology_enabled', 'workforce_enabled', 'sms_enabled', 
            'email_enabled', 'billing_enabled', 'portal_enabled', 'empi_enabled', 
            'telehealth_enabled', 'analytics_enabled', 'offline_sync_enabled', 
            'referrals_enabled', 'queue_enabled', 'claims_enabled'
        ];
        
        $results = [];
        foreach ($features as $feature) {
            $results[$feature] = $service->hasFeatureForTenant($this, $feature);
        }
        return $results;
    }

    protected $casts = [
        'admin_settings' => 'array',
        'subscription_data' => 'array',
        'pediatrics_enabled' => 'boolean',
        'inventory_enabled' => 'boolean',
        'pharmacy_enabled' => 'boolean',
        'pacs_enabled' => 'boolean',
        'laboratory_enabled' => 'boolean',
        'radiology_enabled' => 'boolean',
        'workforce_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'email_enabled' => 'boolean',
        'billing_enabled' => 'boolean',
        'portal_enabled' => 'boolean',
        'empi_enabled' => 'boolean',
        'telehealth_enabled' => 'boolean',
        'analytics_enabled' => 'boolean',
        'offline_sync_enabled' => 'boolean',
        'referrals_enabled' => 'boolean',
        'queue_enabled' => 'boolean',
        'claims_enabled' => 'boolean',
        'trial_ends_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    /**
     * Get the branches for the tenant.
     */
    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
