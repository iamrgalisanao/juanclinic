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
        Schema::create('medicine_disease_map', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('disease_id')->index();
            $table->unsignedBigInteger('medicine_id')->index();
            
            // Metadata for clinical provenance
            $table->string('source')->nullable()->index(); // e.g., PNDF, MIMS, Clinic Protocols
            $table->boolean('is_system')->default(true);
            $table->jsonb('metadata')->nullable(); // For indications/restrictions specific to this map
            
            $table->timestamps();

            // Constraints
            $table->foreign('disease_id')->references('id')->on('diseases')->onDelete('cascade');
            $table->foreign('medicine_id')->references('id')->on('medicines')->onDelete('cascade');
            
            // Prevent duplicate mappings
            $table->unique(['disease_id', 'medicine_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_disease_map');
    }
};
