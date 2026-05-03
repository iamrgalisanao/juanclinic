<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use App\Models\DiseaseTerm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TerminologyController extends Controller
{
    /**
     * Display a queue of DiseaseTerm records for administrative review.
     * Supports filtering by status, source, and search terms.
     */
    public function index(Request $request)
    {
        $query = DiseaseTerm::with(['disease', 'reviewer']);

        if ($request->filled('review_status')) {
            $query->where('review_status', $request->review_status);
        }

        if ($request->filled('source_system')) {
            $query->where('source_system', $request->source_system);
        }

        if ($request->filled('mapped')) {
            $mapped = filter_var($request->mapped, FILTER_VALIDATE_BOOLEAN);
            $mapped ? $query->whereNotNull('disease_id') : $query->whereNull('disease_id');
        }

        if ($request->filled('term_type')) {
            $query->where('term_type', $request->term_type);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function($sub) use ($q) {
                $sub->where('term', 'like', "%{$q}%")
                    ->orWhere('normalized_term', 'like', "%{$q}%");
            });
        }

        // Return paginated results for the review table
        return response()->json($query->latest()->paginate($request->get('limit', 15))->withQueryString());
    }

    /**
     * Search authoritative Canonical Disease concepts for mapping targets.
     * Strictly limited to systemic, approved diagnosis/symptom concepts.
     */
    public function diseases(Request $request)
    {
        $request->validate(['q' => 'required|min:2']);
        $q = $request->q;

        $results = Disease::canonical()
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('code', 'like', "{$q}%");
            })
            ->limit(15)
            ->get(['id', 'name', 'code', 'coding_system', 'disease_type', 'clinical_category']);

        return response()->json($results);
    }

    /**
     * Apply a governance action to an imported term (Map, Approve, or Reject).
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'review_status' => 'required|in:IMPORTED,MAPPED,APPROVED,REJECTED',
            'disease_id'    => 'nullable|exists:diseases,id',
            'review_notes'  => 'nullable|string',
            'is_preferred'  => 'nullable|boolean',
        ]);

        $term = DiseaseTerm::findOrFail($id);

        /**
         * Governance Rule: If setting is_preferred = true, 
         * we must unset other preferred terms for THIS disease concept 
         * WITHIN the same source system context to prevent ambiguity.
         */
        if ($request->is_preferred && $request->disease_id) {
            DiseaseTerm::where('disease_id', $request->disease_id)
                ->where('id', '!=', $id)
                ->update(['is_preferred' => false]);
        }

        $term->update([
            'disease_id'    => $request->disease_id, // Establish or change mapping
            'review_status' => $request->review_status,
            'review_notes'  => $request->review_notes,
            'is_preferred'  => $request->is_preferred ?? $term->is_preferred,
            'reviewed_by'   => Auth::id(),
            'reviewed_at'   => now(),
        ]);

        return response()->json([
            'message' => 'Term governance action successfully recorded.',
            'data'    => $term->load(['disease', 'reviewer'])
        ]);
    }
}
