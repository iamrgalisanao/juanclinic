<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use Illuminate\Http\Request;

class DiseaseController extends Controller
{
    /**
     * Search the disease terminology catalog.
     */
    public function index(Request $request)
    {
        $query = Disease::query()->canonical();

        if ($request->has('search')) {
            $q = $request->input('search');
            $query->where(function($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('code', 'like', "{$q}%")
                      ->orWhereHas('terms', function($termQuery) use ($q) {
                          $termQuery->where('term', 'like', "%{$q}%")
                                    ->where('review_status', '!=', 'REJECTED');
                      });
            });
        }

        if ($request->has('type')) {
            $query->where('disease_type', $request->input('type'));
        }

        return $query->paginate($request->input('per_page', 20));
    }

    /**
     * Get a specific disease by code or ID.
     */
    public function show($id)
    {
        return Disease::where('id', $id)
            ->orWhere('code', $id)
            ->firstOrFail();
    }

    /**
     * Get medicines mapped to a specific disease.
     */
    public function medicines($id)
    {
        $disease = Disease::where('id', $id)
            ->orWhere('code', $id)
            ->firstOrFail();

        return $disease->medicines()
            ->paginate();
    }
}

