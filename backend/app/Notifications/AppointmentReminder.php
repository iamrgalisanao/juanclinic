<?php

namespace App\Notifications;

use App\Notifications\Channels\TenantDatabaseChannel;
use Illuminate\Notifications\Messages\MailMessage;

class AppointmentReminder extends JuanClinicNotification
{
    protected $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct($appointment)
    {
        // Capture tenant/branch from appointment if possible, or from container
        parent::__construct(
            $appointment->tenant_id ?? null,
            $appointment->branch_id ?? null
        );
        $this->appointment = $appointment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [TenantDatabaseChannel::class];

        // Only add mail if the tenant has configured it
        if (config('mail.default') === 'smtp') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $clinicName = config('mail.from.name', 'JuanClinic');
        $date = $this->appointment->appointment_date->format('M d, Y');
        $time = $this->appointment->start_time;

        return (new MailMessage)
            ->subject("Appointment Reminder - {$clinicName}")
            ->greeting("Hello {$notifiable->name},")
            ->line("This is a reminder for your upcoming appointment at **{$clinicName}**.")
            ->line("**Date:** {$date}")
            ->line("**Time:** {$time}")
            ->action('View Appointment', url('/appointments'))
            ->line('Thank you for choosing our clinic!');
    }

    /**
     * Get the array representation of the notification (for database).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'date' => $this->appointment->appointment_date,
            'time' => $this->appointment->start_time,
            'message' => "Appointment reminder for {$this->appointment->appointment_date->format('M d, Y')} at {$this->appointment->start_time}",
        ];
    }
}
