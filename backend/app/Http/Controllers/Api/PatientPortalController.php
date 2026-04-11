<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Order;
use App\Models\ImmunizationRecord;
use App\Models\Vital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PatientPortalController extends Controller
{
    /**
     * Validate the portal link and PIN (DOB).
     */
    public function authorizeAccess(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'pin' => 'required|date_format:Y-m-d',
        ]);

        $patient = Patient::findOrFail($request->patient_id);

        // Security Check: PIN must match Date of Birth exactly
        if ($patient->dob->format('Y-m-d') !== $request->pin) {
            return response()->json([
                'message' => 'Invalid PIN. Please verify the patient\'s date of birth.',
                'error_code' => 'INVALID_PIN'
            ], 401);
        }

        // Generate a temporary access token (for this prototype, we'll return a success status)
        return response()->json([
            'message' => 'Access Granted',
            'patient_name' => $patient->name,
            'access_key' => Crypt::encryptString($patient->id)
        ]);
    }

    /**
     * Fetch the aggregated health summary for the portal.
     */
    public function getSummary(Request $request)
    {
        try {
            $patientId = Crypt::decryptString($request->header('X-Portal-Access-Key'));
            $patient = Patient::with(['branch', 'tenant'])->findOrFail($patientId);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Unauthorized portal session.'], 403);
        }

        // Aggregate Pediatric Growth (Vitals)
        $growthData = Vital::where('patient_id', $patient->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Aggregate Immunizations (Administered)
        $admin_immunizations = ImmunizationRecord::where('patient_id', $patient->id)
            ->orderBy('administered_at', 'desc')
            ->get();

        // Calculate Upcoming Milestones (Simulated based on PediatricsDashboard logic)
        $upcoming = [
            ['vaccine' => 'DPT Booster', 'due_age' => '18 Months', 'status' => 'UPCOMING'],
            ['vaccine' => 'MMR Dose 2', 'due_age' => '4 Years', 'status' => 'WAITING'],
        ];

        // Aggregate Diagnostic Orders (Completed only)
        $orders = Order::where('patient_id', $patient->id)
            ->where('status', 'COMPLETED')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'patient' => [
                'name' => $patient->name,
                'external_id' => $patient->patient_external_id,
                'gender' => $patient->gender,
                'dob' => $patient->dob->format('F j, Y'),
                'contact' => $patient->contact,
            ],
            'clinic' => [
                'name' => $patient->tenant->name,
                'branch' => $patient->branch->name,
            ],
            'vitals' => $growthData,
            'immunizations' => $admin_immunizations,
            'upcoming_milestones' => $upcoming,
            'diagnostic_summary' => $orders,
        ]);
    }
}
