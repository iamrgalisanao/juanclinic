<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\DiseaseTerm;
use Illuminate\Database\Seeder;

class CanonicalAliasSeeder extends Seeder
{
    /**
     * Seed curated discovery aliases for the starter ICD-10 codelist.
     * These aliases bridge the gap between clinical codes and common terminology.
     */
    public function run(): void
    {
        $codingSystem = 'ICD10CM';
        $sourceSystem = 'CANONICAL_SEEDER';

        $mappings = [
            'I10' => [
                ['term' => 'Hypertension', 'type' => 'SYNONYM', 'preferred' => true],
                ['term' => 'High blood pressure', 'type' => 'CONSUMER_LABEL', 'preferred' => false],
                ['term' => 'HTN', 'type' => 'ABBREVIATION', 'preferred' => false],
            ],
            'R50.9' => [
                ['term' => 'Fever', 'type' => 'SYNONYM', 'preferred' => true],
                ['term' => 'Nilalagnat', 'type' => 'CONSUMER_LABEL', 'preferred' => false],
            ],
            'R05' => [
                ['term' => 'Cough', 'type' => 'SYNONYM', 'preferred' => true],
                ['term' => 'Inuubo', 'type' => 'CONSUMER_LABEL', 'preferred' => false],
            ],
            'K21.9' => [
                ['term' => 'GERD', 'type' => 'ABBREVIATION', 'preferred' => true],
                ['term' => 'Acid Reflux', 'type' => 'CONSUMER_LABEL', 'preferred' => false],
            ],
            'E11.9' => [
                ['term' => 'Diabetes', 'type' => 'CONSUMER_LABEL', 'preferred' => true],
                ['term' => 'T2DM', 'type' => 'ABBREVIATION', 'preferred' => false],
            ],
            'J06.9' => [
                ['term' => 'Common Cold', 'type' => 'CONSUMER_LABEL', 'preferred' => true],
                ['term' => 'URI', 'type' => 'ABBREVIATION', 'preferred' => false],
                ['term' => 'Upper Respiratory Infection', 'type' => 'SYNONYM', 'preferred' => false],
                ['term' => "UBO'T SIPON", 'type' => 'CONSUMER_LABEL', 'preferred' => false],
            ],
            'M54.5' => [
                ['term' => 'Back Pain', 'type' => 'CONSUMER_LABEL', 'preferred' => true],
                ['term' => 'Low back pain', 'type' => 'SYNONYM', 'preferred' => false],
                ['term' => 'Lumbago', 'type' => 'SYNONYM', 'preferred' => false],
            ],
        ];

        $this->command->info('Seeding curated canonical aliases...');

        foreach ($mappings as $code => $aliases) {
            $disease = Disease::where('code', $code)
                ->where('coding_system', $codingSystem)
                ->first();

            if (!$disease) {
                $this->command->warn("Disease with code {$code} ({$codingSystem}) not found. Skipping.");
                continue;
            }

            foreach ($aliases as $alias) {
                // Safeguard: Ensure only one preferred alias per disease in this source
                if ($alias['preferred']) {
                    DiseaseTerm::where('disease_id', $disease->id)
                        ->where('source_system', $sourceSystem)
                        ->update(['is_preferred' => false]);
                }

                DiseaseTerm::updateOrCreate(
                    [
                        'disease_id' => $disease->id,
                        'term' => $alias['term'],
                        'source_system' => $sourceSystem,
                    ],
                    [
                        'normalized_term' => DiseaseTerm::normalize($alias['term']),
                        'term_type' => $alias['type'],
                        'is_preferred' => $alias['preferred'],
                        'review_status' => 'APPROVED',
                    ]
                );
            }
        }

        $this->command->info('Canonical aliases seeded successfully.');
    }
}
