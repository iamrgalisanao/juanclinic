# JuanClinic HIS - Project Roadmap

**Current Status**: ⏸️ **Strategic Pause** (v1.35.0 Released)
*Aim: Gather multi-tenant field feedback from early adopters (Pediatricians & Lab Technicians) before further infrastructure expansion.*

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

## Phase 5: Enterprise Scaling & Tier 2 Hardening (COMPLETED)
- [x] **Dynamic Management Reports**: Transition `Reports.jsx` from simulated to live clinical/revenue data.
- [x] **Physical Branch/Entity Layer**: Formalize sub-branching/facility mapping within a single tenant context.
- [x] **Cross-tenant Referrals (Consent-based)**: Secure clinical data sharing between separate facilities.
- [x] **Advanced Analytics**: Cross-branch performance benchmarking and custom reporting.
- [x] **Specialty Clinical Forms**: Pediatric growth charts and specialty specific encounter templates.
- [x] **Offline Sync**: CLINICAL CONTINUITY mode for tablet/mobile context.

## Phase 6: Hospital-Grade Integrations (COMPLETED)
- [x] **HL7 Transport Gateway (Mirth Connect / FHIR Bridge)**: Outbound event-driven clinical data synchronization.
- [x] RIS/PACS Image Archiving (DICOM Integration)
- [x] Enterprise Master Patient Index (EMPI) Hardware Sync
- [x] **Commercial Entitlement Engine**: Multi-tier module gating and SaaS feature control.

## Phase 7: Advanced Patient Engagement & Specialty Care (COMPLETED)
- [x] **Universal Triage & Vitals Module**: Mandatory capture of BP, PR, RR, Temp, and BMI.
- [x] **Automated Patient Reminders (v1.25)**: Email/SMS outreach with multi-language (EN/TL) support.
- [x] **Telehealth Bridge (v1.26)**: Secure video consultations via cryptographically unique signed URLs.
- [x] **Pharmacy QR Loop (v1.28)**: Secure medication authenticity verification and tiered dispensing.

## Phase 8: Enterprise Logistics & Workforce (COMPLETED)
- [x] **Inventory Management v1 (v1.27)**: Branch-isolated stock engine for reagents and clinical supplies.
- [x] **Advanced Staff Scheduling (v1.29)**: Cross-branch shift management and conflict intelligence.

## Phase 9: Pediatric & Lab Hardening (COMPLETED)
- [x] **Pediatric Dosage Calculator**: Automation of weight-based dosing (mg/kg) for safety.
- [x] **Filipino Milestone Checklist**: Filipino-preferred (ECCD) developmental surfacing for pediatricians.
- [x] **Dynamic Lab Reference Ranges**: Age/Gender adjusted normal values with automated flagging.
- [x] **Critical Result Alerts**: Real-time SMS/Email alerts to physicians for life-threatening lab values.

## Phase 10: Engagement & Longitudinal Care (COMPLETED)
- [x] **Patient Portal v2 (v1.33)**: Responsive, mobile-first parental dashboard with growth charts.
- [x] **Unified Clinical History (v1.31)**: Longitudinal chronicle with trend analytics and delta highlighting.

## Deferred Features (Future Consideration)
- [ ] Clinical Decision Support (CDS): Drug-interaction alerts and allergy warnings.
- [ ] Multi-Specialty Modules: OB-GYN, Ophthalmology, and Cardiology specific charting.
- [ ] PHIC/HMO Direct Integration: Automated claims processing for Philippine Health Insurance.
- [ ] **Patient Portal: PDF Download of Clinical Records** (Immunization/Lab summaries).
- [ ] **Patient Portal: Physician Narrative Integration** (Sharing Soap/Progress notes).
- [ ] **Unified Financial/Clinical Chronicle** (Merging revenue and clinical paper trails).
- [ ] **Lab Equipment Integration** (HL7/LIMS direct hardware bridging).
- [ ] **Insurance/PHIC Eligibility Check** (Real-time membership verification).
- [ ] **Referral Network Expansion** (Secure cross-tenant worklist and document exchange).
