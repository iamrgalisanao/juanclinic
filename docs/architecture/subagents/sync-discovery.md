# Sync Discovery Subagent

## Purpose
Verify the current "Ground Truth" of the system before proposing or implementing changes.

## Execution Rule
**Mandatory**: Use this subagent at the start of every session and before planning any new feature or fix.

## Discovery Logic

### 1. Mandatory Discovery
- Use the filesystem and database (postgres/mysql) to verify the current state of files and schemas.
- Do not rely on chat history or prior agent assumptions.

### 2. Context Alignment
- Compare the current workspace state against `docs/ROADMAP.md` and `docs/ai-governance/task-ledger.md`.
- Detect hidden expansions or project drift.

### 3. Failure Detection
- Specifically audit for **Sycophantic Confirmation** by requiring hard evidence for any claim of "Fixed" or "Completed".
