<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Patient;
use App\Models\Branch;

class SyncTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $branch;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable search indexing if it's active to avoid dependency issues in tests
        config(['scout.driver' => null]);

        $this->tenant = Tenant::create(['name' => 'Test Clinic', 'slug' => 'test']);
        $this->branch = Branch::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Main Branch',
            'is_active' => true
        ]);
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'ADMIN',
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branch->id
        ]);
    }

    public function test_pull_returns_new_records_only()
    {
        $beforeSync = now()->subMinutes(5)->toDateTimeString();

        // Create an old patient and explicitly backdate its updated_at using Query Builder
        $oldPatient = Patient::create([
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branch->id,
            'first_name' => 'Old',
            'last_name' => 'Patient',
            'dob' => '1990-01-01',
            'gender' => 'M',
            'patient_external_id' => 'OLD-1'
        ]);

        \Illuminate\Support\Facades\DB::table('patients')
            ->where('id', $oldPatient->id)
            ->update(['updated_at' => now()->subMinutes(10)]);

        // Create a new patient
        $newPatient = Patient::create([
            'tenant_id' => $this->tenant->id,
            'branch_id' => $this->branch->id,
            'first_name' => 'New',
            'last_name' => 'Patient',
            'dob' => '1995-01-01',
            'gender' => 'F',
            'patient_external_id' => 'NEW-1'
        ]);

        $response = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->withHeader('X-Branch-ID', $this->branch->id)
            ->actingAs($this->admin, 'sanctum')
            ->getJson("/api/sync/pull?last_sync_at=" . urlencode($beforeSync));

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.patients');
        $response->assertJsonPath('data.patients.0.id', $newPatient->id);
    }

    public function test_push_creates_records_from_queue()
    {
        $queue = [
            [
                'id' => 1,
                'method' => 'POST',
                'url' => '/patients',
                'data' => [
                    'first_name' => 'Synced',
                    'last_name' => 'Patient',
                    'dob' => '2000-01-01',
                    'gender' => 'M',
                    'patient_external_id' => 'SYNC-1',
                    'branch_id' => $this->branch->id
                ]
            ]
        ];

        $response = $this->withHeader('X-Tenant-ID', $this->tenant->id)
            ->withHeader('X-Branch-ID', $this->branch->id)
            ->actingAs($this->admin, 'sanctum')
            ->postJson('/api/sync/push', ['queue' => $queue]);

        $response->assertStatus(200);
        $response->assertJsonPath('results.0.status', 'success');

        $this->assertDatabaseHas('patients', [
            'first_name' => 'Synced',
            'tenant_id' => $this->tenant->id
        ]);
    }
}
