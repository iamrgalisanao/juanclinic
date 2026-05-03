<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\Medicine;
use App\Models\MedicineDiseaseMap;
use Illuminate\Database\Seeder;

class MedicineDiseaseMapSeeder extends Seeder
{
    /**
     * Seed initial mappings between diseases and medicines for discovery.
     */
    public function run(): void
    {
        $mappings = [
            // Fever -> Biogesic/Paracetamol
            ['disease_code' => 'R50.9', 'medicine_ids' => [2]],
            // Hypertension -> Losartan
            ['disease_code' => 'I10', 'medicine_ids' => [4]],
            // Asthma -> Ventolin
            ['disease_code' => 'J45.909', 'medicine_ids' => [5]],
            // Diabetes -> Metformin
            ['disease_code' => 'E11.9', 'medicine_ids' => [3]],
            // Pneumonia -> Amoxicillin
            ['disease_code' => 'J18.9', 'medicine_ids' => [1]],
        ];

        foreach ($mappings as $map) {
            $disease = Disease::where('code', $map['disease_code'])->first();
            
            if (!$disease) continue;

            foreach ($map['medicine_ids'] as $medicineId) {
                MedicineDiseaseMap::updateOrCreate(
                    [
                        'disease_id' => $disease->id,
                        'medicine_id' => $medicineId,
                    ],
                    [
                        'source' => 'PNDF Core Starter',
                        'is_system' => true,
                    ]
                );
            }
        }
    }
}
