# Developer Quick Guide: JuanClinic HIS

Day-to-day coding reference for the JuanClinic HIS team.

## Core Rules
1. **Safety First**: Clinical code must be defensive.
2. **Privacy First**: No PHI in logs. Default mask/redact.
3. **Tenant First**: Every query must respect `tenant_id`.
4. **Audit First**: If it changes clinical state, audit it.

## Naming Cheat Sheet
| Item | Convention | Example |
| :--- | :--- | :--- |
| **Tables** | plural | `clinical_orders` |
| **Models** | singular | `ClinicalOrder` |
| **Booleans** | predicate | `isActive`, `hasConsent` |
| **PHI Logic** | prefix | `phi_encrypt()` |

## Architecture (A.N.T.)
- **A**: `architecture/` (SOPs, Policies).
- **N**: `app/Http/Middleware/` (AuthZ, Tenant Scoping).
- **T**: `tools/` (Python/JS deterministic fulfilling).

## Git & Workflow
- **Never** commit directly to `main`.
- **Branches**: `feat/*`, `fix/*`, `compliance/*`, `hotfix/*`.
- **Done means**: Code standard followed + Tests pass + Audit implemented + Docs synced + PR approved.

## UI Verification
- AI provides the **Guide** and **Screenshots**.
- **User** performs the click-through verification.
- A task is NOT complete until the User confirms visual/behavioral accuracy.
