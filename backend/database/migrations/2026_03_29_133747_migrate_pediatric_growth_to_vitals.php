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
        $records = DB::table('pediatric_growth_records')->get();
        
        foreach ($records as $record) {
            $bmi = null;
            if ($record->weight_kg && $record->height_cm && $record->height_cm > 0) {
                $heightM = $record->height_cm / 100;
                $bmi = $record->weight_kg / ($heightM * $heightM);
            }

            DB::table('vitals')->insert([
                'tenant_id' => $record->tenant_id,
                'branch_id' => $record->branch_id,
                'patient_id' => $record->patient_id,
                'weight_kg' => $record->weight_kg,
                'height_cm' => $record->height_cm,
                'bmi' => $bmi,
                'recorded_at' => $record->measured_at,
                'metadata' => json_encode([
                    'head_circumference_cm' => $record->head_circumference_cm,
                    'migrated_from' => 'pediatric_growth_records'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vitals', function (Blueprint $table) {
            //
        });
    }
};
