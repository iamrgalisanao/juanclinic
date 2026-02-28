<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $col) {
            $col->id();
            $col->uuid('tenant_id')->index();
            $col->foreignId('patient_id')->constrained()->onDelete('cascade');
            $col->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null');

            $col->date('appointment_date')->index();
            $col->time('start_time');
            $col->time('end_time');

            $col->string('status')->default('SCHEDULED'); // SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED
            $col->string('visit_type')->default('CONSULTATION'); // CONSULTATION, FOLLOW_UP, LAB, RADIOLOGY

            $col->text('reason')->nullable();
            $col->text('notes')->nullable();

            $col->timestamps();

            // Optimization for tenant + date queries
            $col->index(['tenant_id', 'appointment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
