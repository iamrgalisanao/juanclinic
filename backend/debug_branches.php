<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

foreach (\App\Models\Branch::all() as $b) {
    echo $b->id . ': ' . $b->name . ' (Tenant ' . $b->tenant_id . ')' . PHP_EOL;
}
