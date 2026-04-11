<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImagingStudy;
use App\Models\ImagingInstance;
use App\Models\Order;
use App\Models\Patient;
use App\Services\DICOMService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImagingController extends Controller
{
    protected $dicomService;

    public function __construct(DICOMService $dicomService)
    {
        $this->dicomService = $dicomService;
    }

    /**
     * Display a list of studies for a specific patient.
     */
    public function patientStudies($patientId)
    {
        $patient = Patient::findOrFail($patientId);
        
        // Authorization
        $this->authorize('view', $patient);

        return $patient->imagingStudies()->with('instances')->get();
    }

    /**
     * Ingest a DICOM study file.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'order_id' => 'nullable|exists:orders,id',
            'dicom_file' => 'required|file|max:20480', // 20MB max for prototype
        ]);


        $instance = $this->dicomService->ingest(
            $request->file('dicom_file'),
            $request->user()->tenant_id,
            $validated['patient_id'],
            $validated['order_id'] ?? null
        );

        return response()->json([
            'message' => 'DICOM file ingested successfully.',
            'study_id' => $instance->imaging_study_id,
            'instance_id' => $instance->id
        ], 201);
    }

    /**
     * Submit or update a radiology report (preliminary).
     */
    public function submitReport(Request $request, $studyId)
    {
        $study = ImagingStudy::findOrFail($studyId);
        
        $validated = $request->validate([
            'findings' => 'required|string',
            'impression' => 'required|string',
        ]);

        if ($study->is_finalized) {
            return response()->json(['message' => 'Cannot modify a finalized report.'], 422);
        }

        $study->update([
            'findings' => $validated['findings'],
            'impression' => $validated['impression'],
            'radiologist_id' => $request->user()->id,
            'interpretation_date' => now(),
        ]);

        return response()->json([
            'message' => 'Radiology report saved successfully.',
            'study' => $study
        ]);
    }

    /**
     * Finalize the radiology study and close the diagnostic diagnostic loop.
     */
    public function finalizeStudy(Request $request, $studyId)
    {
        $study = ImagingStudy::findOrFail($studyId);
        
        if ($study->is_finalized) {
            return response()->json(['message' => 'Report is already finalized.'], 422);
        }

        if (empty($study->findings) || empty($study->impression)) {
            return response()->json(['message' => 'Cannot finalize a report without findings and impressions.'], 422);
        }

        $study->update(['is_finalized' => true]);

        // Close the Diagnostic Loop: Mark the related Order as COMPLETED
        if ($study->order_id) {
            $order = Order::find($study->order_id);
            if ($order && $order->status !== 'COMPLETED') {
                $order->update(['status' => 'COMPLETED']);
                
                // Track this as a critical audit event
                $study->logAudit('RAD_STUDY_FINALIZED', [
                    'order_id' => $order->id,
                    'radiologist' => $request->user()->name
                ]);
            }
        }

        return response()->json([
            'message' => 'Radiology study finalized and diagnostic order closed.',
            'study' => $study
        ]);
    }

    /**
     * Serve the raw DICOM file for high-fidelity viewing.
     * (Basic WADO implementation for prototype)
     */
    public function showInstance($instanceId)
    {
        $instance = ImagingInstance::findOrFail($instanceId);

        $path = $instance->file_path;

        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'DICOM file not found.');
        }

        return Storage::disk('local')->download($path);
    }

}
