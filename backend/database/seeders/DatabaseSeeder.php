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
            TenantSeeder::class,
            PatientSeeder::class,
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Dr. Sarah Connor',
            'email' => 'sarah@clinic.com',
            'password' => bcrypt('password')
        ]);

        \App\Models\User::factory()->create([
            'name' => 'Dr. Gregory House',
            'email' => 'house@clinic.com',
            'password' => bcrypt('password')
        ]);
    }

}
