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
     * @param string $validationLevel minimal|standard|strict
     * @return Order|null
     */
    public function process(string $rawMessage, int $tenantId, string $validationLevel = 'minimal')
    {
        // Simple mock parsing for demonstration
        // HL7 message segments are separated by \r
        $segments = explode("\r", $rawMessage);

        $orderData = [
            'tenant_id' => $tenantId,
            'status' => 'PENDING',
        ];

        $mshMeta = [
            'message_type' => null,
            'sending_facility' => null,
            'receiving_facility' => null,
        ];

        foreach ($segments as $segment) {
            $fields = explode("|", $segment);
            $header = $fields[0];

            if ($header === 'MSH') {
                // Basic MSH parsing
                // Field 9: Message Type (e.g. ORU^R01, ORM^O01)
                $mshMeta['message_type'] = $fields[8] ?? null;
                // Field 4: Sending Facility, Field 6: Receiving Facility
                $mshMeta['sending_facility'] = $fields[3] ?? null;
                $mshMeta['receiving_facility'] = $fields[5] ?? null;
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

        // Validation based on configured level
        if ($validationLevel !== 'minimal') {
            // Require at least a recognizable message type for standard/strict
            $allowedTypes = ['ORU^R01', 'ORM^O01'];
            if (empty($mshMeta['message_type']) || ! in_array($mshMeta['message_type'], $allowedTypes, true)) {
                Log::warning("HL7 validation failed for tenant {$tenantId}: unsupported or missing message type", $mshMeta);
                return null;
            }
        }

        if (isset($orderData['patient_id']) && isset($orderData['order_type'])) {
            $order = Order::create($orderData);

            // Audit Log (Specific event for raw HL7 message ingestion)
            AuditLog::create([
                'tenant_id' => $tenantId,
                'event' => 'HL7_IMPORT',
                'auditable_type' => 'Order',
                'auditable_id' => $order->id,
                'new_values' => [
                    'raw' => $rawMessage,
                    'hl7_meta' => $mshMeta,
                    'validation_level' => $validationLevel,
                ],
            ]);

            return $order;
        }

        Log::warning("HL7 processing failed for tenant $tenantId: Invalid data.");
        return null;
    }
}
