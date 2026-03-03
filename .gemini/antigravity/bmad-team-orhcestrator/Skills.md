---
name: bmad-team-orchestrator
description: Runs BMad-style multi-role execution by spawning parallel missions (Analyst, PM, Architect, UX, PO) in Antigravity Agent Manager and synthesizing outputs into a single plan/story set.
---

# BMad Team Orchestrator Skill

## Goal
Turn a single user request into a coordinated, multi-role BMad execution using **separate agent missions per role** in Antigravity Agent Manager, then synthesize into a single, actionable output.

## Important Reality Check
- Antigravity has built-in specialized subagents (e.g., browser/terminal) and supports parallel work via Agent Manager.
- **User-defined “custom subagents / agent teams” are not consistently available as a first-class feature**; therefore this Skill implements “multi-agent orchestration” by:
  1) creating distinct **Mission Briefs** for each role, and  
  2) instructing the system/user to run them as separate missions in Agent Manager, and  
  3) synthesizing results into a final deliverable.

## Role Set
You must use these roles as separate missions:
- Analyst
- Product Manager (PM)
- Architect
- UX Expert (only if UI/UX is involved)
- Product Owner (PO)

## How to Run (Agent Manager Missions)
When the user requests multi-role work, do the following:

1) **Classify the request** into one workflow:
   - Development (new functionality)
   - Bug Fix (something broken)
   - Investigation (understand unknown code/system)

2) **Generate Mission Briefs** for each needed role using:
   - orchestration/mission-brief-template.md
   - workflows/<selected>.md
   - roles/<role>.md

3) **Spawn missions in Agent Manager**
   Create (or ask the user to create) missions with these names:
   - BMAD – Analyst
   - BMAD – PM
   - BMAD – Architect
   - BMAD – UX (optional)
   - BMAD – PO

4) **Parallelize safely**
   - Analyst + Architect can usually run in parallel.
   - PM can run in parallel if requirements are known; otherwise wait for Analyst findings.
   - UX can run in parallel once PM clarifies target users and flows.
   - PO runs last to convert outputs into acceptance criteria and backlog-ready stories.

5) **Synthesize**
   When mission outputs return, produce a single response using:
   - orchestration/synthesis-template.md
   - orchestration/decision-log-template.md

## Output Rules
Your final combined output MUST include:
- Workflow chosen (development / bugfix / investigation)
- Decision log (what was decided + why)
- Risks + mitigations
- Acceptance criteria (PO-owned)
- Next actions (what to do next)

## Constraints
- Do not mix roles inside a single mission output.
- Do not invent project facts; cite evidence from repo/code/tests/logs where available.
- Prefer minimal safe changes; avoid scope creep.