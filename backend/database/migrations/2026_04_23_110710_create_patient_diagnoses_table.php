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
        Schema::create('patient_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('patient_id')->index();
            $table->unsignedBigInteger('disease_id')->nullable()->index();
            
            // Standard Clinical Metadata
            $table->string('display_name')->nullable(); // Override catalog name
            $table->enum('clinical_status', [
                'ACTIVE', 'RECURRENCE', 'RELAPSE', 'INACTIVE', 'REMISSION', 'RESOLVED'
            ])->default('ACTIVE')->index();
            
            $table->enum('verification_status', [
                'UNCONFIRMED', 'PROVISIONAL', 'DIFFERENTIAL', 'CONFIRMED', 'REFUTED', 'ERROR'
            ])->default('PROVISIONAL')->index();

            $table->boolean('is_problem_list')->default(false)->index();
            $table->boolean('is_chronic')->default(false);
            
            // Temporal Data
            $table->date('onset_date')->nullable();
            $table->timestamp('diagnosed_at')->useCurrent();
            
            // Advanced Metadata (Laterality, Severity, ICD-11 Clustering)
            $table->jsonb('metadata')->nullable();

            // Traceability
            $table->unsignedBigInteger('recorded_by')->index();
            $table->unsignedBigInteger('clinical_note_id')->nullable()->index();
            
            $table->timestamps();

            // Constraints
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('disease_id')->references('id')->on('diseases')->onDelete('set null');
            $table->foreign('recorded_by')->references('id')->on('users');
            $table->foreign('clinical_note_id')->references('id')->on('clinical_notes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_diagnoses');
    }
};
