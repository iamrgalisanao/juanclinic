# Clinical State Machine Map

**Purpose**: Define explicit, non-ambiguous transitions for vital clinical workflows to ensure patient safety and data integrity.

## 1. Clinical Order (Lab/Rad)
Clinical orders must follow this immutable transition path:

| State | Description | Legacy Alias | Allowed Next State |
| :--- | :--- | :--- | :--- |
| **ORDER_CREATED** | Physician has signed the request. | PENDING | SPECIMEN_COLLECTED, CANCELLED |
| **SPECIMEN_COLLECTED** | Sample bound to Tenant/Patient. | IN_PROGRESS | PROCESSING, REJECTED |
| **PROCESSING** | Lab/Rad engine is analyzing data. | IN_PROGRESS | RESULT_READY |
| **RESULT_READY** | Preliminary data for specialist review. | PRELIMINARY | RESULT_VERIFIED, AMENDED, REJECTED |
| **RESULT_VERIFIED** | Sign-off from a Diagnostic Specialist. | COMPLETED | RESULT_RELEASED, AMENDED |
| **RESULT_RELEASED** | Available to Physician/Portal. | COMPLETED | AMENDED |
| **AMENDED** | Record preserved; new result released. | AMENDED | RESULT_VERIFIED |

## 2. Patient Encounter
| State | Description | Allowed Next State |
| :--- | :--- | :--- |
| **ARRIVED** | Patient registered and tenant-identity verified. | TRIAGE, CANCELLED |
| **TRIAGE** | Initial vitals and priority (STAT/Routine) set. | SEEING_PHYSICIAN |
| **SEEING_PHYSICIAN** | Active consultation. | DISCHARGE, ADMITTED |
| **ADMITTED** | In-patient transition. | DISCHARGE |
| **DISCHARGE** | Financial clearance and summary released. | COMPLETED |

## 3. Implementation Rules
1. **No Inference**: Never infer a state based on nullable timestamps (e.g., `if (verified_at == null)`). Use the `status` column.
2. **Audit Trigger**: Every state transition MUST be recorded in the persistent clinical audit trail.
3. **RBAC Control**: Specific transitions (e.g., `RESULT_VERIFIED`) require high-level Diagnostic Specialist roles.
