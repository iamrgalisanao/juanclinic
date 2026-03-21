<?php
namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicalAttachment extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait;

    protected $fillable = [
        'tenant_id',
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
