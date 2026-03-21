---
description: How to use the mcp_stitch workflow for clinical UI/UX design and verification in JuanClinic HIS.
---

# Stitch Workflow (DS-012)

This workflow ensures that all clinical UI screens are designed, reviewed, and approved before technical implementation, maintaining a "Patient-First" design standard.

## 1. Trigger Conditions
Use this workflow when:
- Building new customer-facing (Clinic, Lab, Rad, Pharmacy) screens.
- Redesigning critical clinical workflows (e.g., Result Entry, Prescription).
- Implementing complex multi-tenant administrative interfaces.

## 2. Design Generation (The Stitch Path)
- [ ] **Step 1: Initialize**: Call `mcp_stitch_create_project` to isolate the new design iteration.
- [ ] **Step 2: Generate**: Use `mcp_stitch_generate_screen_from_text` provided with detailed clinical requirements (e.g., "Must show Patient ID and DOAC warnings").
- [ ] **Step 3: Variant Review**: Use `mcp_stitch_generate_variants` if the user requires alternative layouts for tablet vs. desktop screens.

## 3. Human-in-the-Loop Review
- [ ] **Step 4: Presentation**: Use `mcp_stitch_get_screen` to retrieve the design.
- [ ] **Step 5: Approval**: Present the screenshot/URL to the USER via `notify_user` and WAIT for explicit approval.
- [ ] **Step 6: Compliance Check**: The `ui-reviewer.md` subagent must verify the approved design against WCAG and Clinical Safety standards.

## 4. Technical Implementation
- [ ] **Step 7: Code Alignment**: Only after approval, begin React/Tailwind implementation path.
- [ ] **Step 8: Verification Guide**: AI provides the USER with a structured Verification Guide to test the live implementation against the approved design.

## 5. Rule of Evidence
A UI change is **Done** ONLY if the interactive behavior and appearance are explicitly confirmed by the USER against the approved Stitch mockup.
