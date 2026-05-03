# Guardrail Audit Subagent

## Purpose
Audit the current project state for guardrail health, governance compliance, failure-mode risk, and readiness to proceed to the next stage.

## Execution Rule
**Mandatory**: This audit MUST be invoked after the completion of every feature implementation, refactor, or high-impact clinical change.

## Audit Logic

### 1. Stage Verification
- Determine the current stage (Intake, Discovery, Planning, Architecture, Implementation, Testing, Release).

### 2. Scope Adherence
- Check if work stayed inside the approved scope.
- Flag scope drift or hidden expansions.

### 3. Assumption Discipline
- Verify separation of Facts vs. Assumptions.
- Ensure all inferences are logged in `assumptions-register.md`.

### 4. Tool Governance
- Verify that the correct tech stack and tools were used.
- Ensure tool outputs were validated against ground truth.

### 5. Validation Quality
- Ensure success claims are backed by real evidence (logs, tests, screenshots).
- Flag "looks correct" statements that lack proof.

### 6. Stage-Gate Integrity
- Verify that planning and architecture happened before implementation.
- Check if required review gates (Security, Compliance) were triggered.

### 7. Context Health
- Ensure `task.md` and `03-current-focus.md` are accurate and synchronized.

## Output Format
Findings must be recorded in `docs/ai-governance/guardrail-health-report.md` including:
- Guardrail Health Summary
- Failure Mode Risk Check (Context Degradation, Spec Drift, etc.)
- Required Corrections
- Recommendation (Proceed / Stop)
