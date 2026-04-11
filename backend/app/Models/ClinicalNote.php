<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;
use App\Traits\BelongsToBranch;

class ClinicalNote extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, BelongsToBranch;
    
    protected static function booted()
    {
        static::saved(function ($note) {
            if ($note->status === 'SIGNED' && is_array($note->content)) {
                $vitalsData = array_intersect_key($note->content, array_flip([
                    'weight_kg', 'height_cm', 'head_circumference_cm', 
                    'temp_c', 'pulse_rate', 'resp_rate', 'bp_systolic', 'bp_diastolic', 'spo2'
                ]));

                if (!empty($vitalsData)) {
                    \App\Models\Vital::updateOrCreate(
                        [
                            'patient_id' => $note->patient_id,
                            'recorded_at' => $note->created_at, // Use note timestamp
                            'tenant_id' => $note->tenant_id
                        ],
                        array_merge($vitalsData, [
                            'branch_id' => $note->branch_id,
                            'author_id' => $note->author_id,
                            'remarks' => "Extracted from clinical note: {$note->id}",
                        ])
                    );
                }
            }
        });
    }

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'author_id',
        'template_id',
        'note_type', // SOAP, PROGRESS, DISCHARGE, TEMPLATE
        'content',
        'status', // DRAFT, SIGNED
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(ClinicalTemplate::class, 'template_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
