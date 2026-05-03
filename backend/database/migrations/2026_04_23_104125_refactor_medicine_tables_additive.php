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
        // 1. Enhance medicines with new catalog metadata columns
        Schema::table('medicines', function (Blueprint $table) {
            $table->string('source_id')->nullable()->index()->after('tenant_id');
            $table->string('company_name')->nullable()->after('brand_name');
            $table->text('content')->nullable()->after('company_name');
            $table->text('generic_content')->nullable()->after('content');
            $table->string('therapeutic_class')->nullable()->after('generic_content');
            $table->string('prescription_class')->nullable()->after('therapeutic_class');
            $table->string('class')->nullable()->after('prescription_class'); // molecule class
            $table->string('form_class')->nullable()->after('class');
            $table->string('brand_status')->nullable()->after('form_class');
            $table->boolean('is_prescribable')->default(true)->after('brand_status');
            $table->boolean('show_brand_info')->default(false)->after('is_prescribable');
            $table->text('description')->nullable()->after('show_brand_info');
            $table->longText('indications_text')->nullable()->after('description');
            $table->longText('dose_text')->nullable()->after('indications_text');
            $table->longText('contraindications_text')->nullable()->after('dose_text');
            $table->longText('precautions_text')->nullable()->after('contraindications_text');
            $table->longText('drug_interactions_text')->nullable()->after('precautions_text');
            $table->longText('packaging_text')->nullable()->after('drug_interactions_text');
        });

        // 2. Create medicine_forms
        Schema::create('medicine_forms', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('medicine_id')->indexed();
            $table->unsignedBigInteger('legacy_medicine_id')->nullable()->index(); // Temporary for audit/backfill
            $table->string('external_form_id')->nullable()->index();
            $table->string('brand_form')->nullable();
            $table->string('form_name')->nullable();
            $table->string('strength')->nullable();
            $table->string('form_unit')->nullable();
            $table->string('form_unit_plural')->nullable();
            $table->string('form_dose_type')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('prescription_class')->nullable();
            $table->boolean('is_dangerous')->default(false);
            $table->boolean('compute')->default(false);
            $table->timestamps();

            $table->foreign('medicine_id')->references('id')->on('medicines')->onDelete('cascade');
        });

        // 3. Create tenant_medicine_inventory
        Schema::create('tenant_medicine_inventory', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('medicine_form_id')->index();
            $table->integer('stock')->default(0);
            $table->decimal('price_override', 10, 2)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'medicine_form_id'], 'tenant_form_unique');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('medicine_form_id')->references('id')->on('medicine_forms')->onDelete('cascade');
        });

        // 4. Add nullable medicine_form_id to dependent tables
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('medicine_form_id')->nullable()->after('medicine_id')->index();
            $table->foreign('medicine_form_id')->references('id')->on('medicine_forms')->nullOnDelete();
        });

        Schema::table('medicine_lots', function (Blueprint $table) {
            $table->unsignedBigInteger('medicine_form_id')->nullable()->after('medicine_id')->index();
            $table->foreign('medicine_form_id')->references('id')->on('medicine_forms')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicine_lots', function (Blueprint $table) {
            $table->dropForeign(['medicine_form_id']);
            $table->dropColumn('medicine_form_id');
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropForeign(['medicine_form_id']);
            $table->dropColumn('medicine_form_id');
        });

        Schema::dropIfExists('tenant_medicine_inventory');
        Schema::dropIfExists('medicine_forms');

        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn([
                'source_id', 'company_name', 'content', 'generic_content',
                'therapeutic_class', 'prescription_class', 'class', 'form_class',
                'brand_status', 'is_prescribable', 'show_brand_info', 'description',
                'indications_text', 'dose_text', 'contraindications_text',
                'precautions_text', 'drug_interactions_text', 'packaging_text'
            ]);
        });
    }
};
