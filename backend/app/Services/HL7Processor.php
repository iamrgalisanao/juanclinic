<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Patient;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class HL7Processor
{
    /**
     * Parse a raw HL7 v2 message and map it to a clinical order.
     * 
     * @param string $rawMessage
     * @param int $tenantId
     * @return Order|null
     */
    public function process(string $rawMessage, int $tenantId)
    {
        // Simple mock parsing for demonstration
        // HL7 message segments are separated by \r
        $segments = explode("\r", $rawMessage);

        $orderData = [
            'tenant_id' => $tenantId,
            'status' => 'PENDING',
        ];

        foreach ($segments as $segment) {
            $fields = explode("|", $segment);
            $header = $fields[0];

            if ($header === 'MSH') {
                // Header details
            } elseif ($header === 'PID') {
                // Patient ID mapping
                $externalId = $fields[3] ?? null;
                $patient = Patient::where('patient_external_id', $externalId)->first();
                if ($patient) {
                    $orderData['patient_id'] = $patient->id;
                }
            } elseif ($header === 'OBR') {
                // Order details
                $orderData['order_type'] = (str_contains($fields[4] ?? '', 'LAB')) ? 'LAB' : 'RAD';
                $orderData['priority'] = ($fields[27] ?? '') === 'STAT' ? 'STAT' : 'ROUTINE';
                $orderData['request_details'] = [
                    'test_code' => $fields[4] ?? 'UNKNOWN',
                    'filler_order_number' => $fields[3] ?? 'N/A'
                ];
            }
        }

        if (isset($orderData['patient_id']) && isset($orderData['order_type'])) {
            $order = Order::create($orderData);

            // Audit Log
            AuditLog::create([
                'tenant_id' => $tenantId,
                'action' => 'HL7_IMPORT',
                'resource_type' => 'Order',
                'resource_id' => $order->id,
                'payload' => ['raw' => $rawMessage],
            ]);

            return $order;
        }

        Log::warning("HL7 processing failed for tenant $tenantId: Invalid data.");
        return null;
    }
}
