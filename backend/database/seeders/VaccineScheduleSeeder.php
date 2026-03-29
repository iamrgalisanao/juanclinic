<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VaccineScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedule = [
            ['vaccine_name' => 'BCG', 'dose_number' => 1, 'recommended_age_weeks' => 0, 'description' => 'Tuberculosis protection'],
            ['vaccine_name' => 'Hepatitis B', 'dose_number' => 1, 'recommended_age_weeks' => 0, 'description' => 'Within 12 hours of birth'],
            
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Rotavirus Vaccine', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Rotavirus Vaccine', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Inactivated Polio Vaccine (IPV)', 'dose_number' => 1, 'recommended_age_weeks' => 14],
            
            ['vaccine_name' => 'Measles-Rubella (MR)', 'dose_number' => 1, 'recommended_age_months' => 9],
            ['vaccine_name' => 'Inactivated Polio Vaccine (IPV)', 'dose_number' => 2, 'recommended_age_months' => 9],
            
            ['vaccine_name' => 'Measles, Mumps, Rubella (MMR)', 'dose_number' => 1, 'recommended_age_months' => 12],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'dose_number' => 4, 'recommended_age_months' => 12, 'description' => 'Booster dose'],
        ];

        foreach ($schedule as $item) {
            \App\Models\VaccineSchedule::updateOrCreate(
                [
                    'vaccine_name' => $item['vaccine_name'],
                    'dose_number' => $item['dose_number'],
                ],
                $item
            );
        }
    }
}
