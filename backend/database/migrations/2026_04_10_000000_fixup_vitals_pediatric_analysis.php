<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Vital;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Move Head Circumference from metadata to dedicated column
        $vitals = Vital::whereNotNull('metadata')->get();
        
        foreach ($vitals as $vital) {
            $metadata = $vital->metadata;
            $updated = false;

            // Move HC if present in metadata and column is null
            if (isset($metadata['head_circumference_cm']) && !$vital->head_circumference_cm) {
                $vital->head_circumference_cm = $metadata['head_circumference_cm'];
                unset($metadata['head_circumference_cm']);
                $vital->metadata = $metadata;
                $updated = true;
            }

            // Ensure BMI is present if weight/height exist
            if (!$vital->bmi && $vital->weight_kg && $vital->height_cm && $vital->height_cm > 0) {
                $heightM = $vital->height_cm / 100;
                $vital->bmi = $vital->weight_kg / ($heightM * $heightM);
                $updated = true;
            }

            if ($updated) {
                $vital->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed for data fixup
    }
};
