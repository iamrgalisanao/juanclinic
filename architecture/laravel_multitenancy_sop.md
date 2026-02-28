# SOP: Laravel Multi-Tenancy Implementation

## 1. Objective
Ensure logical isolation between multiple clinics (tenants) while supporting shared staff workflows.

## 2. Tenancy Principles
- **Clinic = Tenant:** Primary data owner.
- **Shared Staff:** Users (Lab/Rad Techs) can belong to multiple tenants but access data ONLY through active worklists.
- **Global Scopes:** All reads/writes MUST be scoped by `tenant_id`.

## 3. Enforcement Modes
- **Mode 0-1:** Scoped queries, foreign key constraints, session-based resolution.
- **Mode 2-3:** Composite uniqueness (`tenant_id + mrn`), Row-Level Security (RLS) prep, per-tenant encryption keys.

## 4. Implementation Steps
- **Model Trait:** `BelongsToTenant` trait applying `TenantScope` globally.
- **Middleware:** Resolve `tenant_id` from JWT or session early in the request lifecycle.
- **Shared Access:** For techs, use `worklist_id` to provide temporary, scoped access to specific records without broad tenant browsing.

## 5. Super Admin & "Break-Glass"
- Cross-tenant access requires explicit justification and is logged with high-severity markers.
