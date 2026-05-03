# Normalized Requirements Ledger (v1.36.0-prep)

This document formalizes the requirements implemented during the v1.25 to v1.35 release cycle, ensuring alignment with the project's "Non-Negotiables".

## 1. Pediatric & Specialty Care (v1.30.0+)
- **Dosing Safety**: Implement a weight-based dosage calculator (mg/kg) to prevent clinical errors.
- **Developmental Surfacing**: Integrate the Filipino Milestone Checklist (ECCD) for pediatricians.
- **Neonatal Care**: Provide a specialized infant dashboard with APGAR and birth weight velocity tracking.

## 2. Laboratory & Radiology Hardening (v1.21.0 - v1.30.0)
- **Critical Alerts**: Automate real-time physician alerts (SMS/Email) for life-threatening lab values.
- **Reference Ranges**: Implement age/gender-adjusted dynamic ranges for all lab results.
- **Imaging Bridge**: RIS/PACS integration for DICOM viewing and diagnostic loop closure.

## 3. Patient Engagement & Portal (v1.33.0)
- **Longitudinal Chronicle**: Merged view of all clinical events with trend analytics.
- **Self-Service Verification**: PIN-based DOB verification for secure patient access.
- **Mobile-First Experience**: Responsive dashboard for parents to track growth charts and vaccinations.

## 4. Enterprise Logistics & Finance (v1.22.0 - v1.29.0)
- **Inventory Integrity**: Batch-tracked, branch-isolated stock engine for reagents and supplies.
- **BIR Compliance**: Automated Sales Journal with VAT breakdowns and TIN-layer reporting.
- **Pharmacy Security**: Cryptographic QR loop for medication authenticity and tiered dispensing.

## 5. Architectural Guardrails (Cross-Cutting)
- **Strict Isolation**: All new modules must utilize `BelongsToTenant` and `tenant_id` scoping.
- **Clinical Audit**: All status transitions (Lab results, Dosage changes) must trigger `AuditLogTrait`.
- **Entitlement Gating**: Commercial features must be gated by the SaaS Entitlement Engine.

## 6. Clinically-Guided Drug Discovery (Phase 12)
- **Disease-First Search**: The UI must support searching by normalized disease/symptom terms before listing medicines.
- **Normalized Registry**: Condition terms must be normalized in a system-wide `diseases` and `disease_terms` registry.
- **Form-Aware Handoff**: The discovery flow must resolve to a specific `medicine_form_id` for downstream prescribing.
- **Shared Knowledge Base**: Disease-to-medicine mappings must be treated as global system knowledge rather than tenant-specific.
