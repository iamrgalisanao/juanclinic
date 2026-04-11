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

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database']; // Always logged in DB for HIS records
        if ($notifiable->receive_email_reminders && $notifiable->email) {
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
        
        // Signed URL for one-click confirmation (expires in 48h)
        $confirmationUrl = URL::signedRoute('appointments.confirm', ['appointment' => $this->appointment->id], now()->addHours(48));
        
        // Telehealth Meeting Link (if applicable)
        $meetingUrl = null;
        if ($this->appointment->visit_type === 'TELEHEALTH' && $this->appointment->meeting_id) {
            $meetingUrl = "https://meet.jit.si/JuanClinic-" . $this->appointment->meeting_id;
        }

        if ($lang === 'tl') {
            $mail = (new MailMessage)
                ->subject('Paalala sa iyong Appointment - JuanClinic')
                ->greeting("Kamusta, {$notifiable->first_name}!")
                ->line("Ito ay paalala para sa iyong appointment bukas, " . $this->appointment->appointment_date->format('M d, Y') . " sa ganap na " . $this->appointment->start_time . ".")
                ->line("Doktor: Dr. " . ($this->appointment->doctor->last_name ?? 'Juan'))
                ->line("Lokasyon: " . ($this->appointment->visit_type === 'TELEHEALTH' ? 'VIDEO CALL (Telehealth)' : ($branch->name ?? 'JuanClinic Branch')))
                ->action('I-kumpirma ang Appointment', $confirmationUrl);

            if ($meetingUrl) {
                $mail->line("Para sa iyong video call, i-click ito sa oras ng appointment: " . $meetingUrl);
            }

            $mail->line("Maaari mo ring makita ang record ng paglaki at bakuna ng iyong anak sa aming bagong Patient Portal.");
            
            return $mail->line('Mangyaring dumating 15 minuto bago ang iyong schedule.')
                ->salutation('Lubos na gumagalang, Ang iyong JuanClinic Team');
        }

        $mail = (new MailMessage)
            ->subject('Appointment Reminder - JuanClinic')
            ->greeting("Hello, {$notifiable->first_name}!")
            ->line("This is a reminder for your appointment tomorrow, " . $this->appointment->appointment_date->format('M d, Y') . " at " . $this->appointment->start_time . ".")
            ->line("Doctor: Dr. " . ($this->appointment->doctor->last_name ?? 'Juan'))
            ->line("Location: " . ($this->appointment->visit_type === 'TELEHEALTH' ? 'VIDEO CALL (Telehealth)' : ($branch->name ?? 'JuanClinic Branch')))
            ->action('Confirm Appointment', $confirmationUrl);

        if ($meetingUrl) {
            $mail->line("For your video call, please join at the scheduled time: " . $meetingUrl);
        }

        $mail->line("You can also track your child's growth and vaccination records on our new Patient Portal.");

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
            'type' => 'REMINDER',
            'message' => "Appointment reminder for tomorrow at " . $this->appointment->start_time,
        ];
    }
}
