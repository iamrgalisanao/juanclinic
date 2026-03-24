<?php
namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;
use App\Traits\BelongsToBranch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicalAttachment extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
        'uploaded_by'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
