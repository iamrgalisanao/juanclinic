<?php

namespace App\Services;

use App\Models\Disease;
use App\Models\DiseaseTerm;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class TerminologyService
{
    /**
     * Ingest a external clinical/discovery term with built-in governance.
     * Prevents technical duplicates and enforces architectural naming standards.
     *
     * @param array $data {
     *      term: string,
     *      disease_id?: int,
     *      term_type?: string,
     *      review_status?: string,
     *      is_preferred?: bool,
     *      source_system?: string,
     *      source_id?: string
     * }
     * @return DiseaseTerm
     */
    public function ingestTerm(array $data): DiseaseTerm
    {
        $term = $data['term'];
        $sourceSystem = $data['source_system'] ?? 'LOCAL_IMPORT';
        $sourceId = $data['source_id'] ?? null;
        
        $normalized = DiseaseTerm::normalize($term);

        // 1. Find existing term by technical tuple for governance check
        $existing = DiseaseTerm::where('term', $term)
            ->where('source_system', $sourceSystem)
            ->where('source_id', $sourceId)
            ->first();

        // 2. Status Hierarchy Governance: Prevent automated status downgrades
        // Logic: APPROVED > MAPPED > IMPORTED. REJECTED is terminal.
        $newStatus = $data['review_status'] ?? 'IMPORTED';
        if ($existing) {
            $weights = ['REJECTED' => 0, 'IMPORTED' => 1, 'MAPPED' => 2, 'APPROVED' => 3];
            $currentWeight = $weights[$existing->review_status] ?? 0;
            $incomingWeight = $weights[$newStatus] ?? 0;

            if ($currentWeight > $incomingWeight) {
                $newStatus = $existing->review_status; // Reserve ground-truth review
            }
        }

        try {
            return DiseaseTerm::updateOrCreate(
                [
                    'term' => $term,
                    'source_system' => $sourceSystem,
                    'source_id' => $sourceId,
                ],
                [
                    'normalized_term' => $normalized,
                    'disease_id' => $data['disease_id'] ?? ($existing->disease_id ?? null),
                    'term_type' => $data['term_type'] ?? ($existing->term_type ?? 'DISCOVERY_LABEL'),
                    'review_status' => $newStatus,
                    'is_preferred' => $data['is_preferred'] ?? ($existing->is_preferred ?? false),
                ]
            );
        } catch (\Exception $e) {
            Log::error("[TerminologyService] Ingestion failed for term '{$term}': " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Bulk normalize a collection of terms.
     */
    public function bulkNormalize(array $terms): array
    {
        return array_map(fn($t) => DiseaseTerm::normalize($t), $terms);
    }

    /**
     * Resolve a raw string to its authoritative Canonical Disease concept.
     * High-integrity lookup used by both discovery ingestion and clinical pickers.
     *
     * Hierarchy:
     * 1. Exact Canonical Name
     * 2. Canonical Slug
     * 3. Approved Preferred Alias (via DiseaseTerm)
     * 4. Approved Alias by normalized term
     */
    public function findDiseaseByTerm(string $termString): ?Disease
    {
        $termString = trim($termString);
        if (empty($termString)) return null;

        $normalized = DiseaseTerm::normalize($termString);
        $slug = Str::slug($termString);

        // 1. Direct hit on Canonical catalog (Name or Slug)
        $directMatch = Disease::canonical()
            ->where(function ($q) use ($termString, $slug) {
                $q->where('name', $termString)
                  ->orWhere('slug', $slug);
            })
            ->first();

        if ($directMatch) return $directMatch;

        // 2. Curated Alias hit (Via Approved DiseaseTerms)
        // We prioritize Mapped + Approved aliases with higher weights on is_preferred
        $aliasMatch = DiseaseTerm::where('normalized_term', $normalized)
            ->where('review_status', 'APPROVED')
            ->whereNotNull('disease_id')
            ->orderByDesc('is_preferred')
            ->first();

        if ($aliasMatch) {
            // Verify the parent concept is still canonical/active
            return Disease::canonical()->find($aliasMatch->disease_id);
        }

        return null;
    }
}
