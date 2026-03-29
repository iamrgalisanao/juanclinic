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
        Schema::create('pediatric_growth_standards', function (Blueprint $table) {
            $table->id();
            $table->string('source'); // WHO or CDC
            $table->string('gender'); // M or F
            $table->string('metric'); // weight_for_age, height_for_age, etc.
            
            $table->integer('age_months');
            
            $table->decimal('l', 10, 6); // Lambda (skewness)
            $table->decimal('m', 10, 6); // Mu (median)
            $table->decimal('s', 10, 6); // Sigma (variation)
            
            $table->timestamps();
            
            // Index for fast lookup during calculation
            $table->index(['source', 'gender', 'metric', 'age_months'], 'standard_lookup_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pediatric_growth_standards');
    }
};
