<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'sarah@clinic.com'],
            [
                'name' => 'Dr. Sarah Connor',
                'password' => bcrypt('password'),
                'role' => 'DOCTOR',
                'tenant_id' => 1,
                'branch_id' => 1, // Alpha - Main Office
            ]
        );

        User::updateOrCreate(
            ['email' => 'house@clinic.com'],
            [
                'name' => 'Dr. Gregory House',
                'password' => bcrypt('password'),
                'role' => 'DOCTOR',
                'tenant_id' => 2,
                'branch_id' => 3, // Beta - Central Clinic (Assuming sequential IDs or using logic)
            ]
        );

        User::updateOrCreate(
            ['email' => 'tech@clinic.com'],
            [
                'name' => 'Tim Tech',
                'password' => bcrypt('password'),
                'role' => 'TECH',
                'tenant_id' => 1,
                'branch_id' => 2, // Alpha - Downtown Center
            ]
        );

        User::updateOrCreate(
            ['email' => 'approver@clinic.com'],
            [
                'name' => 'Amy Approver',
                'password' => bcrypt('password'),
                'role' => 'DIAGNOSTIC_APPROVER',
                'tenant_id' => 1,
                'branch_id' => 2, // Supporting Downtown branch
            ]
        );

        User::updateOrCreate(
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
