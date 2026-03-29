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
        Schema::table('patients', function (Blueprint $table) {
            $table->integer('gestational_weeks')->nullable()->after('gender');
            $table->integer('birth_weight_g')->nullable()->after('gestational_weeks');
            $table->string('apgar_score')->nullable()->after('birth_weight_g');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['gestational_weeks', 'birth_weight_g', 'apgar_score']);
        });
    }
};
