<?php

namespace App\Services;

use App\Models\ImagingStudy;
use App\Models\ImagingInstance;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DICOMService
{
    /**
     * Process an uploaded DICOM file, extract metadata, and store it.
     */
    public function ingest($file, $tenantId, $patientId, $orderId = null)
    {
        // 1. Move file to secure tenant-isolated storage
        $path = $file->store("tenants/{$tenantId}/imaging/" . date('Y/m/d'), 'local');
        
        // 2. Parse Metadata (Simplified version for this prototype)
        // In a production environment, we'd use a binary parser like 'php-dicom'
        $metadata = $this->parseDicom($file->getRealPath());
        
        // 3. Find or Create Study
        $study = ImagingStudy::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'study_instance_uid' => $metadata['study_instance_uid'] ?? Str::uuid()->toString()
            ],
            [
                'patient_id' => $patientId,
                'order_id' => $orderId,
                'modality' => $metadata['modality'] ?? 'OT', // Other
                'study_description' => $metadata['study_description'] ?? 'Uploaded Image',
                'study_date' => $metadata['study_date'] ?? now(),
                'metadata' => $metadata
            ]
        );

        // 4. Create Instance
        return ImagingInstance::create([
            'tenant_id' => $tenantId,
            'imaging_study_id' => $study->id,
            'sop_instance_uid' => $metadata['sop_instance_uid'] ?? Str::uuid()->toString(),
            'instance_number' => $metadata['instance_number'] ?? 1,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Simplified DICOM tag extractor.
     * Extracts tags like StudyInstanceUID (0020,000D), Modality (0008,0060), etc.
     */
    private function parseDicom($filePath)
    {
        // For this implementation, we simulate extraction.
        // A real parser would read the File Meta Information and Data Sets.
        return [
            'study_instance_uid' => '1.2.840.113619.2.55.3.2831165.732.1610419200.54',
            'series_instance_uid' => '1.2.840.113619.2.55.3.2831165.732.1610419200.55',
            'sop_instance_uid' => '1.2.840.113619.2.55.3.2831165.732.1610419200.56',
            'modality' => 'XR',
            'study_description' => 'Chest X-Ray PA View',
            'study_date' => now()->subDays(1)->format('Y-m-d H:i:s'),
            'instance_number' => 1
        ];
    }
}
