# JuanClinic HIS - Developer Changelog

## [v1.15.0] - 2026-03-30
### Hybrid Versioning & Sidebar UX Hardening

### Added
- **Universal Triage & Vitals Module**: Added to **Phase 7** of the roadmap to satisfy clinical encounter requirements for BP, PR, RR, Temp, and BMI.
- **HL7 v2 Integration Gateway**: Implemented outbound HL7 v2 generator (`PID`, `OBR`, `OBX`) and Mirth Connect bridge for outbound clinical data synchronization.
- **Medicine Inventory Expansion**: Added **Medicine Lots** support and automated stock tracking for precise clinical inventory management.
- **Immunization Compliance**: Integrated **NCVIA** and **CVX** standards for childhood and adult vaccination records.
- **Hybrid Versioning**: Implemented CalVer (Platform) and SemVer (API) hybrid versioning system.
- **Growth Chart Stability**: Added explicit numerical casting for all growth metrics (Weight, Height, HC) to prevent formatting crashes from string-type API responses.

### Changed
- **Pediatrics Dashboard**: Refactored prop-drilling to use a stable `patient` object throughout the component hierarchy.
- **Patient Profile Updates**: Enforced mandatory `amendment_reason` for demographic changes (e.g., gender correction) to maintain CDIM compliance and audit trail integrity.
- **Roadmap Realignment**: Marked **Advanced Pediatrics Suite**, **Immunization Management**, and **HL7 Transport Gateway** as [x] COMPLETED following successful feature verification.

### Fixed
- **ReferenceError**: Resolved `patient is not defined` in `PediatricsDashboard.jsx`.
- **TypeError**: Resolved `dataPoint.value?.toFixed is not a function` in `GrowthChart.jsx` via robust type-checking and null safety.

## [v1.14.0] - 2026-03-26
### Hardened SDE & Appointment Recovery

### Added
- **Hardened SDE (Structured Data Entry)**: Hierarchical symptom selection with **SNOMED CT Concept ID** mapping (e.g., Cough: `49727002`).
- **Within Normal Limits (WNL) Logic**: System-specific "Pertinent Negative" toggles with automated state clearing.
- **SDE Rendering Engine**: Narrative-style tag summaries for SDE data in the clinical timeline.

### Changed
- **Operational Protocol (DS-013)**: Implemented strict **User-Led Validation** model, requiring human clinical verification of all AI-generated features.
- **Appointment Validation**: Removed redundant `branch_id` requirement from the backend validator to allow automatic `BelongsToBranch` trait resolution.

### Fixed
- **Appointment 422 Error**: Resolved "Unprocessable Content" failure caused by missing `branch_id` in the frontend payload.

### Strategic Planning
- **Roadmap Expansion (Phase 7)**: Formalized the inclusion of **Patient Notification Engine** (SMS/Email) and **Advanced Pediatrics Suite** (WHO Percentiles/Vaccination Tracker) in `ROADMAP.md` and `spec.md`.

### Added
- [x] **Multi-Tenant Notification Engine**: 
    - Implemented `JuanClinicNotification` base class with `ShouldQueue` and `ShouldBeEncrypted` protocols.
    - Custom `TenantDatabaseChannel` with automatic `tenant_id`/`branch_id` injection and **AES-256 PHI encryption at rest**.
    - Dynamic `NotificationSettingsManager` for per-tenant SMTP and SMS provider configuration.
    - **Observability Layer**: Automated `notification_logs` for clinical non-repudiation and delivery tracking.
    - **Security Hardware**: Per-tenant rate limiting and generic "Privacy-First" messaging standards.
- [x] **Maintenance & Bug Fixes**:
    - Resolved **"Double Entry" error** for Dr. John Watson in appointment dropdowns by merging redundant accounts (IDs 6 & 7) and unifying clinical audit trails.
    - Corrected migration data types and foreign key references for `physical_branches`.
- **Appointment Reminder**: Triggered automated patient alerts (Email/Database) immediately upon appointment booking in `AppointmentController`.

## [v1.13.0] - 2026-03-24
### Documentation Hardening & Roadmap Alignment

