<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Scopes\TenantScope;

class Medicine extends Model
{
    protected $fillable = [
        'tenant_id',
        'generic_name',
        'brand_name',
        'form',
        'strength',
        'price',
        'stock',
        'is_system',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        // Global medicines (is_system = true) should be visible to all tenants.
        // Custom medicines (is_system = false) should only be visible to their tenant.
        static::addGlobalScope('tenant_or_system', function ($builder) {
            $tenantId = request()->header('X-Tenant-ID');
            $builder->where(function ($query) use ($tenantId) {
                $query->where('is_system', true)
                      ->orWhere('tenant_id', $tenantId);
            });
        });
    }
}
