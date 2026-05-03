<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('diseases', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name')->index();
            
            // Industrial Constraints & Indices
            // Note: Indices and unique constraints are now handled in 2026_04_23_111750_add_indices_to_diseases_table.php
        });


        if (DB::getDriverName() === 'mysql') {
            // Use raw query to update Enum for compatibility
            DB::statement("ALTER TABLE diseases MODIFY COLUMN coding_system ENUM('ICD10', 'ICD10CM', 'ICD11', 'ICD11MMS', 'SNOMED', 'LOCAL') DEFAULT 'LOCAL'");
            DB::statement("ALTER TABLE diseases MODIFY COLUMN disease_type ENUM('ACUTE', 'CHRONIC', 'SYMPTOM', 'CONDITION') DEFAULT 'CONDITION'");
            DB::statement("ALTER TABLE diseases MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diseases', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
