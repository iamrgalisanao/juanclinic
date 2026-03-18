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
        Schema::create('clinical_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('patient_id')->index();
            $table->unsignedBigInteger('author_id')->index();
            $table->string('note_type'); // SOAP, PROGRESS, DISCHARGE
            $table->longText('content');
            $table->string('status')->default('DRAFT'); // DRAFT, SIGNED
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients');
            $table->foreign('author_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_notes');
    }
};
