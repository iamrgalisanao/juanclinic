<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = [
            ['generic_name' => 'Amoxicillin', 'brand_name' => null, 'form' => 'Capsule', 'strength' => '500mg'],
            ['generic_name' => 'Paracetamol', 'brand_name' => 'Biogesic', 'form' => 'Tablet', 'strength' => '500mg'],
            ['generic_name' => 'Metformin Hydrochloride', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '500mg'],
            ['generic_name' => 'Losartan Potassium', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '50mg'],
            ['generic_name' => 'Salbutamol', 'brand_name' => 'Ventolin', 'form' => 'Inhaler', 'strength' => '100mcg/dose'],
            ['generic_name' => 'Ceftriaxone', 'brand_name' => null, 'form' => 'Vial (Injection)', 'strength' => '1g'],
            ['generic_name' => 'Amlodipine Besilate', 'brand_name' => 'Norvasc', 'form' => 'Tablet', 'strength' => '5mg'],
            ['generic_name' => 'Mefenamic Acid', 'brand_name' => 'Ponstan', 'form' => 'Capsule', 'strength' => '500mg'],
            ['generic_name' => 'Ascorbic Acid (Vitamin C)', 'brand_name' => 'Ceelin', 'form' => 'Syrup', 'strength' => '100mg/5mL'],
            ['generic_name' => 'Omeprazole', 'brand_name' => null, 'form' => 'Capsule', 'strength' => '20mg'],
        ];

        foreach ($medicines as $medicine) {
            \App\Models\Medicine::create(array_merge($medicine, [
                'tenant_id' => null,
                'is_system' => true,
            ]));
        }
    }
}