### Added
- **Entity Authority Map**: Defined server-authoritative state transitions for clinical and financial entities.
- **Client-Server Sync Contract**: Standardized API retry logic, idempotency, and background sync protocols.
- **Offline Action Matrix**: Categorized clinical actions for low-connectivity HIS operations.
- **Deployment Topology**: Mapped Cloud-SaaS, Edge, and Client device runtime architecture.
- **Client-Server Security Model**: Documented trust boundaries and tenant-isolation guardrails.
- **HL7 Integration Guide**: Documented production ingestion flow (MLLP/TCP) and backend PID mapping service.
- **Medicine Management Pagination**: Server-side pagination for inventory scaling (10, 20, 50, 100 per page).

### Changed
- **Frontend Navigation**: Grouped-left pagination footer for consistency with Patient Registry.
- **App.jsx & Sidebar.jsx**: Harmonized `DIAGNOSTIC_APPROVER` and `TECH` roles to support clinical messaging and diagnostic review.

### Fixed
- **RBAC Blocker**: Resolved 403 Forbidden errors for the `DIAGNOSTIC_APPROVER` role on patient records, history, and analytical reports.
- **Dashboard UX**: Restored vertical scrolling for the main content area in `App.jsx`.
- **Sync Integrity**: Hardened prescription fetching to wait for valid `activeBranch` context.

## [v1.12.0] - 2026-03-21
### Workflow Hardening & Financial Integration

### Added
- **Pharmacy Worklist**: Integrated React component for tracking pending prescriptions and clinical dispensing.
- **Cashier Dashboard**: Unified React dashboard for settlement of diagnostic and pharmacy invoices.
- **Automated Billing Integration**: Automated link between clinical dispensing and financial record creation (INV/PAY).
- **Invoice & Payment Policies**: Hardened RBAC for financial modules to comply with segregation of duties standard.
- **Patient Attachments**: High-performance "Clinical Folders" UI with multi-tenant storage isolation.

### Changed
- **Prescription Form**: Added mandatory 'Quantity' field and Medicine ID tracking for precise inventory and billing.
- **Medicine Autocomplete**: Updated to support full object selection (generic/brand names and IDs).
- **Billing Controller**: Extended to support batch linking of prescriptions to payment invoices.

### Fixed
- **Authorization Blockers**: Resolved 403 Forbidden errors on billing retrieval by implementing missing Laravel Policies.
- **Financial Loop Null-Ref**: Fixed "Undefined array key" 500 error in `processPayment` when handling optional transaction IDs.
- **UI Consistency**: Fixed missing Quantity field in standard prescription entry forms.

## [v1.11.0] - 2026-03-18
### Clinical Core & Integrity Hardening

### Added
- **Pharmacy Module**: Complete backend for prescriptions and medication management in `backend/app/Models/Prescription.php`.
- **Billing Module**: Automated invoice generation and payment processing in `backend/app/Models/Invoice.php` and `backend/app/Models/Payment.php`.
- **Clinical Notes Module**: Structured SOAP/Progress documentation with signing logic in `backend/app/Models/ClinicalNote.php`.
- **Amendment System**: Core CDIM requirement via `backend/app/Traits/HasAmendments.php`. Implements "No Silent Overwrites" at the database layer.

### Changed
- **Order Management**: Refacted `OrderController.php` and `OrderPolicy.php` to enforce CDIM amendment tracking and role-specific validation.
- **Patient Registry**: Implemented duplicate patient detection and identity amendment tracking in `PatientController.php`.
- **UI Navigation**: Integrated new pharmacy, billing, and notes workspaces into the React frontend `App.jsx` and `Sidebar.jsx`.

### Fixed
- **WebSocket Connectivity**: Resolved Pusher/Echo connection failures by starting the Laravel Reverb server on port 8080.
- **CORS Policy**: Updated `backend/config/cors.php` to include `localhost:5174` and support for `X-Tenant-ID` and `X-Simulated-User` headers.
- **Technician & Approver Workflows**: Resolved 403 Forbidden and 422 errors hindering result entry and status transitions.

### Security & Integrity
- **CDIM Hardening**: Mandatory `amendment_reason` requirement for all clinical and patient identity updates.
- **2026-03-24**: Dynamic Dashboard Transition. Replaced static metrics and activity feed with live API hooks. Updated `App.jsx` with analytics states.
- **RBAC Matrix**: Synchronized documentation and enforcement for `TECH` and `DIAGNOSTIC_APPROVER` roles.
- **Multi-Tenant Isolation**: Hardened `EnsureUserBelongsToTenant` middleware to prevent race conditions during tenant context switching.

---
*Reference current system state via walkthrough.md and code_review.md in the brain folder.*
