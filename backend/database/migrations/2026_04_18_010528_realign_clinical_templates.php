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
        // Realign platform-standard templates to the SYSTEM_ID (888) scope
        // to ensure visibility across all clinics/tenants.
        \Illuminate\Support\Facades\DB::table('clinical_templates')
            ->whereIn('name', [
                'General SOAP Note',
                'Pediatric Growth Checklist',
                'Medical Certificate',
                'Comprehensive SDE Note',
                'Social Determinants of Health (SDOH)',
                'General SOAP Note' // Included both spellings if they migrated
            ])
            ->update([
                'tenant_id' => \App\Models\Tenant::SYSTEM_ID,
                'is_active' => true
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No deterministic way to reverse this without snapshotting previous IDs
    }
};
