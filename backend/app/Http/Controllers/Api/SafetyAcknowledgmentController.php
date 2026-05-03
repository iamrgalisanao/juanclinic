<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vital;
use App\Models\DiagnosticResult;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SafetyAcknowledgmentController extends Controller
{
    /**
     * Acknowledge critical vitals.
     */
    public function acknowledgeVital(Vital $vital)
    {
        $this->authorize('update', $vital->patient);

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
        $this->authorize('update', $result->order->patient);

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
            ->where(function($q) {
                // Critical Thresholds (Simulated - in prod these use PediatricService thresholds)
                $q->where('temp_c', '>', 39)
                  ->orWhere('spo2', '<', 92)
                  ->orWhere('pain_score', '>=', 8);
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
            'labs_count' => $unacknowledgedLabsCount,
            'critical_thresholds' => [
                'temp_c' => 39.0,
                'spo2' => 92,
                'pain_score' => 8
            ]
        ]);
    }
}
