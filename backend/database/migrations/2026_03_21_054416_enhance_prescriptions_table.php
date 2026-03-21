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
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('medicine_id')->nullable()->after('medication_name');
            $table->integer('quantity')->default(1)->after('medication_name');
            $table->timestamp('dispensed_at')->nullable()->after('status');
            $table->unsignedBigInteger('dispensed_by')->nullable()->after('dispensed_at');

            $table->foreign('medicine_id')->references('id')->on('medicines');
            $table->foreign('dispensed_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropForeign(['medicine_id']);
            $table->dropForeign(['dispensed_by']);
            $table->dropColumn(['medicine_id', 'quantity', 'dispensed_at', 'dispensed_by']);
        });
    }
};
