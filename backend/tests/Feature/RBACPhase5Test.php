<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACPhase5Test extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $patient;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Tenant and Admin
        $this->tenant = Tenant::create(['name' => 'Alpha Clinic', 'slug' => 'alpha']);
        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant->id
        ]);
    }

    /** @test */
    public function creating_a_patient_is_automatically_audited()
    {
        $this->actingAs($this->admin)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->postJson('/api/patients', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'dob' => '1990-01-01',
                'gender' => 'M'
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'created',
            'auditable_type' => Patient::class,
            'user_id' => $this->admin->id,
            'tenant_id' => $this->tenant->id,
        ]);

        $log = AuditLog::first();
        $this->assertNotNull($log->new_values);
        $this->assertEquals('John', $log->new_values['first_name']);
    }

    /** @test */
    public function updating_a_patient_records_old_and_new_values()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id
        ]);

        // Clear creation log for clarity
        AuditLog::truncate();

        $this->actingAs($this->admin)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/patients/{$patient->id}", [
                'last_name' => 'Smith'
            ]);

        $log = AuditLog::where('event', 'updated')->first();
        $this->assertNotNull($log);
        $this->assertEquals('Doe', $log->old_values['last_name']);
        $this->assertEquals('Smith', $log->new_values['last_name']);
    }

    /** @test */
    public function order_status_updates_are_audited_via_trait()
    {
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id
        ]);

        $order = Order::create([
            'patient_id' => $patient->id,
            'order_type' => 'LAB',
            'priority' => 'ROUTINE',
            'status' => 'PENDING',
            'tenant_id' => $this->tenant->id
        ]);

        AuditLog::truncate();

        $this->actingAs($this->admin)
            ->withHeader('X-Tenant-ID', $this->tenant->id)
            ->putJson("/api/orders/{$order->id}", [
                'status' => 'COMPLETED'
            ])
            ->assertStatus(200);

        $log = AuditLog::where('event', 'updated')->first();
        $this->assertNotNull($log);
        $this->assertEquals('PENDING', $log->old_values['status']);
        $this->assertEquals('COMPLETED', $log->new_values['status']);
    }

    /** @test */
    public function deleting_a_record_is_audited_with_historical_snapshot()
    {
        $patient = Patient::create([
            'first_name' => 'To Be Deleted',
            'last_name' => 'User',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'tenant_id' => $this->tenant->id
        ]);

        AuditLog::truncate();

        $patient->delete();

        $log = AuditLog::where('event', 'deleted')->first();
        $this->assertNotNull($log);
        $this->assertEquals('To Be Deleted', $log->old_values['first_name']);
        $this->assertNull($log->new_values);
    }
}
