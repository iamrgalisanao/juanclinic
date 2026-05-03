<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\AuditLogTrait;

class DiseaseTerm extends Model
{
    use HasFactory, AuditLogTrait;

    protected $fillable = [
        'disease_id',
        'term',
        'normalized_term',
        'term_type',
        'review_status',
        'is_preferred',
        'source_system',
        'source_id',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    /**
     * Boot the model for automatic normalization and enum enforcement.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($term) {
            // Ensure enums expressed in uppercase for DB consistency
            $term->term_type = strtoupper($term->term_type);
            $term->review_status = strtoupper($term->review_status);
            
            // Auto-normalize if not set or if term changed
            if (empty($term->normalized_term) || $term->isDirty('term')) {
                $term->normalized_term = static::normalize($term->term);
            }
        });
    }

    /**
     * Centralized normalization logic for discovery-layer matching.
     * Trims, lowercases, and collapses atmospheric/punctuation noise.
     */
    public static function normalize(string $term): string
    {
        // 1. Lowercase
        $norm = mb_strtolower($term);
        // 2. Remove punctuation variants (keep alphanumeric and spaces)
        $norm = preg_replace('/[^\p{L}\p{N}\s]/u', '', $norm);
        // 3. Collapse whitespace
        $norm = preg_replace('/\s+/', ' ', $norm);
        
        return trim($norm);
    }

    /**
     * Relationship: Points back to the Canonical Disease Concept.
     */
    public function disease(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }

    /**
     * Relationship: Points back to the User who reviewed this term.
     */
    public function reviewer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope: Approved terms only.
     */
    public function scopeApproved($query)
    {
        return $query->where('review_status', 'APPROVED');
    }

    /**
     * Scope: Preferred label for a concept.
     */
    public function scopePreferred($query)
    {
        return $query->where('is_preferred', true);
    }

    /**
     * Scope: Mapped terms (Connects discovery to clinical).
     */
    public function scopeMapped($query)
    {
        return $query->whereNotNull('disease_id');
    }

    /**
     * Scope: Imported terms awaiting review or mapping.
     */
    public function scopeImported($query)
    {
        return $query->whereNull('disease_id');
    }
}
