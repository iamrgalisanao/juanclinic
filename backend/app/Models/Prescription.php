<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;
use App\Traits\BelongsToBranch;

class Prescription extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, BelongsToBranch;

    protected $fillable = [
        'patient_id',
        'medicine_id',
        'medicine_form_id',
        'physician_id',
        'medication_name',
        'quantity',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'status',
        'branch_id',
        'tenant_id',
        'dispensed_at',
        'dispensed_by',
        'qr_uuid',
        'dispensed_quantity',
        'remaining_quantity',
    ];

    protected static function booted()
    {
        static::creating(function ($prescription) {
            $prescription->qr_uuid = (string) \Illuminate\Support\Str::uuid();
            $prescription->remaining_quantity = $prescription->quantity;
        });
    }

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

    public function medicineForm()
    {
        return $this->belongsTo(MedicineForm::class);
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
