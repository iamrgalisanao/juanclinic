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
            // Birth
            ['vaccine_name' => 'BCG', 'cvx_code' => '19', 'dose_number' => 1, 'recommended_age_weeks' => 0, 'description' => 'Tuberculosis protection'],
            ['vaccine_name' => 'Hepatitis B', 'cvx_code' => '08', 'dose_number' => 1, 'recommended_age_weeks' => 0, 'description' => 'Within 12 hours of birth'],
            
            // 6 Weeks
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'cvx_code' => '102', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'cvx_code' => '02', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'cvx_code' => '152', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            ['vaccine_name' => 'Rotavirus Vaccine', 'cvx_code' => '119', 'dose_number' => 1, 'recommended_age_weeks' => 6],
            
            // 10 Weeks
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'cvx_code' => '102', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'cvx_code' => '02', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'cvx_code' => '152', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            ['vaccine_name' => 'Rotavirus Vaccine', 'cvx_code' => '119', 'dose_number' => 2, 'recommended_age_weeks' => 10],
            
            // 14 Weeks
            ['vaccine_name' => 'Pentavalent (DTP-Hib-HepB)', 'cvx_code' => '102', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Oral Polio Vaccine (OPV)', 'cvx_code' => '02', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'cvx_code' => '152', 'dose_number' => 3, 'recommended_age_weeks' => 14],
            ['vaccine_name' => 'Inactivated Polio Vaccine (IPV)', 'cvx_code' => '10', 'dose_number' => 1, 'recommended_age_weeks' => 14],
            
            // 9 Months
            ['vaccine_name' => 'Measles-Rubella (MR)', 'cvx_code' => '04', 'dose_number' => 1, 'recommended_age_months' => 9],
            ['vaccine_name' => 'Inactivated Polio Vaccine (IPV)', 'cvx_code' => '10', 'dose_number' => 2, 'recommended_age_months' => 9],
            
            // 12 Months
            ['vaccine_name' => 'Measles, Mumps, Rubella (MMR)', 'cvx_code' => '03', 'dose_number' => 1, 'recommended_age_months' => 12],
            ['vaccine_name' => 'Pneumococcal Conjugate Vaccine (PCV)', 'cvx_code' => '152', 'dose_number' => 4, 'recommended_age_months' => 12, 'description' => 'Booster dose'],
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
