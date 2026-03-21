<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BranchIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $mainBranch;
    protected $otherBranch;
    protected $doctor;
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create(['name' => 'Alpha Clinic', 'slug' => 'alpha']);

        $this->mainBranch = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Main Branch'
        ]);

        $this->otherBranch = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Other Branch'
        ]);

        $this->doctor = User::create([
            'name' => 'Dr. Branch',
            'email' => 'doc@branch.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->mainBranch->id
        ]);

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant->id
        ]);
    }

    /** @test */
    public function doctor_can_access_their_own_branch()
    {
        $this->actingAs($this->doctor)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->mainBranch->id
            ])
            ->getJson('/api/patients')
            ->assertStatus(200);
    }

    /** @test */
    public function doctor_cannot_access_other_branch()
    {
        $this->actingAs($this->doctor)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->otherBranch->id
            ])
            ->getJson('/api/patients')
            ->assertStatus(403);
    }

    /** @test */
    public function admin_can_access_any_branch()
    {
        $this->actingAs($this->admin)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->otherBranch->id
            ])
            ->getJson('/api/patients')
            ->assertStatus(200);
    }

    /** @test */
    public function patients_are_automatically_scoped_by_branch_header()
    {
        // Patient in main branch
        Patient::create([
            'first_name' => 'Main',
            'last_name' => 'Patient',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->mainBranch->id
        ]);

        // Patient in other branch
        Patient::create([
            'first_name' => 'Other',
            'last_name' => 'Patient',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->otherBranch->id
        ]);

        // Querying main branch should only return 1 patient
        $response = $this->actingAs($this->doctor)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->mainBranch->id
            ])
            ->getJson('/api/patients');

        $response->assertStatus(200);

        $this->assertCount(1, $response->json('data') ?? $response->json());
        $this->assertEquals('Main', ($response->json('data')[0]['first_name'] ?? $response->json()[0]['first_name'] ?? ''));
    }

    /** @test */
    public function new_records_automatically_get_the_active_branch_id()
    {
        $this->actingAs($this->doctor)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->mainBranch->id
            ])
            ->postJson('/api/patients', [
                'first_name' => 'New',
                'last_name' => 'Branch Patient',
                'dob' => '2000-01-01',
                'gender' => 'F'
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('patients', [
            'first_name' => 'New',
            'branch_id' => $this->mainBranch->id
        ]);
    }
}
