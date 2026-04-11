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
        Schema::create('empi_submissions', function (Blueprint $table) {
            $table->uuid('submission_uuid')->primary();
            $table->unsignedBigInteger('hardware_terminal_id');
            $table->longText('raw_payload'); // Encrypted JSON
            $table->unsignedBigInteger('matched_patient_id')->nullable();
            $table->decimal('matching_confidence', 5, 4)->default(0);
            $table->string('status')->default('PENDING'); // PENDING, SUCCESS, PARTIAL_MATCH, FAILED
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->foreign('hardware_terminal_id')->references('id')->on('hardware_terminals')->onDelete('cascade');
            $table->foreign('matched_patient_id')->references('id')->on('patients')->onDelete('set null');

            $table->index(['status', 'processed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empi_submissions');
    }
};
