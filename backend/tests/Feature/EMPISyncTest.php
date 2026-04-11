<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\HardwareTerminal;
use App\Models\EMPI_Submission;
use App\Models\Patient;
use App\Models\Tenant;
use App\Models\User;
use App\Services\EMPISyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * EMPI Hardware Sync Integration Tests
 *
 * Covers:
 *  - Hardware authentication (valid / unregistered / inactive)
 *  - Checksum verification (valid / tampered)
 *  - Patient matching: deterministic, probabilistic, skeleton creation
 *  - Admin hardware management endpoints
 */
class EMPISyncTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant         $tenant;
    protected Branch         $branch;
    protected User           $admin;
    protected HardwareTerminal $terminal;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Build a valid payload and compute its SHA-256 checksum.
     */
    private function buildPayload(array $overrides = []): array
    {
        $base = [
            'transaction_id'   => 'SALE_TEST_' . now()->format('YmdHis'),
            'hardware_id'      => 'JC-HW-TERM-001',
            'terminal_id'      => '91',
            'transaction_type' => 'SALE',
            'customer'         => [
                'customer_code' => 'JC-PAT-00001',
                'first_name'    => 'Maria',
                'last_name'     => 'Santos',
                'dob'           => '1990-06-15',
                'gender'        => 'F',
                'contact'       => '09171234567',
            ],
            'totals' => [
                'gross_amount' => 850.00,
                'net_amount'   => 910.00,
            ],
        ];

        // array_replace_recursive correctly overwrites scalars (unlike array_merge_recursive
        // which would convert them to arrays when both keys exist).
        $payload = array_replace_recursive($base, $overrides);

        // Compute checksum over canonical payload (without the checksum key itself)
        $canonical = $payload;
        unset($canonical['payload_checksum']);
        ksort($canonical);
        $payload['payload_checksum'] = hash('sha256', json_encode($canonical));

        return $payload;
    }

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    protected function setUp(): void
    {
        parent::setUp();

        config(['scout.driver' => null]);

        $this->tenant = Tenant::create(['name' => 'Test Clinic', 'slug' => 'test-empi']);
        $this->branch = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name'      => 'Main Branch',
        ]);
        $this->admin  = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branch->id,
            'role'      => 'ADMIN',
        ]);
        $this->terminal = HardwareTerminal::create([
            'tenant_id'   => $this->tenant->id,
            'branch_id'   => $this->branch->id,
            'terminal_id' => '91',
            'hardware_id' => 'JC-HW-TERM-001',
            'min_number'  => 'MIN-2026-009',
            'ptu_number'  => 'PTU-2026-ABC',
            'is_active'   => true,
        ]);
    }

    // =========================================================================
    // GROUP 1: Hardware Authentication
    // =========================================================================

    /** @test */
    public function it_rejects_an_unregistered_hardware_device(): void
    {
        $payload = $this->buildPayload(['hardware_id' => 'UNKNOWN-DEVICE-999']);

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(403)
                 ->assertJsonFragment(['status' => 'REJECTED']);
    }

    /** @test */
    public function it_rejects_an_inactive_hardware_device(): void
    {
        $this->terminal->update(['is_active' => false]);
        $payload = $this->buildPayload();

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(403)
                 ->assertJsonFragment(['status' => 'REJECTED']);
    }

    /** @test */
    public function it_accepts_a_registered_active_terminal(): void
    {
        $payload = $this->buildPayload();

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(201);
    }

    // =========================================================================
    // GROUP 2: Checksum Verification
    // =========================================================================

    /** @test */
    public function it_rejects_a_tampered_payload_with_incorrect_checksum(): void
    {
        $payload = $this->buildPayload();
        // Tamper with the checksum after building it
        $payload['payload_checksum'] = str_repeat('a', 64);

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(422)
                 ->assertJsonFragment(['status' => 'REJECTED']);
    }

    /** @test */
    public function it_accepts_a_payload_with_a_valid_checksum(): void
    {
        $payload = $this->buildPayload();

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('empi_submissions', [
            'hardware_terminal_id' => $this->terminal->id,
        ]);
    }

    // =========================================================================
    // GROUP 3: Patient Matching - Deterministic
    // =========================================================================

    /** @test */
    public function it_deterministically_links_a_patient_by_customer_code(): void
    {
        $patient = Patient::create([
            'tenant_id'           => $this->tenant->id,
            'patient_external_id' => 'JC-PAT-00001',
            'first_name'          => 'Maria',
            'last_name'           => 'Santos',
            'dob'                 => '1990-06-15',
            'gender'              => 'F',
            'contact'             => '09171234567',
        ]);

        $payload = $this->buildPayload();

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['status' => 'SUCCESS'])
                 ->assertJsonFragment(['matching_confidence' => 1.0]);

        $this->assertDatabaseHas('empi_submissions', [
            'matched_patient_id' => $patient->id,
            'status'             => 'SUCCESS',
        ]);
    }

    // =========================================================================
    // GROUP 4: Patient Matching - Skeleton Creation
    // =========================================================================

    /** @test */
    public function it_creates_an_unverified_skeleton_patient_when_no_match_is_found(): void
    {
        // Submit with a customer code that has no match in DB
        $payload = $this->buildPayload([
            'customer' => [
                'customer_code' => 'JC-PAT-GHOST-999',
                'first_name'    => 'Juan',
                'last_name'     => 'Unknown',
                'dob'           => '2000-01-01',
                'contact'       => '09009990000',
            ],
        ]);

        $response = $this->postJson('/api/empi/sync/submit', $payload);
        $response->assertStatus(201);

        // A skeleton patient must have been auto-created
        $this->assertDatabaseHas('patients', [
            'tenant_id'           => $this->tenant->id,
            'patient_external_id' => 'JC-PAT-GHOST-999',
            'first_name'          => 'Juan',
            'last_name'           => 'Unknown',
        ]);

        // The patient metadata must flag it as UNVERIFIED
        $skeletonPatient = Patient::where('patient_external_id', 'JC-PAT-GHOST-999')->first();
        $this->assertEquals('UNVERIFIED', $skeletonPatient->metadata['empi_status']);
        $this->assertEquals('HARDWARE_SYNC', $skeletonPatient->metadata['source']);
    }

    // =========================================================================
    // GROUP 5: Submission Persistence & Encryption
    // =========================================================================

    /** @test */
    public function it_persists_an_encrypted_submission_record(): void
    {
        $payload = $this->buildPayload();

        $this->postJson('/api/empi/sync/submit', $payload)->assertStatus(201);

        $submission = EMPI_Submission::first();
        $this->assertNotNull($submission);

        // The raw_payload must be encrypted — it must NOT match plain JSON
        $this->assertNotEquals(json_encode($payload), $submission->raw_payload);
        
        // Laravel's Crypt::encryptString usually returns a base64 string 
        // that often starts with 'eyJ' (which is the base64 for '{"iv"')
        $this->assertStringStartsWith('eyJ', $submission->raw_payload);
    }

    /** @test */
    public function it_returns_the_submission_uuid_in_the_response(): void
    {
        $payload = $this->buildPayload();

        $response = $this->postJson('/api/empi/sync/submit', $payload);

        $response->assertStatus(201)
                 ->assertJsonStructure(['submission_uuid', 'status', 'matching_confidence']);
    }

    // =========================================================================
    // GROUP 6: Admin Hardware Management
    // =========================================================================

    /** @test */
    public function admin_can_list_registered_hardware_terminals(): void
    {
        $response = $this->actingAs($this->admin)
                         ->withHeader('X-Tenant-ID', $this->tenant->id)
                         ->getJson('/api/empi/hardware');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data' => [['id', 'hardware_id', 'terminal_id', 'is_active']]]);
    }

    /** @test */
    public function admin_can_register_a_new_hardware_terminal(): void
    {
        $response = $this->actingAs($this->admin)
                         ->withHeader('X-Tenant-ID', $this->tenant->id)
                         ->postJson('/api/empi/hardware/register', [
                             'terminal_id' => '92',
                             'hardware_id' => 'JC-HW-TERM-002',
                             'branch_id'   => $this->branch->id,
                             'min_number'  => 'MIN-2026-010',
                             'ptu_number'  => 'PTU-2026-DEF',
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('hardware_terminals', [
            'hardware_id' => 'JC-HW-TERM-002',
            'is_active'   => true,
        ]);
    }

    /** @test */
    public function admin_cannot_register_a_duplicate_hardware_id(): void
    {
        $response = $this->actingAs($this->admin)
                         ->withHeader('X-Tenant-ID', $this->tenant->id)
                         ->postJson('/api/empi/hardware/register', [
                             'terminal_id' => '99',
                             'hardware_id' => 'JC-HW-TERM-001', // already registered in setUp
                         ]);

        $response->assertStatus(422); // validation error: unique
    }

    /** @test */
    public function non_admin_cannot_list_hardware_terminals(): void
    {
        $frontDesk = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branch->id,
            'role'      => 'FRONT_DESK',
        ]);

        $response = $this->actingAs($frontDesk)
                         ->getJson('/api/empi/hardware');

        $response->assertStatus(403);
    }

    // =========================================================================
    // GROUP 7: Service Unit Tests
    // =========================================================================

    /** @test */
    public function checksum_service_correctly_validates_sha256(): void
    {
        $service = app(EMPISyncService::class);
        $payload  = ['foo' => 'bar', 'baz' => 123];

        $canonical = $payload;
        ksort($canonical);
        $correctChecksum = hash('sha256', json_encode($canonical));

        $this->assertTrue($service->verifyChecksum($payload, $correctChecksum));
        $this->assertFalse($service->verifyChecksum($payload, str_repeat('0', 64)));
    }

    /** @test */
    public function hardware_verification_service_returns_null_for_unknown_device(): void
    {
        $service = app(EMPISyncService::class);

        $result = $service->verifyHardware('GHOST-DEVICE', '00');

        $this->assertNull($result);
    }
}
