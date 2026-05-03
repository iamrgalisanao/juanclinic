<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossBranchVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $branchA;
    protected $branchB;
    protected $frontDeskA;
    protected $doctorB;
    protected $patientB;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Tenant
        $this->tenant = Tenant::create(['name' => 'Visibility Clinic', 'slug' => 'vis-clinic']);

        // 2. Create Branches
        $this->branchA = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'North Branch',
            'is_active' => true
        ]);
        $this->branchB = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'South Branch',
            'is_active' => true
        ]);

        // 3. Create Front Desk in Branch A
        $this->frontDeskA = User::create([
            'name' => 'Front Desk North',
            'email' => 'north@test.com',
            'password' => bcrypt('password'),
            'role' => 'FRONT_DESK',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branchA->id
        ]);

        // 4. Create Doctor in Branch B
        $this->doctorB = User::create([
            'name' => 'Dr. South',
            'email' => 'south_doc@test.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branchB->id
        ]);

        // 5. Create Patient in Branch B
        $this->patientB = Patient::create([
            'first_name' => 'South',
            'last_name' => 'Patient',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branchB->id,
            'patient_external_id' => 'EXT-SOUTH-001'
        ]);
    }

    /** @test */
    public function front_desk_in_one_branch_can_see_doctors_in_another_branch()
    {
        // Act as Front Desk North, targeting North Branch
        Sanctum::actingAs($this->frontDeskA);
        
        $tenantId = Tenant::first()->id;
        $branchId = Branch::where('name', 'North Branch')->first()->id;

        $response = $this->withHeader('X-Tenant-ID', $tenantId)
            ->withHeader('X-Branch-ID', $branchId)
            ->getJson('/api/users?role=DOCTOR');

        if ($response->status() !== 200) {
            $response->dump();
        }

        $response->assertStatus(200);
        
        // Assert Doctor South is visible despite being in Branch B
        $response->assertJsonFragment(['name' => 'Dr. South']);
    }

    /** @test */
    public function front_desk_in_one_branch_can_see_patients_registered_in_another_branch()
    {
        // Act as Front Desk North, targeting North Branch
        Sanctum::actingAs($this->frontDeskA);

        $response = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->withHeader('X-Branch-ID', $this->branchA->id)
            ->getJson('/api/patients');

        if ($response->status() !== 200) {
            $response->dump();
        }

        $response->assertStatus(200);
        
        // Assert Patient South is visible despite being in Branch B
        $response->assertJsonFragment(['first_name' => 'South', 'last_name' => 'Patient']);
    }

    /** @test */
    public function cross_branch_isolation_still_applies_to_operational_data_like_orders()
    {
        // Create an Order specifically in Branch B
        $orderB = Order::create([
            'patient_id' => $this->patientB->id,
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branchB->id,
            'order_type' => 'LAB',
            'status' => 'PENDING',
            'priority' => 'ROUTINE'
        ]);

        // Act as Front Desk North, targeting North Branch
        Sanctum::actingAs($this->frontDeskA);

        $response = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->withHeader('X-Branch-ID', $this->branchA->id)
            ->getJson('/api/orders');

        if ($response->status() !== 200) {
            $response->dump();
        }

        $response->assertStatus(200);
        
        // Assert Order B is NOT visible in North Branch's operational list
        $response->assertJsonMissing(['id' => $orderB->id]);
    }
}
