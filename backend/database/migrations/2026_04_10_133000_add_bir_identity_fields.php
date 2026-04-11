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
            if (!Schema::hasColumn('tenants', 'tin')) {
                $table->string('tin', 20)->nullable()->after('name');
            }
            if (!Schema::hasColumn('tenants', 'registered_business_name')) {
                $table->string('registered_business_name')->nullable()->after('tin');
            }
            if (!Schema::hasColumn('tenants', 'official_address')) {
                $table->text('official_address')->nullable()->after('registered_business_name');
            }
        });

        Schema::table('physical_branches', function (Blueprint $table) {
            if (!Schema::hasColumn('physical_branches', 'tin')) {
                $table->string('tin', 20)->nullable()->after('name');
            }
            if (!Schema::hasColumn('physical_branches', 'official_address')) {
                $table->text('official_address')->nullable()->after('tin');
            }
        });

        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'tin')) {
                $table->string('tin', 20)->nullable()->after('contact');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['tin', 'registered_business_name', 'official_address']);
        });

        Schema::table('physical_branches', function (Blueprint $table) {
            $table->dropColumn(['tin', 'official_address']);
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['tin']);
        });
    }
};
