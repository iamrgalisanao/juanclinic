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
        Schema::create('disease_terms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('disease_id')->nullable()->index();
            $table->string('term')->index();
            $table->string('normalized_term')->index();
            $table->enum('term_type', ['SYNONYM', 'CONSUMER_LABEL', 'ABBREVIATION', 'DISCOVERY_LABEL'])
                ->default('DISCOVERY_LABEL');
            $table->enum('review_status', ['IMPORTED', 'MAPPED', 'APPROVED', 'REJECTED'])
                ->default('IMPORTED');
            $table->boolean('is_preferred')->default(false);
            $table->string('source_system')->nullable()->index();
            $table->string('source_id')->nullable()->index();
            $table->timestamps();

            $table->foreign('disease_id')
                ->references('id')
                ->on('diseases')
                ->nullOnDelete();

            $table->unique(['term', 'source_system', 'source_id'], 'dt_term_source_unique');
            $table->index(['normalized_term', 'review_status'], 'dt_norm_review_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disease_terms');
    }
};
