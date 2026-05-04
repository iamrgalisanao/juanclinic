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

Route::get('/version', function () {
    return response()->json(\App\Services\VersionService::getInfo());
});

// Public Patient Portal Routes (Link + PIN based)
Route::prefix('portal')->middleware('entitled:portal_enabled')->group(function () {
    Route::post('authorize', [\App\Http\Controllers\Api\PatientPortalController::class, 'authorizeAccess']);
    Route::get('summary', [\App\Http\Controllers\Api\PatientPortalController::class, 'getSummary']);
});

// Appointment Confirmation (Signed URL)
Route::get('appointments/{appointment}/confirm', [\App\Http\Controllers\Api\AppointmentConfirmationController::class, 'confirm'])
    ->name('appointments.confirm')
    ->middleware('signed');

// Pharmacy QR Verification (Public-Facing authenticity check)
Route::middleware('entitled:pharmacy_enabled')->get('verify/rx/{uuid}', [\App\Http\Controllers\Api\PharmacyVerificationController::class, 'verify'])
    ->name('prescriptions.verify');

Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('tenants', [\App\Http\Controllers\Api\TenantController::class, 'index'])->middleware(['auth:sanctum']);
Route::get('tenants/{tenant}', [\App\Http\Controllers\Api\TenantController::class, 'show'])->middleware(['auth:sanctum']);
Route::apiResource('tenants', \App\Http\Controllers\Api\TenantController::class)->only(['store', 'update', 'destroy'])->middleware(['auth:sanctum', 'role:ADMIN']);
Route::get('branches', [\App\Http\Controllers\Api\BranchController::class, 'index'])->middleware(['auth:sanctum', 'tenant_active', 'tenant_user']);
Route::apiResource('branches', \App\Http\Controllers\Api\BranchController::class)->except(['index'])->middleware(['auth:sanctum', 'tenant_active', 'tenant_user', 'role:ADMIN']);

