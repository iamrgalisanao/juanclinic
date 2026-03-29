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
        Schema::create('pediatric_growth_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('patient_id');
            
            $table->decimal('weight_kg', 8, 3)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->decimal('head_circumference_cm', 8, 2)->nullable();
            
            $table->date('measured_at');
            $table->json('metadata')->nullable(); // For calculated BMI, encounter_id, etc.
            
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('branch_id')->references('id')->on('physical_branches')->onDelete('set null');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pediatric_growth_records');
    }
};
