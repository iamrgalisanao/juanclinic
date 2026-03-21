<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines (autocomplete).
     */
    public function index(Request $request)
    {
        $query = Medicine::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%");
            });
        }

        return $query->limit(20)->get();
    }

    /**
     * Store a new custom medicine for the tenant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'form' => 'nullable|string|max:100',
            'strength' => 'nullable|string|max:100',
        ]);

        $tenantId = $request->header('X-Tenant-ID');
        
        return Medicine::create([
            'tenant_id' => $tenantId,
            'generic_name' => $validated['generic_name'],
            'brand_name' => $validated['brand_name'] ?? null,
            'form' => $validated['form'] ?? null,
            'strength' => $validated['strength'] ?? null,
            'is_system' => false,
        ]);
    }
}
