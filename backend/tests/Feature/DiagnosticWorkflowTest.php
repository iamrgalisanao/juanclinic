<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnosticWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $tech;
    protected $approver;
    protected $patient;
    protected $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create(['name' => 'Lab Clinic', 'slug' => 'lab']);

        $this->tech = User::create([
            'name' => 'Tim Tech',
            'email' => 'tech@test.com',
            'password' => bcrypt('password'),
            'role' => 'TECH',
            'tenant_id' => $this->tenant->id
        ]);

        $this->approver = User::create([
            'name' => 'Amy Approver',
            'email' => 'approver@test.com',
            'password' => bcrypt('password'),
            'role' => 'DIAGNOSTIC_APPROVER',
            'tenant_id' => $this->tenant->id
        ]);

        $this->patient = Patient::create([
            'first_name' => 'Patient',
            'last_name' => 'Zero',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id
        ]);

        $this->order = Order::create([
            'patient_id' => $this->patient->id,
            'order_type' => 'LAB',
            'priority' => 'ROUTINE',
            'status' => 'PENDING',
            'tenant_id' => $this->tenant->id
        ]);
    }

    /** @test */
    public function tech_can_access_worklist_and_enter_preliminary_results()
    {
        // 1. Tech views worklist
        $this->actingAs($this->tech)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/orders/worklist')
            ->assertStatus(200)
            ->assertJsonCount(1);

        // 2. Tech enters results
        $this->actingAs($this->tech)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$this->order->id}", [
                'status' => 'PRELIMINARY',
                'result_data' => ['findings' => 'High glucose level detected.']
            ])
            ->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals('PRELIMINARY', $this->order->status);
        $this->assertEquals($this->tech->id, $this->order->performed_by);
        $this->assertNotNull($this->order->performed_at);
        $this->assertEquals('High glucose level detected.', $this->order->result_data['findings']);

        // Verify Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'updated',
            'auditable_id' => $this->order->id,
            'user_id' => $this->tech->id
        ]);
    }

    /** @test */
    public function approver_can_finalize_preliminary_orders()
    {
        // Setup a preliminary order
        $this->order->update([
            'status' => 'PRELIMINARY',
            'result_data' => ['findings' => 'Test findings'],
            'performed_by' => $this->tech->id,
            'performed_at' => now()
        ]);

        // Approver views their queue
        $this->actingAs($this->approver)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->getJson('/api/orders/worklist')
            ->assertStatus(200)
            ->assertJsonCount(1);

        // Approver signs off
        $this->actingAs($this->approver)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$this->order->id}", [
                'status' => 'COMPLETED'
            ])
            ->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals('COMPLETED', $this->order->status);
        $this->assertEquals($this->approver->id, $this->order->approved_by);
        $this->assertNotNull($this->order->approved_at);
    }

    /** @test */
    public function technical_staff_cannot_finalize_orders()
    {
        $this->order->update(['status' => 'PRELIMINARY']);

        $this->actingAs($this->tech)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$this->order->id}", [
                'status' => 'COMPLETED'
            ])
            ->assertStatus(403); // Forbidden for TECH to set status to COMPLETED
    }
}
