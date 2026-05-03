<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\PatientController;
use App\Models\Patient;
use Illuminate\Http\Request;

$patient = Patient::where('first_name', 'John')->where('last_name', 'Test')->first();

if ($patient) {
    $controller = app(PatientController::class);
    $response = $controller->getNeonatalSummary($patient->id);
    echo $response->getContent();
} else {
    echo "Patient not found.\n";
}
