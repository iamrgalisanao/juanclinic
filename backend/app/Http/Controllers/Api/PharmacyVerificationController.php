<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PharmacyVerificationController extends Controller
{
    /**
     * Public verification of a prescription via QR UUID.
     */
    public function verify($uuid)
    {
        $rx = Prescription::where('qr_uuid', $uuid)
            ->with(['patient', 'physician', 'branch'])
            ->firstOrFail();

        // Obfuscate patient data if not logged in (Privacy by Design)
        if (!auth()->check()) {
            return response()->json([
                'status' => 'VERIFIED',
                'prescription' => [
                    'medication_name' => $rx->medication_name,
                    'dosage' => $rx->dosage,
                    'frequency' => $rx->frequency,
                    'instructions' => $rx->instructions,
                    'status' => $rx->status,
                    'remaining_quantity' => $rx->remaining_quantity,
                    'patient_initials' => substr($rx->patient->first_name, 0, 1) . '.' . substr($rx->patient->last_name, 0, 1) . '.',
                    'physician' => "Dr. " . $rx->physician->last_name,
                    'branch' => $rx->branch->name,
                    'created_at' => $rx->created_at->toIso8601String(),
                ]
            ]);
        }

        // Full data for authenticated staff
        return response()->json([
            'status' => 'VERIFIED',
            'prescription' => $rx
        ]);
    }

    /**
     * Dispense medication (Staff Only).
     */
    public function dispense(Request $request, $uuid)
    {
        $rx = Prescription::where('qr_uuid', $uuid)->firstOrFail();
        
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.5|max:' . $rx->remaining_quantity,
        ]);

        return DB::transaction(function () use ($rx, $validated) {
            $dispensedQty = $validated['quantity'];
            
            $rx->dispensed_quantity += $dispensedQty;
            $rx->remaining_quantity -= $dispensedQty;
            
            if ($rx->remaining_quantity <= 0) {
                $rx->status = 'COMPLETED';
            }

            $rx->dispensed_at = now();
            $rx->dispensed_by = auth()->id();
            $rx->save();

            // Log Audit
            \App\Models\AuditLog::create([
                'tenant_id' => $rx->tenant_id,
                'actor_id' => auth()->id(),
                'action' => 'PRESCRIPTION_DISPENSED',
                'resource_type' => 'Prescription',
                'resource_id' => $rx->id,
                'payload' => [
                    'quantity_dispensed' => $dispensedQty,
                    'remaining' => $rx->remaining_quantity
                ]
            ]);

            return response()->json([
                'message' => 'Medication dispensed successfully.',
                'prescription' => $rx
            ]);
        });
    }
}
