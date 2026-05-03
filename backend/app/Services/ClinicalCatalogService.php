<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\MedicineForm;
use App\Models\Disease;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ClinicalCatalogService
{
    /**
     * Ingest a single brand entry (Medicine + Forms).
     */
    public function ingestBrand(array $item): ?Medicine
    {
        try {
            return DB::transaction(function () use ($item) {
                $medicine = $this->ingestMedicine($item);
                $this->ingestForms($medicine, $item);
                return $medicine;
            });
        } catch (\Exception $e) {
            Log::error("[ClinicalCatalog] Failed to ingest brand '" . ($item['brand_name'] ?? 'UNKNOWN') . "': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Ingest a disease and its associated brand mappings.
     */
    public function ingestDiseaseMapping(array $item): bool
    {
        try {
            return DB::transaction(function () use ($item) {
                // 1. Ingest Disease
                $disease = Disease::updateOrCreate(
                    ['name' => trim($item['disease_name'])],
                    [
                        'source_id' => (string) ($item['disease_id'] ?? null),
                        'is_system' => true,
                    ]
                );

                // 2. Ingest associated brands
                if (!empty($item['brands']) && is_array($item['brands'])) {
                    foreach ($item['brands'] as $brandData) {
                        // We use a lighter version of brand ingestion here
                        $medicine = Medicine::updateOrCreate(
                            [
                                'source_id' => (string) $brandData['brand_id'],
                                'source_system' => 'DOCS_ALL_DISEASE_BRANDS',
                            ],
                            [
                                'brand_name' => $brandData['brand_name'],
                                'generic_name' => $brandData['generic_content'] ?? 'UNKNOWN',
                                'company_name' => $brandData['company_name'] ?? null,
                                'brand_shot_url' => $brandData['brand_shot']['small'] ?? null,
                                'is_system' => true,
                                'classification' => 'HUMAN',
                            ]
                        );

                        // 3. Link them
                        $disease->medicines()->syncWithoutDetaching([$medicine->id => [
                            'source' => 'DOCS_ALL_DISEASE_BRANDS',
                            'is_system' => true,
                        ]]);
                    }
                }

                return true;
            });
        } catch (\Exception $e) {
            Log::error("[ClinicalCatalog] Failed to ingest disease mapping for '" . ($item['disease_name'] ?? 'UNKNOWN') . "': " . $e->getMessage());
            return false;
        }
    }

    /**
     * Bulk ingest from file with type detection.
     */
    public function ingestFromFile(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new \Exception("Catalog file not found at: {$filePath}");
        }

        $json = file_get_contents($filePath);
        $items = json_decode($json, true);

        if (!is_array($items)) {
            throw new \Exception("Failed to parse catalog JSON.");
        }

        $totalCount = count($items);
        $successCount = 0;
        $errorCount = 0;

        // Detect type based on first item
        $isMappingFile = isset($items[0]['disease_name']);

        Log::info("[ClinicalCatalog] Starting ingestion of {$totalCount} items from " . basename($filePath));

        foreach ($items as $item) {
            $success = $isMappingFile 
                ? $this->ingestDiseaseMapping($item) 
                : (bool) $this->ingestBrand($item);

            if ($success) {
                $successCount++;
            } else {
                $errorCount++;
            }

            if ($successCount % 100 === 0) {
                Log::info("[ClinicalCatalog] Progress: {$successCount}/{$totalCount} items processed.");
            }
        }

        return [
            'total' => $totalCount,
            'success' => $successCount,
            'errors' => $errorCount,
        ];
    }

    /**
     * Create or update a Medicine record from brand data.
     */
    private function ingestMedicine(array $item): Medicine
    {
        $data = $item['detail']['data'] ?? $item;
        $sections = $item['flattened_sections'] ?? [];

        return Medicine::updateOrCreate(
            [
                'source_id' => (string) $item['brand_id'],
                'source_system' => 'DOCS_ALL_BRAND_DETAILS',
            ],
            [
                'generic_name' => $item['generic_content'] ?? 'UNKNOWN',
                'brand_name' => $item['brand_name'],
                'company_name' => $data['company']['name'] ?? null,
                'content' => $item['content'] ?? null,
                'generic_content' => $item['generic_content'] ?? null,
                'therapeutic_class' => $data['therapeutic_class'] ?? ($sections['therapeutic_class'] ?? null),
                'prescription_class' => $data['prescription_class'] ?? ($sections['regulatory_classification'] ?? null),
                'class' => $item['class'] ?? 'human',
                'form_class' => (string) $item['form_class'],
                'brand_status' => (string) $item['brand_status'],
                'is_prescribable' => (bool) ($data['is_prescribable'] ?? true),
                'show_brand_info' => (bool) ($item['show_brand_info'] ?? false),
                'brand_shot_url' => $data['brand_shot']['small'] ?? null,
                'description' => $data['description'] ?? null,
                'indications_text' => $sections['indications'] ?? ($item['indication_long'] ?? null),
                'dose_text' => $sections['dose'] ?? null,
                'contraindications_text' => $sections['contraindications'] ?? null,
                'precautions_text' => $sections['precautions'] ?? null,
                'drug_interactions_text' => $sections['drug_interactions'] ?? null,
                'packaging_text' => $sections['packaging'] ?? ($data['packaging'] ?? null),
                'classification' => strtoupper($item['class'] ?? 'HUMAN_MEDICINE'),
                'is_system' => true,
            ]
        );
    }

    /**
     * Parse packaging text and ingest MedicineForm records.
     */
    private function ingestForms(Medicine $medicine, array $item): array
    {
        $sections = $item['flattened_sections'] ?? [];
        $packagingText = $sections['packaging'] ?? ($item['detail']['data']['packaging'] ?? null);
        
        if (empty($packagingText)) {
            return [];
        }

        $forms = [];
        $parts = preg_split('/(?<=\.)\s+|(?<=,\s)/', $packagingText, -1, PREG_SPLIT_NO_EMPTY);

        foreach ($parts as $part) {
            $parsed = $this->parsePackagingPart($part);
            if ($parsed) {
                $forms[] = MedicineForm::updateOrCreate(
                    [
                        'medicine_id' => $medicine->id,
                        'external_form_id' => $medicine->source_id . '_' . Str::slug($part),
                    ],
                    [
                        'brand_form' => $part,
                        'form_name' => $parsed['form'],
                        'strength' => $parsed['strength'],
                        'price' => $parsed['price'],
                        'prescription_class' => $medicine->prescription_class,
                        'is_dangerous' => (bool) ($item['is_dangerous'] ?? false),
                    ]
                );
            }
        }

        return $forms;
    }

    /**
     * Regex logic to extract form, strength, and price from a packaging string.
     */
    private function parsePackagingPart(string $part): ?array
    {
        $price = null;
        if (preg_match('/\(P([\d\.,]+)\)/', $part, $matches)) {
            $price = (float) str_replace(',', '', $matches[1]);
            $part = str_replace($matches[0], '', $part);
        }

        $strength = null;
        $strengthPattern = '/(\d+\.?\d*\s*(mg|g|mcg|mL|L|IU|units|%|mmol|s)(\/(mg|g|mcg|mL|L))?)/i';
        if (preg_match($strengthPattern, $part, $matches)) {
            $strength = trim($matches[0]);
            $part = str_replace($matches[0], '', $part);
        }

        $form = trim(preg_replace('/\s+/', ' ', $part));
        $form = rtrim($form, '., ');

        if (empty($form) && empty($strength)) {
            return null;
        }

        return [
            'form' => $form ?: 'Other',
            'strength' => $strength,
            'price' => $price,
        ];
    }
}
