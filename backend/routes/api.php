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

Route::group(['middleware' => ['auth:sanctum', 'tenant_user']], function () {
    Route::apiResource('patients', \App\Http\Controllers\Api\PatientController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK');
    Route::get('patients/{patient}/history', [\App\Http\Controllers\Api\PatientHistoryController::class, 'show'])->middleware('role:DOCTOR,ADMIN');
    Route::get('orders/worklist', [\App\Http\Controllers\Api\OrderController::class, 'worklist'])->middleware('role:ADMIN,TECH,DIAGNOSTIC_APPROVER');
    Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class)->middleware('role:DOCTOR,ADMIN,TECH,DIAGNOSTIC_APPROVER');
    Route::apiResource('appointments', \App\Http\Controllers\Api\AppointmentController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK');
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class)->middleware('role:ADMIN,DOCTOR,TECH,FRONT_DESK,DIAGNOSTIC_APPROVER');
    Route::get('messages', [\App\Http\Controllers\Api\MessageController::class, 'index']);
    Route::post('messages/groups', [\App\Http\Controllers\Api\MessageController::class, 'createGroup']);
    Route::get('messages/{conversation}', [\App\Http\Controllers\Api\MessageController::class, 'show']);
    Route::post('messages', [\App\Http\Controllers\Api\MessageController::class, 'store']);
});

Route::post('hl7/ingest', [\App\Http\Controllers\Api\HL7Controller::class, 'store']);

