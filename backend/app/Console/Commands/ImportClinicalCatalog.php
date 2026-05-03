<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ClinicalCatalogService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImportClinicalCatalog extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'his:import-catalog 
                            {--file=docs/all_brand_details.json : Path to the details JSON file}
                            {--limit= : Limit the number of records to process}
                            {--dry-run : Only simulate the import without writing to DB}
                            {--chunk=500 : Number of records per chunk}';

    /**
     * The console command description.
     */
    protected $description = 'Ingest the high-integrity clinical catalog from JSON sources';

    protected $catalogService;

    public function __construct(ClinicalCatalogService $catalogService)
    {
        parent::__construct();
        $this->catalogService = $catalogService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = base_path($this->option('file'));

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info("Reading catalog from: {$filePath}");
        
        // Load the file content
        $content = file_get_contents($filePath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error("Invalid JSON format: " . json_last_error_msg());
            return 1;
        }

        $total = count($data);
        $limit = $this->option('limit') ? (int) $this->option('limit') : $total;
        $count = 0;
        $success = 0;
        $dryRun = $this->option('dry-run');

        $this->info("Found {$total} brands. Processing " . ($dryRun ? " (DRY RUN) " : "") . "limit: {$limit}");
        
        $bar = $this->output->createProgressBar(min($total, $limit));
        $bar->start();

        foreach ($data as $brand) {
            if ($count >= $limit) break;

            if ($dryRun) {
                // Simulate output for verification
                $this->line("\n[Dry Run] Brand: {$brand['brand_name']} | Generic: {$brand['generic_content']}");
                if (!empty($brand['flattened_sections']['packaging'])) {
                    $this->line("  Packaging: {$brand['flattened_sections']['packaging']}");
                }
                $success++;
            } else {
                $medicine = $this->catalogService->ingestBrand($brand);
                if ($medicine) {
                    $success++;
                }
            }

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Records Read', $count],
                ['Successful Imports', $success],
                ['Failed Imports', $count - $success],
                ['Dry Run Mode', $dryRun ? 'Yes' : 'No'],
            ]
        );

        $this->info("Import process completed.");
        return 0;
    }
}
