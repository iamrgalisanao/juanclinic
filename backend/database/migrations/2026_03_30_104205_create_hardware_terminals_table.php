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
        Schema::create('hardware_terminals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->string('terminal_id'); // e.g., "91"
            $table->string('hardware_id')->unique(); // Unique Machine Serial
            $table->string('min_number')->nullable(); // BIR Machine Identification Number
            $table->string('ptu_number')->nullable(); // BIR Permit to Use Number
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('branch_id')->references('id')->on('physical_branches')->onDelete('set null');
            
            $table->index(['tenant_id', 'hardware_id']);
            $table->index(['min_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hardware_terminals');
    }
};
