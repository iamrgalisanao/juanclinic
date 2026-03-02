# SOP Upgrade Pack (Right-Sized for Multi-Clinic, Same-Building Multi-Tenancy)
**Version:** 2.1 (Configurable / “Dial-up as you grow”)  
**Applies to:** Multi-tenant HIS with shared building services (Lab/Rad Tech, shared front desk)  
**Goal:** Keep enterprise-grade *principles* (isolation, auditability, safety) while allowing **dynamic admin settings** to progressively enforce controls.

---

## 0) Guiding Principle: “Enterprise Controls, Progressive Enforcement”
We implement the full framework, but controls can be **enabled per-tenant** or **per-building** using admin settings.  
This prevents over-engineering early while keeping you compliant-ready.

### Control Modes (Admin Config)
- **Mode 0 — MVP:** Basic validation + audit + tenant scoping
- **Mode 1 — Standard Clinic:** Stronger validation, idempotency, structured logs
- **Mode 2 — Accreditation-Ready:** ISO 15189-style traceability, immutable audit, queue/DLQ
- **Mode 3 — Enterprise/SaaS:** Per-tenant keys, WORM logs, SIEM, advanced conformance profiles

---

# SOP 1 — HL7 v2 Integration (ORU/ORM) — Enterprise Pattern, Configurable Enforcement

## 1. Objective
Implement a deterministic, secure, tenant-isolated HL7 pipeline for lab/radiology orders and results with reliable processing and auditable traceability.

## 2. Scope
- **Inbound:** ORU/ORM (results/orders), optional ADT for demographics
- **Transport:** MLLP (preferred), HTTPS API (secondary)
- **Tenancy:** Map HL7 facility/app identifiers to a single `tenant_id`

## 3. Message Flow (Standard)
1. **Ingress** (Receive HL7)
2. **Tenant Resolution** (Map to tenant)
3. **Validation** (Conformance checks)
4. **Queue** (Async processing)
5. **Parsing & Mapping** (PID/OBR/OBX mapping)
6. **Persistence** (DB write with tenant enforcement)
7. **Outbound Acknowledgement** (ACK/NACK)
8. **Audit Trail** (Immutable/logged lifecycle)

## 4. Tenant Mapping Rules
- Each `SendingFacility` (MSH-4) **must** map to exactly one tenant
- Unknown/mismatched facility **must** be rejected
- Tenant mapping changes must be admin-controlled and logged

**Admin Settings**
- `hl7.tenant_mapping.strict = true|false`  
  - **true:** reject unknown facilities (recommended)
  - **false:** route to quarantine queue (MVP onboarding)

## 5. Validation & Conformance (Configurable)
**Minimum (Mode 0)**
- Validate MSH exists
- Validate MSH-4 matches tenant mapping
- Validate message type (MSH-9)
- Validate Message Control ID exists (MSH-10)

**Standard (Mode 1)**
- Validate required segments/fields:
  - PID-3 (patient identifier)
  - OBR-4 (service/test code)
  - OBX-3 (observation identifier)
  - OBX-11 (result status)
- Reject unsupported HL7 versions unless allowed

**Accreditation/Enterprise (Mode 2–3)**
- Enforce message idempotency per tenant (MSH-10 uniqueness)
- Detect replay/duplicates
- Validate code systems (e.g., LOINC mapping rules)

**Admin Settings**
- `hl7.validation.level = minimal|standard|strict`
- `hl7.supported_versions = ["2.3","2.4","2.5.1"]`
- `hl7.idempotency.enabled = true|false`

## 6. Error Handling (ACK/NACK)
- Always return appropriate HL7 ACK:
  - **AA:** accepted
  - **AE/AR:** error/rejected with reason
- Errors should include:
  - correlation_id
  - tenant_id (if resolved)
  - failure_code

**Admin Settings**
- `hl7.ack.mode = sync|async`
- `hl7.rejection.policy = reject|quarantine`

## 7. Queue + DLQ Requirements (Highly Recommended)
- Ingest to queue immediately (non-blocking)
- Retry with exponential backoff
- DLQ for repeated failures
- Reprocess tools for admin

