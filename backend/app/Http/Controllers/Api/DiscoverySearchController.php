<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use App\Models\Medicine;
use Illuminate\Http\Request;

class DiscoverySearchController extends Controller
{
    /**
     * Perform an Omni-Search across indications, brands, and generics.
     * This powers the grouped suggestion dropdown in the clinical discovery UX.
     */
    public function search(Request $request)
    {
        $q = $request->input('q');
        
        if (strlen($q) < 2) {
            return response()->json([
                'indications' => [],
                'brands'      => [],
                'generics'    => []
            ]);
        }

        // 1. Search Indications (Diseases + Synonyms)
        $indications = Disease::where('status', 'ACTIVE')
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('code', 'like', "{$q}%")
                      ->orWhereHas('terms', function($termQuery) use ($q) {
                          $termQuery->where('term', 'like', "%{$q}%")
                                    ->where('review_status', '!=', 'REJECTED');
                      });
            })
            ->limit(10)
            ->get(['id', 'name', 'code', 'disease_type']);

        // 2. Search Brands
        $brands = Medicine::where('is_prescribable', true)
            ->where('brand_name', 'like', "%{$q}%")
            ->limit(5)
            ->get(['id', 'brand_name', 'generic_name', 'company_name']);

        // 3. Search Generics
        // We select distinct generic names to avoid cluttering the suggestion box
        $generics = Medicine::where('is_prescribable', true)
            ->where('generic_name', 'like', "%{$q}%")
            ->distinct()
            ->limit(5)
            ->get(['generic_name']);

        return response()->json([
            'indications' => $indications,
            'brands'      => $brands,
            'generics'    => $generics
        ]);
    }
}
