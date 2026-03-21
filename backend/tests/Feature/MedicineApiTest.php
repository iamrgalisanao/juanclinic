<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicineApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed system medicines
        Medicine::create([
            'generic_name' => 'System Amoxicillin',
            'is_system' => true,
            'tenant_id' => null
        ]);
    }

    public function test_tenant_can_search_system_medicines()
    {
        $tenant = Tenant::create(['name' => 'Clinic A', 'subdomain' => 'clinica', 'slug' => 'clinica']);
        $user = User::factory()->create(['role' => 'DOCTOR', 'tenant_id' => $tenant->id]);

        $response = $this->actingAs($user)
            ->withHeader('X-Tenant-ID', $tenant->id)
            ->getJson('/api/medicines?search=System');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['generic_name' => 'System Amoxicillin']);
    }

    public function test_tenant_can_create_and_search_own_medicines()
    {
        $tenant = Tenant::create(['name' => 'Clinic A', 'subdomain' => 'clinica', 'slug' => 'clinica']);
        $user = User::factory()->create(['role' => 'DOCTOR', 'tenant_id' => $tenant->id]);

        $this->actingAs($user)
            ->withHeader('X-Tenant-ID', $tenant->id)
            ->postJson('/api/medicines', [
                'generic_name' => 'Local Medicine X',
                'form' => 'Tablet',
                'strength' => '100mg'
            ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Tenant-ID', $tenant->id)
            ->getJson('/api/medicines?search=Local');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['generic_name' => 'Local Medicine X']);
    }

    public function test_tenant_isolation_for_custom_medicines()
    {
        $tenantA = Tenant::create(['name' => 'Clinic A', 'subdomain' => 'clinica', 'slug' => 'clinica']);
        $tenantB = Tenant::create(['name' => 'Clinic B', 'subdomain' => 'clinicb', 'slug' => 'clinicb']);

        // Create medicine for Tenant A
        Medicine::create([
            'generic_name' => 'Secret Medicine A',
            'is_system' => false,
            'tenant_id' => $tenantA->id
        ]);

        $userB = User::factory()->create(['role' => 'DOCTOR', 'tenant_id' => $tenantB->id]);

        // Tenant B should NOT see Tenant A's medicine
        $response = $this->actingAs($userB)
            ->withHeader('X-Tenant-ID', $tenantB->id)
            ->getJson('/api/medicines?search=Secret');

        $response->assertStatus(200);
        $response->assertJsonCount(0);
        
        // Tenant B should still see system medicine
        $response = $this->actingAs($userB)
            ->withHeader('X-Tenant-ID', $tenantB->id)
            ->getJson('/api/medicines?search=System');
        
        $response->assertJsonCount(1);
    }
}
