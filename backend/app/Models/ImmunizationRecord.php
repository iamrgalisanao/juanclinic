<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property \Carbon\Carbon $administered_at
 * @property \Carbon\Carbon $next_due_date
 */
class ImmunizationRecord extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'vaccine_name',
        'manufacturer',
        'dose_number',
        'administered_at',
        'administered_by',
        'lot_number',
        'site',
        'route',
        'next_due_date',
        'vis_edition_date',
        'vis_provided_date',
        'cvx_code',
        'ndc_code',
        'remarks',
    ];

    protected $casts = [
        'administered_at' => 'date',
        'next_due_date' => 'date',
        'vis_edition_date' => 'date',
        'vis_provided_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
