# Operational Protocol for Secure AI-Assisted Development (Multi-Tenant HIS)

This document is a mandatory pre-flight and task-gating protocol for AI-assisted software development of the JuanClinic platform. It must be followed at the beginning of every working session and before starting any implementation, refactor, high-impact research, or production-sensitive analysis.

It is designed to ensure secure development discipline, controlled change management, and clinical safety in a multi-tenant health information system.

---

## 1. Protocol Intent

The AI must not jump directly into coding, patching, or tool execution without first establishing task type, risk level, and HIS-specific safety boundaries. This protocol exists to ensure:
* **Secure Development Discipline**: Controlled change management and auditability.
* **Tenant Isolation**: Prevention of cross-tenant data leakage.
* **Clinical Integrity**: Accuracy and standards-compliance (HL7/FHIR) of medical data.
* **Validation Readiness**: Rigorous testing before implementation closure.

The AI must not jump directly into coding, patching, or tool execution without first establishing:

* the task type,
* the risk level,
* the affected system boundaries,
* the required review path,
* the required validation path,
* and the required documentation updates.

This protocol is mandatory for:

* Feature Work
* Fix Work
* Refactor Work
* Compliance Work
* Operational Work
* security-sensitive Research Work

---

## 2. Required Standards Baseline
* NIST SSDF as the secure SDLC baseline
* OWASP ASVS as the application security verification baseline
* OWASP Code Review Guide principles for manual review discipline
* HL7 v2 / FHIR Clinical Data Standards
* Project-specific compliance and audit guardrails

---

## 2.1 Anti-Failure Controls (Continuous)
The AI must continuously apply these controls to maintain system integrity:
1.  **Context Degradation**: Maintain durable facts in `docs/ai-governance/` and current state in `task.md`. Summarize sessions explicitly.
2.  **Specification Drift**: Restate objectives before implementation. Validate against `normalized-requirements.md`.
3.  **Sycophantic Confirmation**: Separate Fact from Assumption. Challenge premises and log unresolved questions.
4.  **Tool Selection Errors**: Verify stack (Layer 2) before selecting tools (Layer 3).
5.  **Cascading Failures**: Use stage gates. Prevent downstream work if upstream evidence is weak.
6.  **Silent Failures**: Require evidence-backed validation and compare against clinical acceptance criteria.

---

## 3. SDLC Gated Stages & Session Startup

Every task must progress through these stages, documented in `docs/ai-governance/`:

1.  **Stage 1: Intake**: Read requirements and normalize into `normalized-requirements.md`.
2.  **Stage 2: Discovery**: Confirm tech stack and tool availability.
3.  **Stage 3: Planning**: Break work into bounded stages in `delivery-plan.md`.
4.  **Stage 4: Architecture**: Review `docs/architecture/` and use specialized subagents.
5.  **Stage 5: Implementation**: Create `implementation_plan.md` (Aesthetic & Clinical hardening).
6.  **Stage 6: Validation**: Proof of correctness via `validation-report.md`.
7.  **Stage 7: Guardrail Audit**: Mandatory invocation of `guardrail-audit.md` to ensure governance integrity.
8.  **Stage 8: Code Review**: Use `code-scanner.md` subagent and manual spot checks.
9.  **Stage 9: Security**: Check for tenant leakage and security hygiene.
10. **Stage 10: Release**: Update `CHANGELOG.md` and `ROADMAP.md`.

### Session Pre-flight Checklist:
1. **Verify the active branch** (`git branch --show-current`).
2. **Inspect the repo state** (`git status --short`, `git diff --name-only`).
3. **Classify the task** and risk level.
4. **Identify Protected Areas** affected (General & HIS-specific).
5. **Define the expected validation path** before implementation begins.

---

## 4. Task Classification (Mandatory)

### 4.1 Work Type
* Feature | Fix | Refactor | Research | Compliance | Operational | Hotfix

### 4.2 Risk Level
* Low | Medium | **High** | **Critical** (High/Critical requires explicit senior/specialist review)

