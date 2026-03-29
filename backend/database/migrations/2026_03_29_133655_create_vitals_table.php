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
        Schema::create('vitals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('branch_id')->nullable()->index();
            $table->unsignedBigInteger('patient_id')->index();
            $table->unsignedBigInteger('author_id')->nullable()->index(); // Who recorded it
            
            // Core Physiological Vitals
            $table->decimal('weight_kg', 8, 3)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->decimal('bmi', 8, 2)->nullable();
            $table->decimal('temp_c', 5, 2)->nullable();
            $table->integer('bp_systolic')->nullable();
            $table->integer('bp_diastolic')->nullable();
            $table->integer('pulse_rate')->nullable(); // bpm
            $table->integer('resp_rate')->nullable();  // breaths/min
            $table->integer('spo2')->nullable();       // percentage
            
            // Contextual Metadata
            $table->string('bp_position')->nullable(); // Sitting, Standing, Supine
            $table->string('bp_arm')->nullable();      // Left, Right
            $table->timestamp('recorded_at')->index();
            $table->text('remarks')->nullable();
            $table->json('metadata')->nullable(); // For future flexibility (e.g. pain scale)
            
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vitals');
    }
};
