<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACPhase4Test extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $doctor;
    protected $tech;
    protected $approver;
    protected $frontDesk;
    protected $patient;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Tenant and Users
        $this->tenant = Tenant::create(['name' => 'Alpha Clinic', 'slug' => 'alpha-clinic']);

        $this->doctor = User::create([
            'name' => 'Dr. Sarah',
            'email' => 'sarah@test.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant->id
        ]);

        $this->tech = User::create([
            'name' => 'Tech Tim',
            'email' => 'tim@test.com',
            'password' => bcrypt('password'),
            'role' => 'TECH',
            'tenant_id' => $this->tenant->id
        ]);

        $this->approver = User::create([
            'name' => 'Approver Amy',
            'email' => 'amy@test.com',
            'password' => bcrypt('password'),
            'role' => 'DIAGNOSTIC_APPROVER',
            'tenant_id' => $this->tenant->id
        ]);

        $this->frontDesk = User::create([
            'name' => 'Fred',
            'email' => 'fred@test.com',
            'password' => bcrypt('password'),
            'role' => 'FRONT_DESK',
            'tenant_id' => $this->tenant->id
        ]);

        // Create a Patient
        $this->patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id
        ]);
    }

    /** @test */
    public function front_desk_can_see_patients_but_cannot_create_orders()
    {
        $response = $this->actingAs($this->frontDesk)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/patients');

        $response->assertStatus(200);

        $response = $this->actingAs($this->frontDesk)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->postJson('/api/orders', [
                'patient_id' => $this->patient->id,
                'order_type' => 'LAB',
                'priority' => 'ROUTINE'
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function tech_can_provide_preliminary_results_but_cannot_finalize()
    {
        $order = Order::create([
            'patient_id' => $this->patient->id,
            'order_type' => 'LAB',
            'priority' => 'ROUTINE',
            'status' => 'PENDING',
            'tenant_id' => $this->tenant->id
        ]);

        // Tech sets to IN_PROGRESS (Allow)
        $this->actingAs($this->tech)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", ['status' => 'IN_PROGRESS'])
            ->assertStatus(200);

        // Tech tries to COMPLETED (Finalize) (Deny)
        $this->actingAs($this->tech)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", ['status' => 'COMPLETED'])
            ->assertStatus(403);
    }

    /** @test */
    public function diagnostic_approver_can_finalize_orders()
    {
        $order = Order::create([
            'patient_id' => $this->patient->id,
            'order_type' => 'LAB',
            'priority' => 'ROUTINE',
            'status' => 'IN_PROGRESS',
            'tenant_id' => $this->tenant->id
        ]);

        // Approver sets to COMPLETED (Allow)
        $this->actingAs($this->approver)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", ['status' => 'COMPLETED'])
            ->assertStatus(200);

        $this->assertEquals('COMPLETED', $order->fresh()->status);
    }

    /** @test */
    public function doctor_can_cancel_orders_but_cannot_finalize_clinical_work()
    {
        $order = Order::create([
            'patient_id' => $this->patient->id,
            'order_type' => 'LAB',
            'priority' => 'ROUTINE',
            'status' => 'PENDING',
            'tenant_id' => $this->tenant->id
        ]);

        // Doctor Cancels (Allow)
        $this->actingAs($this->doctor)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", ['status' => 'CANCELLED'])
            ->assertStatus(200);

        // Reset to IN_PROGRESS
        $order->update(['status' => 'IN_PROGRESS']);

        // Doctor Finalizes (Deny - Clinical Segregation)
        $this->actingAs($this->doctor)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", ['status' => 'COMPLETED'])
            ->assertStatus(403);
    }
}
