# JuanClinic HIS - Developer Changelog

## [v1.40.0] - 2026-04-10
### SuperAdmin Commercial Workspace: Global SaaS Orchestration

### Added
- **Platform Command Center**: A high-fidelity "Control Tower" for global tenant governance and infrastructure monitoring.
- **Commercial Tier Orchestration**: Implemented a point-and-click interface to transition tenants between Bronze, Silver, Gold, and Trial tiers.
- **Granular Feature Cherry-Picking**: A visual matrix to enable or disable premium modules (Pediatrics, PACS, Inventory, Pharmacy) on an organization-by-organization basis.
- **Administrative Impersonation**: Secure, context-switched impersonation protocol with mandatory audit logging for platform technical support.
- **Impersonation Awareness**: High-visibility TopBar badge alert surfacing context-switch status and one-click session termination.

### Changed
- **Entitlement Logic**: Refactored `EntitlementService` to prioritize commercial entity attributes over legacy configuration blocks, ensuring high-performance access control.
- **Tenant Management**: Updated organizational settings with state-of-the-art multi-tenant provisioning wizards.

## [v1.35.0] - 2026-04-10
### Clinical Quality & Intelligent Triage: Closing the Safety Loop

### Added
- **Global Smart Triage**: Automated worklist prioritization that elevates 'STAT' orders and critical findings to the top of clinical queues.
- **Clinical "Hard-Stop" Verification**: Enforced system-level validation preventing new diagnostic orders for patients with unacknowledged life-safety findings.
- **Patient Safety Banner**: A high-visibility, persistent awareness layer surfacing unacknowledged vitals and critical lab markers throughout the clinician journey.
- **Safety Acknowledgment Protocol**: Implemented `acknowledged_at` metadata for vitals and labs to establishing a formal response-time audit trail.

### Changed
- **Order Entry**: Restricted 'New Order' creation when critical safety status is active.
- **Clinical Worklist**: Enhanced row styling with "STAT Glow" and high-priority pulses for urgent patient care.

## [v1.31.0] - 2026-04-10
### Unified Clinical History: Longitudinal Trend Intelligence

### Added
- **Clinical Chronicle (v1)**: A high-fidelity, chronological timeline merging encounters, labs, and vitals into a single clinical narrative.
- **Trend Engine**: Automated sparklines for Weight, Blood Pressure, and Pulse, supporting 5, 10, and 12-month trailing windows.
- **Delta Intelligence**: Automated percentage-based comparison (deltas) between the current and previous clinical data points.
- **Responsive History View**: Specialized UI for longitudinal review, optimized for high-density clinical data surfacing.

### Changed
- **Patient Profile**: Surfaced the Unified Chronicle as the primary diagnostic lens for physicians.
- **Backend API**: Expanded `PatientHistoryController` to include calculated trends and clinical drift analytics.

## [v1.33.0] - 2026-04-10
### Patient Portal v2: Responsive Parental Engagement

### Added
- **Mobile-First Dashboard**: Launched a completely redesigned, high-fidelity Patient Portal optimized for smartphones, tablets, and desktops.
- **Parental Growth Surveillance**: Integrated interactive growth charts allowing parents to visualize weight/height percentiles over time.
- **Digital Vaccination card**: Visual timeline of completed immunizations and predictive "Upcoming Milestones" for childhood protection.
- **Engagement Loop Integration**: Automated dual-language (EN/TL) reminders now direct parents to the high-fidelity portal v2.

### Changed
- **Navigation Architecture**: Implemented an adaptive navigation system (Bottom Nav for mobile, Sidebar for desktop).
- **Data Payload**: Expanded portal API to include predictive immunization milestones.

## [v1.30.0] - 2026-04-10
### Pediatric & Laboratory Hardening: Precision Clinical Integrity

### Added
- **Pediatric Dosage Calculator**: Implemented automated, weight-based (mg/kg) dosing logic to ensure medication safety for infants and children.
- **Filipino Milestone Checklist**: Integrated the Filipino-preferred (ECCD) developmental surveillance checklist for pediatricians.
- **Critical Lab Alerts**: Implemented real-time life-safety alerting (SMS/Email) specifically for critical diagnostic findings.
- **Age-Adjusted Clinical Ranges**: Standardized vitals and lab results now automatically flag status based on age-appropriate norms (e.g., higher heart rates in infants).
- **Hardened Lab Workflow**: Expanded diagnostic schema to include reference ranges and clinical flagging (H/L/C).

### Changed
- **Roadmap Refactoring**: Specialty modules (OB-GYN, Ophthalmology) have been moved to the **Deferred Features** section to focus on core clinical depth.

## [v1.29.0] - 2026-04-10
### Advanced Staff Scheduling: Enterprise Workforce Management

### Added
- **Cross-Branch Scheduling**: Implemented a robust shift management engine with automated conflict detection (preventing simultaneous assignments across physical branches).
- **Shift Swap Protocol**: Developed a collaborative exchange loop with administrative approval workflows.
- **Workforce Dashboard**: Created a high-fidelity calendar interface for medical staff shift optimization and coverage visualization.

