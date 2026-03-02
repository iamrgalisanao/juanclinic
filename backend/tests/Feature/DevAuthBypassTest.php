<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DevAuthBypassTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_is_protected_by_default()
    {
        $tenant = Tenant::create(['name' => 'Demo', 'slug' => 'demo']);
        $response = $this->getJson('/api/patients', [
            'X-Tenant-ID' => $tenant->id
        ]);

        $response->assertStatus(401);
    }

    public function test_simulated_user_header_bypasses_auth_in_local()
    {
        // Ensure env is local
        config(['app.env' => 'local']);

        $tenant = Tenant::create(['name' => 'Demo', 'slug' => 'demo']);
        $user = User::create([
            'name' => 'Test',
            'email' => 'dr@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $tenant->id
        ]);

        $response = $this->getJson('/api/patients', [
            'X-Tenant-ID' => $tenant->id,
            'X-Simulated-User' => 'dr@clinic.com'
        ]);

        $response->assertStatus(200);
        $this->assertEquals($user->id, auth()->id());
    }

    public function test_bypass_fails_if_env_is_not_local()
    {
        config(['app.env' => 'production']);

        $tenant = Tenant::create(['name' => 'Demo', 'slug' => 'demo']);
        $user = User::create([
            'name' => 'Test',
            'email' => 'dr@clinic.com',
            'password' => bcrypt('password'),
            'role' => 'DOCTOR',
            'tenant_id' => $tenant->id
        ]);

        $response = $this->getJson('/api/patients', [
            'X-Tenant-ID' => $tenant->id,
            'X-Simulated-User' => 'dr@clinic.com'
        ]);

        $response->assertStatus(401);
    }
}
