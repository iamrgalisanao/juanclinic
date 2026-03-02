<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACPhase2Test extends TestCase
{
    use RefreshDatabase;

    private $tenant1;
    private $tenant2;
    private $doctor1;
    private $doctor2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant1 = Tenant::create(['name' => 'Alpha Clinic', 'slug' => 'alpha-clinic']);
        $this->tenant2 = Tenant::create(['name' => 'Beta Clinic', 'slug' => 'beta-clinic']);

        $this->doctor1 = User::create([
            'name' => 'Dr. Sarah Connor',
            'email' => 'sarah@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant1->id,
        ]);

        $this->doctor2 = User::create([
            'name' => 'Dr. Gregory House',
            'email' => 'house@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant2->id,
        ]);

        // Create a patient in Tenant 1
        app()->instance('tenant', $this->tenant1);
        Patient::create([
            'tenant_id' => $this->tenant1->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'patient_external_id' => 'EXT-001'
        ]);
    }

    /** @test */
    public function doctor_can_access_own_tenant_patients()
    {
        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->getJson('/api/patients');

        $response->assertStatus(200);
    }

    /** @test */
    public function doctor_cannot_access_other_tenant_patients()
    {
        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant2->id])
            ->getJson('/api/patients');

        // Should fail because doctor1 belongs to tenant 1, but requesting tenant 2 context
        $response->assertStatus(403);
        $response->assertJson(['message' => 'User does not belong to this tenant.']);
    }

    /** @test */
    public function guest_cannot_access_clinical_routes()
    {
        $guest = User::create([
            'name' => 'Guest User',
            'email' => 'guest@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'GUEST',
            'tenant_id' => $this->tenant1->id,
        ]);

        $response = $this->actingAs($guest)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->getJson('/api/patients');

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Unauthorized role.']);
    }

    /** @test */
    public function doctor_cannot_access_user_management()
    {
        $response = $this->actingAs($this->doctor1)
            ->withHeaders(['X-Tenant-ID' => $this->tenant1->id])
            ->getJson('/api/users');

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Unauthorized role.']);
    }
}