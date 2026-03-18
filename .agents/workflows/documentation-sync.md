---
description: How to strictly synchronize documentation with technical changes in JuanClinic HIS.
---

# Documentation Sync Workflow (DS-001)

This workflow ensures that no technical change exists without its corresponding documentation update, satisfying both developer reference and clinical compliance requirements.

## 1. Pre-Implementation (Planning)
- [ ] Identify which documents are affected by the proposed change:
    - `docs/RBAC_matrix.md` (for permission or role changes)
    - `docs/standards/clinical-data-integrity-model.md` (for any PHI/Data Integrity logic)
    - `docs/architecture/*` (for structural or data flow changes)
- [ ] List these documents in the `implementation_plan.md`.

## 2. Implementation (Execution)
// turbo-all
- [ ] Perform technical changes (Code/DB).
- [ ] Immediately update the identified documents with the new state/rules.
- [ ] Update `CHANGELOG.md` with a summary of the changes (Added, Changed, Fixed, Security).

## 3. Post-Implementation (Verification)
- [ ] Conduct a formal self-review (documented in `code_review.md`).
- [ ] Verify that the `walkthrough.md` references the updated documentation.
- [ ] Confirm all `task.md` entries for documentation sync are marked as complete.

## 4. Rule of Evidence
- **Rule**: A feature is "Done" ONLY if the code, the changelog, and the specific domain documentation are in sync.
- **Enforcement**: Zero-tolerance for "blind" code updates without corresponding spec alignment.
