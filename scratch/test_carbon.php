<?php
require __DIR__ . '/../backend/vendor/autoload.php';

use Carbon\Carbon;

$dob = Carbon::parse('2026-04-08');
$now = Carbon::parse('2026-05-03 11:15:00');

echo "diffInDays: " . $dob->diffInDays($now) . "\n";
echo "diffInSeconds / 86400: " . ($dob->diffInSeconds($now) / 86400) . "\n";