## [v1.28.0] - 2026-04-10
### Prescription QR Loop: Secure Medication Fulfillment

### Added
- **Cryptographic RX Verification**: Automated generation of unique UUID-based QR codes for every digital prescription.
- **Partial Dispensing Logic**: Support for tiered medication fulfillment, allowing patients to purchase scripts in installments while maintaining clinical integrity.
- **Public/Private Verification Portal**: Integrated a pharmacy-facing dashboard for authenticity checks with obfuscated patient privacy layers.
- **Digital Prescription UI**: High-fidelity, print-ready digital script with embedded QR logic.

## [v1.27.0] - 2026-04-10
### Inventory Management v1: Clinical Supply & Reagent Integrity

### Added
- **Purchase-Driven Consumption**: Implemented automated stock deduction specifically upon **Confirmed Payment** (Invoice status: PAID), ensuring financial and physical alignment.
- **Categorical Stock Tracking**: Support for **Medical Supplies** and specialized **Laboratory Reagents**.
- **Batch & Expiry Monitoring**: Implemented batch-level tracking with FIFO (First-In-First-Out) deduction logic and critical expiry visual alerts.
- **Inventory Dashboard**: Created a high-fidelity control panel for branch-isolated stock management.

### [v1.26.0] - 2026-04-10
### Telehealth Bridge: Secure Remote Consultations

### Added
- **Secure Meeting Logic**: Automated generation of cryptographically unique **Jitsi Meet** rooms for `TELEHEALTH` visit types.
- **One-Click Clinical Handoff**: Integrated meeting links into automated reminders and the Patient Portal.
- **Session Lifecycle**: Implemented security tokens and expiry timestamps for remote video consultations.

## [v1.25.0] - 2026-04-10
### Patient Reminders & Engagement (Closing the Loop)

### Added
- **Automated Reminder Engine**: Implemented `juanclinic:remind` Artisan command to scan and notify patients 24-48 hours before appointments.
- **Multi-channel Outreach**: Support for **Email** and **Simulated SMS** notifications with per-patient preference tracking.
- **Localization (EN/TL)**: Support for English and **Tagalog (Filipino)** clinical Concierge templates.
- **One-Click Confirmation**: Implemented cryptographically **signed URLs** in emails, allowing patients to confirm appointments with a single click without logging in.
- **Engagement Settings**: New dashboard for clinical administrators to control global outreach parameters and window duration.

### Changed
- **Patient Schema**: Added `email`, `preferred_language`, and `notification_preferences` for engagement tracking.
- **Appointment Schema**: Added `last_reminder_sent_at` to prevent redundant notifications.

## [v1.23.0] - 2026-04-10
### Clinical Analytics v2: Outcome & Efficiency Tracking

### Added
- **Clinical Outcomes Dashboard**: Implemented a high-fidelity analytical view for **Population Health** and **Operational Efficiency**.
- **Demographics Distribution**: Added real-time tracking of patient Gender and Age Groups (Neonatal, Pediatric, Adult, Senior).
- **Turnaround Time (TAT) Analytics**: Implemented automated measurement of diagnostic efficiency (Avg. hours from Order to Completion).
- **Disease Prevalence Insights**: Added semantic extraction of common diagnosis keywords from signed clinical SOAP notes.
- **Visit Reliability Tracking**: Added Show vs. No-Show rate visualization for clinic appointments.

### Changed
- **Analytical Engine**: Expanded `ReportController` with deep-aggregation logic for medical outcomes.
- **Reports UI**: Integrated **Clinical Outcomes** as a major sub-tab within the unified Reporting module.

## [v1.22.0] - 2026-04-10
### BIR-Compliant Financial Reporting & Fiscal Identity

### Added
- **BIR Sales Journal (Register)**: Implemented automated sales journaling with regulatory-compliant breakdown of **VATable Sales**, **VAT (12%)**, and **VAT-Exempt Sales** (Senior/PWD).
- **Business Identity Layer**: Added mandatory fiscal fields (`tin`, `registered_business_name`, `official_address`) to Tenants, Branches, and Patients for regulatory alignment.
- **Financial Compliance Dashboard**: Created a specialized reporting interface for accountants with CSV export capabilities for BIR submission preparation.
- **Sequential Invoicing Hardening**: Reinforced numbering logic to ensure zero-drift sequential series across all clinical branches.

### Changed
- **Fiscal Models**: Expanded `tenants`, `physical_branches`, and `patients` schema to support Taxpayer Identification Number (TIN) tracking.
- **Reporting RBAC**: Restricted financial compliant reports to `ADMIN` and `FRONT_DESK` roles to ensure data privacy.

## [v1.21.0] - 2026-04-10
### RIS/PACS Clinical Hardening (Phase 6 Finalization)

### Added
- **Radiology Reporting Engine**: Implemented side-by-side **Findings** and **Impression** capturing within the `DICOMViewer`.
- **Diagnostic Loop Closure**: Added automated transition of `Order` status to `COMPLETED` upon finalization of a radiology study.
- **Radiologist Attribution**: Implemented verified digital signatures and status tracking (Preliminary vs. Finalized) for all imaging studies.
- **Interpretation Status Badging**: Enhanced `ImagingDashboard` with real-time reporting indicators to improve clinical oversight.

