<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
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
            'order_id' => 'nullable|exists:orders,id',
            'total_amount' => 'required|numeric',
        ]);

        $validated['invoice_number'] = 'INV-' . strtoupper(uniqid());
        $validated['status'] = 'UNPAID';

        return Invoice::create($validated);
    }

    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        
        $payment = Payment::create([
            'tenant_id' => $invoice->tenant_id,
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'],
        ]);

        // Update invoice status
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'PAID']);
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
