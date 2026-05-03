<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientHistoryController extends Controller
{
    /**
     * Get a patient's complete longitudinal record.
     */
    public function show(Patient $patient)
    {
        // Load relationships to build the timeline
        $patient->load([
            'orders' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'appointments' => function ($query) {
                $query
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('start_time', 'desc');
            },
            'prescriptions' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'clinicalNotes' => function ($query) {
                $query->with('template', 'author')->orderBy('created_at', 'desc');
            },
            'vitals' => function ($query) {
                $query->with('author')->orderBy('recorded_at', 'desc');
            },
            'referrals' => function ($query) {
                $query->with('targetTenant', 'externalProvider')->orderBy('created_at', 'desc');
            }
        ]);

        return response()->json([
            'patient' => $patient,
            'history' => [
                'orders' => $patient->orders,
                'appointments' => $patient->appointments,
                'prescriptions' => $patient->prescriptions,
                'clinical_notes' => $patient->clinicalNotes,
                'vitals' => $patient->vitals,
                'referrals' => $patient->referrals
            ],
            'trends' => $this->calculateClinicalTrends($patient)
        ]);
    }

    /**
     * Calculate longitudinal trends for key clinical markers.
     */
    protected function calculateClinicalTrends(Patient $patient)
    {
        $vitals = $patient->vitals()->orderBy('recorded_at', 'desc')->get();
        
        if ($vitals->isEmpty()) return [];

        $latest = $vitals->first();
        $previous = $vitals->get(1); // 1-indexed for the item before latest

        $trends = [
            'weight' => [
                'current' => $latest->weight_kg,
                'previous' => $previous ? $previous->weight_kg : null,
                'delta' => $previous && $previous->weight_kg > 0 
                    ? round((($latest->weight_kg - $previous->weight_kg) / $previous->weight_kg) * 100, 1) 
                    : 0,
                'history' => $vitals->take(12)->map(fn($v) => ['val' => $v->weight_kg, 'date' => $v->recorded_at->toDateString()])
            ],
            'pulse' => [
                'current' => $latest->pulse_rate,
                'previous' => $previous ? $previous->pulse_rate : null,
                'delta' => $previous && $previous->pulse_rate > 0 
                    ? ($latest->pulse_rate - $previous->pulse_rate)
                    : 0,
                'history' => $vitals->take(12)->map(fn($v) => ['val' => $v->pulse_rate, 'date' => $v->recorded_at->toDateString()])
            ],
            'bp' => [
                'current' => "{$latest->bp_systolic}/{$latest->bp_diastolic}",
                'previous' => $previous ? "{$previous->bp_systolic}/{$previous->bp_diastolic}" : null,
                'latest_systolic' => $latest->bp_systolic,
                'history' => $vitals->take(12)->map(fn($v) => [
                    'sys' => $v->bp_systolic, 
                    'dia' => $v->bp_diastolic, 
                    'date' => $v->recorded_at->toDateString()
                ])
            ]
        ];

        return $trends;
    }
}
