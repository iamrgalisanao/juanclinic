<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Tenant::create([
            'id' => 1,
            'name' => 'Alpha Clinic',
            'slug' => 'alpha-clinic',
            'admin_settings' => ['hl7.validation.level' => 'standard']
        ]);

        \App\Models\Tenant::create([
            'id' => 2,
            'name' => 'Beta Clinic',
            'slug' => 'beta-clinic',
            'admin_settings' => ['hl7.validation.level' => 'minimal']
        ]);
    }
}
