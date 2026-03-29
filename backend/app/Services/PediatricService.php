<?php

namespace App\Services;

use App\Models\PediatricGrowthStandard;
use App\Models\Patient;
use Carbon\Carbon;

class PediatricService
{
    /**
     * Calculate Z-Score for a given metric and value using the LMS method.
     * Formula: z = ((y/M)^L - 1) / (L * S)
     */
    public function calculateZScore(string $gender, string $metric, int $ageMonths, ?float $value, string $source = 'WHO'): ?float
    {
        if (!$value) return null;

        $standard = PediatricGrowthStandard::where([
            'source' => $source,
            'gender' => $gender,
            'metric' => $metric,
            'age_months' => $ageMonths,
        ])->first();

        if (!$standard) {
            $low = PediatricGrowthStandard::where([
                'source' => $source,
                'gender' => $gender,
                'metric' => $metric,
            ])->where('age_months', '<', $ageMonths)
              ->orderBy('age_months', 'desc')
              ->first();

            $high = PediatricGrowthStandard::where([
                'source' => $source,
                'gender' => $gender,
                'metric' => $metric,
            ])->where('age_months', '>', $ageMonths)
              ->orderBy('age_months', 'asc')
              ->first();

            if (!$low || !$high) return null;

            $ratio = ($ageMonths - $low->age_months) / ($high->age_months - $low->age_months);
            $L = $low->l + $ratio * ($high->l - $low->l);
            $M = $low->m + $ratio * ($high->m - $low->m);
            $S = $low->s + $ratio * ($high->s - $low->s);
        } else {
            $L = (float) $standard->l;
            $M = (float) $standard->m;
            $S = (float) $standard->s;
        }

        $y = $value;
        if ($L == 0) return log($y / $M) / $S;
        return (pow($y / $M, $L) - 1) / ($L * $S);
    }

    /**
     * Convert Z-Score to Percentile.
     */
    public function zScoreToPercentile(float $z): float
    {
        // Simple approximation of the cumulative distribution function for a standard normal distribution
        $t = 1 / (1 + 0.2316419 * abs($z));
        $d = 0.3989423 * exp(-$z * $z / 2);
        $p = $d * $t * (0.3193815 + $t * (-0.3565638 + $t * (1.781478 + $t * (-1.821256 + $t * 1.330274))));
        
        if ($z > 0) {
            return (1 - $p) * 100;
        }
        
        return $p * 100;
    }

    /**
     * Get age in months for a patient at a given date.
     */
    public function getAgeMonths(Patient $patient, Carbon $atDate): int
    {
        return (int) $patient->dob->diffInMonths($atDate);
    }

    /**
     * Calculate BMI.
     */
    public function calculateBMI(float $weightKg, float $heightCm): float
    {
        if ($heightCm <= 0) return 0;
        $heightM = $heightCm / 100;
        return (float) ($weightKg / ($heightM * $heightM));
    }

    /**
     * Calculate all pediatric growth metrics for a given record.
     */
    public function calculateGrowthAnalysis(\App\Models\PediatricGrowthRecord $record): array
    {
        $patient = $record->patient;
        $ageMonths = $this->getAgeMonths($patient, $record->measured_at);
        $gender = $patient->gender === 'M' ? 'M' : 'F'; // Default to F if not M/F

        $weightZ = $this->calculateZScore($gender, 'weight_for_age', $ageMonths, $record->weight_kg);
        $heightZ = $this->calculateZScore($gender, 'height_for_age', $ageMonths, $record->height_cm);
        
        $bmi = $this->calculateBMI($record->weight_kg, $record->height_cm);
        $bmiZ = $this->calculateZScore($gender, 'bmi_for_age', $ageMonths, $bmi);

        $headZ = $this->calculateZScore($gender, 'head_circumference_for_age', $ageMonths, $record->head_circumference_cm);

        return [
            'age_months' => $ageMonths,
            'weight_for_age_z' => $weightZ,
            'weight_for_age_percentile' => $weightZ !== null ? $this->zScoreToPercentile($weightZ) / 100 : null,
            'height_for_age_z' => $heightZ,
            'height_for_age_percentile' => $heightZ !== null ? $this->zScoreToPercentile($heightZ) / 100 : null,
            'bmi' => $bmi,
            'bmi_for_age_z' => $bmiZ,
            'bmi_for_age_percentile' => $bmiZ !== null ? $this->zScoreToPercentile($bmiZ) / 100 : null,
            'head_circum_z' => $headZ,
            'head_circum_percentile' => $headZ !== null ? $this->zScoreToPercentile($headZ) / 100 : null,
        ];
    }

    /**
     * Get WHO Standards for a given metric and gender.
     */
    public function getGrowthStandards(string $gender, string $metric, string $source = 'WHO'): \Illuminate\Support\Collection
    {
        return PediatricGrowthStandard::where([
            'source' => $source,
            'gender' => $gender,
            'metric' => $metric,
        ])->orderBy('age_months')->get();
    }

    /**
     * Get personalized immunization roadmap for a patient.
     */
    public function getImmunizationRoadmap(Patient $patient): array
    {
        $standards = \App\Models\VaccineSchedule::all();
        $records = \App\Models\ImmunizationRecord::where('patient_id', $patient->id)->get();
        
        return $standards->map(function ($milestone) use ($patient, $records) {
            $dueDate = $patient->dob->copy();
            
            if ($milestone->recommended_age_weeks !== null) {
                $dueDate->addWeeks($milestone->recommended_age_weeks);
            } elseif ($milestone->recommended_age_months !== null) {
                $dueDate->addMonths($milestone->recommended_age_months);
            }
            
            $existing = $records->where('vaccine_name', $milestone->vaccine_name)
                               ->where('dose_number', $milestone->dose_number)
                               ->first();
            
            return [
                'vaccine_name' => $milestone->vaccine_name,
                'dose_number' => $milestone->dose_number,
                'recommended_age_weeks' => $milestone->recommended_age_weeks,
                'recommended_age_months' => $milestone->recommended_age_months,
                'due_date' => $dueDate->toDateString(),
                'status' => $existing ? 'ADMINISTERED' : ($dueDate->isPast() ? 'OVERDUE' : 'PENDING'),
                'administered_at' => $existing ? $existing->administered_at->toDateString() : null,
                'record_id' => $existing ? $existing->id : null,
                'description' => $milestone->description,
            ];
        })->toArray();
    }
}
