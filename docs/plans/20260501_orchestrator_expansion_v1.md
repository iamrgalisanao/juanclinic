# Implementation Plan: Orchestrator Expansion (v1)

## Goal
Expand the **Commercial Orchestrator** framework to support the full range of enterprise modules identified in the `table-tier-comparison.md`. This plan involves adding new technical gates, categorized UI controls, and hardened backend validation.

## User Review Required
> [!IMPORTANT]
> This expansion adds 9 new boolean columns to the `tenants` table. While additive and safe, it significantly increases the granularity of the orchestration form. I have proposed **Categorization** in the UI to maintain usability.

## Proposed Changes

### 1. Database Layer (Migration)
#### [NEW] `2026_05_01_225000_expand_tenant_commercial_gates.php`
Add the following columns to the `tenants` table:
- `billing_enabled`: BIR-compliant invoicing and payments.
- `portal_enabled`: Public-facing Patient Portal access.
- `empi_enabled`: Enterprise Master Patient Index hardware sync.
- `telehealth_enabled`: Secure messaging and remote care.
- `analytics_enabled`: Advanced benchmarking and management reports.
- `offline_sync_enabled`: Desktop client data synchronization.
- `referrals_enabled`: Inter-facility referral network connectivity.
- `queue_enabled`: Digital queue and waiting area management.
- `claims_enabled`: PhilHealth/eClaims regulatory integration.

### 2. Backend Layer
#### [MODIFY] `app/Models/Tenant.php`
- Add all new boolean fields to `$fillable`.
- Add all new boolean fields to `$casts` as `boolean`.

#### [MODIFY] `app/Http/Controllers/Api/SuperAdminController.php`
- Update `updateCommercialPlan` validation rules to include new fields.
- Expand the `clearCache` loop to invalidate all new entitlement keys.

#### [MODIFY] `app/Services/EntitlementService.php`
- Update `clearCache` defaults to include common enterprise gates.

### 3. Frontend Layer
#### [MODIFY] `src/views/admin/SuperAdminDashboard.jsx`
- Refactor the orchestration modal to use **Categorized Feature Toggles**:
    - **Clinical Specialties**: Lab, Rad, PACS, Pediatrics.
    - **Operations**: Billing, Inventory, Pharmacy, Workforce, Queue.
    - **Patient Engagement**: SMS, Email, Portal, Telehealth.
    - **Enterprise Connectivity**: EMPI, Offline Sync, Referrals, eClaims.

### 4. Seeding
#### [MODIFY] `database/seeders/SystemTenantSeeder.php`
- Update System Root (888) to enable all 9 new features by default.

## Verification Plan

### Automated Tests
- `php artisan migrate`: Verify column addition.
- `php artisan db:seed --class=SystemTenantSeeder`: Verify root tenant entitlements.
- Integration test for `EntitlementService` to confirm new gates are readable and cached.

### Manual Verification
- **SuperAdmin UI Audit**: Verify that the new categorized matrix renders correctly and saves all 18+ feature states.
- **Gate Testing**: Verify that disabling `billing_enabled` restricts access to `/billing` routes via the `EnsureFeatureIsEnabled` middleware.
