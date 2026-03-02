# RBAC Implementation Roadmap: JuanClinic HIS

According to the **JuanClinic Constitution (Progressive Enforcement Rule)**, the best time to implement RBAC is **progressively**, starting immediately with the foundational schema but deferring complex logic until core features are stable.

## Phase 1: Foundation (Current - MVP Phase)
**Goal**: Establish the "Who" and "Where".
- **Timing**: Right after Multi-Tenancy is established (Happening now).
- **Actions**:
    - Add a `role` column to the `users` table (or a simple many-to-many relationship).
    - Hardcode standard roles: `ADMIN`, `DOCTOR`, `NURSE`, `TECH`.
    - **Why now?**: Without this, you cannot test the "Doctor Workflow" or "Shared Tech Worklist" reliably.

## Phase 2: Route Protection (Mid-Development)
**Goal**: Enforce boundary rules.
- **Timing**: As soon as the first 3-4 API resources are functional.
- **Actions**:
    - Implement Laravel Middlewares (e.g., `EnsureUserIsDoctor`).
    - Tie RBAC to the Multi-Tenant scope (e.g., "Is this user a doctor *for this specific tenant*?").
    - **Why then?**: Prevents unauthorized API access during manual testing.

## Phase 3: UI-Level Enforcement (Feature Polish)
**Goal**: Improve UX by hiding irrelevant actions.
- **Timing**: During frontend component refinement.
- **Actions**:
    - Create a React hook `useRole()` or `PermissionsProvider`.
    - Hide the "Ingest HL7" button from non-admins/techs.
    - **Why then?**: Reduces noise for the end-user (Doctor vs. Admin).

## Phase 4: Enterprise Mode (Hardening)
**Goal**: Dynamic and audit-ready controls.
- **Timing**: Before pilot deployment/security audit.
- **Actions**:
    - Integration with Spatie Laravel Permission (for dynamic permissions).
    - Advanced audit logs linking actions to specific Permission IDs.
    - **Why then?**: Too much overhead for early development, but necessary for enterprise compliance.

---

### [IMPORTANT]
**Recommendation**: Start **Phase 1** immediately by adding roles to your `User` model. This is the "Data-First" requirement of your architecture.
