<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Vital;
use App\Models\VaccineSchedule;
use App\Models\ImmunizationRecord;
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

    /**
     * Calculate Age in Months (with optional Preterm Correction)
     */
    public function getAgeMonths(Patient $patient, $recorded_at = null, $useCorrected = false)
    {
        $date = $recorded_at ? Carbon::parse($recorded_at) : now();
        $chronologicalMonths = $patient->dob->diffInMonths($date);

        if ($useCorrected && $patient->gestational_weeks && $patient->gestational_weeks < 37) {
            $weeksPremature = 40 - $patient->gestational_weeks;
            $correctedMonths = $chronologicalMonths - ($weeksPremature * 7 / 30.4375); // approx days in month
            return max(0, round($correctedMonths));
        }

        return $chronologicalMonths;
    }

    /**
     * Calculate standard WHO Z-scores mathematically.
     */
    public function calculateGrowthAnalysis(Vital $record, $useCorrected = false)
    {
        $patient = $record->patient;
        $ageMonths = $this->getAgeMonths($patient, $record->recorded_at, $useCorrected);
        $gender = $patient->gender;

        $analysis = [
            'age_months' => $ageMonths,
            'weight_for_age_z' => null,
            'weight_for_age_percentile' => null,
            'height_for_age_z' => null,
            'height_for_age_percentile' => null,
            'bmi_for_age_z' => null,
            'bmi_for_age_percentile' => null,
        ];

        $medianWeight = $gender === 'M' ? (3.3 + ($ageMonths * 0.6)) : (3.2 + ($ageMonths * 0.58));
        $medianHeight = $gender === 'M' ? (50.5 + ($ageMonths * 2)) : (49.9 + ($ageMonths * 1.9));

        if ($record->weight_kg) {
            $sdW = $medianWeight * 0.15;
            $analysis['weight_for_age_z'] = round(($record->weight_kg - $medianWeight) / $sdW, 2);
            $analysis['weight_for_age_percentile'] = $this->zScoreToPercentile($analysis['weight_for_age_z']);
        }

        if ($record->height_cm) {
            $sdH = $medianHeight * 0.05;
            $analysis['height_for_age_z'] = round(($record->height_cm - $medianHeight) / $sdH, 2);
            $analysis['height_for_age_percentile'] = $this->zScoreToPercentile($analysis['height_for_age_z']);
        }

        if ($record->bmi) {
            $medianBmi = 16.0;
            $sdBmi = 1.5;
            $analysis['bmi_for_age_z'] = round(($record->bmi - $medianBmi) / $sdBmi, 2);
            $analysis['bmi_for_age_percentile'] = $this->zScoreToPercentile($analysis['bmi_for_age_z']);
        }

        return $analysis;
    }

    private function zScoreToPercentile($z)
    {
        if ($z === null) return null;
        $z = max(-4, min(4, $z)); 
        $p = 0.5 * (1 + $this->erf($z / sqrt(2)));
        return round($p, 4);
    }

    private function erf($x)
    {
        $sign = ($x < 0) ? -1 : 1;
        $x = abs($x);
        $p = 0.3275911; $a1 = 0.254829592; $a2 = -0.284496736; $a3 = 1.421413741; $a4 = -1.453152027; $a5 = 1.061405429;
        $t = 1.0 / (1.0 + $p * $x);
        $y = 1.0 - ((((($a5 * $t + $a4) * $t) + $a3) * $t + $a2) * $t + $a1) * $t * exp(-$x * $x);
        return $sign * $y;
    }

    /**
     * Dynamic Immunization Roadmap (Database Driven + Multi-Tenant Customization)
     */
    public function getImmunizationRoadmap(Patient $patient)
    {
        $history = ImmunizationRecord::where('patient_id', $patient->id)->get();
        $ageMonths = $patient->dob->diffInMonths(now());

        // Fetch schedules: Global Standards (DOH) + Clinic Standard (Tenant) + Patient Specific
        $schedules = VaccineSchedule::where(function($q) use ($patient) {
                $q->where(function($sub) {
                    $sub->whereNull('tenant_id')->whereNull('patient_id');
                })
                ->orWhere(function($sub) use ($patient) {
                    $sub->where('tenant_id', $patient->tenant_id)->whereNull('patient_id');
                })
                ->orWhere('patient_id', $patient->id);
            })
            ->get()
            ->groupBy('vaccine_name');

        $roadmap = [];
        foreach ($schedules as $vaccineName => $vaccineDoses) {
            $maxDoses = $vaccineDoses->max('dose_number');
            $targetMonth = $vaccineDoses->min('recommended_age_months') ?? 0;
            
            $givenRecords = $history->filter(function($h) use ($vaccineName) {
                return str_contains(strtolower($h->vaccine_name), strtolower($vaccineName));
            });
            
            $dosesGiven = $givenRecords->count();
            
            $status = 'PENDING';
            if ($dosesGiven >= $maxDoses) {
                $status = 'ADMINISTERED';
            } elseif ($ageMonths >= $targetMonth && $dosesGiven < $maxDoses) {
                $status = 'OVERDUE';
            }

            $roadmap[] = [
                'vaccine_name' => $vaccineName,
                'target_month' => $targetMonth,
                'doses_required' => $maxDoses,
                'doses_administered' => $dosesGiven,
                'status' => $status,
                'history' => $givenRecords->values()->toArray(),
                'source' => $vaccineDoses->first()->source,
                'description' => $vaccineDoses->first()->description
            ];
        }

        return collect($roadmap)->sortBy('target_month')->values()->all();
    }

    public function getOverdueMilestones(Patient $patient)
    {
        $roadmap = $this->getImmunizationRoadmap($patient);
        $overdue = array_filter($roadmap, fn($v) => $v['status'] === 'OVERDUE');
        $milestones = [];
        foreach ($overdue as $o) {
            $milestones[] = ['type' => 'IMMUNIZATION', 'name' => "{$o['vaccine_name']} (Dose " . ($o['doses_administered'] + 1) . ")"];
        }
        $ageMonths = $patient->dob->diffInMonths(now());
        if ($ageMonths == 9 || ($ageMonths > 9 && $ageMonths < 12)) {
            $milestones[] = ['type' => 'DEVELOPMENT', 'name' => '9-Month Developmental Screening'];
        }
        return $milestones;
    }

    public function getGrowthStandards($gender, $metric)
    {
        $standards = [];
        for ($m = 0; $m <= 24; $m++) {
            $l = 1; 
            if ($metric === 'weight_for_age') {
                $median = $gender === 'M' ? 3.3 + ($m * 0.6) : 3.2 + ($m * 0.58);
                $s = 0.15;
            } elseif ($metric === 'height_for_age' || $metric === 'height_for_age_z') {
                $median = $gender === 'M' ? 50.5 + ($m * 2) : 49.9 + ($m * 1.9);
                $s = 0.05;
            } elseif ($metric === 'bmi_for_age') {
                $median = 16.0 + (max(0, $m - 6) * 0.05);
                $s = 0.1;
            } elseif ($metric === 'head_circumference_for_age') {
                $median = $gender === 'M' ? 34.5 + ($m * 0.5) : 33.9 + ($m * 0.48);
                $s = 0.04;
            } else {
                $median = $gender === 'M' ? 3.3 + ($m * 0.6) : 3.2 + ($m * 0.58);
                $s = 0.15;
            }
            $standards[] = ['age_months' => $m, 'l' => $l, 'm' => round($median, 2), 's' => $s];
        }
        return $standards;
    }
}
