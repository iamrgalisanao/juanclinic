# Multi-Tenancy Architecture: JuanClinic HIS

## 1. Tenancy Model
JuanClinic HIS is a **Shared Database, Shared Schema** platform. All hospital data resides in the same database tables, isolated logically by a mandatory `tenant_id` column.

### 1.1 Row-Level Isolation
Every record owned by a hospital (Tenant) must include a `tenant_id`. This isolation ensures:
- Strict logical separation between hospitals.
- Simplified maintenance of a single source of truth schema.
- High performance via indexed tenant lookups.

### 1.2 Tenant-Owned Entities
The following entities are strictly tenant-owned and must NEVER be accessed without a tenant filter:
- `patients`, `encounters`, `diagnostic_orders`, `lab_results`.
- `prescriptions`, `clinical_documents`, `invoices`, `payments`.
- `audit_logs` (tenant-specific activity).

## 2. Enforcement Mechanisms

### 2.1 ORM-Level (Global Scopes)
All tenant models must use the `BelongsToTenant` trait. This trait automatically:
- Injects the `tenant_id` on record creation.
- Applies a `GlobalScope` to all queries: `WHERE tenant_id = :active_tenant`.

### 2.2 Background Job & Export Safety
- **Jobs**: Must carry `tenant_id` in their payload and re-activate the context before execution.
- **Exports**: Selective queries only. Raw `SELECT *` without isolation filters is prohibited.

## 3. Cross-Tenant Access Policy
**Denied by Default.** Any cross-tenant access requires:
1. **Administrative Approval**: Documented business need.
2. **Role-Based Authorization**: Restricted to Compliance or Platform Admin roles.
3. **Audit Log**: Every cross-tenant access is logged with actor, purpose, and timestamp.

## 4. Compliance Alignment
This model supports **RA 10173 (DPA)** by guaranteeing that Health Data belonging to one facility remains invisible and inaccessible to all other facilities on the platform.

### Implementation Reference
- [database-persistence-guardrails.md](database-persistence-guardrails.md)
- [engineering-safeguards-policy.md](../standards/engineering-safeguards-policy.md)
