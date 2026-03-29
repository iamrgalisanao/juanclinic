<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PediatricService;
use App\Models\PediatricGrowthRecord;
use App\Models\ImmunizationRecord;
use App\Models\Patient;

class PatientController extends Controller
{
    protected $pediatricService;

    public function __construct(PediatricService $pediatricService)
    {
        $this->pediatricService = $pediatricService;
    }
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
            'amendment_reason' => 'required|string|min:4',
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

    /**
     * Get pediatric growth history with Z-Scores.
     */
    public function getGrowthHistory(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);

        $records = \App\Models\PediatricGrowthRecord::where('patient_id', $id)
            ->oldest('measured_at')
            ->get();

        $history = $records->map(function ($record) use ($patient) {
            $ageMonths = $this->pediatricService->getAgeMonths($patient, $record->measured_at);
            
            $weightZ = $record->weight_kg ? $this->pediatricService->calculateZScore($patient->gender, 'weight_for_age', $ageMonths, (float)$record->weight_kg) : null;
            $heightZ = $record->height_cm ? $this->pediatricService->calculateZScore($patient->gender, 'height_for_age', $ageMonths, (float)$record->height_cm) : null;
            return [
                'id' => $record->id,
                'weight_kg' => $record->weight_kg,
                'height_cm' => $record->height_cm,
                'head_circumference_cm' => $record->head_circumference_cm,
                'measured_at' => $record->measured_at->toIso8601String(),
                'age_months' => $ageMonths,
                'analysis' => $this->pediatricService->calculateGrowthAnalysis($record)
            ];
        });

        return response()->json($history);
    }

    /**
     * Store new pediatric growth record.
     */
    public function storeGrowthRecord(Request $request, string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('update', $patient);

        $validated = $request->validate([
            'weight_kg' => 'nullable|numeric',
            'height_cm' => 'nullable|numeric',
            'head_circumference_cm' => 'nullable|numeric',
            'measured_at' => 'required|date',
        ]);

        $record = \App\Models\PediatricGrowthRecord::create(array_merge($validated, [
            'patient_id' => $id,
            'tenant_id' => $patient->tenant_id,
            'branch_id' => $patient->branch_id,
        ]));

        // Calculate and save analysis
        $record->metadata = array_merge($record->metadata ?? [], [
            'analysis' => $this->pediatricService->calculateGrowthAnalysis($record)
        ]);
        $record->save();

        return response()->json($record, 201);
    }

    /**
     * Get immunization history and roadmap.
     */
    public function getImmunizationHistory(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);

        $roadmap = $this->pediatricService->getImmunizationRoadmap($patient);
        $history = \App\Models\ImmunizationRecord::where('patient_id', $id)
            ->latest('administered_at')
            ->get();

        return response()->json([
            'roadmap' => $roadmap,
            'history' => $history,
        ]);
    }

    /**
     * Store new immunization record.
     */
    public function storeImmunizationRecord(Request $request, string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('update', $patient);

        $validated = $request->validate([
            'vaccine_name' => 'required|string',
            'dose_number' => 'required|integer',
            'administered_at' => 'required|date',
            'administered_by' => 'nullable|string',
            'lot_number' => 'nullable|string',
            'next_due_date' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        $record = \App\Models\ImmunizationRecord::create(array_merge($validated, [
            'patient_id' => $id,
            'tenant_id' => $patient->tenant_id,
            'branch_id' => $patient->branch_id,
        ]));

        return response()->json($record, 201);
    }
    /**
     * Get growth standards for background lines.
     */
    public function getStandards(Request $request)
    {
        $validated = $request->validate([
            'gender' => 'required|in:M,F',
            'metric' => 'required|string',
        ]);

        $standards = $this->pediatricService->getGrowthStandards(
            $validated['gender'], 
            $validated['metric']
        );

        return response()->json($standards);
    }
}
