<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Tenant;
use App\Models\ClinicalTemplate;

class ClinicalTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        if (!$tenant) {
            return;
        }

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'General SOAP Note'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'General SOAP Note',
                'description' => 'Standard Subjective, Objective, Assessment, and Plan encounter note.',
                'schema' => [
                    ['name' => 'subjective', 'label' => 'Subjective (Chief Complaint & HPI)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'objective', 'label' => 'Objective (Vitals & Physical Exam)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'assessment', 'label' => 'Assessment (Diagnosis)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'plan', 'label' => 'Plan (Treatment & Follow-up)', 'type' => 'textarea', 'required' => true],
                ],
            ]
        );

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Pediatric Growth Checklist'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Pediatric Growth Checklist',
                'description' => 'Standard infant and toddler growth tracking form.',
                'schema' => [
                    ['name' => 'age_months', 'label' => 'Age (Months)', 'type' => 'number', 'required' => true],
                    ['name' => 'weight_kg', 'label' => 'Weight (kg)', 'type' => 'number', 'required' => true],
                    ['name' => 'height_cm', 'label' => 'Height/Length (cm)', 'type' => 'number', 'required' => true],
                    ['name' => 'head_circumference_cm', 'label' => 'Head Circumference (cm)', 'type' => 'number', 'required' => false],
                    ['name' => 'milestones_met', 'label' => 'Developmental Milestones Met?', 'type' => 'select', 'options' => ['Yes', 'No', 'Partial', 'Not Evaluated'], 'required' => true],
                    ['name' => 'notes', 'label' => 'Additional Pediatric Notes', 'type' => 'textarea', 'required' => false],
                ],
            ]
        );

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Medical Certificate'],
            [
                'description' => 'Formal medical certificate detailing patient examination, diagnosis, and rest recommendations.',
                'schema' => [
                    ['name' => 'examination_date', 'label' => 'Date of Examination', 'type' => 'date', 'required' => true],
                    ['name' => 'diagnosis', 'label' => 'Diagnosis / Impression', 'type' => 'textarea', 'required' => true],
                    ['name' => 'recommendations', 'label' => 'Recommendations / Treatment', 'type' => 'textarea', 'required' => true],
                    ['name' => 'rest_days', 'label' => 'Number of Rest Days Recommended', 'type' => 'number', 'required' => true],
                    ['name' => 'remarks', 'label' => 'Additional Remarks', 'type' => 'textarea', 'required' => false],
                ],
                'is_active' => true,
            ]
        );
    }
}