### 4.3 Impact Tags
* **General**: UI | Integration | Secrets/Config | Dependency Change | Reporting | Offline Sync | Auth | Permissions
* **HIS-Specific**: Tenant Isolation | Patient Record | Clinical Order | Lab/Rad Result | HL7/FHIR Ingest | Audit Log | Tenant Config

---

## 5. Branch Verification Rules
### 5.1 Command

Run:
`git branch --show-current`

### 5.2 Rule

Never work directly on:

* `main`
* protected release branches
* any branch explicitly marked as protected by the project

### 5.3 Required Action

If currently on a protected branch, immediately create or switch to a scoped branch such as:

* `feat/...`
* `fix/...`
* `refactor/...`
* `compliance/...`
* `hotfix/...`
* `research/...`

### 5.4 Reporting

Always report the active branch in the first task-boundary update.

---

## 6. Repo State and Protected Areas

### 6.1 Commands

Run:

* `git status --short`
* `git diff --name-only`

### 6.2 Required Objective

Identify:

* active uncommitted changes,
* target files for the task,
* whether protected areas are touched,
* whether unrelated changes are present.

### 6.3 Protected Areas
Treat the following as strictly protected:
* **Auth/Security**: Authentication, authorization logic, secrets, and environment config.
* **HIS Core**: `TenantScope`, `BelongsToTenant` logic, Audit Engine (logging traits).
* **Clinical Intelligence**: HL7/FHIR processors, clinical order workflows, patient records.
* **Financial/Legal**: Receipt generation, tax computation, and reporting.

### 6.4 Rule

If unrelated local changes are present, the AI must avoid silently mixing them into the current task.

---

## 7. Security and Code Hygiene Scan

Before implementation, perform a lightweight but meaningful scan of the targeted or recently touched area.

### 7.1 Minimum Checks

Before implementation, perform a scan of the targeted area for:
* **Debug Artifacts**: `console.log`, `dd()`, `dump()`, temporary alerts, or test bypasses.
* **Exposed Secrets**: Hardcoded keys, tokens, or credentials.
* **HIS Hygiene**: Queries missing `tenant_id` filters (Tenant Leakage) or clinical transitions without audit triggers.
* **Dead Code**: TODO markers in sensitive paths or orphaned logic in touched files.

### 7.2 Subagent Scanner Integration (B.L.A.S.T.)
For automated quality and compliance audits, invoke the **JuanClinic Code Scanner** subagent (`docs/architecture/subagents/ code-scanner.md`):
1. **Classification**: Mark the scan as `Work Type: Operational` and `Risk Level: Low`.
2. **Impact Tags**: Use `HIS-Specific: Tenant Isolation | Audit Log`.
3. **Operational Gating**: Run `git branch --show-current` to ensure the scanner is not on `main`.

### 7.3 Output & Reporting
Findings from the scanner must be recorded in `findings.md` using the clinical impact format:
* **🔴 Critical**: Issues causing Tenant Leakage, Clinical Data Integrity loss, or Security violations.
* **🟡 Warning**: UI gaps, missing loading states, or non-critical compliance drift.

### 7.5 Refactor Scanner Integration (DRY Audit)
For logic consolidation and code health, invoke the **JuanClinic Refactor-Scanner** subagent (`docs/architecture/subagents/refactor-scanner.md`):
1.  **Classification**: Tag refactors of core modules as `Work Type: Refactor` and `Risk Level: Medium/High`.
2.  **Automated Documentation Flow**: The subagent MUST synchronize findings with the "Source of Truth Quartet" (DS-001) as detailed in its specification.

### 7.6 UI Reviewer Integration (UX & Accessibility)
For frontend quality and clinical UX safety, invoke the **JuanClinic UI-Reviewer** subagent (`docs/architecture/subagents/ui-reviewer.md`):
1.  **Classification**: Tag UI changes as `Work Type: UI/UX` and `Risk Level: Medium` (unless Auth/Patient views are touched).
2.  **Stitch Verification**: High-visibility clinical screens must follow the **[Stitch Workflow](.agents/workflows/stitch-workflow.md) (DS-012)**.
3.  **Output**: Findings must be recorded in `findings.md` focusing on **Clinical Safety** (context confusion) and **Accessibility**.

