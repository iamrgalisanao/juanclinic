<?php

namespace Database\Seeders;

use App\Models\Disease;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DiseaseCatalogSeeder extends Seeder
{
    /**
     * Seed a starter set of high-frequency coded diagnoses and symptoms.
     * Deterministic ordering is applied for readability and repeatable maintenance.
     */
    public function run(): void
    {
        $diseases = [
            [
                'code' => 'J06.9',
                'name' => 'Acute upper respiratory infection, unspecified',
                'disease_type' => 'ACUTE',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'J45.909',
                'name' => 'Unspecified asthma, uncomplicated',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'J02.9',
                'name' => 'Acute pharyngitis, unspecified',
                'disease_type' => 'ACUTE',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'J18.9',
                'name' => 'Pneumonia, unspecified organism',
                'disease_type' => 'ACUTE',
                'clinical_category' => 'DIAGNOSIS',
            ],

            [
                'code' => 'E11.9',
                'name' => 'Type 2 diabetes mellitus without complications',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'E66.9',
                'name' => 'Obesity, unspecified',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'E03.9',
                'name' => 'Hypothyroidism, unspecified',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],

            [
                'code' => 'I10',
                'name' => 'Essential (primary) hypertension',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'I25.10',
                'name' => 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],

            [
                'code' => 'K21.9',
                'name' => 'Gastro-esophageal reflux disease without esophagitis',
                'disease_type' => 'CHRONIC',
                'clinical_category' => 'DIAGNOSIS',
            ],
            [
                'code' => 'K29.70',
                'name' => 'Gastritis, unspecified, without bleeding',
                'disease_type' => 'ACUTE',
                'clinical_category' => 'DIAGNOSIS',
            ],

            [
                'code' => 'R50.9',
                'name' => 'Fever, unspecified',
                'disease_type' => 'SYMPTOM',
                'clinical_category' => 'SYMPTOM',
            ],
            [
                'code' => 'R51',
                'name' => 'Headache',
                'disease_type' => 'SYMPTOM',
                'clinical_category' => 'SYMPTOM',
            ],
            [
                'code' => 'R05',
                'name' => 'Cough',
                'disease_type' => 'SYMPTOM',
                'clinical_category' => 'SYMPTOM',
            ],
            [
                'code' => 'M54.5',
                'name' => 'Low back pain',
                'disease_type' => 'SYMPTOM',
                'clinical_category' => 'SYMPTOM',
            ],
        ];

        collect($diseases)
            ->sortBy('code')
            ->each(function (array $d) {
                Disease::updateOrCreate(
                    [
                        'code' => $d['code'],
                        'coding_system' => 'ICD10CM',
                    ],
                    [
                        'name' => $d['name'],
                        'slug' => Str::slug($d['name']),
                        'disease_type' => $d['disease_type'],
                        'clinical_category' => $d['clinical_category'],
                        'is_system' => true,
                        'status' => 'ACTIVE',
                        'review_status' => 'APPROVED',
                    ]
                );
            });
    }
}
