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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('plan_tier')->default('BRONZE')->after('slug'); // BRONZE, SILVER, GOLD
            $table->boolean('pediatrics_enabled')->default(false)->after('plan_tier');
            $table->boolean('inventory_enabled')->default(false)->after('pediatrics_enabled');
            $table->boolean('pharmacy_enabled')->default(false)->after('inventory_enabled');
            $table->boolean('pacs_enabled')->default(false)->after('pharmacy_enabled');
            $table->boolean('workforce_enabled')->default(false)->after('pacs_enabled');
            $table->json('subscription_data')->nullable()->after('workforce_enabled');
            $table->timestamp('trial_ends_at')->nullable()->after('subscription_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'plan_tier',
                'pediatrics_enabled',
                'inventory_enabled',
                'pharmacy_enabled',
                'pacs_enabled',
                'workforce_enabled',
                'subscription_data',
                'trial_ends_at'
            ]);
        });
    }
};