### 7.7 Guardrail Audit Integration (Mandatory)
Before concluding any implementation or refactor, invoke the **JuanClinic Guardrail-Audit** subagent (`docs/architecture/subagents/guardrail-audit.md`):
1. **Classification**: Mark the audit as `Work Type: Operational`.
2. **Impact**: Assess the six failure modes.
3. **Outcome**: No task is "Done" until a `guardrail-health-report.md` is generated with a "Proceed" recommendation.

### 7.7 Rule
Do not proceed while known debug backdoors, exposed secrets, or unsafe temporary code remain unresolved.

### 7.8 Recording Rule

Meaningful findings must be recorded in one or more of:

* `findings.md`
* the active feature/fix/refactor note
* a security or cleanup note

---

## 8. Documentation and Context Synchronization

The AI must load and update only the documentation that is relevant to the task.

### 8.1 Minimum Context to Review

As applicable, review:

* `progress.md` (or `docs/ai-governance/task-ledger.md`)
* `docs/ai-governance/normalized-requirements.md`
* `docs/ai-governance/assumptions-register.md`
* relevant guardrails in `docs/architecture/`
* prior lessons in `findings.md`
* design, architecture, compliance, or security notes relevant to the change

### 8.2 Update Rule

Documentation must be updated when system truth changes. Use the **[Documentation Sync Workflow](.agents/workflows/documentation-sync.md) (DS-001)** to ensure all relevant files (RBAC, CDIM, Changelog) are synchronized. 

Do not update roadmap or changelog files mechanically for tiny internal edits that do not change project truth.

### 8.3 Common Update Targets (Source of Truth Quartet)

Depending on task type, update the "Source of Truth Quartet" and other relevant docs:

* **`CHANGELOG.md`** (for unreleased changes)
* **`ROADMAP.md`** (milestone and feature completion)
* **`progress.md`** (sync with Roadmap percentages)
* **`WALKTHROUGH.md`** (modernization and compliance logic)
* feature/fix/refactor note
* compliance documentation
* security note when a meaningful risk or mitigation decision was made

---

## 9. Required Companion Document Triggers

Consult foused architecture/security docs as required:
- `docs/architecture/database-persistence-guardrails.md`
  - Required when schema, persistence mode, migration, backfill, replay, or source-of-truth changes are involved.

- `docs/architecture/entity-authority-map.md`
  - Required when a task introduces or changes a protected entity/event, or changes client/server authority.

- `docs/architecture/client-server-sync-contract.md`
  - Required when APIs, queue replay, retries, acknowledgments, client/server status handling, or sync payloads are affected.

- `docs/architecture/offline-action-matrix.md`
  - Required when a feature may work offline, be queued offline, or must be blocked offline.

- `docs/architecture/deployment-topology.md`
  - Required when runtime placement, tablet/server responsibilities, local peripherals, or cloud/server assumptions are affected.

### 9.1 Security Documents
Consult these when the task affects trust boundaries, security controls, permissions, secrets, replay safety, or code hygiene:

- `docs/security/client-server-security-model.md`
  - Required when auth, authorization, approvals, device trust, local storage trust, or client/server responsibility changes are involved.

- `docs/security/security-hygiene-guardrails.md`
  - Required for all high-risk tasks and any task affecting protected actions, dependencies, debug artifacts, dead code, duplicate logic, or sensitive paths.

### Rule
If a task affects a domain governed by one of these files, the AI must review the relevant file before implementation and reflect the applicable constraints in the implementation plan.


---

## 10. Security and Compliance Gate (Trigger Conditions)

This gate is mandatory if the task affects:
* **Monetary/Print**: Receipts, tax, totals, refunds.
* **Identity/Access**: Auth, role approvals, customer/patient data.
* **Integrations**: APIs, webhooks, HL7/FHIR ingest.
* **Isolation**: Tenant scoping or config.

If triggered, perform a documented impact review and define validation depth in the implementation plan.

---

## 11. Validation Readiness Gate

No task is implementation-ready until success criteria are defined:
* **General**: Unit/Integration tests, regression scope, manual UI verification.
* **HIS-Specific**: Tenant scoping verification (cross-tenant block), Clinical Audit check (log entry exists), HL7 segment parsing verification.
* **Risk Aware**: Containment/Rollback plan for High/Critical tasks.

