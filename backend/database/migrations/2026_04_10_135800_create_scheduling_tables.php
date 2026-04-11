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
        Schema::create('staff_schedules', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreignId('branch_id');
            $table->foreignId('user_id');
            $table->date('shift_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('shift_swap_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreignId('requester_id');
            $table->foreignId('requester_schedule_id');
            $table->foreignId('receiver_id');
            $table->foreignId('receiver_schedule_id')->nullable(); // receiver can swap or just take the shift
            $table->string('status')->default('PENDING'); // PENDING, APPROVED, REJECTED, CANCELLED
            $table->foreignId('admin_approver_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_swap_requests');
        Schema::dropIfExists('staff_schedules');
    }
};
