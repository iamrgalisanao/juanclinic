<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Patient;
use App\Models\ClinicalTemplate;
use App\Models\ClinicalNote;
use Tests\TestCase;

class ClinicalNoteTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant1;
    protected $tenant2;
    protected $doctor1;
    protected $doctor2;
    protected $patient1;
    protected $template1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant1 = Tenant::create(['name' => 'Clinic Alpha', 'slug' => 'alpha']);
        $this->tenant2 = Tenant::create(['name' => 'Clinic Beta', 'slug' => 'beta']);

        $this->doctor1 = User::create([
            'name' => 'Dr. Alpha',
            'email' => 'alpha@test.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant1->id
        ]);

        $this->doctor2 = User::create([
            'name' => 'Dr. Beta',
            'email' => 'beta@test.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant2->id
        ]);

        $this->patient1 = Patient::create([
            'tenant_id' => $this->tenant1->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'patient_external_id' => 'P-001'
        ]);

        $this->template1 = ClinicalTemplate::create([
            'tenant_id' => $this->tenant1->id,
            'name' => 'Pediatric Checklist',
            'schema' => [
                ['name' => 'weight', 'label' => 'Weight', 'type' => 'number']
            ],
            'is_active' => true
        ]);
    }

    /** @test */
    public function doctor_can_fetch_active_templates_for_their_tenant()
    {
        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->getJson('/api/clinical-templates');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['name' => 'Pediatric Checklist']);
    }

    /** @test */
    public function doctor_cannot_see_templates_from_other_tenants()
    {
        $response = $this->actingAs($this->doctor2)
            ->withHeaders(['X-Tenant-ID' => $this->tenant2->id])
            ->getJson('/api/clinical-templates');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    /** @test */
    public function doctor_can_create_a_templated_clinical_note()
    {
        $content = ['weight' => 12.5];

        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->postJson('/api/clinical-notes', [
                'patient_id' => $this->patient1->id,
                'template_id' => $this->template1->id,
                'note_type' => 'TEMPLATE',
                'content' => $content,
                'status' => 'SIGNED'
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('clinical_notes', [
            'patient_id' => $this->patient1->id,
            'template_id' => $this->template1->id,
            'note_type' => 'TEMPLATE'
        ]);

        $note = ClinicalNote::first();
        $this->assertEquals($content, $note->content);
    }

    /** @test */
    public function doctor_can_create_a_standard_soap_note()
    {
        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->postJson('/api/clinical-notes', [
                'patient_id' => $this->patient1->id,
                'note_type' => 'SOAP',
                'content' => 'Subjective: Patient feels well...',
                'status' => 'DRAFT'
            ]);

        $response->assertStatus(201);
    }
}
