<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function index(Request $request, $patientId)
    {
        // Tenant scoping is handled by the BelongsToTenant trait
        return ClinicalAttachment::where('patient_id', $patientId)
            ->with('uploader')
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB limit
            'description' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $tenantId = $request->user()->tenant_id;
        
        // Path isolation: storage/app/tenants/{tenant_id}/attachments/
        $path = $file->store("tenants/{$tenantId}/attachments");

        $attachment = ClinicalAttachment::create([
            'tenant_id' => $tenantId,
            'patient_id' => $request->patient_id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'description' => $request->description,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($attachment, 201);
    }

    public function download(Request $request, $id)
    {
        $attachment = ClinicalAttachment::findOrFail($id);

        // Verify file exists
        if (!Storage::exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found on disk'], 404);
        }

        return Storage::download($attachment->file_path, $attachment->file_name);
    }

    public function destroy($id)
    {
        $attachment = ClinicalAttachment::findOrFail($id);
        
        // Delete from disk
        Storage::delete($attachment->file_path);
        
        // Delete record
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully']);
    }
}
