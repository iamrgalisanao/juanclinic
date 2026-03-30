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
        Schema::table('immunization_records', function (Blueprint $table) {
            $table->string('manufacturer')->nullable()->after('vaccine_name');
            $table->string('site')->nullable()->after('lot_number');
            $table->string('route')->nullable()->after('site');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immunization_records', function (Blueprint $table) {
            $table->dropColumn(['manufacturer', 'site', 'route']);
        });
    }
};
