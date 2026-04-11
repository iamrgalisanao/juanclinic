<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Prescription;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);
        return Invoice::with(['patient', 'payments'])->get();
    }

    public function storeInvoice(Request $request)
    {
        $this->authorize('create', Invoice::class);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'branch_id' => 'required|exists:branches,id',
            'order_id' => 'nullable|exists:orders,id',
            'prescription_ids' => 'nullable|array',
            'prescription_ids.*' => 'exists:prescriptions,id',
            'subtotal' => 'required|numeric',
            'discount_type' => 'nullable|string|in:NONE,SENIOR,PWD',
        ]);

        $subtotal = $validated['subtotal'];
        $vatAmount = 0;
        $discountAmount = 0;
        $netAmount = 0;

        if ($request->discount_type === 'SENIOR' || $request->discount_type === 'PWD') {
            // PH Law: VAT Exempt + 20% Discount
            $vExempt = $subtotal / 1.12;
            $discountAmount = $vExempt * 0.20;
            $netAmount = $vExempt - $discountAmount;
            $vatAmount = 0; // VAT Exempt
        } else {
            // Standard: Inclusive VAT
            $netAmount = $subtotal;
            $vatAmount = $subtotal - ($subtotal / 1.12);
        }

        // Sequential BIR-compliant ID (Simulated with latest count)
        $count = Invoice::where('branch_id', $validated['branch_id'])->count() + 1;
        $invoiceNumber = 'INV-' . str_pad($validated['branch_id'], 2, '0', STR_PAD_LEFT) . '-' . date('Y') . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'tenant_id' => auth()->user()->tenant_id,
            'branch_id' => $validated['branch_id'],
            'patient_id' => $validated['patient_id'],
            'order_id' => $validated['order_id'] ?? null,
            'invoice_number' => $invoiceNumber,
            'subtotal' => $subtotal,
            'vat_amount' => $vatAmount,
            'discount_amount' => $discountAmount,
            'discount_type' => $validated['discount_type'] ?? 'NONE',
            'net_amount' => $netAmount,
            'status' => 'UNPAID',
        ]);
        
        if ($request->has('prescription_ids')) {
            Prescription::whereIn('id', $request->prescription_ids)
                ->update(['invoice_id' => $invoice->id]);
        }

        return $invoice;
    }

    public function processPayment(Request $request)
    {
        $this->authorize('create', Payment::class);

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        
        $payment = Payment::create([
            'tenant_id' => $invoice->tenant_id,
            'branch_id' => $invoice->branch_id,
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'] ?? null,
        ]);

        // Update invoice status based on net_amount
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->net_amount && $invoice->status !== 'PAID') {
            $invoice->update(['status' => 'PAID']);
            
            // JuanClinic Logic: Deduct inventory only upon confirmed purchase
            foreach ($invoice->items as $lineItem) {
                if ($lineItem->inventory_item_id) {
                    // Find oldest stock batch for this branch (FIFO)
                    $stock = \App\Models\InventoryStock::where('inventory_item_id', $lineItem->inventory_item_id)
                        ->where('branch_id', $invoice->branch_id)
                        ->where('quantity', '>', 0)
                        ->orderBy('expiry_date', 'asc')
                        ->orderBy('created_at', 'asc')
                        ->first();

                    if ($stock) {
                        $deduct = min($stock->quantity, $lineItem->quantity);
                        $stock->decrement('quantity', $deduct);
                        
                        \App\Models\AuditLog::create([
                            'tenant_id' => $invoice->tenant_id,
                            'actor_id' => auth()->id(),
                            'action' => 'INVENTORY_DEDUCTED',
                            'resource_type' => 'InventoryStock',
                            'resource_id' => $stock->id,
                            'payload' => [
                                'reason' => 'PURCHASE_CONFIRMED',
                                'invoice_id' => $invoice->id,
                                'deducted' => $deduct,
                                'remaining' => $stock->fresh()->quantity
                            ]
                        ]);
                    }
                }
            }
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'PARTIAL']);
        }

        return $payment->load('invoice');
    }

    public function showInvoice($id)
    {
        $invoice = Invoice::findOrFail($id);
        $this->authorize('view', $invoice);
        return $invoice->load(['patient', 'payments', 'amendments.actor']);
    }
}
