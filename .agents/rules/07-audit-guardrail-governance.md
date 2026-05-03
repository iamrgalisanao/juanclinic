# 07-audit-guardrail-governance.md

## Rule
The **Guardrail Audit** subagent MUST be invoked at the conclusion of every feature implementation, refactor, or clinical workflow change.

## Intent
To prevent context degradation and ensure that all technical changes are synchronized with the project's governance documents (Roadmap, Task Ledger, and Audit Reports).

## Mandatory Actions
1. **Post-Implementation Audit**: Once a feature is declared "Implemented" in the code, run the `guardrail-audit` subagent.
2. **Report Generation**: A new or updated `docs/ai-governance/guardrail-health-report.md` must be produced.
3. **Roadmap Sync**: Any discrepancy found between code reality and `ROADMAP.md` must be corrected immediately.
4. **Failure Mode Risk Check**: Explicitly score the six failure modes (Context Degradation, Spec Drift, Sycophancy, Tool Selection, Cascading Failure, Silent Failure).

## Enforcement
Implementation tasks cannot be marked as "Completed" in the `task-ledger.md` or `ROADMAP.md` until a "Proceed" recommendation is issued by the Guardrail Audit.
