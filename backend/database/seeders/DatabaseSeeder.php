<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SystemTenantSeeder::class,
            TenantSeeder::class,
            BranchSeeder::class,
            UserSeeder::class,
            PatientSeeder::class,
            ClinicalTemplateSeeder::class,
            MedicineSeeder::class,
            VaccineScheduleSeeder::class,
        ]);
    }

}
