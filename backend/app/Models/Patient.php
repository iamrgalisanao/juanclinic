<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\AuditLogTrait;

use App\Traits\HasAmendments;

use Illuminate\Notifications\Notifiable;

/**
 * @property \Carbon\Carbon $dob
 */
class Patient extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments, \App\Traits\BelongsToBranch, Notifiable, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'patient_external_id',
        'first_name',
        'last_name',
        'dob',
        'gender',
        'gestational_weeks',
        'birth_weight_g',
        'apgar_score',
        'contact',
        'email',
        'preferred_language',
        'receive_email_reminders',
        'receive_sms_reminders',
        'tin',
        'metadata',
        'branch_id',
        'communication_preferences',
        'last_notification_audit_at',
    ];

    protected $casts = [
        'dob' => 'date',
        'metadata' => 'array',
        'communication_preferences' => 'array',
        'last_notification_audit_at' => 'datetime',
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

    public function referrals()
    {
        return $this->hasMany(Referral::class);
    }

    public function diagnoses()
    {
        return $this->hasMany(PatientDiagnosis::class)->latest('diagnosed_at');
    }

    public function problemList()
    {
        return $this->hasMany(PatientDiagnosis::class)->where('is_problem_list', true)->where('clinical_status', 'ACTIVE');
    }


    /**
     * Calculate corrected age in days for premature infants (<37 weeks).
     * Formula: Corrected Age = Chronological Age - (40 - Gestational Weeks)
     */
    public function getCorrectedAgeInDays(?\Carbon\Carbon $atDate = null)
    {
        $atDate = $atDate ?? now();
        $chronologicalAgeDays = $this->dob->diffInDays($atDate);
        
        // If not premature or no gestational data, return chronological age
        if (!$this->gestational_weeks || $this->gestational_weeks >= 37) {
            return $chronologicalAgeDays;
        }

        $weeksEarly = 40 - $this->gestational_weeks;
        $daysEarly = $weeksEarly * 7;
        return max(0, $chronologicalAgeDays - $daysEarly);
    }

    /**
     * Check if the patient has consented to a specific communication channel.
     * 
     * @param string $channel 'email' or 'sms'
     */
    public function canReceiveNotification(string $channel): bool
    {
        $prefs = $this->communication_preferences ?? [
            'email' => (bool) $this->receive_email_reminders,
            'sms' => (bool) $this->receive_sms_reminders
        ];

        return (bool) ($prefs[$channel] ?? false);
    }
}
