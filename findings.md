# JuanClinic HIS - Quality & Compliance Findings

This document is managed by the **JuanClinic Code Scanner** subagent.

## 🟢 Cleared Scans
- **Branch Verification**: Currently on feature-scoped branch.
- **Secrets Management**: No hardcoded keys found in `backend/config/`.

## 🔴 Critical Findings
- **File**: `backend/app/Http/Controllers/Api/PatientController.php`
- **Issue**: `Patient::all()` lacks explicit tenant scoping. (HIS-Specific: Tenant Isolation)
- **Status**: **Investigated**. Safe due to `BelongsToTenant` global scope, but flagged for visibility.
- **File**: `backend/app/Models/User.php`
- **Issue**: Missing `AuditLogTrait`. (HIS-Specific: Audit Log)
- **Status**: **RESOLVED**. `AuditLogTrait` added (2026-03-18).
- **File**: `frontend/src/components/PrescriptionForm.jsx`
- **Issue**: Missing Patient/Tenant context in form header. (Clinical Safety: Context Confusion)
- **Status**: **RESOLVED**. Context header added (2026-03-18).
- **Issue**: No "Discard Changes" confirmation on Cancel. (Clinical Safety: Data Loss)
- **Status**: **RESOLVED**. Discard safety gate implemented (2026-03-18).
- **File**: `frontend/src/components/PatientProfile.jsx`
- **Issue**: Missing Tenant Context in Profile Header. (Clinical Safety)
- **Status**: **RESOLVED**. Context header added (2026-03-18).
- **Issue**: Missing PHI Access Audit Indicator. (Clinical Safety: Audit-Ready)
- **Status**: **RESOLVED**. Real-time access indicator added (2026-03-18).
- **Issue**: Sub-optimal layout stacking on Tablets (768px-1279px). (Tablet Responsiveness)
- **Status**: **RESOLVED**. Grid optimized to `lg:grid-cols-3` (2026-03-18).
- **Issue**: Missing Submitting State Guard in Demographics Form. (Clinical Safety: Concurrency)
- **Status**: **RESOLVED**. `isSubmitting` guard and button disabling added (2026-03-18).
- **Issue**: Missing Tenant Context in Patients List. (Clinical Safety)
- **Status**: **RESOLVED**. Tenant badge and access audit pulses added (2026-03-18).
- **Issue**: Missing List Access Audit Indicator. (Clinical Safety: Audit-Ready)
- **Status**: **RESOLVED**. Live pulse indicator added (2026-03-18).

## 🟡 Warnings
- **File**: `backend/app/Models/Appointment.php`, `backend/app/Models/Payment.php`
- **Issue**: Missing `HasAmendments` trait. (Clinical Integrity / Financial Audit)
- **Status**: **RESOLVED**. `HasAmendments` added (2026-03-18).
- **File**: `frontend/src/components/PrescriptionForm.jsx`
- **Issue**: Label font-size (10px) and low contrast (Slate-400). (Accessibility)
- **Status**: **RESOLVED**. Increased to 12px with higher contrast (2026-03-18).
- **File**: `frontend/src/components/PatientProfile.jsx`
- **Issue**: Missing DPA "Right to Object/Erasure" components. (Compliance: RA 10173)
- **Status**: **RESOLVED**. Privacy Management section added (2026-03-18).
- **Issue**: Label font-size (10px) in demographics edit. (Accessibility)
- **Status**: **RESOLVED**. Increased to 12px for tablet scaling (2026-03-18).
- **Issue**: Small Hit Areas for Timeline Filters (<44px). (Accessibility: Touch)
- **Status**: **RESOLVED**. Filter areas increased to `min-h-[44px]` (2026-03-18).
- **Issue**: Small Font/Hit Areas for Search & Filters in Patients List. (Accessibility: Touch)
- **Status**: **RESOLVED**. Search scaled to py-3 and table density optimized for touch (2026-03-18).
- **Issue**: Missing DPA Compliance Portal in Registry. (Compliance: RA 10173)
- **Status**: **RESOLVED**. Privacy & DPA link added to footer (2026-03-18).

---
*Last scanned: 2026-03-18*
