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
        $vaccine = $this->vaccineData['vaccine_name'];
        $dose = $this->vaccineData['dose_number'];
        $dueDate = \Carbon\Carbon::parse($this->vaccineData['due_date'])->format('M d, Y');
        $tier = $this->vaccineData['tier'] ?? 'DUE_TODAY';

        $subject = match($tier) {
            'UPCOMING' => "Upcoming Immunization: {$vaccine} (Dose #{$dose})",
            'OVERDUE' => "URGENT: Immunization Overdue for {$this->patient->name}",
            default => "Immunization Due Today: {$vaccine} Dose #{$dose}",
        };

        $educationalSnippet = match(strtoupper($vaccine)) {
            'BCG' => 'BCG protects infants against tuberculosis (TB), which remains a health concern in the Philippines.',
            'HEPB', 'HEPATITIS B' => 'Hepatitis B vaccination prevents chronic liver disease and liver cancer later in life.',
            'DPT', 'PENTAVALENT' => 'This combined vaccine protects against Diphtheria, Pertussis (Whooping Cough), and Tetanus.',
            'OPV', 'IPV', 'POLIO' => 'Polio vaccination is critical to maintain the Philippines\' polio-free status.',
            'MEASLES', 'MR', 'MMR' => 'Measles is highly contagious; timely vaccination is the only way to prevent outbreaks.',
            default => 'Timely vaccination is vital for building long-term immunity and protecting your child from preventable diseases.',
        };

        $mail = (new MailMessage)
            ->subject($subject . " - JuanClinic")
            ->greeting("Hello {$notifiable->name},");

        if ($tier === 'UPCOMING') {
            $mail->line("This is a friendly reminder that **{$this->patient->name}** has an upcoming immunization scheduled for {$dueDate}.");
        } elseif ($tier === 'OVERDUE') {
            $mail->line("Our records show that **{$this->patient->name}** is **OVERDUE** for a critical immunization milestone.");
        } else {
            $mail->line("This is a reminder that **{$this->patient->name}** has an immunization milestone due today, {$dueDate}.");
        }

        return $mail->line("**Vaccine:** {$vaccine} (Dose #{$dose})")
            ->line("**Due Date:** {$dueDate}")
            ->line($educationalSnippet)
            ->action('View Pediatric Roadmap', url("/portal/patients/{$this->patient->id}/pediatrics"))
            ->line('Thank you for choosing our clinic for your family\'s healthcare!');
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
