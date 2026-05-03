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
        Schema::table('referrals', function (Blueprint $table) {
            $table->unsignedBigInteger('external_provider_id')->nullable()->after('target_tenant_id');
            $table->string('type')->default('INTERNAL')->after('external_provider_id'); // INTERNAL or EXTERNAL
            
            $table->foreign('external_provider_id')->references('id')->on('external_providers');
        });
    }

    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropForeign(['external_provider_id']);
            $table->dropColumn(['external_provider_id', 'type']);
        });
    }
};
