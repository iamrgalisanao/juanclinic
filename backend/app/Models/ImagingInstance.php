<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;

class ImagingInstance extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'imaging_study_id',
        'sop_instance_uid',
        'instance_number',
        'file_path',
        'file_type',
        'file_size',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function study()
    {
        return $this->belongsTo(ImagingStudy::class, 'imaging_study_id');
    }
}
