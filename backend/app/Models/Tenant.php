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
        'slug', 
        'admin_settings',
        'plan_tier',
        'pediatrics_enabled',
        'inventory_enabled',
        'pharmacy_enabled',
        'pacs_enabled',
        'workforce_enabled',
        'subscription_data',
        'trial_ends_at'
    ];

    protected $casts = [
        'admin_settings' => 'array',
        'subscription_data' => 'array',
        'pediatrics_enabled' => 'boolean',
        'inventory_enabled' => 'boolean',
        'pharmacy_enabled' => 'boolean',
        'pacs_enabled' => 'boolean',
        'workforce_enabled' => 'boolean',
        'trial_ends_at' => 'datetime',
    ];

    /**
     * Get the branches for the tenant.
     */
    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
