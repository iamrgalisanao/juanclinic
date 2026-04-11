<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;
use App\Traits\BelongsToBranch;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, BelongsToBranch;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'patient_id',
        'doctor_id',
        'appointment_date',
        'start_time',
        'end_time',
        'status',
        'visit_type',
        'reason',
        'notes',
        'last_reminder_sent_at',
        'meeting_id',
        'meeting_token',
        'meeting_expires_at',
    ];

    protected static function booted()
    {
        static::creating(function ($appointment) {
            if ($appointment->visit_type === 'TELEHEALTH') {
                $appointment->meeting_id = 'JC-' . strtoupper(bin2hex(random_bytes(6)));
                $appointment->meeting_token = bin2hex(random_bytes(16));
                // Room expires 1 hour after the scheduled end time
                // (Using simple logic here, assuming and ensuring end_time exists)
                $appointment->meeting_expires_at = now()->addHours(2); 
            }
        });
    }

    protected $casts = [
        'appointment_date' => 'date',
    ];

    /**
     * Get the patient associated with the appointment.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the doctor (user) associated with the appointment.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
