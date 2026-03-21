<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\Invoice;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PharmacyController extends Controller
{
    /**
     * Get all pending prescriptions for the pharmacy worklist.
     */
    public function worklist(Request $request)
    {
        // Filter by tenant and ACTIVE status
        return Prescription::where('status', 'ACTIVE')
            ->with(['patient', 'physician', 'medicine'])
            ->latest()
            ->get();
    }

    /**
     * Record the dispensing of a prescription.
     */
    public function dispense(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);

        if ($prescription->status !== 'ACTIVE') {
            return response()->json(['message' => 'Prescription is no longer active'], 422);
        }

        $prescription->update([
            'status' => 'COMPLETED',
            'dispensed_at' => now(),
            'dispensed_by' => Auth::id(),
        ]);

        // Create Invoice for the dispensed medication
        $totalAmount = 0;
        if ($prescription->medicine_id && $prescription->quantity) {
            $medicine = Medicine::find($prescription->medicine_id);
            if ($medicine) {
                $totalAmount = $medicine->price * $prescription->quantity;
            }
        }

        $invoice = Invoice::create([
            'tenant_id' => $prescription->tenant_id,
            'patient_id' => $prescription->patient_id,
            'invoice_number' => 'INV-' . strtoupper(uniqid()),
            'total_amount' => $totalAmount,
            'status' => 'UNPAID',
        ]);

        // Link prescription to invoice
        $prescription->update(['invoice_id' => $invoice->id]);

        return response()->json([
            'message' => 'Medication dispensed & invoice generated successfully',
            'prescription' => $prescription->load(['patient', 'physician', 'medicine', 'dispenser']),
            'invoice' => $invoice
        ]);
    }
}
