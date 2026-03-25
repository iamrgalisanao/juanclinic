# JuanClinic HIS - Developer Changelog

## [2026-03-24] - Documentation Hardening & Roadmap Alignment

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

## [2026-03-21] - Workflow Hardening & Financial Integration (Phase 4 Finalization)

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

## [2026-03-18] - Clinical Core & Integrity Hardening

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
