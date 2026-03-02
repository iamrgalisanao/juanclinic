# Doctor Workflow: Initial Real-World Scenario

In the **JuanClinic** HIS, the doctor's initial workflow is designed for high-efficiency, multi-tenant environments (e.g., a doctor working across multiple clinics or departments within the same building).

## 1. Contextual Login (Tenant Selection)
- **Action**: Upon logging in, the doctor must select their active **Tenant** (Clinic/Dept) via the `TopBar`.
- **System Behavior**: The application sets a tenant-scoped token (`setTenantToken`) ensures strict data isolation. 
- **Real-World Benefit**: Prevents cross-clinic data leakage and ensures the doctor only sees patients relevant to their current shift.

## 2. Schedule Review (Appointments View)
- **Action**: The doctor navigates to the `Appointments` dashboard (`#appointments`).
- **Workflow**:
    - View the daily/weekly grid of scheduled patients.
    - Identify `STAT` priorities or urgent follow-ups.
- **Key UI**: The drag-and-drop calendar allows for quick rescheduling if a procedure runs late.

## 3. The Patient Encounter
- **Action**: Changing Appointment Status to `IN_PROGRESS`.
- **Documentation**: 
    - The doctor reviews the `Reason for Visit`.
    - During the consultation, they update the `notes` field (intended for SOAP notes: Subjective, Objective, Assessment, Plan).
- **Audit Requirement**: The system logs the start time and the doctor ID for compliance.

## 4. Clinical Ordering (Lab/Rad)
- **Action**: Creating a `Clinical Order` via the `OrderController`.
- **Details**:
    - **Order Type**: Select `LAB` or `RAD`.
    - **Priority**: Set to `STAT` for immediate processing or `ROUTINE`.
    - **Shared Tech Access**: The order appears on the **Shared Worklist**, allowing a centralized Lab/Rad technician to see it while maintaining the originating clinic's data ownership.

## 5. Result Monitoring & HL7 Sync
- **Action**: Monitoring the `Clinical Worklist` on the main dashboard.
- **Integration**: 
    - As diagnostic devices finish tests, the `HL7Controller` ingests the results directly into the system.
    - The order status in the `Worklist` automatically moves to `COMPLETED`.

## 6. Closing the Encounter
- **Action**: Finalizing notes and setting status to `COMPLETED`.
- **Next Step**: The patient is moved to the "Billing" or "Discharge" phase (handled by administrative staff).
