<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\AuditLogTrait;

use App\Traits\HasAmendments;

use Illuminate\Notifications\Notifiable;

/**
 * @property \Carbon\Carbon $dob
 */
class Patient extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, \App\Traits\BelongsToBranch, Notifiable;

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
     * Get the patient's full name.
     */
    public function getNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

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

    public function clinicalNotes()
    {
        return $this->hasMany(ClinicalNote::class);
    }

    public function vitals()
    {
        return $this->hasMany(Vital::class);
    }
}
