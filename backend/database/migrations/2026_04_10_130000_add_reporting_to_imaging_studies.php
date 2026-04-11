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
        Schema::table('imaging_studies', function (Blueprint $table) {
            $table->text('findings')->nullable()->after('study_description');
            $table->text('impression')->nullable()->after('findings');
            $table->unsignedBigInteger('radiologist_id')->nullable()->after('impression');
            $table->timestamp('interpretation_date')->nullable()->after('radiologist_id');
            $table->boolean('is_finalized')->default(false)->after('interpretation_date');

            $table->foreign('radiologist_id')->references('id')->on('users');
            $table->index('is_finalized');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('imaging_studies', function (Blueprint $table) {
            $table->dropForeign(['radiologist_id']);
            $table->dropColumn(['findings', 'impression', 'radiologist_id', 'interpretation_date', 'is_finalized']);
        });
    }
};
