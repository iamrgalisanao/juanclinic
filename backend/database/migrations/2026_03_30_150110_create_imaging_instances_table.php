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
        Schema::create('imaging_instances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('imaging_study_id');
            
            $table->string('sop_instance_uid')->unique();
            $table->integer('instance_number')->nullable();
            
            $table->string('file_path'); // Path to the .dcm file (S3 or local)
            $table->string('file_type')->default('DICOM');
            $table->unsignedBigInteger('file_size')->nullable();
            
            $table->json('metadata')->nullable(); // Frame-level DICOM tags
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('imaging_study_id')->references('id')->on('imaging_studies')->onDelete('cascade');
            
            $table->index(['tenant_id', 'imaging_study_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imaging_instances');
    }
};
