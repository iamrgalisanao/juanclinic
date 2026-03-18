# Project Constitution

## Tech Stack
- **Frontend:** ReactJS
- **Backend:** Laravel PHP
- **Database:** MySQL
- **App Type:** Web-based Multi-Tenant HIS

## Data Schemas

### Patient Schema (Input/Output)
```json
{
  "tenant_id": "string (UUID)",
  "patient_id": "string (External ID)",
  "demographics": {
    "first_name": "string",
    "last_name": "string",
    "dob": "ISO8601 Date",
    "gender": "string (M/F/O)",
    "contact": "string"
  }
}
```

### Clinical Order Schema (HL7 v2/FHIR compatible)
```json
{
  "order_id": "string",
  "patient_id": "string",
  "order_type": "string (LAB/RAD)",
  "request_details": "object",
  "priority": "string (ROUTINE/STAT)",
  "status": "string (PENDING/IN_PROGRESS/COMPLETED)"
}
```

## Behavioral Rules
- **Strict Isolation**: No cross-tenant data leakage.
- **Audit-Ready**: Every clinical action must be logged with a timestamp and user ID.
- **Standards-First**: All data exchange must prefer HL7/FHIR/DICOM.
- **Privacy-by-Design**: Strictly comply with the Philippines Data Privacy Act (RA 10173).
- **Progressive Enforcement**: Controls can be dynamically enforced via admin settings (Mode 0: MVP to Mode 3: Enterprise).
- **Multi-Tenant Building Pattern**: Support shared staff (Lab/Rad Tech) access via worklists while maintaining strict data owner isolation.


## Architectural Invariants
- **3-Layer A.N.T. Architecture:**
  - Layer 1: **Architecture** / `architecture/` (SOPs, Documentation, Policies, **Subagents**)
  - Layer 2: **Navigation** (Tenant Resolution, Auth, Context Management)
  - Layer 3: **Tools** / `tools/` (Deterministic Python Scripts, HL7 Generators)
- **Data-First Rule**: Schema defined before coding tools.
- **Deliverables vs Intermediates**: `.tmp/` for intermediates, Global/Cloud for deliverables.
- **Self-Annealing**: Analyze error -> Patch tool -> Test -> Update SOP.

## Governance & Hierarchy
1. **gemini.md** (Strategy): The source of truth for the system's existence and architectural soul.
2. **spec.md** (Domain): The specialized rules for the HIS domain and compliance (Non-Negotiables).
3. **Subagents** (`docs/architecture/subagents/*.md`): Operations-level architectural logic for specific domain tasks.
4. **Operational_protocol.md** (Execution): The gatekeeper for daily development and risk management.
5. **ai-interaction.md** (Interface): The mechanical rules that enforce the hierarchy above.

## Maintenance Log
- **2026-02-28**: Initial System Architecture established. 3-Layer A.N.T. structure implemented. Laravel/React/MySQL tech stack confirmed. HL7 and Multi-tenancy SOPs drafted and tools verified.
- **2026-03-17**: Synchronized constitution with specialized HIS/DPA protocols and established formal document hierarchy.
