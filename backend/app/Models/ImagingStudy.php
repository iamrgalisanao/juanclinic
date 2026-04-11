<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;

class ImagingStudy extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, \App\Traits\BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'order_id',
        'study_instance_uid',
        'accession_number',
        'modality',
        'study_description',
        'study_date',
        'metadata',
        'findings',
        'impression',
        'radiologist_id',
        'interpretation_date',
        'is_finalized'
    ];

    protected $casts = [
        'study_date' => 'datetime',
        'interpretation_date' => 'datetime',
        'is_finalized' => 'boolean',
        'metadata' => 'array'
    ];

    public function instances()
    {
        return $this->hasMany(ImagingInstance::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
