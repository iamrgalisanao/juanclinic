# 🩺 JuanClinic - Physician's User Guide (Quick Start)

Welcome to JuanClinic! This manual is written specifically for doctors and healthcare professionals. We have designed JuanClinic to be an intuitive, patient-first platform that stays out of your way so you can focus entirely on delivering care. 

---

## 1. Navigating the Patient Registry
The Patient Registry is your master list of all patients assigned to your clinic or branch.

### Accessing the Registry
- **Action:** Click the **"Patients"** menu item on the left-side navigation bar.
- **Expected Result:** You will instantly see a tabular list of all active patients belonging to your clinical branch.

### Searching for a Patient
- **Action:** Click inside the **"Search by name or MRN..."** text box at the top right of the Patient screen, type the patient's name, and press **Enter**.
- **Expected Result:** The system securely filters the list, returning only records matching your search query. 

### Opening a Patient's Clinical File
- **Action:** Click anywhere on the specific patient's row in the table.
- **Expected Result:** The screen transitions to the **Patient Profile**—your central command center for treating this specific individual.

---

## 2. Generating New Clinical Orders
From inside the **Patient Profile** screen, you can electronically prescribe medications and request diagnostic tests without paper forms.

### Creating a Medication Prescription
- **Action:** Click the green **"New Order"** button in the top right corner of the Patient Profile, then select **"Medication Prescription"** from the drop-down menu.
- **Expected Result:** An e-Prescribing (eRx) interface slides onto the screen, providing tools to log medications, dosages, and frequencies.

### Requesting Diagnostic Tests (Lab / Imaging)
- **Action:** Click the green **"New Order"** button, then select either **"Diagnostic Order (LAB)"** or **"Diagnostic Order (RAD)"**.
- **Expected Result:** A digital requisition form appears. Upon submitting, the order routes directly to the respective department's screen, queuing the patient automatically.

### Initiating a Cross-Tenant Referral
- **Action:** Click the green **"New Order"** button, then select **"Cross-Tenant Referral"**.
- **Expected Result:** A secure referral interface opens. You can now transfer this patient's medical context to an external specialist who exists outside your specific clinic branch.

---

## 3. Reviewing Clinical History
Immediately beneath the patient's demographics on their Profile, you will see several Clinical Tabs for navigating historical data.

### Viewing the Longitudinal Timeline
- **Action:** Click the **"Longitudinal History"** tab.
- **Expected Result:** The page alters to show a chronological, visual timeline of every interaction the patient has had with the clinic (Orders, Prescriptions, Appointments).

### Reviewing Pediatrics & Growth Charts
- **Action:** Click the **"Pediatrics / Growth"** tab.
- **Expected Result:** If the patient is a minor, this tab will render an interactive layout plotting their Weight, Height, and BMI against standard World Health Organization (WHO) curves to identify stunting or obesity risks.

---

## 4. e-Prescribing Pediatric Safety Features
We built "invisible guardrails" directly into the **Medication Prescription** form to prevent mathematical errors in pediatric care.

### Using the Dosage Calculator
- **Action:** When prescribing for a child, input your desired formulation in the **"Target Dosage (mg/kg)"** box.
- **Expected Result:** Because the system already knows the child's last recorded weight from the triage unit, it automatically executes the math and calculates the precise daily mg.

### Triggering Safety Ceilings
- **Action:** Accidentally input a target dosage exceeding `60 mg/kg` or an absolute grand total that surpasses `1,000 mg`.
- **Expected Result:** The system denies standard styling and flashes an **Amber Toxicity Warning**. If it exceeds the absolute limit (1000mg), it will visually hard-cap the math to ensure a lethal dosage cannot be blindly signed into record.

---

## 5. Your Clinical Worklist (Reviewing Test Results)
When laboratory scientists complete blood work or read an x-ray, it enters a queue meant for your final medical approval.

### Accessing the Pending Inbox
- **Action:** Click the **"Worklist"** menu item on the left-side navigation bar.
- **Expected Result:** You will see an inbox listing exclusively Diagnostic Orders waiting in a "Pending Approval" state.

### Signing Off on a Result
- **Action:** Click on a pending result, review the documented findings, and click the **"Approve & Sign"** button at the bottom of the review pane.
- **Expected Result:** The document becomes finalized and securely locked. It instantly pushes into the patient's permanent clinical record, ensuring the lab results are legally attributed to your clinical license.

---

## 6. Privacy First Operations (RA 10173)
Doctors must actively participate in securing Protected Health Information (PHI) under the Philippine Data Privacy Act.

### Restricting Data Processing (Right to Object)
- **Action:** Scroll to the bottom of the Patient Profile, find the Privacy & DPA section, and click **"Request Access"** beneath "Right to Object".
- **Expected Result:** A formal consent restriction workflow is initiated. An alert is sent to Administration to toggle data restrictions for this patient.

### Removing Patient Data (Right to Erasure)
- **Action:** Click the **"Formal Request"** button beneath "Right to Erasure".
- **Expected Result:** You will receive a critical confirmation prompt. Acknowledging this action permanently journals a deletion request to the infrastructure engineers, securely wiping the patient's longitudinal history from the platform.

---
*End of Guide. For credentialing issues or system errors, contact your local Clinic Administrator.*
