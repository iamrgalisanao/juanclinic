<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SystemTenantSeeder extends Seeder
{
    /**
     * Seed the application's system root tenant and global admin.
     * Use this for testing Enterprise Entitlements and RIS/PACS bypass.
     */
    public function run(): void
    {
        // 1. Ensure System Root Tenant (ID: 888) exists
        $systemTenant = Tenant::firstOrCreate(
            ['id' => 888],
            [
                'name' => 'JuanClinic System Root',
                'slug' => 'system-root',
                'plan_tier' => 'GOLD',
                'pediatrics_enabled' => true,
                'inventory_enabled' => true,
                'pharmacy_enabled' => true,
                'pacs_enabled' => true,
                'laboratory_enabled' => true,
                'radiology_enabled' => true,
                'workforce_enabled' => true,
                'sms_enabled' => true,
                'email_enabled' => true,
                'billing_enabled' => true,
                'portal_enabled' => true,
                'empi_enabled' => true,
                'telehealth_enabled' => true,
                'analytics_enabled' => true,
                'offline_sync_enabled' => true,
                'referrals_enabled' => true,
                'queue_enabled' => true,
                'claims_enabled' => true,
                'admin_settings' => [
                    'features' => [
                        'empi_sync_enabled' => true,
                    ]
                ]
            ]
        );

        // 2. Create Global Administrator User
        $admin = User::firstOrCreate(
            ['email' => 'root@juanclinic.com'],
            [
                'name' => 'System Root Admin',
                'password' => Hash::make('password123'),
                'tenant_id' => 888,
                'role' => 'GLOBAL_ADMIN', // Authorized for Platform Command Center
            ]
        );

        // 3. Update Existing Tenant for Enterprise Testing
        $enterpriseClinic = Tenant::where('id', '!=', 888)->first();
        if ($enterpriseClinic) {
            $settings = $enterpriseClinic->admin_settings ?? [];
            $settings['features']['pacs_enabled'] = false; // Set to false to test the "Upgrade" gate
            $enterpriseClinic->admin_settings = $settings;
            $enterpriseClinic->save();
        }
    }
}
