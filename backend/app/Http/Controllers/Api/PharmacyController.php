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

        // 1. Stock Guard Check
        if ($prescription->medicine_id && $prescription->quantity) {
            $medicine = Medicine::find($prescription->medicine_id);
            if (!$medicine || $medicine->quantity < $prescription->quantity) {
                return response()->json([
                    'message' => 'Insufficient stock for requested medication.',
                    'errors' => ['medicine_id' => ['Stock unavailable.']]
                ], 422);
            }

            // Deduct Stock
            $medicine->decrement('quantity', $prescription->quantity);
        }

        // 2. Dispense Audit
        $prescription->update([
            'status' => 'COMPLETED',
            'dispensed_at' => now(),
            'dispensed_by' => Auth::id(),
        ]);

        // 3. Create Hardened Invoice (Tier 2 Compliant)
        $totalAmount = 0;
        if ($prescription->medicine_id && $prescription->quantity) {
            $medicine = Medicine::find($prescription->medicine_id);
            if ($medicine) {
                $totalAmount = $medicine->price * $prescription->quantity;
            }
        }

        // Use the new Billing logic or directly call the storeInvoice logic (here simplified but following the same schema)
        $count = Invoice::where('branch_id', $prescription->branch_id)->count() + 1;
        $invoiceNumber = 'INV-' . str_pad($prescription->branch_id, 2, '0', STR_PAD_LEFT) . '-' . date('Y') . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'tenant_id' => $prescription->tenant_id,
            'branch_id' => $prescription->branch_id,
            'patient_id' => $prescription->patient_id,
            'invoice_number' => $invoiceNumber,
            'subtotal' => $totalAmount,
            'vat_amount' => $totalAmount - ($totalAmount / 1.12), // Standard Inclusive VAT
            'discount_amount' => 0,
            'discount_type' => 'NONE',
            'net_amount' => $totalAmount,
            'status' => 'UNPAID',
        ]);

        // Link prescription to invoice
        $prescription->update(['invoice_id' => $invoice->id]);

        return response()->json([
            'message' => 'Medication dispensed & standard invoice generated successfully',
            'prescription' => $prescription->load(['patient', 'physician', 'medicine', 'dispenser']),
            'invoice' => $invoice
        ]);
    }
}
