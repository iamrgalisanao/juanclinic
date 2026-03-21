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
        'invoice_id',
        'physician_id',
        'medicine_id',
        'medication_name',
        'quantity',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'status', // ACTIVE, COMPLETED, CANCELLED
        'dispensed_at',
        'dispensed_by',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function physician()
    {
        return $this->belongsTo(User::class, 'physician_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function dispenser()
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
