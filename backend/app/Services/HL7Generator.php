<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Order;
use App\Models\HL7Outbox;
use Illuminate\Support\Facades\Auth;

class HL7Generator
{
    /**
     * Generate an ADT (Patient Administration) message.
     */
    public function generateADT(Patient $patient, string $trigger = 'A04')
    {
        $msh = $this->buildMSH("ADT^$trigger", $patient->tenant_id);
        $pid = $this->buildPID($patient);

        $message = implode("\r", [$msh, $pid]);
        
        return $this->queueMessage($patient, 'ADT', $message);
    }

    /**
     * Generate an ORU (Observation Result) message.
     */
    public function generateORU(Order $order)
    {
        $msh = $this->buildMSH("ORU^R01", $order->tenant_id);
        $pid = $this->buildPID($order->patient);
        $obr = $this->buildOBR($order);
        
        $obxSegments = [];
        if (is_array($order->result_data)) {
            $setIdx = 1;
            foreach ($order->result_data as $key => $value) {
                $obxSegments[] = $this->buildOBX($setIdx++, $key, $value);
            }
        }

        $message = implode("\r", array_merge([$msh, $pid, $obr], $obxSegments));

        return $this->queueMessage($order, 'ORU', $message);
    }

    /**
     * Build the MSH (Message Header) segment.
     */
    private function buildMSH(string $type, int $tenantId)
    {
        $dateTime = now()->format('YmdHis');
        $controlId = uniqid();
        // MSH|^~\&|SendingApp|SendingFac|ReceivingApp|ReceivingFac|DateTime||Type|ControlId|P|Version
        return "MSH|^~\\&|JUANCLINIC|$tenantId|MIRTH|HOSPITAL|$dateTime||$type|$controlId|P|2.3";
    }

    /**
     * Build the PID (Patient Identification) segment.
     */
    private function buildPID(Patient $patient)
    {
        $dob = $patient->dob ? date('Ymd', strtotime($patient->dob)) : '';
        // PID|SetID|PatientID|ExternalID||Name||DOB|Gender
        return "PID|1||{$patient->patient_external_id}||{$patient->last_name}^{$patient->first_name}||$dob|{$patient->gender}";
    }

    /**
     * Build the OBR (Observation Request) segment.
     */
    private function buildOBR(Order $order)
    {
        $dateTime = $order->created_at->format('YmdHis');
        // OBR|SetID|PlacerOrder|FillerOrder|ServiceId
        return "OBR|1|{$order->id}||{$order->order_type}|||$dateTime";
    }

    /**
     * Build the OBX (Observation Result) segment.
     */
    private function buildOBX(int $setId, string $key, $value)
    {
        // OBX|SetID|ValueType|ObservationId||ObservationValue|Units||ResultStatus
        return "OBX|$setId|ST|$key||$value|||F";
    }

    /**
     * Queue the message in the outbox.
     */
    private function queueMessage($model, string $type, string $payload)
    {
        return HL7Outbox::create([
            'tenant_id' => $model->tenant_id,
            'message_type' => $type,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'payload' => $payload,
            'status' => 'PENDING',
        ]);
    }
}
