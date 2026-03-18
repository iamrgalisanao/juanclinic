# JuanClinic: Multi-Tenant Health Information System (HIS) Specification

## 1. Introduction
JuanClinic is a modern, web-based, multi-tenant Health Information System (HIS) designed for hospitals and clinics. It prioritizes data isolation, auditability, and clinical data standards (HL7/FHIR) to provide a robust platform for clinical management.

### 1.1 Project Vision
To provide a scalable, secure, and standards-compliant HIS that supports diverse clinical workflows while maintaining strict tenant-level data integrity.

### 1.2 Objectives
- **Multi-tenancy**: Support multiple independent clinics/hospitals on a single platform.
- **Interoperability**: Adhere to HL7 v2 and FHIR standards for clinical data exchange.
- **Operational Excellence**: Streamline clinical workflows from patient registration to diagnostic reporting.
- **Auditability**: Ensure all clinical actions are logged and verifiable.

---

## 2. Core Architecture (A.N.T. Design)
The system follows a 3-layer architectural pattern:

- **Layer 1: Architecture (SOPs & Policy)**: Defined in `architecture/`. Contains system design documents and Standard Operating Procedures.
- **Layer 2: Navigation (Context Resolution)**: Handles tenant resolution (`X-Tenant-ID`), authentication (`DevAuthentication`), and routing.
- **Layer 3: Tools (Deterministic Execution)**: Python scripts in `tools/` for data validation, HL7 generation, and system seeding.

---

## 3. Multi-Tenancy & Isolation
JuanClinic employs a "Shared-Database, Isolated-Schema" approach via global query scopes.

### 3.1 Data Isolation
- **Tenant Scope**: Every database query is automatically scoped by `tenant_id`.
- **Isolation Enforcement**: Middleware ensures users can only access data belonging to their assigned tenant.
- **Onboarding**: Tenants are bootstrapped with specific configuration levels (Mode 0: MVP to Mode 3: Enterprise).

### 3.2 Shared Staff Access
The system supports worklists that allow shared staff (e.g., Lab/Rad Techs) to process orders across multiple tenants if authorized, while keeping the underlying patient record strictly isolated to the data owner.

---

## 4. Clinical Data Standards
### 4.1 HL7 v2 Compliance
- **Ingestion**: Supports MSH, PID, and OBR segments for clinical order imports.
- **Validation**: Strict validation of message types and tenant-specific protocol enforcement.

### 4.2 FHIR Compatibility
- Core entities (Patient, Clinical Order) are modeled to be FHIR-ready, allowing for future expansion into RESTful FHIR APIs.

---

## 5. Functional Modules
### 5.1 Patient Management (EMR)
- **Centralized Registry**: Demographic tracking with strict tenant ownership.
- **Longitudinal History**: Timeline view of all clinical orders, appointments, and results.

### 5.2 Clinical Order Management
- **Workflow**: PENDING → IN_PROGRESS → PRELIMINARY → COMPLETED.
- **Priority**: Support for ROUTINE and STAT orders.
- **Audit**: Every status transition captures the performing user and timestamp.

### 5.3 Diagnostic Worklists
- **Tech Flow**: Lab/Rad Technicians enter results as structured JSON.
- **Approver Flow**: Diagnostic Approvers (e.g., Pathologists, Radiologists) review and sign off on results.

### 5.4 Secure Messaging
- Real-time communication between clinical staff via private channels (Laravel Reverb/Echo).
- Context-aware conversations linked to patients or specific orders.

---

## 6. Non-Negotiables (Privacy-First)

1. **Never guess at clinical or compliance logic.** Verify, inspect, or document uncertainty.
2. **Never build result-sensitive behavior without a spec.**
3. **Never duplicate order, diagnostic, treatment, or reporting logic across modules.**
4. **Never allow UI-only calculations to become clinical truth.**
5. **Never mark clinical-workflow work complete without regression testing.**
6. **Never silently change clinical reports, results, or patient-affecting behavior.**
7. **Never deploy result-sensitive or treatment-sensitive changes without documentation updates.**
8. **Never let a commercial feature override clinical auditability or privacy rules.**
9. **Never patch a compliance defect (HIPAA/DPA/NPC) without root-cause investigation.**
10. **Never allow offline sync to create duplicate or untraceable clinical records, orders, or unauthorized data cached on client.**
11. **Never treat file-based and relational persistence as interchangeable without documented mapping and migration rules.**
12. **Never allow patient records, clinical orders, or prescriptions to bypass protected clinical accounting and audit rules.**
13. **Never process sensitive personal information without a verified lawful basis (Consent or specific DPA Exception).**
14. **Never ignore the principle of Proportionality: collect and process only the minimum data necessary for the declared purpose.**
15. **Never initiate a major feature or data-flow change without a Privacy Impact Assessment (PIA).**

