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
        Schema::create('medicine_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained()->onDelete('cascade');
            $table->string('lot_number')->index();
            $table->string('manufacturer')->nullable();
            $table->date('vis_edition_date')->nullable();
            $table->string('cvx_code')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('stock')->default(0);
            $table->timestamps();
            
            // Allow same lot for different medicines (rare but possible)
            $table->unique(['medicine_id', 'lot_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_lots');
    }
};
