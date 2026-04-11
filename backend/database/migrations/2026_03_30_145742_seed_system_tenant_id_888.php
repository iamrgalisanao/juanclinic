<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Clean up any existing 'system' slug that isn't ID 888
        \Illuminate\Support\Facades\DB::table('tenants')
            ->where('slug', 'system')
            ->where('id', '!=', 888)
            ->delete();

        // 2. Create the reserved System Root Tenant (ID: 888)
        \Illuminate\Support\Facades\DB::table('tenants')->updateOrInsert(
            ['id' => 888],
            [
                'name' => 'JuanClinic System Root',
                'slug' => 'system',
                'admin_settings' => json_encode(['features' => ['pacs_enabled' => true], 'global_pacs_access' => true]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // 3. Transition all users with null tenant_id to System Tenant (888)
        \App\Models\User::whereNull('tenant_id')->update(['tenant_id' => 888]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\User::where('tenant_id', 888)->update(['tenant_id' => null]);
        \Illuminate\Support\Facades\DB::table('tenants')->where('id', 888)->delete();
    }
};
