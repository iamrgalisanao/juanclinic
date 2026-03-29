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
        'dose_number',
        'administered_at',
        'administered_by',
        'lot_number',
        'next_due_date',
        'remarks',
    ];

    protected $casts = [
        'administered_at' => 'date',
        'next_due_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
