<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;

class Invoice extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'order_id', // Link to Lab/Rad order
        'invoice_number',
        'total_amount',
        'status', // UNPAID, PARTIAL, PAID
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
