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
            ->with(['patient', 'physician', 'medicineForm.medicine'])
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

        // Use medicine_form_id (fallback to medicine_id if old data)
        $formId = $prescription->medicine_form_id;
        
        $totalAmount = 0;
        $tenantId = $prescription->tenant_id;

        // 1. Stock & Inventory Check
        if ($formId && $prescription->quantity) {
            $form = \App\Models\MedicineForm::find($formId);
            
            if (!$form) {
                return response()->json(['message' => 'Medication form not found'], 404);
            }

            // Find tenant-specific inventory
            $inventory = \App\Models\TenantMedicineInventory::where('tenant_id', $tenantId)
                ->where('medicine_form_id', $formId)
                ->first();

            if (!$inventory || $inventory->stock < $prescription->quantity) {
                return response()->json([
                    'message' => 'Insufficient stock for requested medication.',
                    'errors' => ['medicine_form_id' => ['Stock unavailable in clinic inventory.']]
                ], 422);
            }

            // Deduct Stock from Inventory
            $inventory->decrement('stock', $prescription->quantity);

            // Calculate Price (Override > Base Form Price)
            $unitPrice = $inventory->price_override ?? $form->price ?? 0;
            $totalAmount = $unitPrice * $prescription->quantity;
        }

        // 2. Dispense Audit & Status Update
        $prescription->update([
            'status' => 'COMPLETED',
            'dispensed_at' => now(),
            'dispensed_by' => Auth::id(),
        ]);

        // 3. Create Hardened Invoice
        $count = Invoice::where('branch_id', $prescription->branch_id)->count() + 1;
        $invoiceNumber = 'INV-' . str_pad($prescription->branch_id, 2, '0', STR_PAD_LEFT) . '-' . date('Y') . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'tenant_id' => $prescription->tenant_id,
            'branch_id' => $prescription->branch_id,
            'patient_id' => $prescription->patient_id,
            'invoice_number' => $invoiceNumber,
            'subtotal' => $totalAmount,
            'vat_amount' => $totalAmount - ($totalAmount / 1.12),
            'discount_amount' => 0,
            'discount_type' => 'NONE',
            'net_amount' => $totalAmount,
            'status' => 'UNPAID',
        ]);

        // Link prescription to invoice
        $prescription->update(['invoice_id' => $invoice->id]);

        return response()->json([
            'message' => 'Medication dispensed & standard invoice generated successfully',
            'prescription' => $prescription->load(['patient', 'physician', 'medicineForm.medicine', 'dispenser']),
            'invoice' => $invoice
        ]);
    }

}