**Admin Settings**
- `hl7.queue.enabled = true|false`
- `hl7.retry.max_attempts = N`
- `hl7.dlq.enabled = true|false`

## 8. Audit & Security
**Minimum**
- Log raw message (redacted if necessary)
- Store timestamp + tenant + control ID + status

**Enterprise**
- Immutable storage for raw HL7 payloads (WORM object store)
- SHA-256 hash to detect tampering
- Alerting for repeated invalid facility attempts

**Admin Settings**
- `audit.hl7.store_raw = true|false`
- `audit.hl7.immutable = true|false`
- `security.hl7.ip_whitelist = [...]`
- `security.hl7.rate_limit = {per_tenant, per_ip}`

---

# SOP 2 — Laravel Multi-Tenancy (Healthcare-Grade, Progressive Hardening)

## 1. Objective
Ensure strict logical isolation between multiple clinics (tenants) within one application instance while supporting shared staff workflows safely.

## 2. Tenancy Model
- **Each clinic = Tenant**
- Shared roles (lab/rad tech, receptionist) may be members of multiple tenants
- Access must occur via **worklists and explicit tenant context**, not broad cross-tenant browsing

## 3. Core Rules (Always On)
1. All tenant-scoped tables must include `tenant_id`
2. All reads/writes must be filtered/scoped by tenant at application level
3. Tenant resolution must occur early (middleware)
4. Every PHI mutation must be audited

## 4. Tenant Resolution (Recommended)
Preferred sources (in order):
- Auth token claims (OIDC/JWT)
- Verified subdomain / domain mapping
- Explicit tenant selection UI (for multi-tenant staff)

**Admin Settings**
- `tenancy.resolution.mode = token|domain|user-select`
- `tenancy.user_multi_tenant.enabled = true|false`

## 5. Application Layer Enforcement
- Global scope applied to all tenant models
- Server-side injection of tenant_id
- Prevent `tenant_id` mass assignment

**Admin Settings**
- `tenancy.enforce_global_scope = true|false` (should stay true)
- `tenancy.allow_super_admin_bypass = true|false`

## 6. Database Layer Hardening (Enable as you grow)
**Mode 0–1**
- Index `tenant_id`
- Foreign keys to `tenants`

**Mode 2–3**
- Composite uniqueness rules (e.g., `tenant_id + mrn`)
- Composite indexes (`tenant_id, id`)
- Optional row-level security if migrating to Postgres

**Admin Settings**
- `tenancy.db.enforcement = basic|strong|rls`

## 7. Super Admin & Break-Glass
Cross-tenant actions should require:
- explicit elevation
- justification
- time-bound session
- high-severity audit log

**Admin Settings**
- `security.break_glass.enabled = true|false`
- `security.break_glass.duration_minutes = N`
- `security.break_glass.require_reason = true|false`

## 8. Background Jobs & Scheduled Tasks
- Jobs must carry tenant context
- Validate tenant existence at execution time
- Fail closed on mismatch

**Admin Settings**
- `jobs.tenant_context.required = true|false`

## 9. Encryption (Progressive)
**Mode 0–1**
- TLS in transit
- DB encryption at rest (infra-level)

**Mode 2–3**
- Per-tenant encryption keys for sensitive fields
- KMS/HSM integration

**Admin Settings**
- `crypto.per_tenant_keys.enabled = true|false`

## 10. Backup/Restore
- Tenant-scoped export and restore capability
- Avoid cross-tenant restore risks

**Admin Settings**
- `backup.tenant_scoped.enabled = true|false`

---

# SOP 3 — Patient Registration & Order Workflow (Clinical Grade, Multi-Tenant Building)

## 1. Objective
Provide a deterministic, safe patient registration and clinical order workflow that prevents duplication, supports shared-staff scenarios, and ensures auditability.

## 2. Patient Identity Strategy (Configurable)
You must choose one of these modes (admin setting):

### Option A — Per-Tenant Patient Identity (Strictest)
- Same person may exist separately in different tenants
- Simplest isolation model
- Harder for shared building record continuity

