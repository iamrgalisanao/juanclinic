<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;

use App\Traits\HasAmendments;

class Order extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, \App\Traits\BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'order_type',
        'request_details',
        'priority',
        'status',
        'result_data',
        'performed_by',
        'performed_at',
        'approved_by',
        'approved_at',
        'acknowledged_at',
        'acknowledged_by',
        'branch_id',
    ];

    protected $casts = [
        'request_details' => 'array',
        'result_data' => 'array',
        'performed_at' => 'datetime',
        'approved_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function results()
    {
        return $this->hasMany(DiagnosticResult::class);
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * Get the branch for the order.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the technician who performed the order.
     */
    public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the specialist who approved the order.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function imagingStudies()
    {
        return $this->hasMany(ImagingStudy::class);
    }
}
