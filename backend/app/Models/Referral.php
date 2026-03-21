<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Scopes\CrossTenantReferralScope;

class Referral extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'source_tenant_id',
        'target_tenant_id',
        'referred_by_user_id',
        'status',
        'clinical_notes',
        'consent_proof',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::addGlobalScope(new CrossTenantReferralScope);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class)->withoutGlobalScopes();
    }

    public function sourceTenant()
    {
        return $this->belongsTo(Tenant::class, 'source_tenant_id');
    }

    public function targetTenant()
    {
        return $this->belongsTo(Tenant::class, 'target_tenant_id');
    }

    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by_user_id');
    }
}
