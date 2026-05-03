<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\PatientAppointmentReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendRemindersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'juanclinic:remind';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send appointment reminders to patients scheduled for tomorrow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting dynamic appointment reminder scan...");

        $tenants = \App\Models\Tenant::all();
        $totalSent = 0;

        foreach ($tenants as $tenant) {
            // Set tenant context
            app()->instance('tenant', $tenant);
            
            // Fetch active appointment cadences for this tenant
            $cadences = \App\Models\NotificationCadence::where('category', 'APPOINTMENT')
                ->where('trigger_type', 'BEFORE_DUE')
                ->where('is_active', true)
                ->get();

            // Fallback to defaults if none configured
            if ($cadences->isEmpty()) {
                $cadences = collect([
                    (object)['days' => 3, 'description' => 'Default 72h Reminder'],
                    (object)['days' => 1, 'description' => 'Default 24h Reminder'],
                ]);
            }

            foreach ($cadences as $cadence) {
                $targetDate = now()->addDays($cadence->days)->toDateString();
                $this->info("Scanning [{$tenant->name}] for appointments on {$targetDate} ({$cadence->description})...");

                $appointments = Appointment::where('appointment_date', $targetDate)
                    ->where('status', 'PENDING')
                    ->where(function ($query) use ($cadence) {
                        // Allow if no reminder sent yet for this cadence window
                        // (Simplified logic: ensure we don't double-send same cadence today)
                        $query->whereNull('last_reminder_sent_at')
                              ->orWhere('last_reminder_sent_at', '<', now()->subHours(20));
                    })
                    ->with(['patient', 'branch', 'doctor'])
                    ->get();

                if ($appointments->isEmpty()) continue;

                $this->info("Found {$appointments->count()} eligible appointments for {$cadence->description}.");

                foreach ($appointments as $appointment) {
                    $patient = $appointment->patient;

                    if (!$patient) continue;

                    try {
                        // Send Notification with cadence context
                        $patient->notify(new PatientAppointmentReminder($appointment, $cadence->days));

                        // Log Audit Trail
                        $patient->logAudit('notification_sent', [
                            'type' => 'APPOINTMENT_REMINDER',
                            'appointment_id' => $appointment->id,
                            'days' => $cadence->days,
                            'channel' => 'EMAIL'
                        ]);

                        // Update timestamp
                        $appointment->update(['last_reminder_sent_at' => now()]);
                        $totalSent++;

                    } catch (\Exception $e) {
                        $this->error("Failed to send {$cadence->description} for Appointment #{$appointment->id}: " . $e->getMessage());
                        Log::error("Reminder failure ({$cadence->description}): " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Successfully sent {$totalSent} reminders in total.");
        return Command::SUCCESS;
    }
}
