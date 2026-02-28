<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tenant = \App\Models\Tenant::find(1);
if ($tenant) {
    echo "Tenant found: " . $tenant->name . PHP_EOL;
} else {
    echo "Tenant NOT found!" . PHP_EOL;
}
