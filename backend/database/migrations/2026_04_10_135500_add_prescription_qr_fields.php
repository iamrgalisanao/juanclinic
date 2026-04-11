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
            $table->uuid('qr_uuid')->unique()->nullable()->after('id');
            $table->decimal('dispensed_quantity', 10, 2)->default(0)->after('quantity');
            $table->decimal('remaining_quantity', 10, 2)->nullable()->after('dispensed_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropColumn(['qr_uuid', 'dispensed_quantity', 'remaining_quantity']);
        });
    }
};
