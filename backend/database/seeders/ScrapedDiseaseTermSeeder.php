<?php

namespace Database\Seeders;

use App\Services\TerminologyService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ScrapedDiseaseTermSeeder extends Seeder
{
    /**
     * Ingest discovery terms from the all_diseases.json source.
     * Aligned with Phase 3 Governance: Protects Canonical catalog while expanding search.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/all_diseases.json');
        
        if (!File::exists($path)) {
            $this->command->error("Source discovery file not found at: {$path}");
            return;
        }

        $json = File::get($path);
        $items = json_decode($json, true);
        
        if (!is_array($items)) {
            $this->command->error("Failed to parse JSON from {$path}");
            return;
        }

        $service = new TerminologyService();
        $count = count($items);
        $this->command->info("Starting ingestion of {$count} discovery terms...");

        $mappedCount = 0;
        $importedCount = 0;
        $skippedCount = 0;

        foreach ($items as $item) {
            $termString = trim($item['disease_name'] ?? '');
            
            if (empty($termString)) {
                $skippedCount++;
                continue;
            }

            // Centralized Mapping Resolution:
            // Tries Name -> Slug -> Approved Aliases
            $canonicalDisease = $service->findDiseaseByTerm($termString);

            $diseaseId = $canonicalDisease?->id;
            
            $service->ingestTerm([
                'term' => $termString,
                'disease_id' => $diseaseId,
                'term_type' => 'DISCOVERY_LABEL',
                'review_status' => $diseaseId ? 'MAPPED' : 'IMPORTED',
                'source_system' => 'DOCS_ALL_DISEASES',
                'source_id' => (string) $item['id'],
            ]);

            if ($diseaseId) {
                $mappedCount++;
            } else {
                $importedCount++;
            }
        }

        $this->command->info("Ingestion Summary:");
        $this->command->info("- Total Read: {$count}");
        $this->command->info("- Auto-Mapped to Canonical: {$mappedCount}");
        $this->command->info("- Registered as IMPORTED: {$importedCount}");
        if ($skippedCount > 0) {
            $this->command->warn("- Skipped (empty): {$skippedCount}");
        }
    }
}
