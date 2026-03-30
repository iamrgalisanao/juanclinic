<?php

namespace App\Observers;

use App\Models\Patient;
use App\Services\HL7Generator;

class PatientObserver
{
    protected $generator;

    public function __construct(HL7Generator $generator)
    {
        $this->generator = $generator;
    }

    /**
     * Handle the Patient "created" event.
     */
    public function created(Patient $patient): void
    {
        $this->generator->generateADT($patient, 'A04');
    }

    /**
     * Handle the Patient "updated" event.
     */
    public function updated(Patient $patient): void
    {
        // Only trigger if significant demographics changed
        $monitored = ['first_name', 'last_name', 'dob', 'gender', 'patient_external_id'];
        if ($patient->wasChanged($monitored)) {
            $this->generator->generateADT($patient, 'A08');
        }
    }
}
