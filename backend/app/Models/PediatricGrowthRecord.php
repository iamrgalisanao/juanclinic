<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property \Carbon\Carbon $measured_at
 */
class PediatricGrowthRecord extends Model
{
    use \App\Traits\BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'weight_kg',
        'height_cm',
        'height_cm',
        'head_circumference_cm',
        'measured_at',
        'metadata',
    ];

    protected $casts = [
        'measured_at' => 'date',
        'metadata' => 'json',
        'weight_kg' => 'decimal:3',
        'height_cm' => 'decimal:2',
        'head_circumference_cm' => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
