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
        Schema::table('vitals', function (Blueprint $table) {
            $table->timestamp('acknowledged_at')->nullable()->after('remarks');
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->after('acknowledged_at');
        });

        Schema::table('diagnostic_results', function (Blueprint $table) {
            $table->timestamp('acknowledged_at')->nullable()->after('is_critical');
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->after('acknowledged_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            $table->dropForeign(['acknowledged_by']);
            $table->dropColumn(['acknowledged_at', 'acknowledged_by']);
        });

        Schema::table('diagnostic_results', function (Blueprint $table) {
            $table->dropForeign(['acknowledged_by']);
            $table->dropColumn(['acknowledged_at', 'acknowledged_by']);
        });
    }
};
