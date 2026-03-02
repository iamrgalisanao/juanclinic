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
                $query->orderBy('appointment_at', 'desc');
            }
        ]);

        return response()->json([
            'patient' => $patient,
            'history' => [
                'orders' => $patient->orders,
                'appointments' => $patient->appointments
            ]
        ]);
    }
}