---

## 7. Required Project Context System

### 7.1 Required Root Files

* `task_plan.md` — overall phases, milestones, priorities, and task sequence.
* `progress.md` — current completion state, blockers, validation results, next steps.
* `findings.md` — verified discoveries, open questions, research evidence, issue lessons.
* `current-feature.md` — the active feature/fix/refactor/compliance specification.
* `coding-standards.md` — naming, module boundaries, error handling, test expectations.

### 7.2 Required Directories

* `context/features/`
* `context/fixes/`
* `context/refactors/`
* `context/research/`
* `context/screenshots/`
* `docs/compliance/`
* `docs/architecture/`
* `docs/security/`
* `docs/reports/`
* `tools/`
* `.tmp/`

### 7.3 Required Domain-Specific Documents (HIS + DPA)

- `docs/compliance/hipaa-dpa-compliance-matrix.md`
- `docs/compliance/dpa-privacy-manual.md`
- `docs/compliance/privacy-impact-assessment-report.md`
- `docs/compliance/npc-registration-and-compliance.md`
- `docs/compliance/hl7-v2-mapping-spec.md`
- `docs/compliance/fhir-resource-profiles.md`
- `docs/compliance/clinical-audit-protocol.md`
- `docs/architecture/hl7-engine-architecture.md`
- `docs/architecture/unified-clinical-architecture.md`
- `docs/architecture/database-persistence-guardrails.md`
- `docs/architecture/entity-authority-map.md`
- `docs/architecture/client-server-sync-contract.md`
- `docs/architecture/offline-action-matrix.md`
- `docs/architecture/deployment-topology.md`
- `docs/architecture/multi-tenancy-model.md`
- `docs/security/rbac-clinical-matrix.md`
- `docs/security/security-hygiene-guardrails.md`
- `docs/reports/clinical-report-definitions.md`
- `docs/standards/engineering-safeguards-policy.md`

### 7.4 Documentation Rule

This spec defines what documents must exist. `Operational_protocol.md` defines when they must be consulted and updated.

---

## 8. Data Privacy & DPA Compliance (RA 10173)

JuanClinic is committed to the Philippines Data Privacy Act of 2012 (DPA). Privacy-by-Design is integrated into every clinical workflow.

### 8.1 Core Principles
* **Transparency**: Patients must be informed about data collection and processing.
* **Legitimate Purpose**: Data is processed only for declared clinical or operational reasons.
* **Proportionality**: Minimize data collection to what is necessary for patient care.

### 8.2 Data Subject Rights (Patients)
The system must support the exercise of:
1. **Right to be Informed**
2. **Right to Access** (Patient Portal/Export)
3. **Right to Object**
4. **Right to Rectification**
5. **Right to Erasure or Blocking**
6. **Right to Damages**
7. **Right to Data Portability** (HL7/FHIR Export)
8. **Right to File a Complaint**

### 8.3 Organizational & Technical Measures
* **DPO (Data Protection Officer)**: System must support DPO overrides and audit reviews.
* **Least Privilege**: Role-based access (RBAC) enforced at the API and Database layer.
* **Encryption**: Mandatory encryption of Personal Information (PI) at rest and in transit.
* **PIA**: Mandatory Privacy Impact Assessment for every new module.

---

## 9. Security & Non-Functional Requirements
- **RBAC**: Role-Based Access Control (ADMIN, TECH, DIAGNOSTIC_APPROVER).
- **Audit Logs**: Mandatory tracking of all Create/Update/Delete actions on clinical models.
- **Tech Stack**:
  - **Backend**: Laravel PHP (API-first).
  - **Frontend**: ReactJS (Vite).
  - **Database**: MySQL with JSON field support for complex results.
