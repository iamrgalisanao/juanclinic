<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('tenants', \App\Http\Controllers\Api\TenantController::class);
Route::apiResource('patients', \App\Http\Controllers\Api\PatientController::class);
Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class);
Route::apiResource('appointments', \App\Http\Controllers\Api\AppointmentController::class);
Route::post('hl7/ingest', [\App\Http\Controllers\Api\HL7Controller::class, 'store']);

