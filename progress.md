# Progress Log

**Last verified:** 2026-03-03

This file tracks what is *implemented in code* (not just planned).

## 🟢 Protocol 0: Initialization
- [x] Directory structure created.
- [x] Memory files initialized (`progress.md`, `task_plan.md`, `findings.md`).
- [x] Core architecture docs + SOPs created under `architecture/`.

## ⚡ Phase 2: L - Link (Connectivity)
- [x] Laravel `.env` verification helper exists (`tools/verify_laravel_env.py`).
- [x] Frontend ↔ backend connectivity via tenant + simulated user headers.

## ⚙️ Phase 3: A - Architect (Implemented Runtime Architecture)

### Layer 1 (SOP / Policy)
- [x] System architecture and SOPs written (`architecture/system_architecture.md`, `architecture/*_sop.md`).

### Layer 2 (Navigation / Context Resolution)
- [x] Tenant resolution from `X-Tenant-ID` header (`ResolveTenant` middleware).
- [x] Dev-only auth bypass via `X-Simulated-User` header (`DevAuthentication` middleware).
- [x] Tenant membership guard (`EnsureUserBelongsToTenant` middleware).

### Layer 3 (Deterministic Tools)
- [x] Schema validator scaffold (`tools/schema_validator.py`).
- [x] HL7 sample generator (`tools/hl7_generator.py`).
- [x] Tenant config seeder (`tools/tenant_config_seeder.py`).
- [x] Sample dataset generator (`tools/generate_sample_dataset.py`).

## 🔐 Security: Multi-Tenant Isolation + RBAC + Audit Logging

### Multi-Tenant Isolation
- [x] Global tenant query scope applied (`TenantScope`).
- [x] Automatic `tenant_id` attribution on creates (`BelongsToTenant`).

### RBAC
- [x] Route role gates via `role:` middleware.
- [x] Fine-grained access via Laravel Policies (`PatientPolicy`, `OrderPolicy`).

### Audit Logging
- [x] `AuditLog` model + migrations exist.
- [x] Automatic auditing on create/update/delete for `Patient` and `Order` via `AuditLogTrait`.
- [x] HL7 import writes an explicit audit event (`HL7_IMPORT`).
- [/] Coverage is partial: auditing is not consistently applied across all models/endpoints (e.g., appointments/messages are not uniformly audited).

## 🧪 Clinical Workflows (API)
- [x] Tenants API (basic create/list).
- [x] Patients API (CRUD).
- [x] Orders API (CRUD).
- [x] Worklist endpoint filtered by role (`TECH`, `DIAGNOSTIC_APPROVER`, `ADMIN`).
- [x] Status transition attribution on orders:
	- `PRELIMINARY` sets `performed_by/performed_at`
	- `COMPLETED` sets `approved_by/approved_at`
- [x] HL7 ingest endpoint implemented with minimal parsing to create orders.

## 📁 EMR (Longitudinal)
- [x] Patient history endpoint returns orders + appointments for timeline.
- [x] Patient profile view in the React SPA includes timeline + result viewer.

## ✨ UI (Frontend)
- [x] React/Vite SPA present and wired to backend APIs.
- [x] Tenant + simulated user selection via headers.
- [x] Clinical Worklist UI:
	- Tech: structured JSON result entry
	- Approver: review + approve/reject
- [x] Messaging UI with realtime updates (Echo/Reverb private channels).
- [x] Static dashboard mockup exists (`mockup/dashboard_v1.html`).

## ✅ Data Model (Migrations)
- [x] Core tables: `tenants`, `patients`, `orders`, `audit_logs`.
- [x] Orders result + sign-off fields added via migration.
- [x] Messaging tables: `conversations`, `messages`, pivot `conversation_user`.

## ⚠️ Known Gaps / Rough Edges (Tracked)
- [x] Order approval UI uses status `FINAL` but backend expects `COMPLETED` (now aligned).
- [x] Python schema validator + dataset generator had minor import/runtime issues (now fixed and passing `--test`).
- [ ] Tenant ID type inconsistency: `appointments.tenant_id` uses `uuid` while `tenants.id` is bigint.
- [x] HL7 tenancy validation was minimal; processor now parses MSH and applies basic message-type validation using tenant-specific levels.

## ▶️ Next Practical Steps
- [ ] Align frontend approval statuses with backend order status enum.
- [ ] Fix/finish the Python validation tools so they run cleanly (`--test` path included).
- [ ] Normalize tenant ID types across all tables (especially appointments) and confirm scoping works.
- [ ] Expand audit logging coverage (decide which models/events must be auditable).
