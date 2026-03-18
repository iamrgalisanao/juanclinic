# Security & Hygiene Guardrails: JuanClinic H.I.S.

## 1. Multi-Tenant Isolation (Absolute Rule)
- **Global Scope**: All tenant-owned models MUST use `TenantScope` and the `BelongsToTenant` trait.
- **Background Jobs**: Every job MUST carry and re-authorize `tenant_id` and `actor_id` context.
- **CI Enforcement**: The **Tenant Guardrail Scanner** will fail any PR containing unscoped queries on clinical models.

## 2. P.I.I. & Protected Health Information (PHI)
- **Definition**: RA 10173 compliant. Includes names, MRNs, DOBs, results, and clinical notes.
- **PHI Denylist (CI Scanning)**: Usage of the following fields in unsafe contexts (logs, UI state, alerts) is forbidden:
    `first_name`, `last_name`, `middle_name`, `full_name`, `birth_date`, `dob`, `address`, `phone`, `email`, `mrn`, `national_id`, `philhealth_id`, `insurance_id`, `patient_name`, `diagnosis`, `lab_result`, `clinical_note`.
- **Encryption**: Demographics and results must be encrypted at rest (AES-256).

## 3. Forbidden Practices (Zero Tolerance)
1. **Logging PHI**: Never log denylisted fields. Use `SafeAuditLogger` for data-safe auditing.
2. **Browser Storage**: PHI MUST NEVER be stored in `localStorage`, `sessionStorage`, or `cookies`.
3. **Test Fixtures**: Real patient data is strictly prohibited in `tests/`, `factories/`, or `seeders/`.
4. **Third-Party Analytics**: PHI must never be sent to external analytics or crash report platforms.

## 4. Automated CI Safety Gates
- **PHI Leak Guardrail**: Compares code against the PHI Denylist. Fails CI on positive matches in logs or non-secure storage.
- **Tenant Leak Guardrail**: Validates 100% tenant-scoped query coverage. Fails CI on `Model::all()` or raw SQL without `tenant_id`.
- **Failure Protocol**: 
    - CI FAIL -> Merge Blocked -> Mandatory Security Review -> Documented Justification.

## 5. System Hygiene
- **Dead Code**: Remove all "TODO" or commented-out clinical snippets before push.
- **Orphaned Models**: Every new clinical model must be attributed to a tenant.
