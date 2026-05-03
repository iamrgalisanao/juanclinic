<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Prescription::class);
        return Prescription::with(['patient', 'physician'])->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Prescription::class);

        // Check if input is a bulk request or single entry
        $isBulk = $request->has('prescriptions') && is_array($request->input('prescriptions'));
        $data = $isBulk ? $request->input('prescriptions') : [$request->all()];

        return \DB::transaction(function () use ($data, $request, $isBulk) {
            $created = [];
            
            foreach ($data as $item) {
                // Validation - we could use a custom FormRequest for bulk, 
                // but for now we'll validate inline to keep it simple and robust.
                $validated = \Validator::make($item, [
                    'patient_id' => 'required|exists:patients,id',
                    'medicine_id' => 'nullable|exists:medicines,id',
                    'medicine_form_id' => 'nullable|exists:medicine_forms,id',
                    'medication_name' => 'required|string',
                    'quantity' => 'required|integer|min:1',
                    'dosage' => 'required|string',
                    'frequency' => 'required|string',
                    'duration' => 'required|string',
                    'instructions' => 'nullable|string',
                ])->validate();

                $validated['physician_id'] = $request->user()->id;
                $validated['branch_id'] = $request->header('X-Branch-ID');
                $validated['status'] = 'ACTIVE';

                $created[] = Prescription::create($validated);
            }

            return $isBulk ? $created : $created[0];
        });
    }

    public function show($id)
    {
        $prescription = Prescription::findOrFail($id);
        $this->authorize('view', $prescription);
        return $prescription->load(['patient', 'physician', 'amendments.actor']);
    }

    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $this->authorize('update', $prescription);

        $validated = $request->validate([
            'medication_name' => 'sometimes|string',
            'dosage' => 'sometimes|string',
            'frequency' => 'sometimes|string',
            'duration' => 'sometimes|string',
            'instructions' => 'nullable|string',
            'status' => 'sometimes|in:ACTIVE,COMPLETED,CANCELLED',
            'amendment_reason' => 'required|string|max:255',
        ]);

        $prescription->recordAmendment($validated, $validated['amendment_reason']);

        return $prescription->load(['patient', 'physician']);
    }
}
