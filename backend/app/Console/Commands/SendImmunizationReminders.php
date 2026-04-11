<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Patient;
use App\Services\PediatricService;
use App\Notifications\ImmunizationReminder;
use Illuminate\Support\Facades\Notification;

class SendImmunizationReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clinic:send-immunization-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scan patient rosters for overdue immunization milestones and send notifications';

    /**
     * Execute the console command.
     */
    public function handle(PediatricService $pediatricService)
    {
        $this->info('Starting multi-tenant immunization reminder scan...');

        $tenants = \App\Models\Tenant::all();
        $remindersSent = 0;

        foreach ($tenants as $tenant) {
            // Bind current tenant to the application container for scoping
            app()->instance('tenant', $tenant);
            
            $this->line("Scanning Tenant: {$tenant->name}...");

            // Scoped patient query (via BelongsToTenant trait)
            $patients = Patient::where('dob', '>=', now()->subYears(6))->get();

            foreach ($patients as $patient) {
                $roadmap = $pediatricService->getImmunizationRoadmap($patient);
                
                foreach ($roadmap as $milestone) {
                    if ($milestone['status'] === 'OVERDUE' || (isset($milestone['due_date']) && $milestone['due_date'] === now()->toDateString())) {
                        
                        // Check if already notified within tenant context
                        $alreadyNotified = $patient->notifications()
                            ->where('type', ImmunizationReminder::class)
                            ->where('data->vaccine_name', $milestone['vaccine_name'])
                            ->where('data->dose_number', $milestone['dose_number'])
                            ->where('created_at', '>=', now()->subDays(7))
                            ->exists();

                        if (!$alreadyNotified) {
                            $patient->notify(new ImmunizationReminder($patient, [
                                'vaccine_name' => $milestone['vaccine_name'],
                                'dose_number' => $milestone['dose_number'],
                                'due_date' => $milestone['due_date']
                            ]));
                            $remindersSent++;
                        }
                    }
                }
            }
        }

        $this->info("Global scan complete. Total reminders sent: {$remindersSent}");
    }
}
