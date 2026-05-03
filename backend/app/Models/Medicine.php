<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Scopes\TenantScope;

use App\Traits\AuditLogTrait;

class Medicine extends Model
{
    use AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'source_id',
        'generic_name',
        'brand_name',
        'company_name',
        'content',
        'generic_content',
        'therapeutic_class',
        'prescription_class',
        'class',
        'form_class',
        'brand_status',
        'is_prescribable',
        'show_brand_info',
        'brand_shot_url',
        'description',
        'indications_text',
        'dose_text',
        'contraindications_text',
        'precautions_text',
        'drug_interactions_text',
        'packaging_text',
        'source_system',
        'classification',
        'is_system',
        // Deprecated fields (Phase 2)
        'form',
        'strength',
        'price',
        'stock',
    ];

    public function forms(): HasMany
    {
        return $this->hasMany(MedicineForm::class);
    }

    /**
     * Diseases associated with this medicine for discovery.
     */
    public function diseases()
    {
        return $this->belongsToMany(Disease::class, 'medicine_disease_map')
            ->withPivot(['source', 'metadata'])
            ->withTimestamps();
    }



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
                $query->where('medicines.is_system', true)
                      ->orWhere('medicines.tenant_id', $tenantId);
            });
        });

    }
}
