<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Branch;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FinanceReportController extends Controller
{
    /**
     * Generate the BIR Sales Journal (Sales Register) for a specific branch and date range.
     */
    public function getSalesJournal(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:physical_branches,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $branch = Branch::with('tenant')->findOrFail($request->branch_id);
        
        // Fetch all invoices (including unpaid) for the period
        $invoices = Invoice::with('patient')
            ->where('branch_id', $branch->id)
            ->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ])
            ->orderBy('invoice_number', 'asc')
            ->get();

        $journal = $invoices->map(function ($invoice) {
            $isExempt = in_array($invoice->discount_type, ['SENIOR', 'PWD']);
            
            // Standard Philippine Financial Mapping:
            // 1. VATable Sales: The base amount for standard 12% VAT
            // 2. VAT Amount (12%): The tax collected
            // 3. VAT-Exempt Sales: Total amount for Senior/PWD/Exempt items (Price - 12% if inclusive)
            
            $vatableSales = 0;
            $vatExemptSales = 0;
            
            if ($isExempt) {
                // For Senior/PWD: The entire subtotal (before discount) is VAT Exempt in PH law
                // (Assuming price was VAT-inclusive, we strip the 1.12 to get the base)
                $vatExemptSales = $invoice->subtotal / 1.12;
                $vatableSales = 0;
            } else {
                // Standard Sales: Subtotal / 1.12 is the VATable base
                $vatableSales = $invoice->subtotal / 1.12;
                $vatExemptSales = 0;
            }

            return [
                'date' => $invoice->created_at->format('Y-m-d'),
                'invoice_number' => $invoice->invoice_number,
                'patient_name' => $invoice->patient->name,
                'patient_tin' => $invoice->patient->tin ?? 'N/A',
                'description' => "Medical Services / Diagnostic Order #{$invoice->order_id}",
                
                // Column Breakdown (BIR Standard)
                'vatable_sales' => round($vatableSales, 2),
                'vat_amount' => round($invoice->vat_amount, 2),
                'vat_exempt_sales' => round($vatExemptSales, 2),
                'zero_rated_sales' => 0.00,
                'non_vat_sales' => 0.00,
                'discount_amount' => round($invoice->discount_amount, 2),
                'net_amount' => round($invoice->net_amount, 2),
                'status' => $invoice->status,
            ];
        });

        return response()->json([
            'meta' => [
                'registered_name' => $branch->tenant->registered_business_name ?? $branch->tenant->name,
                'tin' => $branch->tin ?? $branch->tenant->tin,
                'branch_name' => $branch->name,
                'period' => "{$request->start_date} to {$request->end_date}",
            ],
            'journal' => $journal,
            'summary' => [
                'total_vatable' => $journal->sum('vatable_sales'),
                'total_vat' => $journal->sum('vat_amount'),
                'total_exempt' => $journal->sum('vat_exempt_sales'),
                'total_net' => $journal->sum('net_amount'),
            ]
        ]);
    }
}
