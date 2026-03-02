# JuanClinic Personas

This document defines the primary user personas for the JuanClinic Multi-Tenant HIS, mapping to the Role-Based Access Control (RBAC) tiers.

---

## 1. System Administrator (Global Admin)
**Role Code:** `ADMIN` (Global context)
- **Profile:** A member of the NIMI/JuanClinic technical team.
- **Goals:** Ensure platform stability, manage clinic onboarding (tenants), and oversee global licensing.
- **Key Actions:**
    - Create and disable Tenants (Clinics).
    - Monitor system-wide audit logs for security.
    - Global user management.
- **HIS Mode Elevation:** Always Mode 3 (Enterprise Control).

---

## 2. Clinic Administrator (Facility Lead)
**Role Code:** `ADMIN` (Tenant-locked)
- **Profile:** The practice manager or clinic lead at a specific facility.
- **Goals:** Manage the clinic's local operations, staff access, and reporting.
- **Key Actions:**
    - Add/Remove staff members (Doctors, Techs).
    - Configure clinic-specific HL7/FHIR endpoints.
    - View financial and clinical performance reports for their clinic.
- **Isolation:** Strictly limited to their own Tenant data.

---

## 3. Clinical Specialist (Doctor)
**Role Code:** `DOCTOR`
- **Profile:** A licensed physician or specialist treating patients.
- **Goals:** Efficiently manage patient health records, diagnostic orders, and treatment plans.
- **Key Actions:**
    - Register and manage Patients.
    - Create Clinical Orders (Lab/Rad).
    - Review diagnostic results and sign-off on plans.
    - Manage clinical appointments.

---

## 4. Diagnostics Lead (Lab/Rad Technician)
**Role Code:** `TECH`
- **Profile:** A technician working in the laboratory or imaging department.
- **Goals:** Process diagnostic orders and ensure accurate data ingestion into the EMR.
- **Key Actions:**
    - View the Clinical Worklist for incoming orders.
    - Update order status (PENDING -> IN_PROGRESS -> COMPLETED).
    - Ingest HL7 messages from diagnostic machines.

---

## 5. Front Desk / Receptionist
**Role Code:** `RECEPTIONIST`
- **Profile:** Staff member handled patient check-in and scheduling.
- **Goals:** Streamline patient flow and ensure demographic accuracy.
- **Key Actions:**
    - Patient Registration and Demographic updates.
    - Basic Appointment scheduling.
    - Payment/Insurance collection (Billing).

---

## 6. Patient (Future Phase)
**Role Code:** `PATIENT`
- **Profile:** The healthcare consumer receiving care.
- **Goals:** Access their own medical records and communicate with their provider.
- **Key Actions:**
    - View diagnostic results.
    - Request or reschedule appointments.
    - Update personal contact information.
- **Security:** Strict PII protection via individual user-to-patient record mapping.
