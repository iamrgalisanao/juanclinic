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
        $tenantId = $request->header('X-Tenant-ID');
        
        $query = \App\Models\MedicineForm::has('medicine')
            ->with(['medicine', 'inventories' => function($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            }]);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->whereHas('medicine', function ($mq) use ($search) {
                    $mq->where('generic_name', 'like', "%{$search}%")
                      ->orWhere('brand_name', 'like', "%{$search}%");
                })
                ->orWhere('brand_form', 'like', "%{$search}%")
                ->orWhere('form_name', 'like', "%{$search}%");
            });
        }

        return $query->paginate($request->input('per_page', 20));
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
            'price' => 'nullable|numeric|min:0',
        ]);

        $tenantId = $request->header('X-Tenant-ID');
        
        return \DB::transaction(function () use ($validated, $tenantId) {
            // Create the Master Molecule/Medicine
            $medicine = Medicine::create([
                'tenant_id' => $tenantId,
                'generic_name' => $validated['generic_name'],
                'brand_name' => $validated['brand_name'] ?? null,
                'is_system' => false,
            ]);

            // Create the specific Form/Strength
            $form = $medicine->forms()->create([
                'form_name' => $validated['form'] ?? null,
                'strength' => $validated['strength'] ?? null,
                'price' => $validated['price'] ?? null,
                'legacy_medicine_id' => $medicine->id, // Maintain the link for now
            ]);

            return $medicine->load('forms');
        });
    }

    /**
     * Display the specified medicine with detailed variants.
     */
    public function show(Medicine $medicine)
    {
        return $medicine->load('forms');
    }
}