### Changed
- **Imaging Schema**: Expanded `imaging_studies` with reporting fields, radiologist foreign keys, and finalization locks.
- **RBAC Enforcement**: Hardened reporting endpoints to require `DOCTOR` or `DIAGNOSTIC_APPROVER` roles for final signature.

## [v1.20.0] - 2026-04-10
### Patient Portal v1: The Public Health Gateway

### Added
- **Responsive Patient Portal**: Implemented a standalone, mobile-first gateway (`PatientPortal.jsx`) for safe public access to health records.
- **PIN-Protected Authorization**: Secured portal links with mandatory PIN verification (Patient Date of Birth), ensuring DPA-compliant identity validation.
- **Clinical Summary Views**: High-fidelity visualizations for **Pediatric Growth Charts**, **Digital Vaccine Cards**, and **Diagnostic Summary** results.
- **Public Routing Layer**: Reconfigured `App.jsx` to support unauthenticated `#portal` hash-routing while maintaining strict cryptographic isolation.

### Changed
- **API Service Layer**: Expanded `api.js` with specialized headers for portal session persistence (`X-Portal-Access-Key`).
- **Access Control**: Hardened the `PatientPortalController` to ensure read-only access is restricted to the specific patient's data only.

## [v1.19.0] - 2026-04-10
### Commercial SaaS Feature Gating & Roadmap Alignment

### Added
- **SaaS Entitlement Engine**: Implemented real-time module locking for **Pediatrics**, **Neonatal**, and **Immunization** suites.
- **Cache-Aware Unlocking**: Refactored `EntitlementService` to support precise, on-demand cache invalidation when a SuperAdmin upgrades a tenant's subscription.

### Changed
- **Roadmap Refinement**: Deprioritized **PhilHealth eClaims** from the mandatory Phase 6 roadmap to align with the initial small-clinic rollout strategy.
- **Clinical Governance**: Applied `entitled` middleware across all specialized pediatric endpoints.
- **Unified Documentation**: Synchronized the **Tier Comparison Matrix** and **Roadmap** to reflect the deprioritization of large-hospital statutory bridges in favor of agile SaaS growth.

## [v1.18.0] - 2026-04-10
### Neonatal Care Suite (Infant Progress Unit)

### Added
- **Neonatal Progress Dashboard**: A specialized UI for infants (0-28 days) featuring **APGAR Trend Analysis** and **Weight Velocity Velocity Tracking**.
- **Corrected Age Calculations**: Integrated birth history logic to provide **Corrected Age** for premature infants (<37 weeks) across both backend and frontend.
- **Neonatal Summary API**: Highly-optimized `getNeonatalSummary` endpoint that consolidates birth history, gestational maturity, and early-life vitals.

### Changed
- **Executive Pediatrics View**: Updated `PediatricsDashboard` to automatically prioritize the **Neonatal Unit** as the default view for newborns.
- **Clinical Risk Indicators**: Implemented **High Surveillance** flagging based on APGAR scores (<7) and prematurity status.

## [v1.17.0] - 2026-04-10
### Autonomous Clinical Reminders Hardening

### Added
- **Multi-Tenant Scheduler Logic**: Refactored the `clinic:send-immunization-reminders` command to iterate through Tenants, ensuring memory-level isolation and tenant-specific delivery context.
- **PHI Privacy Protocol**: Enforced **AES-256 Encryption** for all system-generated vaccination alerts via the `ShouldBeEncrypted` protocol.
- **Tenant-Bound Scoping**: Background scans now correctly bind the `tenant` and `branch` context per iteration to prevent data cross-contamination.

### Changed
- **Governance Alignment**: Switched the standard database channel to **`TenantDatabaseChannel`** for all pediatric reminders to ensure tenant-restricted audit visibility.
- **Rate Limiting**: Integrated per-tenant rate limiting for automated notifications to prevent system-wide queue exhaustion.

## [v1.16.0] - 2026-04-10
### Clinical Governance Hardening (Specialty Suite)

### Added
- **Vitals Siphon Logic**: Automated extraction of clinical vitals (Weight, Height, HC, BP) from signed clinical notes into the unified `vitals` table.
- **SDOH Template**: Standardized **Social Determinants of Health (SDOH)** clinical template for capturing housing, food, and financial security metrics.
- **Pediatric Analysis Accessor**: Model-level `analysis` attribute for `Vital` record to provide real-time Z-Scores and Percentiles.

### Changed
- **Governance Alignment**: Applied `BelongsToBranch` and `AuditLogTrait` to `Vital` and `ImmunizationRecord` models to enforce multi-tenant branch isolation and clinical non-repudiation.
- **Schema Hardening**: Migrated `head_circumference_cm` to a dedicated column in the `vitals` table for better indexing and visualization performance.

### Fixed
- **Historical Data Drift**: Resolved missing BMI and HC values in legacy records via `2026_04_10_fixup_vitals_pediatric_analysis` migration.

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
