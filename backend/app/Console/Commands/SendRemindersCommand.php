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
        $this->info("Scanning for appointments scheduled for tomorrow...");

        $tomorrow = now()->addDay()->toDateString();

        $appointments = Appointment::where('appointment_date', $tomorrow)
            ->where('status', 'PENDING')
            ->whereNull('last_reminder_sent_at')
            ->with(['patient', 'branch', 'doctor'])
            ->get();

        $this->info("Found {$appointments->count()} pending appointments for {$tomorrow}.");

        $sentCount = 0;
        foreach ($appointments as $appointment) {
            $patient = $appointment->patient;

            if (!$patient) {
                $this->warn("Skipping appointment ID {$appointment->id} as patient record is missing.");
                continue;
            }

            try {
                // Send Notification
                $patient->notify(new PatientAppointmentReminder($appointment));

                // Log SMS Simulation (Simplified)
                if ($patient->receive_sms_reminders && $patient->contact) {
                    Log::info("[SMS SIMULATION] To: {$patient->contact} | Msg: Hi {$patient->first_name}, reminder for your visit tomorrow at {$appointment->start_time}.");
                }

                // Update timestamp
                $appointment->update(['last_reminder_sent_at' => now()]);
                $sentCount++;

            } catch (\Exception $e) {
                $this->error("Failed to send reminder for Appointment #{$appointment->id}: " . $e->getMessage());
                Log::error("Reminder failure: " . $e->getMessage());
            }
        }

        $this->info("Successfully sent {$sentCount} reminders.");
        return Command::SUCCESS;
    }
}
