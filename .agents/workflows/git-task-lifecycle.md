---
description: procedure for executing a high-integrity git task lifecycle
---

# Git Task Lifecycle Workflow

Follow this procedure when preparing to commit or manage Git state for a task.

## Step 1: Baseline Verification
1. **Active Task Check**: Verify the `task.md` has an active item.
2. **Plan Check**: Verify the current `implementation_plan.md` is marked as **Approved**.
3. **Scope Check**: Ensure no additional files were modified outside the approved scope.

## Step 2: State Inspection
1. **Git Status**: Inspect `git status` to identify staged and unstaged changes.
2. **Diff Check**: Perform `git diff` on modified files to verify content matches the intent of the task.

## Step 3: Commit Grouping
1. **Grouping logic**: 
   - Group by file component (e.g., "Migration", "Service", "Tests").
   - Do not mix divergent tasks in a single commit.
2. **Commit Message Construction**:
   - Prefix with Task ID.
   - Summarize "What" and "Why".
   - Reference Decision Notes if applicable.

## Step 4: Final Validation Readiness
1. **Lint/Test Check**: Ensure `vendor/bin/pest` passes for the affected component.
2. **Drift Detection**: If `git status` shows files not in the plan, **STOP**. Reconcile the plan first.

## Step 5: Execution
1. Propose the `git add` and `git commit` commands to the user.
2. Wait for approval.
3. Once approved, execute and verify the commit exists in `git log`.