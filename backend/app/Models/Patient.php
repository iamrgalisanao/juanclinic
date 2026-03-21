<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\AuditLogTrait;

use App\Traits\HasAmendments;

class Patient extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, \App\Traits\BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'patient_external_id',
        'first_name',
        'last_name',
        'dob',
        'gender',
        'contact',
        'metadata',
        'branch_id',
    ];

    protected $casts = [
        'dob' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Get the branch where the patient was registered.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}
