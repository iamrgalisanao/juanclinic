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
        Schema::table('medicines', function (Blueprint $table) {
            // Add source traceability
            if (!Schema::hasColumn('medicines', 'source_system')) {
                $table->string('source_system')->nullable()->after('source_id');
            }

            // Add explicit classification
            if (!Schema::hasColumn('medicines', 'classification')) {
                $table->string('classification')->default('HUMAN_MEDICINE')->after('class');
            }

            // Ensure rich text fields exist if check failed earlier (Double-check)
            $richFields = [
                'company_name' => 'string',
                'description' => 'text',
                'indications_text' => 'text',
                'dose_text' => 'text',
                'contraindications_text' => 'text',
                'precautions_text' => 'text',
                'drug_interactions_text' => 'text',
                'packaging_text' => 'text',
            ];

            foreach ($richFields as $field => $type) {
                if (!Schema::hasColumn('medicines', $field)) {
                    $table->$type($field)->nullable()->after('brand_status');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn([
                'source_system', 
                'classification',
                'company_name',
                'description',
                'indications_text',
                'dose_text',
                'contraindications_text',
                'precautions_text',
                'drug_interactions_text',
                'packaging_text'
            ]);
        });
    }
};
