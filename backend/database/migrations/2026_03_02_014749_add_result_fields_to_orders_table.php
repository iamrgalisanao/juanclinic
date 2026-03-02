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
        Schema::table('orders', function (Blueprint $table) {
            $table->json('result_data')->nullable()->after('status');
            $table->unsignedBigInteger('performed_by')->nullable()->after('result_data');
            $table->timestamp('performed_at')->nullable()->after('performed_by');
            $table->unsignedBigInteger('approved_by')->nullable()->after('performed_at');
            $table->timestamp('approved_at')->nullable()->after('approved_by');

            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['performed_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['result_data', 'performed_by', 'performed_at', 'approved_by', 'approved_at']);
        });
    }
};
