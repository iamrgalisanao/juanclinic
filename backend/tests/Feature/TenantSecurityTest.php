<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected $superAdmin;
    protected $clinicAdmin1;
    protected $clinicAdmin2;
    protected $tenant1;
    protected $tenant2;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear existing tenants if any (though RefreshDatabase should have handled migrations)
        // However, one migration seeds a tenant (888).
        
        $this->tenant1 = Tenant::create(['name' => 'Clinic Alpha', 'slug' => 'alpha', 'admin_settings' => ['theme' => 'light']]);
        $this->tenant2 = Tenant::create(['name' => 'Clinic Beta', 'slug' => 'beta']);

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'super@juanclinic.com',
            'password' => \Hash::make('password'),
            'role' => 'ADMIN',
            'tenant_id' => null
        ]);

        $this->clinicAdmin1 = User::create([
            'name' => 'Clinic 1 Admin',
            'email' => 'admin1@alpha.com',
            'password' => \Hash::make('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant1->id
        ]);

        $this->clinicAdmin2 = User::create([
            'name' => 'Clinic 2 Admin',
            'email' => 'admin2@beta.com',
            'password' => \Hash::make('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant2->id
        ]);
    }

    /** @test */
    public function public_users_cannot_access_tenants_endpoint()
    {
        $this->getJson('/api/tenants')->assertStatus(401);
    }

    /** @test */
    public function super_admin_can_list_all_tenants()
    {
        // Expecting 3 because of the 2 we created + 1 seeded system tenant
        $response = $this->actingAs($this->superAdmin, 'sanctum')->getJson('/api/tenants');
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /** @test */
    public function clinic_admin_can_only_see_their_own_tenant_in_index()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->getJson('/api/tenants');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['name' => 'Clinic Alpha']);
        $response->assertJsonMissing(['name' => 'Clinic Beta']);
    }

    /** @test */
    public function clinic_admin_can_view_their_own_tenant_details()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->getJson("/api/tenants/{$this->tenant1->id}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Clinic Alpha']);
    }

    /** @test */
    public function clinic_admin_cannot_view_another_tenant_details()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->getJson("/api/tenants/{$this->tenant2->id}");
        $response->assertStatus(403);
    }

    /** @test */
    public function clinic_admin_can_update_their_own_tenant_profile()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->putJson("/api/tenants/{$this->tenant1->id}", [
            'name' => 'Clinic Alpha Updated',
            'tin' => '123-456'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tenants', [
            'id' => $this->tenant1->id,
            'name' => 'Clinic Alpha Updated',
            'tin' => '123-456'
        ]);
    }

    /** @test */
    public function clinic_admin_cannot_update_another_tenant()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->putJson("/api/tenants/{$this->tenant2->id}", [
            'name' => 'Hacked Beta'
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('tenants', ['name' => 'Hacked Beta']);
    }

    /** @test */
    public function clinic_admin_cannot_update_restricted_fields_like_admin_settings()
    {
        $response = $this->actingAs($this->clinicAdmin1, 'sanctum')->putJson("/api/tenants/{$this->tenant1->id}", [
            'admin_settings' => ['extremely_restricted' => true]
        ]);

        // The field should be ignored as it's not in the allowed rules for non-super admins.
        // We check if DB still has old settings.
        $this->tenant1->refresh();
        $this->assertArrayNotHasKey('extremely_restricted', $this->tenant1->admin_settings);
    }

    /** @test */
    public function super_admin_can_update_restricted_fields()
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')->putJson("/api/tenants/{$this->tenant1->id}", [
            'admin_settings' => ['platform_override' => true]
        ]);

        $response->assertStatus(200);
        $this->tenant1->refresh();
        $this->assertArrayHasKey('platform_override', $this->tenant1->admin_settings);
    }

    /** @test */
    public function clinic_admin_cannot_delete_any_tenant()
    {
        $this->actingAs($this->clinicAdmin1, 'sanctum')->deleteJson("/api/tenants/{$this->tenant1->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function super_admin_can_delete_a_tenant()
    {
        $this->actingAs($this->superAdmin, 'sanctum')->deleteJson("/api/tenants/{$this->tenant2->id}")
            ->assertStatus(204);
        
        $this->assertDatabaseMissing('tenants', ['id' => $this->tenant2->id]);
    }

    /** @test */
    public function doctor_can_view_their_own_tenant_but_not_others()
    {
        $doctor = User::create([
            'name' => 'Dr. Alpha',
            'email' => 'doctor@alpha.com',
            'password' => \Hash::make('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant1->id
        ]);

        // Can see own in index
        $response = $this->actingAs($doctor, 'sanctum')->getJson('/api/tenants');
        $response->assertStatus(200);
        $response->assertJsonCount(1);

        // Can view own details
        $this->actingAs($doctor, 'sanctum')->getJson("/api/tenants/{$this->tenant1->id}")
            ->assertStatus(200);

        // Cannot view others details
        $this->actingAs($doctor, 'sanctum')->getJson("/api/tenants/{$this->tenant2->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function doctor_cannot_update_their_own_tenant()
    {
        $doctor = User::create([
            'name' => 'Dr. Alpha',
            'email' => 'doctor2@alpha.com',
            'password' => \Hash::make('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $this->tenant1->id
        ]);

        $response = $this->actingAs($doctor, 'sanctum')->putJson("/api/tenants/{$this->tenant1->id}", [
            'name' => 'Doctor Override'
        ]);

        $response->assertStatus(403);
    }
}
