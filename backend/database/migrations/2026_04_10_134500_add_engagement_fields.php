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
        Schema::table('patients', function (Blueprint $table) {
            $table->string('email')->nullable()->after('contact');
            $table->string('preferred_language', 5)->default('en')->after('email'); // 'en', 'tl'
            $table->boolean('receive_email_reminders')->default(true)->after('preferred_language');
            $table->boolean('receive_sms_reminders')->default(true)->after('receive_email_reminders');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('last_reminder_sent_at')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['email', 'preferred_language', 'receive_email_reminders', 'receive_sms_reminders']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['last_reminder_sent_at']);
        });
    }
};
