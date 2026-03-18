# Engineering Safeguards Policy: JuanClinic HIS

**Version:** 1.0  
**Status:** Mandatory Enforcement (CI/CD)

## 1. Purpose
This policy defines automated safeguards to prevent high-risk errors (PHI exposure and Tenant isolation leaks) in the JuanClinic HIS. These gates are enforced automatically in the CI pipeline.

## 2. PHI Leak Detection Guardrail
### 2.1 Definition of PHI
Includes any data identifying a patient directly or indirectly (RA 10173).
### 2.2 PHI Denylist Fields
The CI scanner flags usage of these fields in logs, browser storage, or test fixtures:
`first_name`, `last_name`, `middle_name`, `full_name`, `birth_date`, `dob`, `address`, `phone`, `email`, `mrn`, `national_id`, `philhealth_id`, `insurance_id`, `patient_name`, `diagnosis`, `lab_result`, `clinical_note`.

### 2.3 Forbidden Practices
- **Logging PHI**: Forbidden. Use `SafeAuditLogger` class for sanitization.
- **Browser Storage**: PHI must not be stored in `localStorage`, `sessionStorage`, or `cookies`.
- **Test Data**: Real patient data is strictly prohibited in the codebase.

## 3. Tenant Data Leak Prevention
### 3.1 Global Isolation
All tenant-owned models MUST use the `BelongsToTenant` trait and global scope.
### 3.2 Job Context
Every background job MUST maintain `tenant_id`, `actor_id`, and `request_id`.
### 3.3 Safe Exports
Reports and Exports must explicitly append `AND tenant_id = ?` to all raw queries.

## 4. CI Pipeline Verification
The following checks must pass before merging to `main`:
1. **PHI Leak Scanner**: Fails CI on denylist matches.
2. **Tenant Guardrail Scanner**: Fails CI on unscoped queries.
3. **Clinical Unit Tests**: 100% pass required.
4. **Integration Regression**: Must pass for HL7/FHIR adapters.

## 5. Governance
No agent or engineer may bypass these safeguards. Disabling guardrails requires Security Review and Architecture approval.
