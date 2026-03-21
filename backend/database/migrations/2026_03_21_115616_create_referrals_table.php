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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('source_tenant_id');
            $table->unsignedBigInteger('target_tenant_id');
            $table->unsignedBigInteger('referred_by_user_id');
            $table->string('status')->default('PENDING'); // PENDING, ACCEPTED, REJECTED, REVOKED
            $table->text('clinical_notes')->nullable();
            $table->string('consent_proof')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('patient_id')->references('id')->on('patients');
            $table->foreign('source_tenant_id')->references('id')->on('tenants');
            $table->foreign('target_tenant_id')->references('id')->on('tenants');
            $table->foreign('referred_by_user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
