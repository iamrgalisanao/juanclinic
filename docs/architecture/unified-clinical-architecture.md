# Unified Clinical Architecture: JuanClinic HIS

**Version:** 1.0  
**Status:** Canonical Clinical Operations Standard

## 1. Purpose
This document serves as the single source of truth for clinical workflows, state transitions, and integration boundaries in JuanClinic HIS. It normalizes all order, result, and encounter lifecycles.

## 2. Core Principles
- **Canonical State Enforcement**: Transitions must use explicit states (no timestamp-based inference).
- **Tenant Isolation by Default**: All clinical actions restricted to the active tenant context.
- **Segregation of Duties**: Order creation, technical processing, and result verification must be separated by role.
- **Human-in-the-Loop**: No automated release of clinical results without human verification.

## 3. Canonical Clinical State Machines

### 3.1 Clinical Order / Result Lifecycle
Authoritative lifecycle for Labs and Radiology:

| Canonical State | Description | Legacy Alias | Allowed Next State |
| :--- | :--- | :--- | :--- |
| **ORDER_CREATED** | Order signed by Physician. | PENDING | SPECIMEN_COLLECTED, CANCELLED |
| **SPECIMEN_COLLECTED** | Sample bound to Patient/Tenant. | IN_PROGRESS | PROCESSING, REJECTED |
| **PROCESSING** | Active analyzer/technical workflow. | IN_PROGRESS | RESULT_READY |
| **RESULT_READY** | Data available for specialist review. | PRELIMINARY | RESULT_VERIFIED, AMENDED, REJECTED |
| **RESULT_VERIFIED** | Sign-off by Diagnostic Specialist. | COMPLETED | RESULT_RELEASED, AMENDED |
| **RESULT_RELEASED** | Visible to EMR, Physician, Portal. | COMPLETED | AMENDED |
| **AMENDED** | Historical record preserved; new result set. | AMENDED | RESULT_VERIFIED |

### 3.2 Patient Encounter Lifecycle
| Canonical State | Description | Allowed Next State |
| :--- | :--- | :--- |
| **ARRIVED** | Registered and identity verified. | TRIAGE, CANCELLED |
| **TRIAGE** | Vitals and priority (STAT/Routine) set. | SEEING_PHYSICIAN |
| **SEEING_PHYSICIAN** | Consultation in progress. | DISCHARGE, ADMITTED |
| **ADMITTED** | Inpatient transition. | DISCHARGE |
| **DISCHARGE** | Summary and financial clearance initiated. | COMPLETED |
| **COMPLETED** | Operational closure. | none |

## 4. HL7 / FHIR Integration Mapping
- **ORM^O01**: Triggers `ORDER_CREATED`.
- **ORU^R01**: Triggers `RESULT_READY`.
- **Restriction**: HL7 ingestion MUST NOT set `RESULT_RELEASED` directly. It must stop at `RESULT_READY` for human sign-off.

## 5. RBAC Action Boundaries
- **Doctor**: Creates Orders, views Released Results.
- **Technician**: Moves Order through Specimen, Processing, and Preliminary Entry.
- **Diagnostic Approver**: Moves Result from Ready to Verified and released.

## 6. Audit & Traceability
Every transition listed above MUST trigger a structured `audit_logs` entry containing:
- `actor_id`, `tenant_id`, `state_from`, `state_to`, `correlation_id`.

---
**Related Documents:**
- [clinical-state-machine-map.md](clinical-state-machine-map.md)
- [integration-standards.md](integration-standards.md)
- [patient-data-security-model.md](../security/patient-data-security-model.md)
