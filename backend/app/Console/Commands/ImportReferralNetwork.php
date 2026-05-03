<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportReferralNetwork extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'juanclinic:import-referral-network';

    protected $description = 'Import external doctors from all_doctors.json into the referral network';

    public function handle()
    {
        $path = base_path('../docs/all_doctors.json');
        
        if (!file_exists($path)) {
            $this->error("JSON file not found at: {$path}");
            return 1;
        }

        $this->info("Importing referral network from {$path}...");
        
        $json = file_get_contents($path);
        $doctors = json_decode($json, true);

        if (!$doctors) {
            $this->error("Failed to decode JSON.");
            return 1;
        }

        $bar = $this->output->createProgressBar(count($doctors));
        $bar->start();

        foreach ($doctors as $doc) {
            // Merge all specialties for easier searching
            $allSpecialties = $doc['doctor_specialties'] ?? [];
            if (!empty($doc['specialty']) && !in_array($doc['specialty'], $allSpecialties)) {
                $allSpecialties[] = $doc['specialty'];
            }
            $searchableSpecialty = implode(', ', array_filter($allSpecialties));

            \App\Models\ExternalProvider::updateOrCreate(
                ['slug' => $doc['slug'] ?? null],
                [
                    'full_name' => $doc['full_name'],
                    'specialty' => $searchableSpecialty,
                    'sub_specialty' => $doc['sub_specialty'],
                    'clinic_name' => $doc['clinic_name'],
                    'clinic_address' => $doc['clinic_address'],
                    'province_name' => $doc['province_name'],
                    'clinic_contacts' => $doc['clinic_contacts'],
                    'hmos' => $doc['hmos'],
                    'prc_no' => $doc['prc_no'] ?? null,
                    'avatar_url' => $doc['avatar'] ?? null,
                ]
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully imported " . count($doctors) . " providers.");
        
        return 0;
    }
}
