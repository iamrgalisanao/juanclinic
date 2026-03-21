# JuanClinic HIS - Project Roadmap

## Phase 1: Foundation (COMPLETED)
- [x] Multi-tenant database schema (MySQL)
- [x] 3-Layer A.N.T. Architecture setup
- [x] Tenant-isolation middleware logic

## Phase 2: Core Clinical Modules (COMPLETED)
- [x] Patient Registration & Identity Management
- [x] Diagnostic Ordering (LAB/RAD)
- [x] Clinical Notes (SOAP/Progress)
- [x] Billing & Automated Invoicing

## Phase 3: Clinical Integrity & Compliance (COMPLETED)
- [x] CDIM "No Silent Overwrite" (Amendments)
- [x] Audit Engine (Log implementation)
- [x] HL7/FHIR Ingestion logic

## Phase 4: Workflow Hardening (COMPLETED)
- [x] Technician & Approver mobile/tablet views refinement
- [x] Pharmacy Worklist - Advanced Dispensing
- [x] **Subagent Integration (Operational Protocol)**
- [x] **Multi-Branch Entity Layer & Cashiering Module**
- [x] **Patient Document Uploads (Clinical Attachments)**

## Phase 5: Enterprise Scaling & Tier 2 Hardening (ACTIVE)

### Tier 2 Compliance Hardening
- [x] **Dynamic Management Reports**: Transition `Reports.jsx` from simulated to live clinical/revenue data.
- [x] **Physical Branch/Entity Layer**: Formalize sub-branching/facility mapping within a single tenant context.

### Enterprise Features
- [x] **Cross-tenant Referrals (Consent-based)**: Secure clinical data sharing between separate facilities.
- [x] **Advanced Analytics**: Cross-branch performance benchmarking and custom reporting.
- [x] **Specialty Clinical Forms**: Pediatric growth charts and specialty specific encounter templates.
- [x] **Offline Sync**: CLINICAL CONTINUITY mode for tablet/mobile context.
