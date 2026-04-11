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
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('meeting_id')->nullable()->after('last_reminder_sent_at');
            $table->string('meeting_token')->nullable()->after('meeting_id');
            $table->timestamp('meeting_expires_at')->nullable()->after('meeting_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['meeting_id', 'meeting_token', 'meeting_expires_at']);
        });
    }
};
