# Assumptions Register

This document tracks hypotheses and design assumptions that require verification during the current **Strategic Pause** (v1.35.0).

| ID | Category | Assumption | Validation Path |
| :--- | :--- | :--- | :--- |
| **A-001** | Clinical | Pediatricians prefer Filipino-specific milestones (ECCD) over international standards for routine visits. | Post-release feedback from the early adopter group. |
| **A-002** | UX/UI | Lab technicians require a high-contrast mode for results entry in low-light facility environments. | Shadowing/Observation during the pilot. |
| **A-003** | Security | PIN-based DOB verification provides sufficient friction-to-security ratio for patient portal access. | Security audit + user friction feedback. |
| **A-004** | Analytics | "Delta Intelligence" (delta highlighting) reduces clinical error rates by surfacing significant trends. | Comparison of diagnostic error logs pre/post v1.31. |
| **A-005** | Scale | Server-side medicine pagination is sufficient for inventory sizes up to 10k items per branch. | Performance monitoring of the v1.27 inventory engine. |
