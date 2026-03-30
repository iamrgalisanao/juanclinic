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
        Schema::table('vitals', function (Blueprint $table) {
            // Universal clinical fields
            $table->integer('pain_score')->nullable()->after('spo2');
            $table->decimal('blood_glucose_mgdl', 8, 2)->nullable()->after('pain_score');
            
            // Pediatric specialty fields
            $table->decimal('head_circumference_cm', 8, 2)->nullable()->after('blood_glucose_mgdl');
            
            // Contextual and scaling fields
            $table->string('oxygen_source')->nullable()->after('head_circumference_cm'); // Room Air, Oxygen, etc.
            $table->unsignedBigInteger('encounter_id')->nullable()->index()->after('patient_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            $table->dropColumn(['pain_score', 'blood_glucose_mgdl', 'head_circumference_cm', 'oxygen_source', 'encounter_id']);
        });
    }
};
