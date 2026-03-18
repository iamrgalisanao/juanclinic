# Database Persistence Guardrails: Multi-Tenant Safety

## 1. Global Tenant Scoping
- **Implementation**: `app/Models/Traits/BelongsToTenant.php`
- **Behavior**: Every query automatically adds `WHERE tenant_id = ?` based on the active session context.
- **Constraint**: This scope is enabled by default. Developers must have a **Major Justification** to use `withoutGlobalScopes()`.

## 2. Data Attribution
- **Implementation**: Eloquent `creating` event observer.
- **Behavior**: Automatically injects `tenant_id` and `created_by` into the model if not provided.
- **Consistency**: All `tenant_id` columns must be **BIGINT UNSIGNED**.

## 3. Global Tenant Scope (High-Governance)
- **Hard Enforcement**: Every clinical model MUST use `TenantScope` booted via the `BelongsToTenant` trait.
- **Context**: The `tenant_id` is resolved once per request/job and stored in a singleton `TenantContext`.
- **Bypass**: Using `withoutGlobalScopes()` on a clinical model is a **High-Risk Change** requiring explicit Security Review. See [multi-tenancy-model.md](multi-tenancy-model.md) for policy details.

## 4. Background Job & Export Safety
- **Job Invariants**: Every queued job must carry `tenant_id` and `actor_id` in its payload. The job handler must re-authorize the context before execution.
- **Export Safety**: All report/export generators must append an `AND tenant_id = ?` clause to the raw SQL or Eloquent builder. "Select All" queries across tenants are strictly forbidden.

## 5. Audit Integrity
- **Persistence**: All clinical transactions are mirrored in `audit_logs` via JSON serialized snapshots of the model state `BEFORE` and `AFTER` change.
- **Privacy**: No PII (names, emails) should be in the `audit_logs` activity description; use IDs or standardized clinical codes.

## 4. Resilience
- **Soft Deletes**: Use `SoftDeletes` for clinical records to prevent catastrophic accidental data loss while remaining DPA-compliant for "Right to Erasure" (blocking).
