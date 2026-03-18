<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;

class Prescription extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'physician_id',
        'medication_name',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'status', // ACTIVE, COMPLETED, CANCELLED
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function physician()
    {
        return $this->belongsTo(User::class, 'physician_id');
    }
}
