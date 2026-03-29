<?php

namespace App\Notifications;

use App\Notifications\Channels\TenantDatabaseChannel;
use Illuminate\Notifications\Messages\MailMessage;

class ImmunizationReminder extends JuanClinicNotification
{
    protected $patient;
    protected $vaccineData;

    /**
     * Create a new notification instance.
     * 
     * @param array $vaccineData ['vaccine_name', 'dose_number', 'due_date']
     */
    public function __construct($patient, array $vaccineData)
    {
        parent::__construct(
            $patient->tenant_id ?? null,
            $patient->branch_id ?? null
        );
        $this->patient = $patient;
        $this->vaccineData = $vaccineData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [TenantDatabaseChannel::class];

        // Add mail if SMTP is configured
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
        $vaccine = $this->vaccineData['vaccine_name'];
        $dose = $this->vaccineData['dose_number'];
        $dueDate = \Carbon\Carbon::parse($this->vaccineData['due_date'])->format('M d, Y');

        return (new MailMessage)
            ->subject("Immunization Reminder: {$vaccine} Dose #{$dose}")
            ->greeting("Hello {$notifiable->name},")
            ->line("This is a reminder that **{$this->patient->name}** has an upcoming or overdue immunization milestone.")
            ->line("**Vaccine:** {$vaccine}")
            ->line("**Dose:** #{$dose}")
            ->line("**Due Date:** {$dueDate}")
            ->action('View Health Record', url("/patients/{$this->patient->id}/pediatrics"))
            ->line('Keeping up with the vaccination schedule is vital for long-term health and immunity.')
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
            'patient_id' => $this->patient->id,
            'vaccine_name' => $this->vaccineData['vaccine_name'],
            'dose_number' => $this->vaccineData['dose_number'],
            'due_date' => $this->vaccineData['due_date'],
            'message' => "Immunization reminder: {$this->vaccineData['vaccine_name']} (Dose #{$this->vaccineData['dose_number']}) was due on " . \Carbon\Carbon::parse($this->vaccineData['due_date'])->format('M d, Y'),
        ];
    }
}
