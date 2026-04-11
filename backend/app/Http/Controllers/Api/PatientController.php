<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PediatricService;
use App\Models\Vital;
use App\Models\ImmunizationRecord;
use App\Models\Patient;
use App\Models\Medicine;
use App\Models\VaccineSchedule;

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
            'gestational_weeks' => 'nullable|integer|between:20,45',
            'birth_weight_g' => 'nullable|integer|between:0,10000',
            'apgar_score' => 'nullable|string',
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
            'gestational_weeks' => 'sometimes|integer|between:20,45',
            'birth_weight_g' => 'sometimes|integer|between:0,10000',
            'apgar_score' => 'sometimes|string',
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
    public function getGrowthHistory(string $id, Request $request)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);
        $useCorrected = $request->boolean('use_corrected', false);

        $records = Vital::where('patient_id', $id)
            ->where(function($q) {
                $q->whereNotNull('weight_kg')
                  ->orWhereNotNull('height_cm');
            })
            ->oldest('recorded_at')
            ->get();

        $history = $records->map(function ($record) use ($patient, $useCorrected) {
            $ageMonths = $this->pediatricService->getAgeMonths($patient, $record->recorded_at);
            
            $analysis = $this->pediatricService->calculateGrowthAnalysis($record, $useCorrected);

            return [
                'id' => $record->id,
                'weight_kg' => (float) $record->weight_kg,
                'height_cm' => (float) $record->height_cm,
                'head_circumference_cm' => (float) ($record->head_circumference_cm ?? 0),
                'measured_at' => $record->recorded_at->toIso8601String(),
                'age_months' => $analysis['age_months'], // Use the age from analysis (corrected or not)
                'is_corrected' => $useCorrected,
                'analysis' => $analysis
            ];
        });

        return response()->json($history);
    }
    
    /**
     * Get summary of overdue milestones and alerts.
     */
    public function getOverdueMilestones(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);

        return response()->json([
            'overdue' => $this->pediatricService->getOverdueMilestones($patient)
        ]);
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

        $bmi = null;
        if ($validated['weight_kg'] && $validated['height_cm'] && $validated['height_cm'] > 0) {
            $heightM = $validated['height_cm'] / 100;
            $bmi = $validated['weight_kg'] / ($heightM * $heightM);
        }

        $record = Vital::create([
            'patient_id' => $id,
            'tenant_id' => $patient->tenant_id,
            'branch_id' => $patient->branch_id,
            'weight_kg' => $validated['weight_kg'],
            'height_cm' => $validated['height_cm'],
            'head_circumference_cm' => $validated['head_circumference_cm'],
            'bmi' => $bmi,
            'recorded_at' => $validated['measured_at'],
            'metadata' => [
                'source' => 'pediatrics_dashboard'
            ]
        ]);

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
            'manufacturer' => 'nullable|string',
            'dose_number' => 'required|integer',
            'administered_at' => 'required|date',
            'administered_by' => 'nullable|string',
            'lot_number' => 'nullable|string',
            'site' => 'nullable|string',
            'route' => 'nullable|string',
            'next_due_date' => 'nullable|date',
            'vis_edition_date' => 'nullable|date',
            'vis_provided_date' => 'nullable|date',
            'cvx_code' => 'nullable|string',
            'ndc_code' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        // Duplicate Check: Same vaccine, same dose, same date for same patient
        $existing = \App\Models\ImmunizationRecord::where([
            'patient_id' => $id,
            'vaccine_name' => $validated['vaccine_name'],
            'dose_number' => $validated['dose_number'],
            'administered_at' => \Carbon\Carbon::parse($validated['administered_at'])->toDateString(),
        ])->first();

        if ($existing) {
            return response()->json([
                'message' => 'A record for this vaccine and dose already exists for this date.',
                'existing_record' => $existing
            ], 422);
        }

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

    /**
     * Lookup for vaccines and historical presets.
     */
    public function lookupVaccines(Request $request)
    {
        $standard = VaccineSchedule::distinct()->pluck('vaccine_name');
        
        $medicines = Medicine::where(function($q) {
                $q->where('brand_name', 'like', '%vaccine%')
                  ->orWhere('brand_name', 'like', '%vax%')
                  ->orWhere('generic_name', 'like', '%vaccine%')
                  ->orWhere('generic_name', 'like', '%vax%');
            })
            ->with('lots')
            ->where('stock', '>', 0)
            ->limit(50)
            ->get();

        $medicineList = $medicines->map(function($m) {
            return [
                'id' => $m->id,
                'name' => $m->brand_name . ($m->generic_name ? " ({$m->generic_name})" : "")
            ];
        });

        $historyPresets = ImmunizationRecord::whereIn('vaccine_name', $standard)
            ->latest('administered_at')
            ->get()
            ->groupBy('vaccine_name')
            ->map(function($items) {
                $latest = $items->first();
                return [
                    'manufacturer' => $latest->manufacturer,
                    'site' => $latest->site,
                    'route' => $latest->route,
                    'vis_edition_date' => $latest->vis_edition_date?->toDateString(),
                    'cvx_code' => $latest->cvx_code
                ];
            });

        return response()->json([
            'standard' => $standard,
            'medicines' => $medicineList,
            'history_presets' => $historyPresets
        ]);
    }

    /**
     * Get summary of neonatal care data.
     */
    public function getNeonatalSummary(string $id)
    {
        $patient = \App\Models\Patient::findOrFail($id);
        $this->authorize('view', $patient);

        // Neonatal period is up to 28 days chronologically or corrected
        $isNeonatal = $patient->dob->diffInDays(now()) <= 28;
        
        // Birth details
        $summary = [
            'gestational_weeks' => $patient->gestational_weeks,
            'birth_weight_g' => $patient->birth_weight_g,
            'apgar_score' => $patient->apgar_score,
            'dob' => $patient->dob->toIso8601String(),
            'current_age_days' => $patient->dob->diffInDays(now()),
            'corrected_age_days' => $patient->getCorrectedAgeInDays(),
            'is_premature' => ($patient->gestational_weeks && $patient->gestational_weeks < 37),
        ];

        // Weight Velocity: Birth weight vs Latest Weight
        $latestVital = Vital::where('patient_id', $id)
            ->whereNotNull('weight_kg')
            ->latest('recorded_at')
            ->first();

        if ($latestVital && $patient->birth_weight_g) {
            $birthWeightKg = $patient->birth_weight_g / 1000;
            $currentWeightKg = (float) $latestVital->weight_kg;
            $summary['weight_gain_g'] = ($currentWeightKg - $birthWeightKg) * 1000;
            $summary['weight_gain_percent'] = (($currentWeightKg - $birthWeightKg) / $birthWeightKg) * 100;
        }

        // Recent APGAR scores (if stored in metadata chronologically)
        $summary['apgar_history'] = $patient->metadata['apgar_history'] ?? [];

        return response()->json($summary);
    }
}
