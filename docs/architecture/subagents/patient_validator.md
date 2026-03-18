# Subagent: Patient Data Integrity Guardian
**Status:** Active | **Risk Level:** High (Clinical Data) | **Compliance:** RA 10173

## 1. Domain Objective
To intercept and validate all Patient demographics before they persist in the MySQL database, ensuring zero tenant leakage and HL7 compatibility.

## 2. A.N.T. Integration Path
* **Layer 1 (Architecture):** Reference `docs/standards/clinical-data-integrity-model.md`.
* **Layer 2 (Navigation):** Hook into `backend/app/Http/Middleware/TenantUser.php` to verify `tenant_id`.
* **Layer 3 (Tools):** Execute `tools/schema_validator.py` for JSON structure checks.

## 3. Mandatory Behavioral Rules
* **Tenant Lock:** If a `patient_id` does not match the active `X-Tenant-ID`, immediately terminate the process and log a "Security Violation".
* **Privacy Shield:** Mask sensitive fields (e.g., specific contact numbers) unless the user has `DIAGNOSTIC_APPROVER` roles.
* **Audit Trigger:** Call the `HasAmendments` trait in the Laravel backend for every modification.

## 4. Execution Logic
1. **Receive** input from `PrescriptionForm.jsx`.
2. **Verify** session via `Operational_protocol.md` (check branch and risk).
3. **Run** `schema_validator.py` on the payload.
4. **Return** standardized JSON response to the Master Agent.
