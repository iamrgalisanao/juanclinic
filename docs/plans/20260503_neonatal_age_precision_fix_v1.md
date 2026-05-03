# Implementation Plan: Neonatal Age Precision Fix (v1)

**Date**: 2026-05-03  
**Phase**: Clinical Safety / Neonatal Hardening  
**Status**: DRAFT - Pending Approval

## 1. Overview
This plan addresses a clinical UX defect where neonatal age (Chronological and Corrected) is displayed with 15 decimal places. It hardens the calculation logic in the backend and formatting logic in the frontend to ensure clinical safety and industry-standard readability (Integer-based Days).

### Industry Standards Alignment
- **Clinical Precision**: Age in days must be an **integer**.
- **Contextual Awareness**: Corrected age should only be prominent for preterm infants (<37 weeks).
- **Safety**: Eliminate high-precision "distractors" to prevent medical errors.

## 2. Technical Specification

### 2.1 Backend (Laravel)

#### [MODIFY] [Patient.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Models/Patient.php)
- Update `getCorrectedAgeInDays` to return an integer using `(int) floor()`.
- Logic update: Ensure `atDate` is handled consistently to prevent microsecond drift.

#### [MODIFY] [PatientController.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Http/Controllers/Api/PatientController.php)
- Update `getNeonatalSummary` to cast `current_age_days` to `(int)`.
- Use a single timestamp for both chronological and corrected age calculations.

### 2.2 Frontend (React)

#### [MODIFY] [NeonatalDashboard.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/clinical/NeonatalDashboard.jsx)
- Wrap display values in `Math.floor()` or `.toFixed(0)` as a secondary defense.
- **UX Improvement**: Add a tooltip or conditional styling if Corrected Age differs from Chronological Age.
- **UX Improvement**: Hide "Corrected Age" section if the patient is >= 37 weeks (Full Term), as it adds redundant cognitive load.

## 3. Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Rounding Bias** | Low | Standard clinical practice uses `floor` for age (you are X days old until the start of day X+1). |
| **Inconsistent Sync** | Low | Using a single `$now` variable in the backend controller will eliminate the sub-second drift between values. |

## 4. Verification Plan

### 4.1 Automated Tests
- **Unit Test**: `PatientTest` to verify `getCorrectedAgeInDays` returns an integer.
- **Integration Test**: `PatientControllerTest` to verify the API response format for neonatal summaries.

### 4.2 Manual Verification
1. **Full Term Check**: View "John Test" (40w GA). Verify age is "25 Days" (integer) and Corrected Age is either hidden or clearly marked as N/A.
2. **Preterm Check**: Update a test patient to 32w GA. Verify Corrected Age is calculated correctly as an integer.

## 5. Self-Audit (Architect Standard)
- [x] Context Updated (`03-current-focus.md`)
- [x] Guardrail Audit Performed (`guardrail-health-summary.md`)
- [x] Plan Saved to `docs/plans/`
- [x] Naming Convention Followed (`20260503_neonatal_age_precision_fix_v1.md`)
