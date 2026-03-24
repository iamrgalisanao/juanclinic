# Entity Authority Map

This document defines the source of truth and modification authority for core clinical entities in the JuanClinic HIS.

## 1. Authority Principles
*   **Server-Side Authority**: The Laravel backend is the final authority for all persistent data and state transitions.
*   **Client-Side Optimistic Updates**: The React frontend may perform optimistic updates for UI responsiveness, but these are subject to server validation and rollback on failure.
*   **Locked-Down Clinical Records**: Once signed or completed (e.g., Clinical Notes, Results), records are immutable and require formal amendments for modification.

## 2. Entity Matrix

| Entity | Primary Authority | Modification Rule | State Transition Owner |
| :--- | :--- | :--- | :--- |
| **Patient Demographics** | Server | Strict Multi-Tenant Isolation | Registrar / Admin |
| **Clinical Orders (LAB/RAD)** | Server | CDIM "No Silent Overwrite" | Doctor (Order) / Tech (Result) |
| **Clinical Results** | HL7 Ingest / Tech | Immutable once approved | Diagnostic Approver |
| **Prescriptions** | Server | Requires quantity & generic/brand ID | Prescribing Physician |
| **Invoices / Payments** | Server | Financial Segregation of Duties | Cashier / Billing Admin |
| **Audit Logs** | Server | Append-only (System Driven) | Core Audit Engine |

## 3. State Transition Ownership

### Diagnostic Workflow
*   `PENDING` -> `IN_PROGRESS`: Automatically triggered upon first result entry by a Technician.
*   `IN_PROGRESS` -> `COMPLETED`: Triggered by `DIAGNOSTIC_APPROVER` after mandatory review.

### Financial Workflow
*   `UNPAID` -> `PAID`: Triggered by `CASHIER` upon successful payment verification.
*   `PAID` -> `REFUNDED`: Requires `SUPER_ADMIN` or `BILLING_MANAGER` approval.

## 4. Conflict Resolution
In cases of divergence between client state and server state, the server response ALWAYS takes precedence. The frontend MUST implement `SyncConflict` UI handlers for clinical data divergence.
