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
        $this->info('Starting immunization reminder scan...');

        // We only care about patients who are within the target age range for the WHO/DOH schedule (0-6 years)
        $patients = Patient::where('dob', '>=', now()->subYears(6))->get();

        $remindersSent = 0;

        /** @var \App\Models\Patient $patient */
        foreach ($patients as $patient) {
            $roadmap = $pediatricService->getImmunizationRoadmap($patient);
            
            foreach ($roadmap as $milestone) {
                // We notify for OVERDUE milestones or milestones due TODAY
                if ($milestone['status'] === 'OVERDUE' || (isset($milestone['due_date']) && $milestone['due_date'] === now()->toDateString())) {
                    
                    // Check if we already sent a notification for this specific milestone recently
                    // to prevent duplicate spamming.
                    $alreadyNotified = $patient->notifications()
                        ->where('type', ImmunizationReminder::class)
                        ->where('data->vaccine_name', $milestone['vaccine_name'])
                        ->where('data->dose_number', $milestone['dose_number'])
                        ->where('created_at', '>=', now()->subDays(7)) // Don't re-notify within 7 days
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

        $this->info("Scan complete. Reminders sent: {$remindersSent}");
    }
}
