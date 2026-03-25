<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class RefineDataIsolationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add Dr. John Watson to Alpha - Downtown Center (Branch 2)
        User::updateOrCreate(
            ['email' => 'watson@clinic.com'],
            [
                'name' => 'Dr. John Watson',
                'password' => bcrypt('password'),
                'role' => 'DOCTOR',
                'tenant_id' => 1,
                'branch_id' => 2,
            ]
        );

        // Ensure Dr. Sarah Connor is in Alpha - Main Office (Branch 1)
        User::where('email', 'sarah@clinic.com')->update(['branch_id' => 1]);

        // Ensure Tim Tech is in Alpha - Downtown Center (Branch 2)
        User::where('email', 'tech@clinic.com')->update(['branch_id' => 2]);
    }
}
