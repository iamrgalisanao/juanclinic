# System Architecture (Multi‑Tenant HIS)

**Date:** 2026-03-02  
**Stack:** React (Vite) + Laravel 11 (PHP 8.2) + MySQL + Reverb (WS)  
**Tenancy Model:** Shared database, tenant-scoped rows (global Eloquent scope)

## 1) Purpose & Scope
This document describes the *implemented* architecture in this repository and how it aligns with the Layered A.N.T. approach defined in [gemini.md](../gemini.md):

- **Layer 1 (SOP / Policy):** `architecture/` operational definitions
- **Layer 2 (Navigation / Routing):** decision + context resolution (tenant/user)
- **Layer 3 (Deterministic Tools):** `tools/` scripts for schema validation and data generation

It focuses on: tenant isolation, RBAC, audit logging, HL7 ingestion, and the core patient/order workflows.

## 2) High-Level Component View

```mermaid
flowchart LR
  subgraph UI[Frontend: React SPA]
    A[Clinician / Staff UI]
  end

  subgraph API[Backend: Laravel API]
    MW1[DevAuthentication (local only)]
    MW2[ResolveTenant]
    RBAC[Role Middleware + Policies]
    CTL[API Controllers]
    SVC[Domain Services (e.g., HL7Processor)]
    AUD[AuditLog + model hooks]
  end

  subgraph DATA[Data]
    DB[(MySQL)]
  end

  subgraph RT[Realtime]
    RV[Laravel Reverb]
  end

  A -->|HTTP/JSON
X-Tenant-ID
X-Simulated-User (local)| MW1 --> MW2 --> RBAC --> CTL --> SVC --> DB
  CTL --> AUD --> DB
  A <-->|WS: Echo private channels| RV
  RV <-->|broadcast auth| API
```

## 3) Runtime Context: Authentication, Tenant Resolution, Authorization

### 3.1 Authentication (Current)
- **Local dev bypass**: `DevAuthentication` reads `X-Simulated-User` and force-auths a matching user (by id or email).
- **Production intent**: `auth:sanctum` is present on some routes, but local bypass effectively simulates authenticated requests.

**Implication:** Auth in this repo is currently *dev-oriented*; the architecture assumes you will replace/disable simulated auth outside `APP_ENV=local`.

### 3.2 Tenant Resolution
- `ResolveTenant` sets the tenant context from `X-Tenant-ID` (or session) and binds `app('tenant')`.
- `TenantScope` and `BelongsToTenant` enforce tenant scoping across models.

**Primary invariant:** once tenant context is set, all data access should be scoped to `tenant_id`.

### 3.3 RBAC
RBAC is enforced at multiple layers:
- **Route middleware**: `role:DOCTOR,ADMIN,...` gates endpoints.
- **Policies**: controllers call `$this->authorize(...)` for many operations.
- **Tenant membership**: `tenant_user` middleware blocks cross-tenant access unless the user is a global admin.

## 4) Data Model & Isolation Mechanics

### 4.1 Tenant-Scoped Entities (Implemented)
- `patients` (`tenant_id`, demographics, external id, metadata)
- `orders` (`tenant_id`, `patient_id`, order fields, result attribution)
- `audit_logs` (`tenant_id`, `user_id`, event, old/new values)

### 4.2 Isolation Enforcement Points
- **Global query scope:** `TenantScope` adds `where tenant_id = <active tenant>`.
- **Write attribution:** `BelongsToTenant` sets `tenant_id` on create from the active tenant.
- **API membership check:** `EnsureUserBelongsToTenant` validates user ↔ tenant alignment.

**Global admin behavior:** `ADMIN` users with `tenant_id == null` bypass tenant_user checks; however, row scoping still applies unless the tenant context is explicitly set.

## 5) Core Flows

### 5.1 Patient Registration
1. React calls `POST /api/patients` with `X-Tenant-ID` and simulated user header (local).
2. Laravel resolves tenant and user.
3. `role` + policy checks authorize creation.
4. `Patient::create(...)` triggers:
   - `BelongsToTenant` → sets `tenant_id`
   - `AuditLogTrait` → writes an audit entry

### 5.2 Order Lifecycle (Worklist)
**Create**
- `POST /api/orders` creates a pending order for an existing patient.

**Worklist**
- `GET /api/orders/worklist` filters based on role:
  - `TECH`: `PENDING|IN_PROGRESS`
  - `DIAGNOSTIC_APPROVER`: `PRELIMINARY`
  - `ADMIN`: all

**Update + Sign-off Attribution**
- `PUT /api/orders/{id}` supports status + result updates.
- On transition:
  - `PRELIMINARY` → sets `performed_by/performed_at`
  - `COMPLETED` → sets `approved_by/approved_at`
- Updates are audited via `AuditLogTrait`.

### 5.3 HL7 Ingestion (Current Implementation)
- React (or integrator) calls `POST /api/hl7/ingest` with `{ hl7_message }`.
- The controller passes the resolved tenant id to `HL7Processor`.
- `HL7Processor` does basic segment parsing and creates an `Order` + an `AuditLog` event `HL7_IMPORT`.

**Important gap vs SOP:** the SOP expects tenant resolution from HL7 `MSH-4` (Sending Facility) with validation levels; current implementation relies on `X-Tenant-ID` and uses only minimal parsing.

### 5.4 Messaging / Realtime
- Frontend uses Laravel Echo configured for **Reverb**.
- Private channel authorization runs through `/broadcasting/auth` and uses the same dev-auth header in local.
- Channel rules ensure only conversation participants can subscribe.

## 6) Deterministic Tools Layer (Python)
The `tools/` folder provides deterministic scripts that align with the project constitution:
- `tools/schema_validator.py`: JSONSchema validation for Patient/Order payloads (Mode-like levels)
- `tools/hl7_generator.py`: generates sample HL7 ORU-like messages for testing

These tools are intended to be invoked by the “Navigation” layer (see `central_navigator.py`) to validate inputs and generate repeatable test artifacts.

## 7) Environment & Local Dev Assumptions
- Backend API base (frontend): `http://localhost:8001/api`
- Frontend dev server: Vite default (`npm run dev`)
- Tenant context: `X-Tenant-ID` header (set by frontend via `setTenantToken`)
- Local auth: `X-Simulated-User` header (set by frontend via `setSimulatedUser`)

## 8) Known Gaps / Risks (Current State)
- **HL7 tenant mapping** is not implemented (facility → tenant).
- **HL7 ingest endpoint** is not protected by `tenant_user` or `auth:sanctum` (may be correct for integration, but needs compensating controls like IP allowlist + facility keys).
- **Tenant API** is currently exposed without auth (suitable for dev; not for production).
- **Some status naming mismatches** likely exist between UI and backend (verify UI status constants vs API validation).

## 9) Next-Step Architecture Checklist
1. Implement facility→tenant mapping + validation levels for HL7 (Mode 0→3).
2. Define production auth strategy (Sanctum tokens or SSO) and disable `DevAuthentication` outside local.
3. Formalize shared-staff “worklist scoped access” (data model + middleware/policy) to match SOP.
4. Add idempotency + replay protection for HL7 (store MSH-10 control id per tenant).
5. Add audit completeness review (who/when/what for clinical actions and exports).
