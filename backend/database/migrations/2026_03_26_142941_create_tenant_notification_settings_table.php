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
        Schema::create('tenant_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('branch_id')->nullable()->index();
            $table->string('channel'); // mail, sms, whatsapp
            $table->string('provider'); // smtp, log, semaphore, twilio
            $table->json('config'); // Host, Port, API Key, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('branch_id')->references('id')->on('physical_branches')->onDelete('set null');
            
            // Ensure unique provider per channel per branch/tenant
            $table->unique(['tenant_id', 'branch_id', 'channel'], 'tenant_branch_channel_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_notification_settings');
    }
};
