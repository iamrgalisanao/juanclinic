<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Patient;
use App\Models\Referral;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralTest extends TestCase
{
    use RefreshDatabase;

    protected $tenantA;
    protected $tenantB;
    protected $userA;
    protected $userB;
    protected $patientA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = Tenant::create(['name' => 'Clinic Alpha', 'slug' => 'alpha']);
        $this->tenantB = Tenant::create(['name' => 'Clinic Beta', 'slug' => 'beta']);

        $this->userA = User::factory()->create([
            'tenant_id' => $this->tenantA->id,
            'role' => 'ADMIN'
        ]);

        $this->userB = User::factory()->create([
            'tenant_id' => $this->tenantB->id,
            'role' => 'ADMIN'
        ]);

        $this->patientA = Patient::create([
            'tenant_id' => $this->tenantA->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'M',
            'dob' => '1990-01-01'
        ]);
    }

    public function test_can_create_referral_to_another_tenant()
    {
        $response = $this->actingAs($this->userA)
            ->withHeader('X-Tenant-ID', $this->tenantA->id)
            ->postJson('/api/referrals', [
                'patient_id' => $this->patientA->id,
                'target_tenant_id' => $this->tenantB->id,
                'clinical_notes' => 'Referral for consultation',
                'consent_proof' => 'VERBAL_CONSENT'
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('referrals', [
            'patient_id' => $this->patientA->id,
            'source_tenant_id' => $this->tenantA->id,
            'target_tenant_id' => $this->tenantB->id,
        ]);
    }

    public function test_unauthorized_tenant_cannot_see_referral()
    {
        $tenantC = Tenant::create(['name' => 'Clinic Gamma', 'slug' => 'gamma']);
        $userC = User::factory()->create(['tenant_id' => $tenantC->id]);

        $referral = Referral::create([
            'patient_id' => $this->patientA->id,
            'source_tenant_id' => $this->tenantA->id,
            'target_tenant_id' => $this->tenantB->id,
            'referred_by_user_id' => $this->userA->id,
            'consent_proof' => 'YES'
        ]);

        // User C (Gamma) should NOT see this referral
        $response = $this->actingAs($userC)
            ->withHeader('X-Tenant-ID', $tenantC->id)
            ->getJson('/api/referrals');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json());
    }

    public function test_target_tenant_can_accept_and_import_patient()
    {
        $referral = Referral::create([
            'patient_id' => $this->patientA->id,
            'source_tenant_id' => $this->tenantA->id,
            'target_tenant_id' => $this->tenantB->id,
            'referred_by_user_id' => $this->userA->id,
            'consent_proof' => 'YES'
        ]);

        $response = $this->actingAs($this->userB)
            ->withHeader('X-Tenant-ID', $this->tenantB->id)
            ->putJson("/api/referrals/{$referral->id}/accept");

        $response->assertStatus(200);

        // Verify patient was imported into Tenant B
        $this->assertDatabaseHas('patients', [
            'tenant_id' => $this->tenantB->id,
            'first_name' => 'John',
            'last_name' => 'Doe'
        ]);

        $this->assertEquals('ACCEPTED', $referral->fresh()->status);
    }
}
