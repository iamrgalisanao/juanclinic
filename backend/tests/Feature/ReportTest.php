<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $branchA;
    protected $branchB;
    protected $admin;
    protected $docA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create(['name' => 'Alpha Clinic', 'slug' => 'alpha']);
        $this->branchA = Branch::create(['tenant_id' => $this->tenant->id, 'name' => 'Branch A']);
        $this->branchB = Branch::create(['tenant_id' => $this->tenant->id, 'name' => 'Branch B']);

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant->id
        ]);

        $this->docA = User::create([
            'name' => 'Reception A',
            'email' => 'receptiona@test.com',
            'password' => bcrypt('password'),
            'role' => 'FRONT_DESK',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branchA->id
        ]);

        // Seed data for Branch A
        $patientA = Patient::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchA->id, 'first_name' => 'A1', 'last_name' => 'P', 'dob' => '1990-01-01', 'gender' => 'M']);
        $orderA = Order::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchA->id, 'patient_id' => $patientA->id, 'order_type' => 'LAB', 'status' => 'COMPLETED', 'priority' => 'ROUTINE']);
        $invoiceA = \App\Models\Invoice::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchA->id, 'patient_id' => $patientA->id, 'order_id' => $orderA->id, 'invoice_number' => 'INV-A', 'total_amount' => 100, 'status' => 'PAID']);
        Payment::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchA->id, 'invoice_id' => $invoiceA->id, 'amount' => 100, 'payment_method' => 'CASH']);

        // Seed data for Branch B
        $patientB = Patient::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchB->id, 'first_name' => 'B1', 'last_name' => 'P', 'dob' => '1990-01-01', 'gender' => 'F']);
        $invoiceB = \App\Models\Invoice::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchB->id, 'patient_id' => $patientB->id, 'invoice_number' => 'INV-B', 'total_amount' => 50, 'status' => 'PAID']);
        Payment::create(['tenant_id' => $this->tenant->id, 'branch_id' => $this->branchB->id, 'invoice_id' => $invoiceB->id, 'amount' => 50, 'payment_method' => 'CASH']);
    }

    /** @test */
    public function admin_can_see_aggregate_tenant_reports()
    {
        $response = $this->actingAs($this->admin)
            ->withHeaders(['X-Tenant-ID' => $this->tenant->id])
            ->getJson('/api/reports/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('stats.total_patients', 2)
            ->assertJsonPath('stats.total_revenue', 150);
    }

    /** @test */
    public function branch_user_sees_restricted_reports()
    {
        $response = $this->actingAs($this->docA)
            ->withHeaders([
                'X-Tenant-ID' => $this->tenant->id,
                'X-Branch-ID' => $this->branchA->id
            ])
            ->getJson('/api/reports/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('stats.total_patients', 1)
            ->assertJsonPath('stats.total_revenue', 100);
    }
}