Route::group(['middleware' => ['auth:sanctum', 'tenant_active', 'tenant_user', 'branch_user']], function () {
    Route::apiResource('patients', \App\Http\Controllers\Api\PatientController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK,DIAGNOSTIC_APPROVER');
    Route::apiResource('clinical-notes', \App\Http\Controllers\Api\ClinicalNoteController::class)->middleware('role:DOCTOR,ADMIN');
    Route::get('clinical-templates', [\App\Http\Controllers\Api\ClinicalTemplateController::class, 'index'])->middleware('role:DOCTOR,ADMIN');
    Route::get('patients/{patient}/history', [\App\Http\Controllers\Api\PatientHistoryController::class, 'show'])->middleware('role:DOCTOR,ADMIN,DIAGNOSTIC_APPROVER,FRONT_DESK');
    Route::middleware('entitled:pediatrics_enabled')->group(function () {
        Route::get('patients/{id}/pediatrics/growth', [\App\Http\Controllers\Api\PatientController::class, 'getGrowthHistory']);
        Route::post('patients/{id}/pediatrics/growth', [\App\Http\Controllers\Api\PatientController::class, 'storeGrowthRecord']);
        Route::get('patients/{id}/pediatrics/immunizations', [\App\Http\Controllers\Api\PatientController::class, 'getImmunizationHistory']);
        Route::post('patients/{id}/pediatrics/immunizations', [\App\Http\Controllers\Api\PatientController::class, 'storeImmunizationRecord']);
        Route::put('patients/{id}/pediatrics/immunizations/{recordId}', [\App\Http\Controllers\Api\PatientController::class, 'updateImmunizationRecord'])->middleware('role:DOCTOR');
        Route::post('patients/{id}/pediatrics/roadmap/enroll', [\App\Http\Controllers\Api\PatientController::class, 'enrollInCustomVaccine'])->middleware('role:DOCTOR');
        Route::delete('patients/{id}/pediatrics/roadmap/{vaccineName}', [\App\Http\Controllers\Api\PatientController::class, 'unenrollVaccine'])->middleware('role:DOCTOR');
        Route::get('pediatrics/vaccines/lookup', [\App\Http\Controllers\Api\PatientController::class, 'lookupVaccines']);
        Route::get('patients/{id}/pediatrics/overdue', [\App\Http\Controllers\Api\PatientController::class, 'getOverdueMilestones']);
        Route::get('pediatrics/standards', [\App\Http\Controllers\Api\PatientController::class, 'getStandards']);
        Route::get('patients/{id}/neonatal/summary', [\App\Http\Controllers\Api\PatientController::class, 'getNeonatalSummary']);
    });

    Route::get('orders/worklist', [\App\Http\Controllers\Api\OrderController::class, 'worklist'])->middleware('role:ADMIN,TECH,DIAGNOSTIC_APPROVER');
    Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class)->middleware('role:DOCTOR,ADMIN,TECH,DIAGNOSTIC_APPROVER');
    Route::apiResource('prescriptions', \App\Http\Controllers\Api\PrescriptionController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK');
    Route::apiResource('appointments', \App\Http\Controllers\Api\AppointmentController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK');
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class)->middleware('role:ADMIN,DOCTOR,TECH,FRONT_DESK,DIAGNOSTIC_APPROVER');
    Route::apiResource('medicines', \App\Http\Controllers\Api\MedicineController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK');
    Route::apiResource('notification-cadences', \App\Http\Controllers\Api\NotificationCadenceController::class)->middleware('role:ADMIN');
    Route::middleware('entitled:billing_enabled')->group(function () {
        Route::get('billing/invoices', [\App\Http\Controllers\Api\BillingController::class, 'index'])->middleware('role:ADMIN,FRONT_DESK');
        Route::post('billing/invoices', [\App\Http\Controllers\Api\BillingController::class, 'storeInvoice'])->middleware('role:ADMIN,FRONT_DESK');
        Route::get('billing/invoices/{id}', [\App\Http\Controllers\Api\BillingController::class, 'showInvoice'])->middleware('role:ADMIN,FRONT_DESK');
        Route::post('billing/payments', [\App\Http\Controllers\Api\BillingController::class, 'processPayment'])->middleware('role:ADMIN,FRONT_DESK');
    });
    Route::apiResource('referrals', \App\Http\Controllers\Api\ReferralController::class)->middleware('entitled:referrals_enabled');
    Route::put('referrals/{referral}/accept', [\App\Http\Controllers\Api\ReferralController::class, 'accept'])->middleware('entitled:referrals_enabled');
    Route::get('audit-logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index'])->middleware('role:ADMIN,DOCTOR');
    Route::middleware('entitled:telehealth_enabled')->group(function () {
        Route::get('messages', [\App\Http\Controllers\Api\MessageController::class, 'index']);
        Route::post('messages/groups', [\App\Http\Controllers\Api\MessageController::class, 'createGroup']);
        Route::get('messages/{conversation}', [\App\Http\Controllers\Api\MessageController::class, 'show']);
        Route::post('messages', [\App\Http\Controllers\Api\MessageController::class, 'store']);
    });
    Route::get('patients/{patient}/attachments', [\App\Http\Controllers\Api\AttachmentController::class, 'index'])->middleware('role:DOCTOR,ADMIN,TECH,DIAGNOSTIC_APPROVER');
    Route::post('attachments', [\App\Http\Controllers\Api\AttachmentController::class, 'store'])->middleware('role:DOCTOR,ADMIN,TECH');
    Route::get('attachments/{id}/download', [\App\Http\Controllers\Api\AttachmentController::class, 'download'])->middleware('role:DOCTOR,ADMIN,TECH');
    Route::delete('attachments/{id}', [\App\Http\Controllers\Api\AttachmentController::class, 'destroy'])->middleware('role:DOCTOR,ADMIN,TECH');
    Route::apiResource('vitals', \App\Http\Controllers\Api\VitalController::class)->middleware('role:DOCTOR,ADMIN,FRONT_DESK,TECH');
    Route::get('patients/{patient}/vitals', [\App\Http\Controllers\Api\VitalController::class, 'index'])->middleware('role:DOCTOR,ADMIN,FRONT_DESK,TECH');
    Route::post('patients/{patient}/vitals', [\App\Http\Controllers\Api\VitalController::class, 'store'])->middleware('role:DOCTOR,ADMIN,FRONT_DESK,TECH');
    Route::get('patients/{patient}/vitals/latest', [\App\Http\Controllers\Api\VitalController::class, 'latest'])->middleware('role:DOCTOR,ADMIN,FRONT_DESK,TECH');

    // Terminology Governance
    Route::group(['prefix' => 'admin/terminology', 'middleware' => 'role:ADMIN'], function () {
        Route::get('disease-terms', [\App\Http\Controllers\Api\Admin\TerminologyController::class, 'index']);
        Route::get('diseases/search', [\App\Http\Controllers\Api\Admin\TerminologyController::class, 'diseases']);
        Route::patch('disease-terms/{id}', [\App\Http\Controllers\Api\Admin\TerminologyController::class, 'update']);
    });

    // Referral Network (External Providers)
    Route::get('/external-providers/search', [App\Http\Controllers\ExternalProviderController::class, 'search']);
    Route::post('/external-providers/refer', [App\Http\Controllers\ExternalProviderController::class, 'refer']);

    // HL7 Outbox Monitoring
    Route::group(['prefix' => 'admin/hl7', 'middleware' => 'role:ADMIN'], function () {
        Route::get('outbox', [\App\Http\Controllers\Api\HL7OutboxController::class, 'index']);
        Route::post('outbox/{message}/retry', [\App\Http\Controllers\Api\HL7OutboxController::class, 'retry']);
        Route::post('outbox/process', [\App\Http\Controllers\Api\HL7OutboxController::class, 'process']);
    });
    // Pharmacy & Dispensing
    Route::middleware('entitled:pharmacy_enabled')->group(function () {
        Route::get('pharmacy/worklist', [\App\Http\Controllers\Api\PharmacyController::class, 'worklist'])->middleware('role:ADMIN,TECH,DOCTOR');
        Route::post('pharmacy/dispense/{id}', [\App\Http\Controllers\Api\PharmacyController::class, 'dispense'])->middleware('role:ADMIN,TECH,DOCTOR');
        Route::post('prescriptions/{uuid}/dispense', [\App\Http\Controllers\Api\PharmacyVerificationController::class, 'dispense'])->middleware('role:ADMIN,TECH');
    });

    // Workforce Management
    Route::middleware('entitled:workforce_enabled')->group(function () {
        Route::apiResource('staff-schedules', \App\Http\Controllers\Api\StaffScheduleController::class)->middleware('role:ADMIN');
    });

    // Inventory Management
    Route::middleware('entitled:inventory_enabled')->group(function () {
        // Route::apiResource('inventory-items', \App\Http\Controllers\Api\InventoryController::class);
        // Note: Stocks are sub-resources or separate endpoints managed by controller
    });

    // Offline Sync Endpoints
    Route::middleware('entitled:offline_sync_enabled')->group(function () {
        Route::get('sync/pull', [\App\Http\Controllers\Api\SyncController::class, 'pull']);
        Route::post('sync/push', [\App\Http\Controllers\Api\SyncController::class, 'push']);
    });

    // Safety Governance
    Route::get('safety/status/{patientId}', [\App\Http\Controllers\Api\SafetyAcknowledgmentController::class, 'checkSafetyStatus']);
    Route::post('safety/vitals/{vital}/acknowledge', [\App\Http\Controllers\Api\SafetyAcknowledgmentController::class, 'acknowledgeVital']);
    Route::post('safety/results/{result}/acknowledge', [\App\Http\Controllers\Api\SafetyAcknowledgmentController::class, 'acknowledgeResult']);

    // Terminology Catalog & Discovery
    Route::get('diseases', [\App\Http\Controllers\Api\DiseaseController::class, 'index']);
    Route::get('diseases/{id}', [\App\Http\Controllers\Api\DiseaseController::class, 'show']);
    Route::get('diseases/{id}/medicines', [\App\Http\Controllers\Api\DiseaseController::class, 'medicines']);
    Route::get('discovery/search', [\App\Http\Controllers\Api\DiscoverySearchController::class, 'search']);


    
    // Broadcast Authorization for Multi-Tenant context

    Broadcast::routes(['middleware' => ['auth:sanctum', 'tenant_user']]);
});

// Reporting Endpoints (Tenant-wide visibility, bypassing branch-isolation)
Route::group(['middleware' => ['auth:sanctum', 'tenant_active', 'tenant_user', 'entitled:analytics_enabled']], function () {
    Route::get('reports/dashboard', [\App\Http\Controllers\Api\ReportController::class, 'dashboard'])->middleware('role:ADMIN,FRONT_DESK,DOCTOR,DIAGNOSTIC_APPROVER');
    Route::get('reports/benchmarking', [\App\Http\Controllers\Api\ReportController::class, 'benchmarking'])->middleware('role:ADMIN,FRONT_DESK,DOCTOR,DIAGNOSTIC_APPROVER');
    Route::get('reports/clinical-outcomes', [\App\Http\Controllers\Api\ReportController::class, 'getClinicalOutcomes'])->middleware('role:ADMIN,DOCTOR,DIAGNOSTIC_APPROVER');
    Route::get('reports/finance/sales-journal', [\App\Http\Controllers\Api\FinanceReportController::class, 'getSalesJournal'])->middleware('role:ADMIN,FRONT_DESK');
});

Route::post('hl7/ingest', [\App\Http\Controllers\Api\HL7Controller::class, 'store']);

// ---------------------------------------------------------------------------
// EMPI Hardware Sync
// Public endpoint: hardware devices submit transactions without user sessions.
// Admin endpoints: manage terminal registration.
// ---------------------------------------------------------------------------
Route::prefix('empi')->middleware('entitled:empi_enabled')->group(function () {
    Route::post('sync/submit', [\App\Http\Controllers\Api\EMPISyncController::class, 'submit']);

    Route::middleware(['auth:sanctum', 'tenant_active', 'tenant_user'])->group(function () {
        Route::get('hardware', [\App\Http\Controllers\Api\EMPISyncController::class, 'listHardware'])
            ->middleware('role:ADMIN');
        Route::post('hardware/register', [\App\Http\Controllers\Api\EMPISyncController::class, 'registerHardware'])
            ->middleware('role:ADMIN');
    });
});

// ---------------------------------------------------------------------------
// RIS/PACS (Imaging) & Super Admin
// ---------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'tenant_active', 'tenant_user'])->group(function () {
    Route::middleware('entitled:pacs_enabled')->prefix('imaging')->group(function () {
        Route::get('patients/{patientId}', [\App\Http\Controllers\Api\ImagingController::class, 'patientStudies']);
        Route::get('instances/{instanceId}', [\App\Http\Controllers\Api\ImagingController::class, 'showInstance']);
        Route::post('upload', [\App\Http\Controllers\Api\ImagingController::class, 'store']);
        Route::post('studies/{studyId}/report', [\App\Http\Controllers\Api\ImagingController::class, 'submitReport'])->middleware('role:DOCTOR,DIAGNOSTIC_APPROVER');
        Route::post('studies/{studyId}/finalize', [\App\Http\Controllers\Api\ImagingController::class, 'finalizeStudy'])->middleware('role:DOCTOR,DIAGNOSTIC_APPROVER');
    });
});

// Platform Command Center (SuperAdmin Only)
// Decoupled from tenant isolation middleware to ensure global visibility
Route::middleware(['auth:sanctum', 'global_admin'])->prefix('sa')->group(function () {
    Route::get('tenants', [\App\Http\Controllers\Api\SuperAdminController::class, 'listTenants']);
    Route::patch('tenants/{tenantId}/plan', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateCommercialPlan']);
    Route::post('tenants/{tenantId}/impersonate', [\App\Http\Controllers\Api\SuperAdminController::class, 'impersonate']);
});
