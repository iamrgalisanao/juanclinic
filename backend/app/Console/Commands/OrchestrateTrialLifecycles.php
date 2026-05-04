<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Services\EntitlementService;

class OrchestrateTrialLifecycles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:orchestrate-trial-lifecycles';

    protected $description = 'Scans for expired and expiring trials to transition their state to SUSPENDED and dispatch alerts.';

    public function handle(EntitlementService $entitlementService)
    {
        $now = Carbon::now();

        // 1. Find Expired Trials
        $expiredTenants = Tenant::where('plan_tier', 'TRIAL')
            ->where('trial_ends_at', '<', $now)
            ->get();

        foreach ($expiredTenants as $tenant) {
            $tenant->update([
                'plan_tier' => 'SUSPENDED',
                'suspended_at' => $now
            ]);

            // Clear cache
            $gates = [
                'pediatrics_enabled', 'inventory_enabled', 'pharmacy_enabled', 'pacs_enabled', 
                'laboratory_enabled', 'radiology_enabled', 'workforce_enabled', 'sms_enabled', 
                'email_enabled', 'billing_enabled', 'portal_enabled', 'empi_enabled', 
                'telehealth_enabled', 'analytics_enabled', 'offline_sync_enabled', 
                'referrals_enabled', 'queue_enabled', 'claims_enabled'
            ];
            foreach ($gates as $gate) {
                $entitlementService->clearCache($tenant->id, $gate);
            }

            Log::info("Tenant #{$tenant->id} ({$tenant->name}) trial expired. Transitioned to SUSPENDED.");
            // TODO: Dispatch TrialExpiredAlert notification
        }

        // 2. Find Expiring Trials (e.g., exactly 3 days away)
        // Using whereBetween to catch those passing the 3-day mark today
        $warningStart = $now->copy()->addDays(3)->startOfDay();
        $warningEnd = $now->copy()->addDays(3)->endOfDay();
        
        $expiringTenants = Tenant::where('plan_tier', 'TRIAL')
            ->whereBetween('trial_ends_at', [$warningStart, $warningEnd])
            ->get();

        foreach ($expiringTenants as $tenant) {
            Log::info("Tenant #{$tenant->id} ({$tenant->name}) trial expires in 3 days.");
            // TODO: Dispatch TrialExpiringWarningAlert notification
        }

        $this->info(count($expiredTenants) . ' trials suspended. ' . count($expiringTenants) . ' expiring warnings triggered.');
    }
}
