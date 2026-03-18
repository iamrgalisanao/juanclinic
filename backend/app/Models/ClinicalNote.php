<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;

class ClinicalNote extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'author_id',
        'note_type', // SOAP, PROGRESS, DISCHARGE
        'content',
        'status', // DRAFT, SIGNED
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
