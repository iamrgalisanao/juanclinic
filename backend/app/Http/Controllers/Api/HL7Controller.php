<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\HL7Processor;

class HL7Controller extends Controller
{
    protected $processor;

    public function __construct(HL7Processor $processor)
    {
        $this->processor = $processor;
    }

    public function store(Request $request)
    {
        $request->validate([
            'hl7_message' => 'required|string',
        ]);

        // Get tenant from context (already set by middleware)
        $tenant = app()->bound('tenant') ? app('tenant') : null;
        $tenantId = $tenant?->id;

        if (! $tenantId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tenant context is required for HL7 ingestion.',
            ], 400);
        }

        $validationLevel = data_get($tenant->admin_settings, 'hl7.validation.level', 'minimal');

        $order = $this->processor->process($request->hl7_message, $tenantId, $validationLevel);

        if ($order) {
            return response()->json([
                'status' => 'success',
                'message' => 'HL7 processed and order created.',
                'order_id' => $order->id
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to process HL7 message.'
        ], 422);
    }
}
