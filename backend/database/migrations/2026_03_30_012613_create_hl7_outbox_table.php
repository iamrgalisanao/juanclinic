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
        Schema::create('hl7_outbox', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('message_type'); // ADT, ORM, ORU
            $table->string('model_type')->nullable(); // Patient, Order
            $table->unsignedBigInteger('model_id')->nullable();
            $table->text('payload'); // Raw HL7 message
            $table->string('status')->default('PENDING'); // PENDING, SENT, FAILED
            $table->integer('retry_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hl7_outbox');
    }
};
