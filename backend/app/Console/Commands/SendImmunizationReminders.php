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
        $this->info('Starting multi-tenant immunization reminder scan (Upcoming & Overdue)...');

        $tenants = \App\Models\Tenant::all();
        $remindersSent = 0;

        foreach ($tenants as $tenant) {
            app()->instance('tenant', $tenant);
            $this->line("Scanning Tenant: {$tenant->name}...");

            // Fetch active vaccination cadences
            $cadences = \App\Models\NotificationCadence::where('category', 'VACCINATION')
                ->where('is_active', true)
                ->get();

            // Fallback to default T-7 if none configured
            if ($cadences->isEmpty()) {
                $cadences = collect([
                    (object)['trigger_type' => 'BEFORE_DUE', 'days' => 7, 'description' => 'Default 7-day Reminder']
                ]);
            }

            $patients = Patient::where('dob', '>=', now()->subYears(6))->get();

            foreach ($patients as $patient) {
                $roadmap = $pediatricService->getImmunizationRoadmap($patient);
                
                foreach ($roadmap as $milestone) {
                    if (!isset($milestone['due_date'])) continue;

                    foreach ($cadences as $cadence) {
                        $isTriggered = false;
                        $tier = 'UPCOMING';

                        if ($cadence->trigger_type === 'BEFORE_DUE') {
                            $targetDate = now()->addDays($cadence->days)->toDateString();
                            $isTriggered = ($milestone['due_date'] === $targetDate);
                            $tier = 'UPCOMING';
                        } elseif ($cadence->trigger_type === 'ON_DUE') {
                            $isTriggered = ($milestone['due_date'] === now()->toDateString());
                            $tier = 'DUE_TODAY';
                        } elseif ($cadence->trigger_type === 'AFTER_DUE') {
                            $targetDate = now()->subDays($cadence->days)->toDateString();
                            $isTriggered = ($milestone['due_date'] === $targetDate && $milestone['status'] === 'OVERDUE');
                            $tier = 'OVERDUE';
                        }

                        if ($isTriggered) {
                            // Check if already notified within tenant context to prevent spam
                            $alreadyNotified = $patient->notifications()
                                ->where('type', ImmunizationReminder::class)
                                ->where('data->vaccine_name', $milestone['vaccine_name'])
                                ->where('data->dose_number', $milestone['dose_number'] ?? null)
                                ->where('data->tier', $tier) // Check tier specifically
                                ->where('created_at', '>=', now()->subDays(7))
                                ->exists();

                            if (!$alreadyNotified) {
                                $patient->notify(new ImmunizationReminder($patient, [
                                    'vaccine_name' => $milestone['vaccine_name'],
                                    'dose_number' => $milestone['dose_number'] ?? 1,
                                    'due_date' => $milestone['due_date'],
                                    'tier' => $tier
                                ]));

                                // Log Audit Trail
                                $patient->logAudit('notification_sent', [
                                    'type' => 'IMMUNIZATION_REMINDER',
                                    'vaccine_name' => $milestone['vaccine_name'],
                                    'dose_number' => $milestone['dose_number'] ?? 1,
                                    'tier' => $tier,
                                    'channel' => 'EMAIL'
                                ]);

                                $remindersSent++;
                            }
                        }
                    }
                }
            }
        }

        $this->info("Global scan complete. Total reminders sent: {$remindersSent}");
    }
}
