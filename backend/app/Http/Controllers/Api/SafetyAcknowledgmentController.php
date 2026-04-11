<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vital;
use App\Models\DiagnosticResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SafetyAcknowledgmentController extends Controller
{
    /**
     * Acknowledge critical vitals.
     */
    public function acknowledgeVital(Vital $vital)
    {
        $vital->update([
            'acknowledged_at' => now(),
            'acknowledged_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Life-safety vitals acknowledged.',
            'timestamp' => $vital->acknowledged_at
        ]);
    }

    /**
     * Acknowledge critical laboratory result.
     */
    public function acknowledgeResult(DiagnosticResult $result)
    {
        $result->update([
            'acknowledged_at' => now(),
            'acknowledged_by' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Critical diagnostic finding acknowledged.',
            'timestamp' => $result->acknowledged_at
        ]);
    }

    /**
     * Check if a patient has unacknowledged critical findings (for Hard-Stop logic).
     */
    public function checkSafetyStatus($patientId)
    {
        $unacknowledgedVitalsCount = Vital::where('patient_id', $patientId)
            ->whereNull('acknowledged_at')
            // Add custom logic for what is considered 'Critical' from Phase 9/10
            ->where(function($q) {
                $q->where('temp_c', '>', 39)
                  ->orWhere('spo2', '<', 92);
                // In a production app, this would use the PediatricService logic
            })
            ->count();

        $unacknowledgedLabsCount = DiagnosticResult::whereHas('order', function($q) use ($patientId) {
                $q->where('patient_id', $patientId);
            })
            ->where('is_critical', true)
            ->whereNull('acknowledged_at')
            ->count();

        return response()->json([
            'has_unacknowledged_criticals' => ($unacknowledgedVitalsCount > 0 || $unacknowledgedLabsCount > 0),
            'vitals_count' => $unacknowledgedVitalsCount,
            'labs_count' => $unacknowledgedLabsCount
        ]);
    }
}
