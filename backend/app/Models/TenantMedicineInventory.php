<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantMedicineInventory extends Model
{
    protected $table = 'tenant_medicine_inventory';

    protected $fillable = [
        'tenant_id',
        'medicine_form_id',
        'stock',
        'price_override',
    ];

    public function medicineForm(): BelongsTo
    {
        return $this->belongsTo(MedicineForm::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
