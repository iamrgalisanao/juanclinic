<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vital;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VitalController extends Controller
{
    /**
     * List vitals for a specific patient.
     */
    public function index(Request $request, Patient $patient)
    {
        $vitals = Vital::where('patient_id', $patient->id)
            ->where('tenant_id', $request->header('X-Tenant-ID', 1)) // Default to 1 for MVP
            ->with('author:id,name')
            ->orderBy('recorded_at', 'desc')
            ->paginate(15);

        return response()->json($vitals);
    }

    /**
     * Store a new vitals record.
     */
    public function store(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'weight_kg' => 'nullable|numeric|between:0,600',
            'height_cm' => 'nullable|numeric|between:0,300',
            'temp_c' => 'nullable|numeric|between:30,45',
            'bp_systolic' => 'nullable|integer|between:50,300',
            'bp_diastolic' => 'nullable|integer|between:30,200',
            'pulse_rate' => 'nullable|integer|between:30,250',
            'resp_rate' => 'nullable|integer|between:5,100',
            'spo2' => 'nullable|integer|between:50,100',
            'pain_score' => 'nullable|integer|between:0,10',
            'blood_glucose_mgdl' => 'nullable|numeric|between:20,1000',
            'head_circumference_cm' => 'nullable|numeric|between:20,100',
            'oxygen_source' => 'nullable|string|max:50',
            'bp_position' => 'nullable|string|max:50',
            'bp_arm' => 'nullable|string|max:20',
            'remarks' => 'nullable|string',
            'recorded_at' => 'required|date',
            'branch_id' => 'nullable|exists:branches,id',
            'encounter_id' => 'nullable',
        ]);

        // Auto-calculate BMI if both height and weight are provided
        $bmi = null;
        if (!empty($validated['weight_kg']) && !empty($validated['height_cm'])) {
            $heightInMeters = $validated['height_cm'] / 100;
            if ($heightInMeters > 0) {
                $bmi = round($validated['weight_kg'] / ($heightInMeters * $heightInMeters), 2);
            }
        }

        $finalPatientId = $patient->id ?: $request->input('patient_id');
        if (!$finalPatientId) {
            return response()->json(['message' => 'Patient ID is required.'], 422);
        }

        $vital = Vital::create(array_merge($validated, [
            'tenant_id' => $request->header('X-Tenant-ID', 1),
            'patient_id' => $finalPatientId,
            'author_id' => Auth::id(),
            'bmi' => $bmi,
        ]));

        return response()->json([
            'message' => 'Vitals recorded successfully',
            'vital' => $vital->load('author:id,name')
        ], 201);
    }

    /**
     * Get the latest vitals for a patient.
     */
    public function latest(Request $request, Patient $patient)
    {
        $latest = Vital::where('patient_id', $patient->id)
            ->where('tenant_id', $request->header('X-Tenant-ID', 1))
            ->orderBy('recorded_at', 'desc')
            ->first();

        return response()->json($latest);
    }
}