---

## 12. UI Design and Verification Protocol (Stitch Workflow)

### 12.1 When Required
Use the `mcp_stitch` workflow when:
* Building new customer-facing screens or major workflow redesigns.
* Creating high-visibility transactional UI or complex operational screens.

### 12.2 Action Path
1. **Initialize**: Use `mcp_stitch_create_project`.
2. **Generate**: Use `mcp_stitch_generate_screen_from_text`.
3. **Review**: Use `mcp_stitch_get_screen` and present mockups via `notify_user` for approval.
4. **Implement**: Only proceed with React/CSS after user approval of the design.

---

## 13. Review Path Selection

Before implementation, select the required review path.

### 13.1 Minimum Review Types

Choose one or more:

* Standard Implementation Review
* Security Review
* Compliance Review
* Receipt Review
* Tax Review
* RBAC Review
* Offline / Sync Review
* Reporting Review
* Refactor / Cleanup Review

### 13.2 Rule

Manual review remains mandatory for sensitive changes even if automated scans or generation tools are available.

### 13.3 Trigger Rule

If the task affects protected areas, the corresponding specialist review must be identified before implementation begins.

---

## 14. Exception and Emergency Handling

If a step must be bypassed because of urgent production impact, the AI must not treat that bypass as invisible.

### 14.1 Required Record

Document:

* reason for deviation,
* risk introduced,
* compensating control,
* approver or decision owner,
* required remediation step after stabilization.

### 14.2 Rule

Emergency deviation is temporary. It is not a permanent waiver.

### 14.3 Hotfix Rule

Hotfix work must still include:

* task classification,
* evidence capture,
* minimal validation,
* and post-fix documentation.

---

## 15. Completion and Handover Gate

Before declaring a task complete, the AI must:
1. **Update CHANGELOG.md**: Record all additions, changes, and fixes in the main developer changelog.
2. **Provide Instructions**: Deliver a structured set of manual verification steps in the `walkthrough.md`.
3. **Request Validation**: Use `notify_user` to prompt the user to execute the verification protocol.
4. **No Safe-to-Declare**: The AI cannot declare "Success" or "Fixed" until the user has confirmed the validation results.
5. **Evidence Capture**: If the user provides screenshots or logs of their manual test, they should be referenced.

---

## 16. Mandatory Session Output Format

At the first task boundary, the AI should provide a concise structured summary containing:

* active branch,
* work type,
* risk level,
* impact tags,
* whether protected modules are affected,
* whether security/compliance review is required,
* planned validation path,
* any immediate hygiene or security findings.

This output should be brief, but it must be explicit.

---

## 17. Anti-Patterns

Do not:

* work on `main`,
* jump into coding before classification,
* skip risk tagging,
* **perform autonomous AI testing for clinical verification**,
* force irrelevant documentation churn,
* ignore unrelated local changes,
* skip review because the change looks small,
* treat hotfixes as exempt from discipline,
* rely on AI generation without validation,
* bypass protected-module review,
* close tasks without providing manual verification instructions.

---

## 18. Final Rule

This protocol is mandatory because secure and maintainable delivery requires more than code generation.

The AI must operate as a disciplined implementation partner that:

* understands risk,
* preserves reviewability,
* respects protected business behavior,
* and leaves behind enough evidence for others to trust the change.

---

## 19. Instruction-Based Validation Rule (DS-013)

To ensure clinical safety and human-in-the-loop oversight, the followng protocol is STRICT:
1. **AI Output**: For every fix or feature, the AI MUST output a "Validation Protocol" (Step-by-step).
2. **User Input**: The User is the final authority on validation correctness.
3. **No Bypass**: The AI is prohibited from using autonomous browser agents to simulate "Validation Success" without providing the user the means to verify.

---

## 20. Final Rule

This protocol is mandatory because secure and maintainable delivery requires more than code generation. The User-Led Validation model ensures that the clinical user (the domain expert) verifies the behavior before it is committed to the project's 'Source of Truth'.
