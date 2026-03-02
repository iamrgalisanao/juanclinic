<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', \App\Models\Patient::class);
        return \App\Models\Patient::all();
    }

    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Patient::class);

        $validated = $request->validate([
            'patient_external_id' => 'nullable|string',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'dob' => 'required|date',
            'gender' => 'required|in:M,F,O',
            'contact' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

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

        $patient->update($validated);

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
