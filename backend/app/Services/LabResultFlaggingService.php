<?php

namespace App\Services;

use App\Models\DiagnosticResult;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class LabResultFlaggingService
{
    /**
     * Analyze and flag a lab result.
     */
    public function process(DiagnosticResult $result)
    {
        $value = floatval($result->value);
        $min = floatval($result->reference_range_min);
        $max = floatval($result->reference_range_max);

        if ($result->reference_range_min && $value < $min) {
            $result->clinical_flag = 'LOW';
        } elseif ($result->reference_range_max && $value > $max) {
            $result->clinical_flag = 'HIGH';
        } else {
            $result->clinical_flag = 'NORMAL';
        }

        // JuanClinic Logic: Check for Life-Safety Critical Flags
        // (Typically based on specific floor/ceiling per test type, simulated here)
        if ($result->is_critical) {
            $result->clinical_flag = 'CRITICAL';
            $this->triggerCriticalAlert($result);
        }

        $result->save();
        return $result;
    }

    /**
     * Trigger immediate life-safety alerts for critical diagnostic findings.
     */
    protected function triggerCriticalAlert(DiagnosticResult $result)
    {
        $order = $result->order;
        if (!$order || !$order->doctor) {
            Log::warning("Critical Alert Failure: No referring physician found for Order #{$result->order_id}");
            return;
        }

        $doctor = $order->doctor;
        $patientName = $order->patient->first_name . ' ' . $order->patient->last_name;

        // SMS Simulation (Mandatory for Critical Labs)
        Log::info("[CRITICAL LAB ALERT] To Dr. {$doctor->last_name}: CRITICAL RESULT for {$patientName} on {$result->test_name}. Value: {$result->value} {$result->unit}. Action Required.");

        // Internal HIS Notification
        // $doctor->notify(new \App\Notifications\CriticalLabNotification($result));
    }
}
