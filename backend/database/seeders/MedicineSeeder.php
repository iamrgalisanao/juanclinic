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
            ['generic_name' => 'Amoxicillin', 'brand_name' => null, 'form' => 'Capsule', 'strength' => '500mg', 'price' => 12.50],
            ['generic_name' => 'Paracetamol', 'brand_name' => 'Biogesic', 'form' => 'Tablet', 'strength' => '500mg', 'price' => 5.00],
            ['generic_name' => 'Metformin Hydrochloride', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '500mg', 'price' => 8.75],
            ['generic_name' => 'Losartan Potassium', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '50mg', 'price' => 15.00],
            ['generic_name' => 'Salbutamol', 'brand_name' => 'Ventolin', 'form' => 'Inhaler', 'strength' => '100mcg/dose', 'price' => 350.00],
            ['generic_name' => 'Ceftriaxone', 'brand_name' => null, 'form' => 'Vial (Injection)', 'strength' => '1g', 'price' => 450.00],
            ['generic_name' => 'Amlodipine Besilate', 'brand_name' => 'Norvasc', 'form' => 'Tablet', 'strength' => '5mg', 'price' => 25.00],
            ['generic_name' => 'Mefenamic Acid', 'brand_name' => 'Ponstan', 'form' => 'Capsule', 'strength' => '500mg', 'price' => 18.00],
            ['generic_name' => 'Ascorbic Acid (Vitamin C)', 'brand_name' => 'Ceelin', 'form' => 'Syrup', 'strength' => '100mg/5mL', 'price' => 120.00],
            ['generic_name' => 'Omeprazole', 'brand_name' => null, 'form' => 'Capsule', 'strength' => '20mg', 'price' => 22.50],
            ['generic_name' => 'Azithromycin', 'brand_name' => 'Zithromax', 'form' => 'Tablet', 'strength' => '500mg', 'price' => 85.00],
            ['generic_name' => 'Ciprofloxacin', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '500mg', 'price' => 45.00],
            ['generic_name' => 'Simvastatin', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '20mg', 'price' => 12.00],
            ['generic_name' => 'Clopidogrel', 'brand_name' => 'Plavix', 'form' => 'Tablet', 'strength' => '75mg', 'price' => 65.00],
            ['generic_name' => 'Prednisone', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '5mg', 'price' => 7.00],
            ['generic_name' => 'Gliclazide', 'brand_name' => 'Diamicron', 'form' => 'Tablet', 'strength' => '60mg', 'price' => 14.50],
            ['generic_name' => 'Atorvastatin', 'brand_name' => 'Lipitor', 'form' => 'Tablet', 'strength' => '20mg', 'price' => 48.00],
            ['generic_name' => 'Levofloxacin', 'brand_name' => null, 'form' => 'Tablet', 'strength' => '500mg', 'price' => 55.00],
            ['generic_name' => 'Ranitidine', 'brand_name' => 'Zantac', 'form' => 'Tablet', 'strength' => '150mg', 'price' => 10.00],
            ['generic_name' => 'Domperidone', 'brand_name' => 'Motilium', 'form' => 'Tablet', 'strength' => '10mg', 'price' => 9.50],
            
            // Vaccines
            ['generic_name' => 'BCG Vaccine', 'brand_name' => 'BCG', 'form' => 'Vial (Injection)', 'strength' => '0.5mg/mL', 'price' => 150.00],
            ['generic_name' => 'Hepatitis B Vaccine (Pediatric)', 'brand_name' => 'Hepatitis B', 'form' => 'Vial (Injection)', 'strength' => '10mcg/0.5mL', 'price' => 250.00],
            ['generic_name' => 'Pentavalent Vaccine (DTP-Hib-HepB)', 'brand_name' => 'Pentavalent', 'form' => 'Vial (Injection)', 'strength' => '0.5mL', 'price' => 450.00],
            ['generic_name' => 'Oral Polio Vaccine', 'brand_name' => 'OPV', 'form' => 'Drops', 'strength' => '2-dose', 'price' => 120.00],
            ['generic_name' => 'Inactivated Polio Vaccine', 'brand_name' => 'IPV', 'form' => 'Vial (Injection)', 'strength' => '0.5mL', 'price' => 550.00],
            ['generic_name' => 'Pneumococcal Conjugate Vaccine', 'brand_name' => 'PCV', 'form' => 'Prefilled Syringe', 'strength' => '0.5mL', 'price' => 1800.00],
            ['generic_name' => 'Measles-Rubella Vaccine', 'brand_name' => 'MR', 'form' => 'Vial (Injection)', 'strength' => '0.5mL', 'price' => 200.00],
            ['generic_name' => 'Measles, Mumps, Rubella Vaccine', 'brand_name' => 'MMR', 'form' => 'Vial (Injection)', 'strength' => '0.5mL', 'price' => 350.00],
            ['generic_name' => 'Rotavirus Vaccine', 'brand_name' => 'Rotavirus', 'form' => 'Oral Suspension', 'strength' => '1.5mL', 'price' => 1200.00],
        ];

        foreach ($medicines as $medicine) {
            \App\Models\Medicine::updateOrCreate(
                [
                    'generic_name' => $medicine['generic_name'],
                    'form' => $medicine['form'],
                    'strength' => $medicine['strength'],
                    'is_system' => true,
                ],
                array_merge($medicine, [
                    'tenant_id' => null,
                ])
            );
        }
    }
}
