<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Patient;

$patient = Patient::where('first_name', 'John')->where('last_name', 'Test')->first();

if ($patient) {
    echo "ID: " . $patient->id . "\n";
    echo "DOB: " . $patient->dob->toDateString() . "\n";
    echo "GA: " . ($patient->gestational_weeks ?? 'N/A') . " weeks\n";
    echo "Chronological: " . $patient->dob->diffInDays(now()) . "\n";
    echo "Corrected: " . $patient->getCorrectedAgeInDays() . "\n";
} else {
    echo "Patient not found.\n";
}
