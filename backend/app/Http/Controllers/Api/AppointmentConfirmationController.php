<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentConfirmationController extends Controller
{
    /**
     * Handle the signed confirmation link.
     */
    public function confirm(Request $request, Appointment $appointment)
    {
        // Signed middleware in routes will handle verification
        if ($appointment->status !== 'PENDING') {
            return response()->view('appointments.confirmation_result', [
                'success' => false,
                'message' => 'This appointment has already been processed or finalized.',
            ]);
        }

        $appointment->update(['status' => 'CONFIRMED']);

        return response()->view('appointments.confirmation_result', [
            'success' => true,
            'message' => 'Salamat! Ang iyong appointment ay kumpirmado na. / Thank you! Your appointment is now confirmed.',
            'appointment' => $appointment
        ]);
    }
}
