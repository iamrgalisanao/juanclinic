# SOP: Patient Registration & Order Workflow (Navigation Layer)

## 1. Objective
Define deterministic paths for patient registration and orders, supporting shared building (multi-tenant) scenarios.

## 2. Patient Identity Strategy (Configurable)
- **Option A (Per-Tenant):** Duplicate-safe within tenant only. (Mode 0-1)
- **Option B (Building MPI):** Master Patient Index shared across clinics in the same building. (Mode 2-3)
- **Rule:** Accessing a patient in Option B from a different tenant requires explicit staff role (e.g., shared Lab Tech) and consent.

## 3. Workflow Steps
1. **Intake:** Receive registration request via React/Laravel API.
2. **Matching (Progressive):**
    - **Minimal:** Match `patient_id` or `contact` within current tenant.
    - **Standard:** Match `Name + DOB + Contact`. Prompt on partial matches.
    - **EMPI:** Cross-tenant match if `patient.identity.mode == building_mpi`.
3. **Shared Staff Access:**
    - If user has `shared_staff` flag, allow access to patient records ONLY via active `worklist_id` or `order_id`.
    - Block "Global Browsing" across tenants.

## 4. Order Lifecycle
- **Lab Tech Flow:** Worklist-driven. Tech sees orders across multiple tenants in one unified view, but data is filtered by `tenant_id` on selection.
- **Results:** Must be validated and delivered with a full audit trail of the technician ID and the tenant context.
