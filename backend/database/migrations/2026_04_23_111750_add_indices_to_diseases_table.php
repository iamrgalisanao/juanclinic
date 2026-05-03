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
        Schema::table('diseases', function (Blueprint $table) {
            // Add unique composite and indices as per MVP approved review
            $table->unique(['code', 'coding_system']);
            $table->index('status');
            $table->index('disease_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diseases', function (Blueprint $table) {
            $table->dropUnique(['code', 'coding_system']);
            $table->dropIndex(['status']);
            $table->dropIndex(['disease_type']);
        });
    }
};
