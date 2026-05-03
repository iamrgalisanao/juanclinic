<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class PatientAppointmentReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $appointment;
    protected $days;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment, int $days = 1)
    {
        $this->appointment = $appointment;
        $this->days = $days;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database']; 

        // Use the new preference helper if available, otherwise fallback
        if (method_exists($notifiable, 'canReceiveNotification')) {
            if ($notifiable->canReceiveNotification('email')) {
                $channels[] = 'mail';
            }
        } elseif ($notifiable->receive_email_reminders && $notifiable->email) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $lang = $notifiable->preferred_language ?? 'en';
        $branch = $this->appointment->branch;
        
        $confirmationUrl = URL::signedRoute('appointments.confirm', ['appointment' => $this->appointment->id], now()->addHours(72));
        $rescheduleUrl = URL::signedRoute('appointments.reschedule', ['appointment' => $this->appointment->id], now()->addHours(72));
        
        $meetingUrl = null;
        if ($this->appointment->visit_type === 'TELEHEALTH' && $this->appointment->meeting_id) {
            $meetingUrl = "https://meet.jit.si/JuanClinic-" . $this->appointment->meeting_id;
        }

        $timeString = $this->days > 1 ? "in {$this->days} days" : "tomorrow";
        $subject = $this->days > 1 ? "Save the Date: Appointment Reminder" : "Final Call: Appointment Tomorrow";

        if ($lang === 'tl') {
            $timeString = $this->days > 1 ? "sa loob ng {$this->days} araw" : "bukas";
            $subject = $this->days > 1 ? "Paalala para sa iyong Appointment" : "Huling Paalala: Appointment Bukas";
            
            $mail = (new MailMessage)
                ->subject($subject . " - JuanClinic")
                ->greeting("Kamusta, {$notifiable->first_name}!")
                ->line("Ito ay paalala para sa iyong appointment {$timeString}, " . $this->appointment->appointment_date->format('M d, Y') . " sa ganap na " . $this->appointment->start_time . ".")
                ->line("Doktor: Dr. " . ($this->appointment->doctor->last_name ?? 'Juan'))
                ->line("Lokasyon: " . ($this->appointment->visit_type === 'TELEHEALTH' ? 'VIDEO CALL (Telehealth)' : ($branch->name ?? 'JuanClinic Branch')))
                ->action('I-kumpirma ang Appointment', $confirmationUrl);

            if ($this->days > 1) {
                $mail->line("Hindi makakarating? Maaari mong i-request ang pag-reschedule dito: " . $rescheduleUrl);
            }

            if ($meetingUrl) {
                $mail->line("Para sa iyong video call, i-click ito sa oras ng appointment: " . $meetingUrl);
            }

            return $mail->line('Mangyaring dumating 15 minuto bago ang iyong schedule.')
                ->salutation('Lubos na gumagalang, Ang iyong JuanClinic Team');
        }

        $mail = (new MailMessage)
            ->subject($subject . " - JuanClinic")
            ->greeting("Hello, {$notifiable->first_name}!")
            ->line("This is a reminder for your appointment {$timeString}, " . $this->appointment->appointment_date->format('M d, Y') . " at " . $this->appointment->start_time . ".")
            ->line("Doctor: Dr. " . ($this->appointment->doctor->last_name ?? 'Juan'))
            ->line("Location: " . ($this->appointment->visit_type === 'TELEHEALTH' ? 'VIDEO CALL (Telehealth)' : ($branch->name ?? 'JuanClinic Branch')))
            ->action('Confirm Appointment', $confirmationUrl);

        if ($this->days > 1) {
            $mail->line("Cannot make it? You can request to reschedule here: " . $rescheduleUrl);
        }

        if ($meetingUrl) {
            $mail->line("For your video call, please join at the scheduled time: " . $meetingUrl);
        }

        return $mail->line('Please arrive 15 minutes before your scheduled time.')
            ->salutation('Best regards, Your JuanClinic Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'tier' => $this->days,
            'type' => 'REMINDER',
            'message' => "Appointment reminder for {$this->appointment->appointment_date->toDateString()} at " . $this->appointment->start_time,
        ];
    }
}
