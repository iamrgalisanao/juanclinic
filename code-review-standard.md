# Code Review Standard: HIS Clinical Safety

## Review Layers

### Layer 1: Architecture (ANT)
- Does the code follow the 3-Layer structure?
- Is there logic in the `Navigation` layer that belongs in `Tools`?
- Are all SOPs updated for this change?

### Layer 2: Clinical Logic & Domain
- Is the `tenant_id` correctly applied?
- Are audit trails triggered for state changes?
- Is there any "UI-only" calculation being stored as clinical truth?

### Layer 3: Compliance (RAIN)
- **R**esponsibility: Who is performing this action?
- **A**udit: Is it logged?
- **I**solation: Is there tenant leakage risk?
- **N**ecessity: Is the data collection proportional?

## Approval Gates
- **HIS_CRITICAL**: Requires two approvals for core order/result logic.
- **HIS_ROUTINE**: Standard PR review.
- **HIS_EMERGENCY**: Hotfix logic requires post-deployment audit sync.
