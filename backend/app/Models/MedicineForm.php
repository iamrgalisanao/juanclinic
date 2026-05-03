<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Traits\AuditLogTrait;

class MedicineForm extends Model
{
    use AuditLogTrait;

    protected $fillable = [
        'medicine_id',
        'legacy_medicine_id',
        'external_form_id',
        'brand_form',
        'form_name',
        'strength',
        'form_unit',
        'form_unit_plural',
        'form_dose_type',
        'price',
        'prescription_class',
        'is_dangerous',
        'compute',
    ];

    protected $appends = [
        'generic_name',
        'brand_name',
        'is_system',
        'therapeutic_class',
    ];

    /**
     * Virtual attributes to support legacy frontend expectations
     */
    public function getGenericNameAttribute()
    {
        return $this->medicine?->generic_name;
    }

    public function getBrandNameAttribute()
    {
        return $this->medicine?->brand_name;
    }

    public function getIsSystemAttribute()
    {
        return (bool) ($this->medicine?->is_system ?? false);
    }

    public function getTherapeuticClassAttribute()
    {
        return $this->medicine?->therapeutic_class;
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(TenantMedicineInventory::class);
    }

    public function lots(): HasMany
    {
        return $this->hasMany(MedicineLot::class);
    }
}
