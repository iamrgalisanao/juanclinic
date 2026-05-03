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
        Schema::create('clinical_notification_cadences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('branch_id')->nullable()->index();
            $table->string('category'); // APPOINTMENT, VACCINATION
            $table->string('trigger_type'); // BEFORE_DUE, ON_DUE, AFTER_DUE
            $table->integer('days'); // Number of days to offset
            $table->boolean('is_active')->default(true);
            $table->string('description')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });

        // Seed defaults for existing tenants
        $tenants = \DB::table('tenants')->get();
        foreach ($tenants as $tenant) {
            \DB::table('clinical_notification_cadences')->insert([
                [
                    'tenant_id' => $tenant->id,
                    'category' => 'APPOINTMENT',
                    'trigger_type' => 'BEFORE_DUE',
                    'days' => 3,
                    'description' => '72h Pre-Appointment Reminder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'tenant_id' => $tenant->id,
                    'category' => 'APPOINTMENT',
                    'trigger_type' => 'BEFORE_DUE',
                    'days' => 1,
                    'description' => 'Final Appointment Reminder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'tenant_id' => $tenant->id,
                    'category' => 'VACCINATION',
                    'trigger_type' => 'BEFORE_DUE',
                    'days' => 7,
                    'description' => 'Upcoming Vaccination Reminder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_notification_cadences');
    }
};
