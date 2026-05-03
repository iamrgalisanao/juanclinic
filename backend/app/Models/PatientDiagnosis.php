<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\BelongsToBranch;

class PatientDiagnosis extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'disease_id',
        'display_name',
        'clinical_status',
        'verification_status',
        'is_problem_list',
        'is_chronic',
        'onset_date',
        'diagnosed_at',
        'metadata',
        'recorded_by',
        'clinical_note_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'diagnosed_at' => 'datetime',
        'onset_date' => 'date',
        'is_problem_list' => 'boolean',
        'is_chronic' => 'boolean',
    ];

    /**
     * The master disease from catalog.
     */
    public function disease()
    {
        return $this->belongsTo(Disease::class);
    }

    /**
     * The patient who has the diagnosis.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * The clinician who recorded the diagnosis.
     */
    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * The optional clinical note where this was documented.
     */
    public function clinicalNote()
    {
        return $this->belongsTo(ClinicalNote::class);
    }
}
