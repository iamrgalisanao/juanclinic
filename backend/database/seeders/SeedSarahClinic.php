<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;

class SeedSarahClinic extends Seeder
{
    public function run()
    {
        // 1. Ensure Alpha Clinic exists (ID 1)
        $alpha = Tenant::find(1);
        if (!$alpha) {
            $alpha = Tenant::create([
                'id' => 1,
                'name' => 'Alpha Clinic',
                'slug' => 'alpha',
                'tin' => '123-456-789',
                'official_address' => '123 Alpha St, Manila',
                'plan_tier' => 'ENTERPRISE'
            ]);
        }

        // 2. Add 'Sarah Clinic' Patient to Alpha Clinic
        Patient::updateOrCreate(
            ['first_name' => 'Sarah', 'last_name' => 'Clinic', 'tenant_id' => 1],
            [
                'dob' => '1995-05-15',
                'gender' => 'F',
                'contact' => '09123456789',
                'email' => 'sarah@clinic.com',
                'tin' => '987-654-321'
            ]
        );

        echo "Seeded Sarah Clinic patient in Alpha Clinic (Tenant 1).\n";
    }
}
