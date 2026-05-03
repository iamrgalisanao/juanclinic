<?php

namespace Database\Seeders;

use App\Services\ClinicalCatalogService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class ClinicalCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $files = [
            '../docs/all_brand_details.json',
            '../docs/all_disease_brands.json',
        ];
        
        $this->command->info("Starting Clinical Catalog Ingestion (Phase 17)...");
        
        $service = new ClinicalCatalogService();
        
        foreach ($files as $file) {
            $filePath = base_path($file);
            $fileName = basename($file);
            
            $this->command->info("Processing {$fileName}...");
            
            try {
                $results = $service->ingestFromFile($filePath);
                
                $this->command->info("Finished {$fileName}:");
                $this->command->info("- Items Read: {$results['total']}");
                $this->command->info("- Success: {$results['success']}");
                
                if ($results['errors'] > 0) {
                    $this->command->error("- Errors: {$results['errors']}");
                }
                
            } catch (\Exception $e) {
                $this->command->error("Failure in {$fileName}: " . $e->getMessage());
                Log::critical("[ClinicalCatalogSeeder] {$fileName}: " . $e->getMessage());
            }
        }

        $this->command->info("Clinical Catalog Ingestion Phase 17 Complete.");
    }
}
