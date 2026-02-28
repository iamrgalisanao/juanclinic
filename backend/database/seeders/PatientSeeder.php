<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Patient::create([
            'tenant_id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1980-01-01',
            'gender' => 'M',
            'contact' => '555-0199',
            'patient_external_id' => 'PAT-001'
        ]);

        \App\Models\Patient::create([
            'tenant_id' => 2,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'dob' => '1992-05-15',
            'gender' => 'F',
            'contact' => '555-0200',
            'patient_external_id' => 'PAT-002'
        ]);

        // Seed Orders for Alpha Clinic (Tenant 1)
        \App\Models\Order::create([
            'tenant_id' => 1,
            'patient_id' => 1,
            'order_type' => 'LAB',
            'priority' => 'STAT',
            'status' => 'PENDING',
            'request_details' => ['test' => 'CBC', 'tube' => 'EDTA']
        ]);

        // Seed Orders for Beta Clinic (Tenant 2)
        \App\Models\Order::create([
            'tenant_id' => 2,
            'patient_id' => 2,
            'order_type' => 'RAD',
            'priority' => 'ROUTINE',
            'status' => 'IN_PROGRESS',
            'request_details' => ['exam' => 'Chest X-Ray']
        ]);
    }
}