### Option B — Building-Wide Master Patient Index (Recommended if shared building)
- One patient identity shared across tenants
- Clinical records still tenant-scoped
- Requires consent and stricter access controls

**Admin Settings**
- `patient.identity.mode = per_tenant|building_mpi`

## 3. Patient Matching (EMPI) Controls
**Mode 0**
- Match by: patient_id or phone/email within tenant

**Mode 1**
- Match by: name + DOB + contact
- Warning prompts for likely duplicates

**Mode 2–3**
- Probabilistic matching scoring
- Duplicate review queue
- Merge workflow with audit

**Admin Settings**
- `patient.matching.level = minimal|standard|empi`
- `patient.merge.enabled = true|false`

## 4. Registration Workflow
1. Validate request schema
2. Resolve tenant context
3. Perform patient match
4. Create/update patient
5. Create audit event
6. Return patient identifier(s)

**Do-Not Rules**
- Do not partially persist patient on validation failure
- Do not allow cross-tenant patient search unless MPI is enabled and consent allows

## 5. Order Workflow (LAB / RAD)
1. Validate provider identity and role
2. Validate test/service availability per tenant
3. Validate consent (if required)
4. Create order with tenant ownership
5. Route to:
   - LIS worklist (lab)
   - RIS worklist (radiology)
6. Optionally generate HL7 message for external systems
7. Audit all steps

**Admin Settings**
- `orders.require_provider_validation = true|false`
- `orders.require_consent = true|false`
- `orders.hl7.outbound.enabled = true|false`

## 6. Shared Lab/Rad Tech Access (Worklist-Only Pattern)
Shared staff may access multiple tenants, but only through:
- assigned worklists
- explicit order context
- least-privilege patient identifiers

**Do-Not Rules**
- Lab/Rad tech must not browse full patient lists across tenants
- Access must be traceable and reviewable

**Admin Settings**
- `shared_staff.worklist_only = true|false` (should be true)
- `shared_staff.minimal_phi_view = true|false`

## 7. Results Lifecycle + Safety Controls
Result states:
- Preliminary → Final → Amended/Corrected

Critical result workflow:
- immediate notification
- acknowledgement required
- escalation path

**Admin Settings**
- `results.lifecycle.enforced = true|false`
- `results.critical.enabled = true|false`
- `results.critical.escalation_minutes = N`

## 8. Concurrency & Idempotency
- Use idempotency tokens on registration and order creation
- Prevent double submission (UI + API)
- Wrap critical operations in transactions

**Admin Settings**
- `api.idempotency.enabled = true|false`

## 9. Audit & Traceability
Audit must include:
- user, role, tenant, timestamp (UTC), IP/device, before/after for PHI changes

**Admin Settings**
- `audit.phi.before_after = true|false`
- `audit.immutable = true|false`

---

# Admin “Dial-Up” Settings Summary (Quick Reference)

## Tenancy
- `tenancy.resolution.mode`
- `tenancy.user_multi_tenant.enabled`
- `tenancy.db.enforcement`
- `tenancy.allow_super_admin_bypass`

## HL7
- `hl7.validation.level`
- `hl7.queue.enabled`
- `hl7.idempotency.enabled`
- `hl7.rejection.policy`

## Patient Identity
- `patient.identity.mode`
- `patient.matching.level`
- `patient.merge.enabled`

## Shared Staff
- `shared_staff.worklist_only`
- `shared_staff.minimal_phi_view`

## Audit/Security
- `audit.immutable`
- `security.break_glass.enabled`
- `crypto.per_tenant_keys.enabled`

---

# Acceptance Checklist (What “Good” Looks Like)
- ✅ Tenant isolation verified by automated tests (no cross-tenant reads/writes)
- ✅ HL7 messages have correlation IDs and deterministic tenant mapping
- ✅ Shared staff can operate across tenants via worklists without broad browsing
- ✅ Audit logs capture PHI access/mutations with adequate forensic detail
- ✅ Controls can be progressively enabled per tenant/building via admin settings

---

# End of Document