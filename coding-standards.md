# Coding Standards: JuanClinic HIS

**Version:** 1.1 (High-Governance Edition)  
**Applies to:** All development and integration for JuanClinic HIS.

All changes must comply with:
- [security-hygiene-guardrails.md](security-hygiene-guardrails.md)
- [code-review-standard.md](code-review-standard.md)
- [testing-standards.md](testing-standards.md)

---

## 0. Core Engineering Principles

1. **Patient Safety First**: Code affecting clinical interpretation, medication, diagnostics, or identity must be reviewed with extra rigor.
2. **Privacy by Design**: Protect PHI/PII by default (RA 10173).
3. **Least Privilege**: Modules must operate with minimum necessary access.
4. **Traceability**: All clinically or financially significant actions must be attributable.
5. **Deterministic Behavior**: Avoid ambiguous logic or hidden side effects.
6. **Separation of Concerns**: Clinical rules must be separated from UI and Navigation layers.

## 1. Naming & Domain Language

- **General**: Clear, descriptive names. `phi_` (PII), `clinical_` (logic), `audit_` (audit) prefixes encouraged.
- **Clinical Rules**: Must use standardized domain language (HL7/FHIR terminology).
- **Functions**: Read as intent: `ClinicalAlertService::triggerCriticalResult()`.

## 2. Clinical Logic Separation (High-Governance)

- **Mandate**: Clinical rules (thresholds, decision logic, calculations) MUST NEVER reside in UI (React) or Controllers.
- **Location**: Use dedicated services in `app/Clinical/`:
    - `ClinicalRules/`
    - `ClinicalDecisionService`
    - `ClinicalValidationService`
- **No Hidden Logic**: Clinical rules must not rely on magic numbers. Use `ReferenceRange` constants.

## 3. Clinical Workflow & Auditability

### 3.1 Clinical State Machines
Workflows (Orders, Results) must use explicit states (e.g., `RESULT_READY`, `RESULT_VERIFIED`). Never infer state from nulls.

### 3.4 Secrets
Never hardcode secrets. Use environment variables.

### 3.5 Input/Output
Sanitize all clinical input; escape all diagnostics output.

### 3.6 Safe Logging
Never log PHI fields directly. Use the `SafeAuditLogger` abstraction to automatically redact denylisted fields.

### 3.2 Critical Result Handling
Critical results must immediately trigger:
1. Audit Engine entry.
2. Notification Engine alert.
3. Clinical Alert System status update.

### 3.3 Result Amendment Tracking
Clinical data must never be overwritten. Amendments require: `original_result`, `amended_result`, `amendment_reason`, `amended_by`, and `amended_at`.

## 4. Database Standards: Multi-Tenant Safety

### 4.1 Tenant Enforcement
Every data access MUST include `tenant_id`. Handled via a mandatory **Global Tenant Scope** in Laravel.

### 4.2 Safe Execution
- **Queries**: Default to `where('tenant_id', ...)` scope.
- **Background Jobs**: Workers must explicitly re-establish tenant context (Actor, Tenant, Request ID).
- **Exports**: Never `SELECT *` without an explicit `WHERE tenant_id`.
- **Logs**: Every log line must include `tenant_id`.

## 5. HL7 / FHIR Integration Standards

### 5.1 Isolation (Adapter Pattern)
External systems handled by adapters in `app/Integrations/` (HL7, FHIR, Laboratory, Insurance).

### 5.2 Traceability & Idempotency
- Store `source_system`, `message_type`, and `correlation_id` for every inbound message.
- Use `process_once_only` logic based on `message_control_id`.

### 5.3 Reliability
- Retry logic with exponential backoff.
- Mandatory Dead Letter Queues (DLQ) for failed clinical messages.
- Mask PHI in raw integration logs.

## 6. UI/UX Standards (Stitch)
- **Source of Truth**: [JuanClinic HIS] workspace in Stitch.
- **Policy**: AI provides guides/screenshots; User performs final verification.

## 7. Definition of Done
A feature is complete ONLY when:
1. Code follows these standards.
2. Audit trails and tenant isolation verified.
3. Regression tests passed for core engines.
4. Documentation (Quartet) synchronized.
5. PR approved by domain-specific reviewer.

---
