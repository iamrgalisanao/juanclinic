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
        // Tenant 1 Branches: 1 (Main Office), 2 (Downtown Center)
        // Tenant 2 Branches: 3 (Central Clinic)

        // Patients for Alpha Clinic - Main Office (Branch 1)
        for ($i = 1; $i <= 5; $i++) {
            $patient = \App\Models\Patient::create([
                'tenant_id' => 1,
                'branch_id' => 1,
                'first_name' => "John_$i",
                'last_name' => "MainOffice",
                'dob' => '1980-01-01',
                'gender' => 'M',
                'contact' => "555-010$i",
                'patient_external_id' => "PAT-M-$i"
            ]);

            $order = \App\Models\Order::create([
                'tenant_id' => 1,
                'branch_id' => 1,
                'patient_id' => $patient->id,
                'order_type' => 'LAB',
                'priority' => 'ROUTINE',
                'status' => 'COMPLETED',
                'request_details' => ['test' => 'CBC']
            ]);

            $invoice = \App\Models\Invoice::create([
                'tenant_id' => 1,
                'branch_id' => 1,
                'patient_id' => $patient->id,
                'order_id' => $order->id,
                'invoice_number' => "INV-M-$i",
                'total_amount' => 500.00,
                'status' => 'PAID'
            ]);

            \App\Models\Payment::create([
                'tenant_id' => 1,
                'branch_id' => 1,
                'invoice_id' => $invoice->id,
                'amount' => 500.00,
                'payment_method' => 'CASH'
            ]);
        }

        // Patients for Alpha Clinic - Downtown Center (Branch 2)
        for ($i = 1; $i <= 3; $i++) {
            $patient = \App\Models\Patient::create([
                'tenant_id' => 1,
                'branch_id' => 2,
                'first_name' => "Jane_$i",
                'last_name' => "Downtown",
                'dob' => '1990-01-01',
                'gender' => 'F',
                'contact' => "555-020$i",
                'patient_external_id' => "PAT-D-$i"
            ]);

            $order = \App\Models\Order::create([
                'tenant_id' => 1,
                'branch_id' => 2,
                'patient_id' => $patient->id,
                'order_type' => 'RAD',
                'priority' => 'STAT',
                'status' => 'COMPLETED',
                'request_details' => ['exam' => 'X-Ray']
            ]);

            $invoice = \App\Models\Invoice::create([
                'tenant_id' => 1,
                'branch_id' => 2,
                'patient_id' => $patient->id,
                'order_id' => $order->id,
                'invoice_number' => "INV-D-$i",
                'total_amount' => 1200.00,
                'status' => 'PAID'
            ]);

            \App\Models\Payment::create([
                'tenant_id' => 1,
                'branch_id' => 2,
                'invoice_id' => $invoice->id,
                'amount' => 1200.00,
                'payment_method' => 'CARD'
            ]);
        }

        // Patient for Beta Clinic (Tenant 2, Branch 3)
        $betaPatient = \App\Models\Patient::create([
            'tenant_id' => 2,
            'branch_id' => 3,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'dob' => '1992-05-15',
            'gender' => 'F',
            'contact' => '555-0200',
            'patient_external_id' => 'PAT-B-001'
        ]);

        \App\Models\Order::create([
            'tenant_id' => 2,
            'branch_id' => 3,
            'patient_id' => $betaPatient->id,
            'order_type' => 'RAD',
            'priority' => 'ROUTINE',
            'status' => 'IN_PROGRESS',
            'request_details' => ['exam' => 'Chest X-Ray']
        ]);
    }
}
