<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Vital;
use Carbon\Carbon;

class PediatricService
{
    /**
     * Filipino-Preferred (ECCD-based) Developmental Milestones
     */
    public function getMilestonesByAge(Patient $patient)
    {
        $ageInMonths = $patient->dob->diffInMonths(now());

        $milestones = [
            '0-3_MONTHS' => [
                'Motor' => ['Holds head up steadily', 'Moves arms and legs together'],
                'Self-Help' => ['Sucks and swallows milk effectively'],
                'Social' => ['Smiles at people', 'Follows moving objects with eyes'],
            ],
            '4-6_MONTHS' => [
                'Motor' => ['Rolls over', 'Sits with support'],
                'Language' => ['Babbles', 'Responds to sounds'],
                'Social' => ['Plays with hands and feet'],
            ],
            '7-9_MONTHS' => [
                'Motor' => ['Sits without support', 'Crawl/Creeps'],
                'Self-Help' => ['Attempts to feed self'],
                'Language' => ['Recognizes name', 'Makes "Ma-ma" or "Da-da" sounds'],
            ],
            '10-12_MONTHS' => [
                'Motor' => ['Stands alone', 'Walks with support'],
                'Social' => ['Plays "Peek-a-boo"', 'Waves bye-bye'],
                'Language' => ['Says 1-2 words besides Ma-ma/Da-da'],
            ]
        ];

        if ($ageInMonths <= 3) return $milestones['0-3_MONTHS'];
        if ($ageInMonths <= 6) return $milestones['4-6_MONTHS'];
        if ($ageInMonths <= 9) return $milestones['7-9_MONTHS'];
        if ($ageInMonths <= 12) return $milestones['10-12_MONTHS'];

        return ['Info' => 'Child is over 1 year. Secondary ECCD milestones recommended.'];
    }

    /**
     * Calculate Recommended Pediatric Dosage (mg/kg)
     */
    public function calculateDose($weightKg, $dosePerKg)
    {
        if ($weightKg <= 0) return 0;
        return round($weightKg * $dosePerKg, 2);
    }

    /**
     * Age-adjusted Clinical Vitals Ranges (Pediatrics)
     */
    public function getVitalStatus(Vital $vital)
    {
        $patient = $vital->patient;
        $age = $patient->dob->diffInMonths(now());

        $status = [];

        // Pulse Rate (Standard Pediatric Norms)
        if ($age <= 1) { // Newborn
            $status['pulse'] = ($vital->pulse_rate >= 100 && $vital->pulse_rate <= 160) ? 'NORMAL' : 'CRITICAL';
            $status['resp'] = ($vital->resp_rate >= 30 && $vital->resp_rate <= 60) ? 'NORMAL' : 'CRITICAL';
        } elseif ($age <= 12) { // Infant
            $status['pulse'] = ($vital->pulse_rate >= 90 && $vital->pulse_rate <= 150) ? 'NORMAL' : 'CRITICAL';
            $status['resp'] = ($vital->resp_rate >= 24 && $vital->resp_rate <= 40) ? 'NORMAL' : 'CRITICAL';
        } else { // Toddler/Older
            $status['pulse'] = ($vital->pulse_rate >= 80 && $vital->pulse_rate <= 130) ? 'NORMAL' : 'CRITICAL';
            $status['resp'] = ($vital->resp_rate >= 20 && $vital->resp_rate <= 30) ? 'NORMAL' : 'CRITICAL';
        }

        return $status;
    }
}
