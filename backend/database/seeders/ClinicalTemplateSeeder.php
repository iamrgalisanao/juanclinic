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

        ClinicalTemplate::updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Comprehensive SDE Note'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Comprehensive SDE Note',
                'description' => 'Professional Structured Data Entry (SDE) note with Concept Mapping (SNOMED CT) and Pertinent Negatives.',
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
                                    'concept_id' => 'SNOMED:363713009', // General findings
                                    'symptoms' => [
                                        ['id' => 'no_acute_distress', 'label' => 'No Acute Distress (NAD)', 'concept_id' => 'SNOMED:162489007', 'modifiers' => []],
                                        [
                                            'id' => 'fever_chills', 
                                            'label' => 'Fever / Chills', 
                                            'concept_id' => 'SNOMED:386661006',
                                            'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['Documented Temp', 'Subjective Fever', 'Chills/Rigors']]]
                                        ],
                                        ['id' => 'fatigue_malaise', 'label' => 'Fatigue / Malaise', 'concept_id' => 'SNOMED:84229001', 'modifiers' => []],
                                        [
                                            'id' => 'weight_change', 
                                            'label' => 'Weight Change', 
                                            'concept_id' => 'SNOMED:248325000',
                                            'modifiers' => [['id' => 'direction', 'label' => 'Direction', 'options' => ['Unintentional Loss', 'Unintentional Gain']]]
                                        ],
                                        [
                                            'id' => 'appetite_change', 
                                            'label' => 'Appetite Change', 
                                            'concept_id' => 'SNOMED:249468005',
                                            'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['Increased', 'Decreased', 'Anorexia']]]
                                        ],
                                        ['id' => 'night_sweats', 'label' => 'Night Sweats', 'concept_id' => 'SNOMED:42915006', 'modifiers' => []]
                                    ]
                                ],
                                [
                                    'id' => 'respiratory',
                                    'label' => 'Respiratory',
                                    'concept_id' => 'SNOMED:20139000', // Respiratory system
                                    'symptoms' => [
                                        [
                                            'id' => 'cough',
                                            'label' => 'Cough',
                                            'concept_id' => 'SNOMED:49727002',
                                            'modifiers' => [
                                                ['id' => 'type', 'label' => 'Type', 'options' => ['Dry', 'Productive', 'Barking', 'Chronic (>8wks)']]
                                            ]
                                        ],
                                        [
                                            'id' => 'sputum',
                                            'label' => 'Sputum (Phlegm)',
                                            'concept_id' => 'SNOMED:248559005',
                                            'modifiers' => [
                                                ['id' => 'color', 'label' => 'Color/Type', 'options' => ['White/Clear', 'Yellow/Green', 'Blood-tinged (Hemoptysis)']]
                                            ]
                                        ],
                                        [
                                            'id' => 'dyspnea',
                                            'label' => 'Dyspnea (SOB)',
                                            'concept_id' => 'SNOMED:267036007',
                                            'modifiers' => [
                                                ['id' => 'timing', 'label' => 'Timing', 'options' => ['At Rest', 'On Exertion (DOE)', 'Paroxysmal']]
                                            ]
                                        ],
                                        ['id' => 'wheezing', 'label' => 'Wheezing', 'concept_id' => 'SNOMED:56018004', 'modifiers' => []],
                                        ['id' => 'chest_pain_pleuritic', 'label' => 'Chest Pain (Pleuritic)', 'concept_id' => 'SNOMED:64344002', 'modifiers' => []],
                                        ['id' => 'stridor', 'label' => 'Stridor (HARSH NOISE)', 'concept_id' => 'SNOMED:70407001', 'modifiers' => []]
                                    ]
                                ],
                                [
                                    'id' => 'cardiovascular',
                                    'label' => 'Cardiovascular',
                                    'concept_id' => 'SNOMED:113257007', // Circulatory system
                                    'symptoms' => [
                                        [
                                            'id' => 'chest_pain_pressure',
                                            'label' => 'Chest Pain / Pressure',
                                            'concept_id' => 'SNOMED:29857009',
                                            'modifiers' => [
                                                ['id' => 'character', 'label' => 'Character', 'options' => ['Crushing', 'Sharp', 'Substernal']],
                                                ['id' => 'radiation', 'label' => 'Radiation', 'options' => ['Left Arm', 'Jaw', 'Back', 'None']]
                                            ]
                                        ],
                                        [
                                            'id' => 'palpitations',
                                            'label' => 'Palpitations',
                                            'concept_id' => 'SNOMED:80313002',
                                            'modifiers' => [
                                                ['id' => 'rhythm', 'label' => 'Sensation', 'options' => ['Racing', 'Fluttering', 'Skipping Beats']]
                                            ]
                                        ],
                                        ['id' => 'orthopnea', 'label' => 'Orthopnea (Needs Pillows)', 'concept_id' => 'SNOMED:271810006', 'modifiers' => []],
                                        ['id' => 'edema', 'label' => 'Edema (Swelling)', 'concept_id' => 'SNOMED:267038008', 'modifiers' => [['id' => 'location', 'label' => 'Location', 'options' => ['Ankles', 'Feet', 'Generalized']]]],
                                        ['id' => 'claudication', 'label' => 'Claudication (Leg Pain)', 'concept_id' => 'SNOMED:30554005', 'modifiers' => []],
                                        ['id' => 'syncope', 'label' => 'Syncope / Fainting', 'concept_id' => 'SNOMED:271594007', 'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['True Syncope', 'Near-Syncope']]]]
                                    ]
                                ],
                                [
                                    'id' => 'gastrointestinal',
                                    'label' => 'Gastrointestinal',
                                    'concept_id' => 'SNOMED:30215005', // Digestive system
                                    'symptoms' => [
                                        [
                                            'id' => 'abdominal_pain',
                                            'label' => 'Abdominal Pain',
                                            'concept_id' => 'SNOMED:21522001',
                                            'modifiers' => [
                                                ['id' => 'location', 'label' => 'Location', 'options' => ['RUQ', 'RLQ (Appendix)', 'LUQ', 'LLQ', 'Epigastric', 'Diffuse']],
                                                ['id' => 'quality', 'label' => 'Quality', 'options' => ['Colicky', 'Burning', 'Cramping']]
                                            ]
                                        ],
                                        [
                                            'id' => 'nausea_vomiting',
                                            'label' => 'Nausea / Vomiting',
                                            'concept_id' => 'SNOMED:422400008',
                                            'modifiers' => [
                                                ['id' => 'character', 'label' => 'Character', 'options' => ['Bilious (Green)', 'Hematemesis (Blood)', 'Projectile', 'Standard']]
                                            ]
                                        ],
                                        ['id' => 'dysphagia', 'label' => 'Dysphagia (Hard to Swallow)', 'concept_id' => 'SNOMED:40739000', 'modifiers' => []],
                                        [
                                            'id' => 'diarrhea',
                                            'label' => 'Diarrhea',
                                            'concept_id' => 'SNOMED:62315008',
                                            'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['Watery', 'Mucoid', 'Bloody']]]
                                        ],
                                        [
                                            'id' => 'constipation',
                                            'label' => 'Constipation',
                                            'concept_id' => 'SNOMED:14760008',
                                            'modifiers' => [['id' => 'type', 'label' => 'Type', 'options' => ['Chronic', 'Straining']]]
                                        ],
                                        ['id' => 'heartburn', 'label' => 'Heartburn / GERD', 'concept_id' => 'SNOMED:16331000', 'modifiers' => []],
                                        ['id' => 'jaundice', 'label' => 'Jaundice (Yellowing)', 'concept_id' => 'SNOMED:66771007', 'modifiers' => []]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['name' => 'physical_exam', 'label' => 'Objective (Physical Exam)', 'type' => 'textarea', 'required' => false],
                    ['name' => 'assessment', 'label' => 'Assessment / Diagnosis', 'type' => 'textarea', 'required' => true],
                    ['name' => 'plan', 'label' => 'Plan / Treatment', 'type' => 'textarea', 'required' => true],
                ],
                'is_active' => true,
            ]
        );
    }
}
