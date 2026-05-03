# Implementation Plan: Lab/Rad Feature Gating (v1)

**Date**: 2026-05-01  
**Phase**: 15 (Commercial Orchestration)  
**Status**: DRAFT - Pending Approval

## 1. Overview
This plan implements granular feature gating for **Laboratory** and **Radiology** modules. By extending the commercial orchestration matrix, we ensure that diagnostic order functionality is restricted to tenants with active subscriptions for these specific service lines.

### Industry Standards Alignment
- **Centrally Managed Configuration**: Feature flags are stored in the `tenants` table and evaluated via the `EntitlementService`.
- **Entitlement vs. Release**: These are permanent Entitlement flags (subscription-based), not temporary release flags.
- **Graceful Degradation**: The UI will conditionally hide premium ordering options to maintain a clean UX for basic-tier tenants.

## 2. Technical Specification

### 2.1 Backend (Laravel)

#### [MODIFY] [Tenant.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Models/Tenant.php)
- Add `laboratory_enabled` and `radiology_enabled` to `$fillable`.
- Add to `$casts` as `boolean`.

#### [NEW] [Migration](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/database/migrations/2026_05_01_120000_add_lab_rad_gating_to_tenants.php)
- Column: `laboratory_enabled` (bool, default false)
- Column: `radiology_enabled` (bool, default false)
- Placement: After `pacs_enabled`.

#### [NEW] [Middleware](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Http/Middleware/EnsureFeatureIsEnabled.php)
- A generic middleware to check feature entitlements before allowing API access.
```php
public function handle($request, Closure $next, $feature) {
    if (!app(EntitlementService::class)->hasFeature($feature)) {
        return response()->json(['message' => "Module '{$feature}' is not enabled for this tenant."], 403);
    }
    return $next($request);
}
```

#### [MODIFY] [api.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/routes/api.php)
- Apply `feature:laboratory_enabled` to Lab order endpoints.
- Apply `feature:radiology_enabled` to Radiology order endpoints.

### 2.2 Frontend (React)

#### [MODIFY] [SuperAdminDashboard.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/views/admin/SuperAdminDashboard.jsx)
- **Feature Matrix**: Add `laboratory_enabled` ("Laboratory System") and `radiology_enabled` ("Radiology Suite").
- **Orchestration Logic**: Update `handleSavePlan` to include new toggles.

#### [MODIFY] [PatientProfile.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/PatientProfile.jsx)
- Gate "Diagnostic Order (LAB)" item in "New Order" menu.
- Gate "Diagnostic Order (RAD)" item in "New Order" menu.

## 3. Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **PACS vs Radiology confusion** | Medium | Maintain `pacs_enabled` for imaging viewing and `radiology_enabled` for ordering. |
| **System Admin Lockout** | High | `EntitlementService` already includes a bypass for Tenant 888 (System Root). |
| **Performance Overhead** | Low | `EntitlementService` uses Laravel Cache with a 1-hour TTL. |

## 4. Verification Plan

### 4.1 Automated Tests
- **Unit Test**: `TenantTest` to verify attribute casting.
- **Integration Test**: `FeatureGatingTest` to verify middleware rejects unauthorized requests.

### 4.2 Manual Verification
1. **Global Admin**: Login as `root@juanclinic.com`, navigate to Command Center.
2. **Toggle**: Enable "Laboratory System" for a test tenant.
3. **Verify UI**: Impersonate tenant, go to Patient Profile -> New Order. Verify "LAB" is visible.
4. **Disable**: Disable "Laboratory System" and verify the button disappears.

## 5. Self-Audit (Architect Standard)
- [x] Context Updated (`03-current-focus.md`)
- [x] Guardrail Audit Performed (`guardrail-health-summary.md`)
- [x] Plan Saved to `docs/plans/`
- [x] Naming Convention Followed
