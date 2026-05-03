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
        Schema::create('diseases', function (Blueprint $table) {
            $table->id();
            $table->string('source_id')->nullable()->index(); // External Ref (e.g. WHO URI)
            $table->string('code')->index(); // ICD-10/11 Code
            $table->enum('coding_system', ['ICD10', 'ICD11', 'SNOMED', 'LOCAL'])->default('LOCAL')->index();
            $table->string('name')->index();
            $table->enum('disease_type', ['ACUTE', 'CHRONIC', 'SYMPTOM', 'CONDITION'])->default('CONDITION');
            $table->boolean('is_system')->default(false); // True if from master catalog
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('diseases')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diseases');
    }
};
