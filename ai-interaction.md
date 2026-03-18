# AI Interaction Rules

- **Operational Protocol Enforcement**: AI MUST read [Operational_protocol.md](Operational_protocol.md) at the start of every session or task before calling any other tool. Follow the "Pre-Flight" checklist strictly.
- **Strict Compliance with spec.md**: AI must strictly and non-negotiably adhere to the [spec.md](spec.md) requirements, particularly the **Non-Negotiables (Privacy-First)** section.
- **A.N.T. Pattern Adherence**: Follow the **A.N.T.** (Architecture, Navigation, Tools) structural patterns for all development and decision-making.
- **Clinical/Compliance Logic**: Always refer to clinical standards (HL7/FHIR) and data privacy regulations (DPA) when modifying clinical workflows or reporting logic.
- **Branching Awareness**: Always work on a specific feature/fix branch. Never commit directly to `main` unless small/chore documentation updates are explicitly requested.
- **Commit Discipline**: Follow conventional commit formats. Each commit should represent a verifiable step in the task-gating protocol.
- **Documentation Synchronicity (Source of Truth Suite)**: For every feature/fix implemented, the following files MUST be updated in lockstep BEFORE merging, following the [Documentation Sync Workflow](.agents/workflows/documentation-sync.md):
    1. **`CHANGELOG.md`**: Add descriptive entry under "[Unreleased]".
    2. **`ROADMAP.md`**: Update milestone/feature completion status.
    3. **`progress.md`**: Update percentage and detailed status.
    4. **`WALKTHROUGH.md`**: Document clinical feature logic and compliance.
    5. **Compliance Docs**: Update `docs/RBAC_matrix.md` and `docs/standards/clinical-data-integrity-model.md` if permissions or integrity rules are touched.
    6. **Feature Records**: Create/update in `context/features/`, etc.
- **Testing Enforcement**: Never mark a task as complete without creating/running a corresponding verification script in the `tests/` directory as per project standards.
- **UI/UX Design Workflow (Stitch)**: For any new clinical screen or significant workflow modification:
    1. **Generate Design**: Use the `mcp_stitch` workflow to generate mockups.
    2. **Review & Iterate**: Present mockups via `notify_user` for approval.
    3. **Implementation**: Only proceed with React/CSS after user approval of the design.
- **User-Led UI Verification (Mandatory)**: For all UI-related changes:
    1. **AI Role**: AI provides a structured **Verification Guide** (detailed terminal/repro steps). AI MUST NOT perform interactive verification (e.g., clicking buttons via subagents).
    2. **User Role**: Only the USER performs the actual interaction and verification of the UI behavior and appearance. 
    3. **Completion**: A UI task is only considered complete once the USER explicitly confirms the verification.
- **Security & Hygiene Guardrails**: AI must strictly implement [Security_hygiene_guardrails.md](Security_hygiene_guardrails.md) at every stage:
    1. **H.I.S. Hygiene**: Perform mandatory sweeps for `tenant_id` leakage and clinical audit triggers.
    2. **Design**: Ask clinical security/privacy review questions before coding.
    3. **Review**: Perform a mandatory pre-merge hygiene sweep (check for dead or orphaned code).
    4. **Release**: Confirm all high-risk clinical actions (result overrides, record edits) are verified and logged.
- **Strict Compliance Remediation**: Any deviation from these rules (e.g., working on `main`) is a critical error and must be remediated immediately.
