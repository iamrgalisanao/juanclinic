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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('category')->default('SUPPLY'); // SUPPLY, REAGENT
            $table->string('unit')->default('PCS');
            $table->text('description')->nullable();
            $table->integer('min_stock_level')->default(10);
            $table->timestamps();
        });

        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreignId('branch_id');
            $table->foreignId('inventory_item_id');
            $table->string('batch_number')->nullable();
            $table->decimal('quantity', 12, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->timestamp('last_restocked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_stocks');
        Schema::dropIfExists('inventory_items');
    }
};
