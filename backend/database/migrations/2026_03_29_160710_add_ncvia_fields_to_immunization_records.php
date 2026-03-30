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
            $table->date('vis_edition_date')->nullable()->after('route');
            $table->date('vis_provided_date')->nullable()->after('vis_edition_date');
            $table->string('cvx_code')->nullable()->after('vis_provided_date');
            $table->string('ndc_code')->nullable()->after('cvx_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immunization_records', function (Blueprint $table) {
            $table->dropColumn(['vis_edition_date', 'vis_provided_date', 'cvx_code', 'ndc_code']);
        });
    }
};
