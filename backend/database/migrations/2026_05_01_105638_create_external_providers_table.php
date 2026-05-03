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
        Schema::create('external_providers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('slug')->unique()->nullable();
            $table->string('specialty')->nullable();
            $table->string('sub_specialty')->nullable();
            $table->string('clinic_name')->nullable();
            $table->text('clinic_address')->nullable();
            $table->string('province_name')->nullable();
            $table->json('clinic_contacts')->nullable();
            $table->json('hmos')->nullable();
            $table->string('prc_no')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('full_name');
            $table->index('specialty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_providers');
    }
};
