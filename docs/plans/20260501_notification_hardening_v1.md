# Implementation Plan: Hardening Patient Notification Ecosystem (Phase 13)

Hardening and enhancing the existing Email Notification system for JuanClinic to align with WHO standards and Philippine Data Privacy Act (DPA) best practices. This phase establishes a robust foundation for the upcoming SMS integration.

## User Review Required

> [!IMPORTANT]
> **Tiered Reminders**: We are moving from a single T-1 (24h) reminder to a tiered sequence (T-3 and T-1). Please confirm if this frequency aligns with your clinic's SOPs.

> [!WARNING]
> **Rescheduling Policy**: Adding a "Reschedule" link in emails will allow patients to modify their status. This requires the `AppointmentController` to handle state transitions from "CONFIRMED" to "RESCHEDULE_REQUESTED".

## Proposed Changes

### 1. Data Model Hardening [Layer 2: Navigation/Context]

#### [MODIFY] [Patient.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Models/Patient.php)
- Add `communication_preferences` (JSON) to track opt-ins for specific channels (Email/SMS).
- Add `preferred_language` support for `TAGLISH`.

#### [NEW] [Migration: Add Notification Preferences](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/database/migrations/2026_05_01_170000_add_notification_preferences_to_patients.php)
- Column: `communication_preferences` (default: `{"email": true, "sms": false}`).
- Column: `last_notification_audit_at` (timestamp).

---

### 2. Notification Intelligence [Layer 3: Tools]

#### [MODIFY] [PatientAppointmentReminder.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Notifications/PatientAppointmentReminder.php)
- Implement **Tiered Messaging**: Change tone based on whether it is a T-3 (Friendly reminder) or T-1 (Final call).
- Add **Reschedule Action**: Generate a signed URL for a new `/portal/reschedule/{uuid}` route.
- Add **Calendar Integration**: Include an `.ics` attachment for Google/Outlook.

#### [MODIFY] [ImmunizationReminder.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Notifications/ImmunizationReminder.php)
- Add **Educational Context**: Pull vaccine-specific "Why it matters" snippets from a new config or terminology table.
- Enhance **Anti-Spam**: Refine the 7-day cooldown to be dose-specific.

---

### 3. Scheduling Logic [Architecture/Automation]

#### [MODIFY] [SendRemindersCommand.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Console/Commands/SendRemindersCommand.php)
- Refactor `handle()` to query for both `now()->addDays(3)` and `now()->addDay()`.
- Add tagging to the notification data to distinguish the reminder tier.

#### [MODIFY] [SendImmunizationReminders.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Console/Commands/SendImmunizationReminders.php)
- Extend scan to include "Upcoming Milestones" (Due in 7 days) as well as "Overdue".

---

### 4. Governance & Audit [Architecture]

#### [MODIFY] [AuditLogTrait.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Traits/AuditLogTrait.php)
- Ensure the `NotificationSent` event is captured in the global audit trail with metadata (Channel: Email, Status: Dispatched).

## Verification Plan

### Automated Tests
- `php artisan test --filter=NotificationTest`
- Verify that `T-3` reminders do not trigger twice if run multiple times.
- Verify that "TAGLISH" renders correct string interpolations.

### Manual Verification
- Trigger a T-1 reminder and verify the "Confirm" and "Reschedule" links in a mail trap.
- Verify that the Patient Portal correctly handles the signed URL for rescheduling.
