# JuanClinic HIS: Official User Manual (V1.0)
*Step-by-Step Operational Guide for Clinical & Administrative Staff*

---

## 📑 Table of Contents
1. [General Navigation](#general-navigation)
2. [Doctor's Workflow](#doctors-workflow)
3. [Front Desk Workflow](#front-desk-workflow)
4. [Pharmacy Workflow](#pharmacy-workflow)
5. [Administrator Workflow](#administrator-workflow)
6. [Compliance & Security](#compliance--security)

---

## 🧭 General Navigation
Common actions for all users:
1. **Login**: Use your tenant-specific credentials.
2. **Dashboard**: View your daily "Mission Control" for active patient throughput.
3. **Help Guide**: Click the floating **(?) HELP GUIDE** button in the bottom right for instant, page-specific instructions.
4. **Logout**: Always logout before leaving your workstation to protect patient data.

---

## 👨‍⚕️ Doctor's Workflow
*Primary Module: Clinical Documentation & E-Prescribing*

### Task 1: Documenting a Clinical Encounter
1. Navigate to **Clinical Notes** via the sidebar.
2. Select the patient from the registry.
3. Review previous notes and vitals on the profile.
4. Click **Add Clinical Note**.
5. Document findings using the **SOAP** framework:
   - **Subjective**: Patient's reported symptoms.
   - **Objective**: Physical exam and vitals.
   - **Assessment**: Differential or final diagnosis.
   - **Plan**: Next steps/Consultation result.
6. Click **Finalize Note**. (Note: Amendments will be version-tracked).

### Task 2: Issuing a Prescription
1. Within the Patient Profile, click **New Prescription**.
2. Start typing the medication in the **Drug Name** field.
3. Select the correct item from the **Medicine Autocomplete** (PNF or Local Inventory).
4. Enter Dosage, Frequency, and Duration.
5. Review and click **Submit Prescription**.

---

## 👩‍💼 Front Desk Workflow
*Primary Module: Registration & Scheduling*

### Task 1: Registering a New Patient
1. Click **New Patient** from the top header.
2. Complete the demographics form accurately:
   - Full Name, Date of Birth (Age auto-calculates), Gender, and Contact Number.
3. Click **Register Patient**.
4. The system automatically assigns a **JUAN-ID** for tracking.

### Task 2: Managing Appointments
1. Navigate to **Appointments**.
2. Select a date on the calendar.
3. To book: Click an available slot and search for the patient.
4. Upon patient arrival: Click **Mark as Arrived** on the daily list. This notifies the clinical team immediately.

---

## 💊 Pharmacy Workflow
*Primary Module: Medicine Inventory & Dispensing*

### Task 1: Updating Medicine Stock
1. Navigate to **Pharmacy -> Medicines**.
2. Search current inventory to verify stock levels.
3. To add a new medication: Click **Add Medicine**.
4. Enter the Generic Name, Brand (if applicable), Form (e.g., Tablet), and Strength.
5. Select **Save Medicine**.

### Task 2: Dispensing Medications
1. Navigate to **Pharmacy -> Dispensing**.
2. Review the list of 'ACTIVE' prescriptions.
3. Click an order to view the full physician instructions.
4. Prepare the medication and verify against the patient's ID.
5. Click **Mark as Dispensed** to complete the workflow.

---

## 👔 Administrator Workflow
*Primary Module: Reports & Audit Trails*

### Task 1: Compliance Audit
1. Navigate to **Reports**.
2. Select **Audit Logs**.
3. Filter by date/user to review system actions (Registration, Deletion, Access).
4. Export the report for RA 10173 (DPA) compliance verification.

### Task 2: System Performance
1. Use the **Dashboard** analytics to monitor total patient visits and clinical completion rates.
2. Review **Medicine Usage** reports to optimize inventory levels.

---

## 🔒 Compliance & Security
- **Strict Isolation**: Never share your login. Permissions are role-restricted.
- **DPA Notice**: Accessing records of patients not under your care is a violation of the Philippines Data Privacy Act.
- **Data Exchange**: All lab/rad orders follow HL7/FHIR compatibility standards.

---
*Manual Version 1.0 | JuanClinic Technical Team*
