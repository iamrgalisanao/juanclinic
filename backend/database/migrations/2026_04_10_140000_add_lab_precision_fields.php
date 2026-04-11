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
        Schema::table('diagnostic_results', function (Blueprint $table) {
            $table->string('reference_range_min')->nullable()->after('value');
            $table->string('reference_range_max')->nullable()->after('reference_range_min');
            $table->string('clinical_flag')->nullable()->after('reference_range_max'); // H, L, C, N
            $table->boolean('is_critical')->default(false)->after('clinical_flag');
            $table->string('unit')->nullable()->after('is_critical');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_results', function (Blueprint $table) {
            $table->dropColumn(['reference_range_min', 'reference_range_max', 'clinical_flag', 'is_critical', 'unit']);
        });
    }
};
