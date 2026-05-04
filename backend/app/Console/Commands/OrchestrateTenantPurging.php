<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OrchestrateTenantPurging extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:orchestrate-tenant-purging';

    protected $description = 'Scans for suspended tenants whose purge grace period has passed, and executes a data purge.';

    public function handle()
    {
        $now = Carbon::now();
        $defaultPurgeDays = (int) env('DEFAULT_TENANT_PURGE_DAYS', 90);

        // Find tenants that are suspended and have a suspended_at timestamp
        $suspendedTenants = Tenant::where('plan_tier', 'SUSPENDED')
            ->whereNotNull('suspended_at')
            ->get();

        $purgedCount = 0;

        foreach ($suspendedTenants as $tenant) {
            $customPurgeDays = $tenant->admin_settings['purge_after_days'] ?? $defaultPurgeDays;
            $purgeDate = $tenant->suspended_at->copy()->addDays($customPurgeDays);

            if ($now->greaterThanOrEqualTo($purgeDate)) {
                Log::info("Tenant #{$tenant->id} ({$tenant->name}) has reached its purge date ({$customPurgeDays} days after suspension). Initiating purge.");
                
                // TODO: Dispatch TenantPurgedAlert notification

                // Execute a soft-delete (or hard-delete depending on policy)
                // For this implementation, we will use delete() which will trigger any cascading soft-deletes
                // assuming the Tenant model uses SoftDeletes (if not, it's a hard delete).
                try {
                    $tenant->delete();
                    $purgedCount++;
                    Log::info("Successfully purged Tenant #{$tenant->id}.");
                } catch (\Exception $e) {
                    Log::error("Failed to purge Tenant #{$tenant->id}: " . $e->getMessage());
                }
            }
        }

        $this->info("{$purgedCount} tenants were successfully purged.");
    }
}
