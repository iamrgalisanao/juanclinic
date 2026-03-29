<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PediatricStandardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents(database_path('data/who_lms_standards.json'));
        $data = json_decode($json, true);

        if (isset($data['WHO'])) {
            foreach ($data['WHO'] as $metric => $genders) {
                foreach ($genders as $gender => $records) {
                    foreach ($records as $record) {
                        \App\Models\PediatricGrowthStandard::updateOrCreate(
                            [
                                'source' => 'WHO',
                                'gender' => $gender,
                                'metric' => $metric,
                                'age_months' => $record['age'],
                            ],
                            [
                                'l' => $record['l'],
                                'm' => $record['m'],
                                's' => $record['s'],
                            ]
                        );
                    }
                }
            }
        }
    }
}
