# JuanClinic HIS - Developer Changelog

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
- **RBAC Matrix**: Synchronized documentation and enforcement for `TECH` and `DIAGNOSTIC_APPROVER` roles.
- **Multi-Tenant Isolation**: Hardened `EnsureUserBelongsToTenant` middleware to prevent race conditions during tenant context switching.

---
*Reference current system state via walkthrough.md and code_review.md in the brain folder.*
