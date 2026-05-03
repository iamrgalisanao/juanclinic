<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use App\Traits\AuditLogTrait;

class Disease extends Model
{
    use HasFactory, AuditLogTrait;

    protected $fillable = [
        'source_id',
        'code',
        'coding_system',
        'name',
        'slug',
        'disease_type',
        'clinical_category',
        'is_system',
        'parent_id',
        'status',
        'review_status',
    ];

    /**
     * Boot the model to handle automatic slugging and case normalization.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($disease) {
            // Auto-generate slug if not provided
            if (empty($disease->slug)) {
                $disease->slug = Str::slug($disease->name);
            }

            // Normalize Enums to Uppercase for DB consistency
            $disease->disease_type = strtoupper($disease->disease_type ?? 'CONDITION');
            $disease->clinical_category = strtoupper($disease->clinical_category ?? 'DIAGNOSIS');
            $disease->status = strtoupper($disease->status ?? 'ACTIVE');
            $disease->review_status = strtoupper($disease->review_status ?? 'APPROVED');
            $disease->coding_system = strtoupper($disease->coding_system ?? 'LOCAL');
        });
    }

    /**
     * Parent disease for hierarchy.
     */
    public function parent()
    {
        return $this->belongsTo(Disease::class, 'parent_id');
    }

    /**
     * Child diseases/variants.
     */
    public function children()
    {
        return $this->hasMany(Disease::class, 'parent_id');
    }

    /**
     * Discovery terms/synonyms associated with this concept.
     */
    public function terms()
    {
        return $this->hasMany(DiseaseTerm::class);
    }

    /**
     * The primary/preferred label for this concept.
     */
    public function preferredTerm()
    {
        return $this->hasOne(DiseaseTerm::class)->where('is_preferred', true);
    }

    /**
     * Patient instances of this disease.
     */
    public function patientDiagnoses()
    {
        return $this->hasMany(PatientDiagnosis::class);
    }

    /**
     * Medicines mapped to this disease for discovery.
     */
    public function medicines()
    {
        return $this->belongsToMany(Medicine::class, 'medicine_disease_map')
            ->withPivot(['source', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Scope: Only active diseases.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    /**
     * Scope: Only clinically approved records.
     */
    public function scopeApproved($query)
    {
        return $query->where('review_status', 'APPROVED');
    }

    /**
     * Scope: Canonical terminology (System-owned, Active, Approved, Non-LOCAL).
     */
    public function scopeCanonical($query)
    {
        return $query->active()
            ->approved()
            ->where('is_system', true)
            ->where('coding_system', '!=', 'LOCAL');
    }
}
