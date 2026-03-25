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
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->after('invoice_number')->default(0);
            $table->decimal('vat_amount', 10, 2)->after('subtotal')->default(0);
            $table->decimal('discount_amount', 10, 2)->after('vat_amount')->default(0);
            $table->string('discount_type')->after('discount_amount')->nullable(); // SENIOR, PWD, PROMO
            $table->renameColumn('total_amount', 'net_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('net_amount', 'total_amount');
            $table->dropColumn(['subtotal', 'vat_amount', 'discount_amount', 'discount_type']);
        });
    }
};
