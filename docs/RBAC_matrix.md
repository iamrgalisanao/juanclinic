# Compliance-Ready RBAC Matrix  
## Multi-Tenant Healthcare Information System (HIS)

Version: 1.0  
Scope: Multi-Clinic, Shared-Building, SaaS-Ready Architecture  
Alignment: HIPAA (Minimum Necessary), ISO 15189, Segregation of Duties, Zero-Trust, Multi-Tenant Isolation

---

# 1. RBAC Design Principles

1. **Least Privilege** – Users only access what is required for their role.
2. **Tenant Isolation** – No cross-tenant data access unless explicitly authorized.
3. **Segregation of Duties** – Order entry ≠ result validation ≠ audit override.
4. **Break-Glass Enforcement** – Elevated access requires justification and logging.
5. **Audit Traceability** – All PHI access and status changes are logged.

---

# 2. Role Hierarchy

## Global (Platform-Level) Roles
- Platform Administrator
- Security / Audit Administrator
- DevOps / System Monitoring (No PHI Access)

## Tenant-Level Roles
- Clinic Administrator
- Clinical Provider (Doctor / Dentist / Specialist)
- Lab Technician
- Radiology Technician
- Diagnostic Approver (Radiologist / Pathologist)
- Billing Officer (Optional)
- Front Desk
- Patient

---

# 3. RBAC Access Matrix

Legend:
- R = Read
- C = Create
- U = Update
- D = Delete
- A = Approve/Finalize
- L = Limited (Scoped/Filtered)
- X = No Access

---

## 3.1 Platform-Level Permissions (Global Scope)

| Resource | Platform Admin | Security Admin | DevOps |
|-----------|----------------|----------------|--------|
| Tenant Onboarding | C U D | X | X |
| Tenant Configuration | C U D | X | X |
| System Health Metrics | R | R | R |
| Audit Logs (All Tenants) | L (metadata only) | R | X |
| Patient PHI | X* | L (audit view only) | X |
| Break-Glass Approval | X | A | X |

*Platform Admin PHI access requires break-glass workflow.

---

## 3.2 Tenant-Level Permissions

### Patient Records

| Role | Patient Demographics | Clinical Notes | Lab Results | Radiology Reports |
|------|---------------------|---------------|-------------|------------------|
| Clinic Admin | R L | X | R L | R L |
| Clinical Provider | R C U | R C U | R | R |
| Lab Technician | L | X | R U (prelim only) | X |
| Radiology Technician | L | X | X | R U (prelim only) |
| Diagnostic Approver | R | X | A | A |
| Front Desk | R C U (demographics only) | X | X | X |
| Patient | R (self only) | R (self only) | R (self only) | R (self only) |

---

### Orders & Workflow

| Role | Create Order | Modify Order | Cancel Order | View Worklist |
|------|-------------|-------------|--------------|--------------|
| Clinical Provider | C | U | U | R |
| Lab Technician | X | X | X | R L |
| Radiology Technician | X | X | X | R L |
| Diagnostic Approver | X | X | X | R L |
| Clinic Admin | X | X | U (admin override) | R |
| Front Desk | C (limited scope) | X | X | X |

---

### Results Lifecycle

| Role | Enter Results | Validate | Finalize | Amend |
|------|--------------|----------|----------|-------|
| Lab Technician | U (preliminary) | X | X | X |
| Radiology Technician | U (preliminary) | X | X | X |
| Diagnostic Approver | X | A | A | A |
| Clinical Provider | X | X | X | X |
| Clinic Admin | X | X | X | X |

Segregation Rule:
- Technician cannot finalize results.
- Approver cannot create original order.

---

### Administrative Controls (Tenant Level)

| Role | Manage Staff | Configure Services | View Reports | Access Audit Logs |
|------|-------------|-------------------|--------------|-------------------|
| Clinic Admin | C U D | C U | R | R |
| Clinical Provider | X | X | R (limited) | X |
| Lab Technician | X | X | X | X |
| Front Desk | X | X | X | X |

---

# 4. Multi-Tenant Isolation Rules

1. All queries must filter by `tenant_id`.
2. Users may belong to multiple tenants but must explicitly switch context.
3. Shared staff (Lab/Rad Tech) can:
   - View only assigned worklists.
   - Access minimal PHI required.
4. Cross-tenant patient browsing is prohibited unless:
   - Master Patient Index enabled.
   - Explicit policy and consent exist.

---

# 5. Break-Glass Workflow

Trigger Conditions:
- Emergency access to restricted PHI
- Cross-tenant access
- Finalized record override

Requirements:
- Justification text
- Time-limited session
- Automatic high-priority audit entry
- Security Admin review required

---

# 6. Audit Requirements

All PHI actions must log:
- User ID
- Role
- Tenant ID
- Timestamp (UTC)
- IP Address
- Device Info
- Before/After state (where applicable)
- Correlation ID

Audit logs must be:
- Immutable (append-only)
- Retained per regulatory period
- Searchable by tenant and resource

---

# 7. Compliance Alignment

This RBAC model supports:

- HIPAA Minimum Necessary Standard
- ISO 15189 Traceability Requirements
- Segregation of Duties (Lab accreditation)
- Multi-Tenant SaaS Security Model
- Zero-Trust Access Principles

---

# 8. Optional Progressive Hardening (Admin-Configurable)

| Control | Mode 0 | Mode 1 | Mode 2 | Mode 3 |
|----------|--------|--------|--------|--------|
| Strict Tenant Isolation | ✓ | ✓ | ✓ | ✓ |
| Result Finalization Separation | ✓ | ✓ | ✓ | ✓ |
| Immutable Audit Logs | Optional | ✓ | ✓ | ✓ |
| Per-Tenant Encryption Keys | X | Optional | ✓ | ✓ |
| Break-Glass Workflow | Optional | ✓ | ✓ | ✓ |
| EMPI Duplicate Review | X | Optional | ✓ | ✓ |

---

# 9. Summary

This RBAC matrix ensures:

- Proper separation between platform and clinic authority
- Clear segregation between order entry, technical processing, and final validation
- Multi-tenant data protection
- Legal defensibility
- Accreditation readiness

---

End of Document