# Clinical Data Integrity Model (CDIM): JuanClinic HIS

**Version:** 1.0  
**Status:** Mandatory  
**Objective:** Ensure clinical records are accurate, traceable, and tamper-resistant.

## 1. Core Integrity Principles
- **No Silent Overwrites**: Clinical records (results, prescriptions, notes) MUST NEVER be updated in-place. History must be preserved via amendments.
- **Immutable Audit Trail**: Every clinically significant change must generate an append-only audit event.
- **Explicit State Transitions**: Transitions MUST use the Canonical State Machine. Inference from timestamps or nullability is forbidden.

## 2. Diagnostic Result Integrity
- **Preliminary vs Verified**: Technicians enter `RESULT_READY` data. Only Diagnostic Approvers move results to `RESULT_VERIFIED`.
- **Amendment Workflow**: Every change to clinical data, including initial entries during technical processing, triggers an audit-mapped update. Post-verification changes MUST trigger an `AMENDED` state, while pre-verification updates preserve history via the `amendments` table, requiring an `amendment_reason` for every submission.
- **Verification Rule**: Critical results MUST be acknowledged and audited upon release.

## 3. Patient Identity Integrity
- **Duplicate Detection**: Creation flows must check Name, DOB, and ID to prevent duplicate record proliferation.
- **Merge Governance**: Patient merges require administrative privilege, explicit confirmation, and a permanent "Merge Trace" in the audit log.
- **Isolation**: Merging patients across different hospital tenants is forbidden without explicit EMPI policy.

## 4. Order & Prescription Safety
- **Duplicate Prevention**: Detect and warn on duplicate orders (e.g., same lab test within 1 hour).
- **Cancellation Safety**: Orders cannot be cancelled after technical processing has reached `PROCESSING` or beyond without formal override.
- **Prescription Versioning**: Changes to medications must be versioned, preserving the original intent and the reason for change.

## 5. Integration Integrity (HL7/FHIR)
- **Identity Matching**: Inbound HL7 `PID` segments must match a valid patient within the same tenant context.
- **No Auto-Verification**: Integration payloads may set `RESULT_READY` but NEVER `RESULT_VERIFIED` or `RESULT_RELEASED` directly.
- **Idempotency**: Prevent duplicate results from retransmitted HL7 messages using `message_control_id` de-duplication.

## 6. Definition of Done (Clinical Integrity)
A clinical feature is not complete unless:
1. State transitions are exhaustive and explicit.
2. Amendment history is preserved (No Silent Overwrite).
3. Audit events are implemented for all state changes.
4. Duplicate detection is validated.
5. Resident data remains strictly tenant-isolated.

---
**Related Standards:**
- [coding-standards.md](../../coding-standards.md)
- [unified-clinical-architecture.md](../architecture/unified-clinical-architecture.md)
- [patient-data-security-model.md](../security/patient-data-security-model.md)
