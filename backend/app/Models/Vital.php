<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    use \App\Traits\BelongsToTenant, \App\Traits\AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'encounter_id',
        'author_id',
        'weight_kg',
        'height_cm',
        'bmi',
        'temp_c',
        'bp_systolic',
        'bp_diastolic',
        'pulse_rate',
        'resp_rate',
        'spo2',
        'pain_score',
        'blood_glucose_mgdl',
        'head_circumference_cm',
        'oxygen_source',
        'bp_position',
        'bp_arm',
        'recorded_at',
        'remarks',
        'metadata',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'metadata' => 'json',
        'weight_kg' => 'decimal:3',
        'height_cm' => 'decimal:2',
        'bmi' => 'decimal:2',
        'temp_c' => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
