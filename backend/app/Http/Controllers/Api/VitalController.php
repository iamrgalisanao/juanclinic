<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VitalController extends Controller
{
    /**
     * Display a listing of vitals for a specific patient.
     */
    public function index(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        return Vital::where('patient_id', $request->patient_id)
            ->with('author:id,name')
            ->orderBy('recorded_at', 'desc')
            ->get();
    }

    /**
     * Store a newly created vital record.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'weight_kg' => 'nullable|numeric|between:0,500',
            'height_cm' => 'nullable|numeric|between:30,300',
            'temp_c' => 'nullable|numeric|between:30,45',
            'bp_systolic' => 'nullable|integer|between:40,300',
            'bp_diastolic' => 'nullable|integer|between:30,200',
            'pulse_rate' => 'nullable|integer|between:20,300',
            'resp_rate' => 'nullable|integer|between:4,100',
            'spo2' => 'nullable|integer|between:0,100',
            'bp_position' => 'nullable|string',
            'bp_arm' => 'nullable|string',
            'recorded_at' => 'required|date',
            'remarks' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // Auto-calculate BMI
        if (!empty($data['weight_kg']) && !empty($data['height_cm']) && $data['height_cm'] > 0) {
            $heightM = $data['height_cm'] / 100;
            $data['bmi'] = $data['weight_kg'] / ($heightM * $heightM);
        }

        $data['author_id'] = Auth::id();
        $data['branch_id'] = $request->header('X-Branch-ID');

        $vital = Vital::create($data);

        return response()->json($vital, 201);
    }

    /**
     * Remove the specified vital record.
     */
    public function destroy(Vital $vital)
    {
        $vital->delete();
        return response()->json(null, 204);
    }
}
