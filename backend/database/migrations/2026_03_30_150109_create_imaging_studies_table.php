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
        Schema::create('imaging_studies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('order_id')->nullable(); // Link to the HIS Order
            
            $table->string('study_instance_uid')->unique();
            $table->string('accession_number')->nullable();
            $table->string('modality')->index(); // CR, CT, MR, US, etc.
            $table->string('study_description')->nullable();
            $table->timestamp('study_date')->nullable();
            
            $table->json('metadata')->nullable(); // Store extra DICOM tags
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            
            $table->index(['tenant_id', 'patient_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imaging_studies');
    }
};
