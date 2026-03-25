<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', \App\Models\Patient::class);
        
        $query = \App\Models\Patient::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_external_id', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($request->input('per_page', 20));
    }

    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Patient::class);

        $validated = $request->validate([
            'patient_external_id' => 'required|string|unique:patients,patient_external_id',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'dob' => 'required|date',
            'gender' => 'required|in:M,F,O',
            'contact' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // CDIM Rule 4.1: Duplicate Patient Detection
        $duplicate = \App\Models\Patient::where('first_name', $validated['first_name'])
            ->where('last_name', $validated['last_name'])
            ->where('dob', $validated['dob'])
            ->exists();

        if ($duplicate && !$request->has('force_duplicate')) {
            return response()->json([
                'message' => 'Potential duplicate patient detected.',
                'code' => 'DUPLICATE_FOUND'
            ], 409);
        }

        return \App\Models\Patient::create($validated);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);
        return $patient;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('update', $patient);

        $validated = $request->validate([
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'dob' => 'sometimes|date',
            'gender' => 'sometimes|in:M,F,O',
            'contact' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // CDIM Rule 2.1: No Silent Overwrites for identity data
        $patient->recordAmendment($validated, $validated['amendment_reason']);

        return $patient;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('delete', $patient);

        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully.']);
    }
}
