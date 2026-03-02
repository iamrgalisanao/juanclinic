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

        \App\Models\User::updateOrCreate(
            ['email' => 'sarah@clinic.com'],
            [
                'name' => 'Dr. Sarah Connor',
                'password' => bcrypt('password'),
                'role' => 'DOCTOR',
                'tenant_id' => 1,
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'house@clinic.com'],
            [
                'name' => 'Dr. Gregory House',
                'password' => bcrypt('password'),
                'role' => 'DOCTOR',
                'tenant_id' => 2,
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'tech@clinic.com'],
            [
                'name' => 'Tim Tech',
                'password' => bcrypt('password'),
                'role' => 'TECH',
                'tenant_id' => 1,
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'approver@clinic.com'],
            [
                'name' => 'Amy Approver',
                'password' => bcrypt('password'),
                'role' => 'DIAGNOSTIC_APPROVER',
                'tenant_id' => 1,
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'admin@juanclinic.com'],
            [
                'name' => 'System Admin',
                'password' => bcrypt('password'),
                'role' => 'ADMIN',
                'tenant_id' => null,
            ]
        );
    }

}
