<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $alpha = \App\Models\Tenant::where('slug', 'alpha-clinic')->first();
        if ($alpha) {
            $main = \App\Models\Branch::updateOrCreate(
                ['tenant_id' => $alpha->id, 'name' => 'Alpha - Main Office'],
                ['address' => '123 Alpha St, Health City', 'phone' => '555-0101', 'is_active' => true]
            );
            $downtown = \App\Models\Branch::updateOrCreate(
                ['tenant_id' => $alpha->id, 'name' => 'Alpha - Downtown Center'],
                ['address' => '456 Beta Ave, Wellness District', 'phone' => '555-0102', 'is_active' => true]
            );

            // Assign a doctor to the main branch
            $sarah = \App\Models\User::where('name', 'Dr. Sarah Connor')->first();
            if ($sarah) {
                $sarah->update(['branch_id' => $main->id]);
            }

            // Assign a tech to the downtown branch
            $tim = \App\Models\User::where('name', 'Tim Tech')->first();
            if ($tim) {
                $tim->update(['branch_id' => $downtown->id]);
            }

            // Assign some patients to branches
            \App\Models\Patient::where('tenant_id', $alpha->id)->limit(5)->update(['branch_id' => $main->id]);
        }

        $beta = \App\Models\Tenant::where('slug', 'beta-clinic')->first();
        if ($beta) {
            $central = \App\Models\Branch::updateOrCreate(
                ['tenant_id' => $beta->id, 'name' => 'Beta - Central Clinic'],
                ['address' => '789 Gamma Rd, Care Valley', 'phone' => '555-0201', 'is_active' => true]
            );

            // Assign a doctor to the central branch
            $house = \App\Models\User::where('name', 'Dr. Gregory House')->first();
            if ($house) {
                $house->update(['branch_id' => $central->id]);
            }

            // Assign some patients to the central branch
            \App\Models\Patient::where('tenant_id', $beta->id)->update(['branch_id' => $central->id]);
        }
    }
}
