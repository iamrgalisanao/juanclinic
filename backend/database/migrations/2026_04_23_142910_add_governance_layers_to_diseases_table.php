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
        Schema::table('diseases', function (Blueprint $table) {
            $table->enum('clinical_category', [
                'DIAGNOSIS', 'SYMPTOM', 'SIGN', 'FINDING', 'SYNDROME', 'DISCOVERY_ONLY', 'WELLNESS_TERM'
            ])->default('DIAGNOSIS')->after('disease_type')->index();

            $table->enum('review_status', [
                'IMPORTED', 'MAPPED', 'CLINICALLY_REVIEWED', 'APPROVED', 'REJECTED'
            ])->default('APPROVED')->after('status')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diseases', function (Blueprint $table) {
            $table->dropColumn(['clinical_category', 'review_status']);
        });
    }
};
