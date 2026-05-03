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
        $tenantId = \App\Models\Tenant::SYSTEM_ID;

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'General SOAP Note'],
            [
                'tenant_id' => $tenantId,
                'name' => 'General SOAP Note',
                'description' => 'Standard Subjective, Objective, Assessment, and Plan encounter note.',
                'is_active' => true,
                'schema' => [
                    ['name' => 'subjective', 'label' => 'Subjective (Chief Complaint & HPI)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'objective', 'label' => 'Objective (Vitals & Physical Exam)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'assessment', 'label' => 'Assessment (Diagnosis)', 'type' => 'textarea', 'required' => true],
                    ['name' => 'plan', 'label' => 'Plan (Treatment & Follow-up)', 'type' => 'textarea', 'required' => true],
                ],
            ]
        );

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Pediatric Growth Checklist'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Pediatric Growth Checklist',
                'description' => 'Standard infant and toddler growth tracking form.',
                'is_active' => true,
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
            ['tenant_id' => $tenantId, 'name' => 'Medical Certificate'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Medical Certificate',
                'description' => 'Formal medical certificate detailing patient examination, diagnosis, and rest recommendations.',
                'is_active' => true,
                'schema' => [
                    ['name' => 'examination_date', 'label' => 'Date of Examination', 'type' => 'date', 'required' => true],
                    ['name' => 'diagnosis', 'label' => 'Diagnosis / Impression', 'type' => 'textarea', 'required' => true],
                    ['name' => 'recommendations', 'label' => 'Recommendations / Treatment', 'type' => 'textarea', 'required' => true],
                    ['name' => 'rest_days', 'label' => 'Number of Rest Days Recommended', 'type' => 'number', 'required' => true],
                    ['name' => 'remarks', 'label' => 'Additional Remarks', 'type' => 'textarea', 'required' => false],
                ],
            ]
        );

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Comprehensive SDE Note'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Comprehensive SDE Note',
                'description' => 'Professional Structured Data Entry (SDE) note with Concept Mapping (SNOMED CT) and Pertinent Negatives.',
                'is_active' => true,
                'schema' => [
                    [
                        'name' => 'chief_complaint', 
                        'label' => 'Chief Complaint', 
                        'type' => 'textarea', 
                        'required' => true
                    ],
                    [
                        'name' => 'sde_content', 
                        'label' => 'Review of Systems (SDE)', 
                        'type' => 'sde', 
                        'config' => [
                            'systems' => [
                                [
                                    'id' => 'constitutional',
                                    'label' => 'Constitutional',
                                    'concept_id' => 'SNOMED:363713009',
                                    'symptoms' => [
                                        ['id' => 'no_acute_distress', 'label' => 'No Acute Distress (NAD)', 'concept_id' => 'SNOMED:162489007', 'modifiers' => []],
                                        ['id' => 'fever_chills', 'label' => 'Fever / Chills', 'concept_id' => 'SNOMED:386661006', 'modifiers' => []],
                                        ['id' => 'fatigue_malaise', 'label' => 'Fatigue / Malaise', 'concept_id' => 'SNOMED:84229001', 'modifiers' => []],
                                    ]
                                ],
                                [
                                    'id' => 'respiratory',
                                    'label' => 'Respiratory',
                                    'concept_id' => 'SNOMED:20139000',
                                    'symptoms' => [
                                        ['id' => 'cough', 'label' => 'Cough', 'concept_id' => 'SNOMED:49727002', 'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['Dry', 'Productive']]]],
                                        ['id' => 'dyspnea', 'label' => 'Dyspnea (SOB)', 'concept_id' => 'SNOMED:267036007', 'modifiers' => []],
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['name' => 'physical_exam', 'label' => 'Objective (Physical Exam)', 'type' => 'textarea', 'required' => false],
                    ['name' => 'assessment', 'label' => 'Assessment / Diagnosis', 'type' => 'textarea', 'required' => true],
                    ['name' => 'plan', 'label' => 'Plan / Treatment', 'type' => 'textarea', 'required' => true],
                ],
            ]
        );

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'Social Determinants of Health (SDOH)'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Social Determinants of Health (SDOH)',
                'description' => 'Standardized assessment of social factors including housing, food security, and transportation (RA 10173 compliant).',
                'is_active' => true,
                'schema' => [
                    ['name' => 'housing_security', 'label' => 'Housing Security', 'type' => 'select', 'options' => ['Stable', 'Unstable', 'Homeless', 'Risk of Eviction'], 'required' => true],
                    ['name' => 'food_security', 'label' => 'Food Security', 'type' => 'select', 'options' => ['Secure', 'Worry about Food', 'Skipping Meals'], 'required' => true],
                    ['name' => 'transportation_access', 'label' => 'Transportation Access', 'type' => 'select', 'options' => ['Reliable', 'Occasional Issues', 'No Reliable Access'], 'required' => true],
                    ['name' => 'financial_strain', 'label' => 'Financial Strain', 'type' => 'select', 'options' => ['No Difficulty', 'Some Difficulty', 'Unable to Pay for Basics'], 'required' => true],
                    ['name' => 'social_support', 'label' => 'Social Support / Safety', 'type' => 'select', 'options' => ['Strong Support', 'Limited Support', 'Isolated / At Risk'], 'required' => true],
                    ['name' => 'additional_social_notes', 'label' => 'Socio-Economic Remarks', 'type' => 'textarea', 'required' => false],
                ],
            ]
        );
    }
}
