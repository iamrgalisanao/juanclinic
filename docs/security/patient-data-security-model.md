# Patient Data Security Model: JuanClinic HIS

**Version:** 1.1 (Executive Edition)  
**Status:** Mandatory Standard  
**Compliance:** RA 10173 (DPA), HIPAA-grade Clinical Safety

## 1. Purpose
This document defines the security model for protecting patient demographics, clinical results, billing, and audit records in JuanClinic HIS.

## 2. Security Principles
- **Privacy by Design**: Data protected by default in storage, transit, and logs.
- **Least Privilege**: Users and jobs access minimum necessary data.
- **Tenant Isolation**: Shared database, shared schema, row-level isolation (Rule 1).
- **Full Traceability**: All access to PHI must be attributable and auditable.
- **Defense in Depth**: Layered safeguards across app, database, and operational layers.
- **Safe Failure**: Security failures must "fail closed" and not expose PHI.

## 3. Data Classification
### 3.1 Restricted Data (Highest Sensitivity)
Includes: Names, DOB, Government IDs, MRN, Diagnoses, Lab/Imaging results, Prescriptions, Clinical notes.
*Protection: Encryption (AES-256), Audit Logging, Masking.*

### 3.2 Confidential Data
Includes: Schedules, Billing details, Internal case routing.
*Protection: RBAC, Authorization, Activity Logging.*

## 4. Access Control Monitoring
### 4.1 RBAC Model
- **ADMIN**: Configuration & Audit Oversight.
- **DOCTOR**: Clinical CRUD & EMR History.
- **TECH**: Worklist & Result Entry.
- **DIAGNOSTIC_APPROVER**: Result Sign-off (Verified states).

### 4.2 Break-Glass Access
Emergency access to clinical data requires:
1. Implicit justification in the UI.
2. Time-limited session.
3. High-priority audit trigger for Compliance Review.

### 4.3 Referral Network (Controlled Sharing)
Cross-tenant sharing requires:
1. **Patient Consent**: Explicitly recorded and revocable.
2. **Limited Scope**: Minimum necessary data only.
3. **Audit Trail**: Tracking when access occurred and when it expired.

## 5. Encryption & Integrity
- **At-Rest**: Sensitive demographics and results encrypted via AES-256.
- **In-Transit**: Mandatory TLS 1.3 for all traffic (Browser/API/Integration).
- **No Silent Overwrite**: Finalized data amendments MUST preserve `original_value`, `amendment_reason`, and actor metadata.
- **Tamper-Evident**: Diagnostic result payloads support digital signing or immutable historical snapshots.

## 6. Frontend & Storage Safeguards
- **Browser Storage**: PHI must NEVER be in `localStorage`, `sessionStorage`, or Cookies.
- **Safe Logging**: Use `SafeAuditLogger` to redact PHI from application logs.
- **Test Data**: All non-production data must be synthetic/fictitious.

## 7. Incident Response
Suspected PHI exposure or tenant leaks trigger:
1. **Containment**: Immediate token revocation or access suspension.
2. **Impact Assessment**: per-tenant audit analysis.
3. **Remediation**: Root cause fix and NPC (National Privacy Commission) notification if breach threshold is met.

## 8. Definition of Done (Security)
A feature is not complete unless:
1. Tenant isolation is verified.
2. Break-glass and RBAC policies are applied.
3. Encryption at-rest is validated for Restricted fields.
4. PHI-safe logging is confirmed by CI.

---
**Related Standards:**
- [coding-standards.md](../../coding-standards.md)
- [engineering-safeguards-policy.md](../standards/engineering-safeguards-policy.md)
- [multi-tenancy-model.md](../architecture/multi-tenancy-model.md)
