<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Backfill medicine_forms from legacy medicines
        $medicines = DB::table('medicines')->get();

        foreach ($medicines as $medicine) {
            // Create exactly one form per legacy medicine
            $formId = DB::table('medicine_forms')->insertGetId([
                'medicine_id' => $medicine->id,
                'legacy_medicine_id' => $medicine->id,
                'form_name' => $medicine->form ?? null,
                'strength' => $medicine->strength ?? null,
                'price' => $medicine->price ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Inventory backfill: Only if it's a tenant-owned record
            if (!is_null($medicine->tenant_id)) {
                DB::table('tenant_medicine_inventory')->insert([
                    'tenant_id' => $medicine->tenant_id,
                    'medicine_form_id' => $formId,
                    'stock' => $medicine->stock ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 3. Prescription and Lot mapping
            DB::table('prescriptions')
                ->where('medicine_id', $medicine->id)
                ->update(['medicine_form_id' => $formId]);

            DB::table('medicine_lots')
                ->where('medicine_id', $medicine->id)
                ->update(['medicine_form_id' => $formId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clean up mappings
        DB::table('medicine_lots')->update(['medicine_form_id' => null]);
        DB::table('prescriptions')->update(['medicine_form_id' => null]);
        
        DB::table('tenant_medicine_inventory')->truncate();
        DB::table('medicine_forms')->truncate();
    }
};
