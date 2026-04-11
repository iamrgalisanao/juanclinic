<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EMPI_Submission extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $table = 'empi_submissions';
    protected $primaryKey = 'submission_uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'submission_uuid',
        'hardware_terminal_id',
        'raw_payload',
        'matched_patient_id',
        'matching_confidence',
        'status',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'matching_confidence' => 'float',
    ];

    public function terminal()
    {
        return $this->belongsTo(HardwareTerminal::class, 'hardware_terminal_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'matched_patient_id');
    }
}
