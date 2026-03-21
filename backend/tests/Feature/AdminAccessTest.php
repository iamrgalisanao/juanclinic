<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected $globalAdmin;
    protected $tenantAdmin;
    protected $tenant1;
    protected $tenant2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant1 = Tenant::create(['name' => 'Tenant 1', 'slug' => 'tenant-1']);
        $this->tenant2 = Tenant::create(['name' => 'Tenant 2', 'slug' => 'tenant-2']);

        // Global Admin (tenant_id = null)
        $this->globalAdmin = User::create([
            'name' => 'Global Admin',
            'email' => 'global@admin.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => null,
        ]);

        // Tenant Admin (tenant_id = 1)
        $this->tenantAdmin = User::create([
            'name' => 'Tenant 1 Admin',
            'email' => 'tenant1@admin.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant1->id,
        ]);

        // Create some patients
        Patient::create(['first_name' => 'T1_Patient', 'last_name' => 'One', 'dob' => '2000-01-01', 'gender' => 'M', 'tenant_id' => $this->tenant1->id]);
        Patient::create(['first_name' => 'T2_Patient', 'last_name' => 'Two', 'dob' => '2000-01-01', 'gender' => 'F', 'tenant_id' => $this->tenant2->id]);
    }

    /** @test */
    public function global_admin_can_access_patients_without_tenant_header()
    {
        // Currently this is expected to FAIL with 403 because of the bug
        $response = $this->actingAs($this->globalAdmin)
            ->getJson('/api/patients');

        $response->assertStatus(200);
    }

    /** @test */
    public function global_admin_can_access_patients_with_tenant_header()
    {
        $response = $this->actingAs($this->globalAdmin)
            ->withHeader('X-Tenant-ID', $this->tenant1->id)
            ->getJson('/api/patients');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['first_name' => 'T1_Patient']);
    }

    /** @test */
    public function tenant_admin_is_blocked_without_header()
    {
        $response = $this->actingAs($this->tenantAdmin)
            ->getJson('/api/patients');

        $response->assertStatus(403);
    }

    /** @test */
    public function tenant_admin_is_blocked_from_other_tenant()
    {
        $response = $this->actingAs($this->tenantAdmin)
            ->withHeader('X-Tenant-ID', $this->tenant2->id)
            ->getJson('/api/patients');

        $response->assertStatus(403);
    }
}
