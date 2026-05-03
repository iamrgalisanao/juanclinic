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
            $table->boolean('billing_enabled')->default(false)->after('email_enabled');
            $table->boolean('portal_enabled')->default(false)->after('billing_enabled');
            $table->boolean('empi_enabled')->default(false)->after('portal_enabled');
            $table->boolean('telehealth_enabled')->default(false)->after('empi_enabled');
            $table->boolean('analytics_enabled')->default(false)->after('telehealth_enabled');
            $table->boolean('offline_sync_enabled')->default(false)->after('analytics_enabled');
            $table->boolean('referrals_enabled')->default(false)->after('offline_sync_enabled');
            $table->boolean('queue_enabled')->default(false)->after('referrals_enabled');
            $table->boolean('claims_enabled')->default(false)->after('queue_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'billing_enabled',
                'portal_enabled',
                'empi_enabled',
                'telehealth_enabled',
                'analytics_enabled',
                'offline_sync_enabled',
                'referrals_enabled',
                'queue_enabled',
                'claims_enabled'
            ]);
        });
    }
};
