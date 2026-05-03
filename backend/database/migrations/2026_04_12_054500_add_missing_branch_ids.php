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
        $tables = ['appointments', 'clinical_notes', 'prescriptions', 'clinical_attachments'];

        foreach ($tables as $table_name) {
            if (Schema::hasTable($table_name)) {
                Schema::table($table_name, function (Blueprint $table) use ($table_name) {
                    if (!Schema::hasColumn($table_name, 'branch_id')) {
                        $table->unsignedBigInteger('branch_id')->nullable()->index();
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['appointments', 'clinical_notes', 'prescriptions', 'clinical_attachments'];

        foreach ($tables as $table_name) {
            if (Schema::hasTable($table_name)) {
                Schema::table($table_name, function (Blueprint $table) use ($table_name) {
                    if (Schema::hasColumn($table_name, 'branch_id')) {
                        // In some DBs, dropping index explicitly is better but Laravel usually handles it if column is dropped.
                        $table->dropColumn('branch_id');
                    }
                });
            }
        }
    }
};
