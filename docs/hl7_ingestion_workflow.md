# HL7 Ingestion Process Workflow

This document outlines the end-to-end technical flow for ingesting HL7 v2 messages and transforming them into internal Clinical Orders within the juanclinic HIS.

## 1. High-Level Flow Diagram

```mermaid
sequenceDiagram
    participant UI as Frontend (App.jsx)
    participant API as Backend (HL7Controller)
    participant SVC as HL7Processor Service
    participant DB as Database (MySQL/Audit)
    participant WS as Real-time (Reverb)

    Note over UI,WS: HL7 Ingestion Workflow

    UI->>UI: User clicks "Ingest HL7" (Simulated)
    UI->>API: POST /api/hl7/ingest (Raw HL7 String)
    
    API->>API: Identify Tenant Context & Middleware Guards
    API->>API: Fetch Tenant Validation Level (Minimal/Strict)
    
    API->>SVC: process(rawMessage, tenantId)
    
    rect rgb(240, 240, 240)
        Note right of SVC: HL7 Parsing Logic
        SVC->>SVC: Split segments by \r
        SVC->>SVC: Parse MSH (Message Header) for Type
        SVC->>SVC: Match PID (Field 3) to Patient Database
        SVC->>SVC: Extract OBR (Order Details, Priority, Type)
    end

    SVC->>SVC: Apply Multi-Tenant Validation Rules
    
    SVC->>DB: CREATE Order (Status: PENDING)
    SVC->>DB: CREATE AuditLog (Event: HL7_IMPORT)
    
    DB-->>WS: Broadcast New Order Event
    WS-->>UI: Sync Sidebar/Worklist (Real-time Laravel Echo)
    
    SVC-->>API: Return Order Object
    API-->>UI: 200 OK (order_id)
    UI->>UI: Update Global State / Notification
```

## 2. Component Responsibilities

### Frontend (`App.jsx` / `api.js`)
- **Simulation Layer:** Generates a mock HL7 ORM (Order Message) containing the patient's external ID, name, and a requested test (e.g., CBC).
- **Communication:** Sends the raw string via the `ingestHL7` service function.
- **Reception:** Listens for the broadcasted `OrderCreated` event to refresh the Worklist immediately.

### Backend Controller (`HL7Controller.php`)
- **Extraction:** Retrieves the tenant context from the request headers (`X-Tenant-ID`).
- **Policy Enforcement:** Checks tenant-specific settings to determine if the message requires "Strict" or "Minimal" validation.

### Processing Service (`HL7Processor.php`)
- **Parsing:** Destructures the HL7 string into segments.
- **Entity Matching:**
    - **Patient:** Uses `PID-3` to find the internal `patient_id`.
    - **Priority:** Maps `OBR-27` (STAT/ROUTINE).
    - **Type:** Maps `OBR-4` test codes to internal types (LAB/RAD).
- **Persistence:** Creates the database record only if both tenant and patient verification pass.

## 3. Data Integrity & Logging

### Audit Compliance
Every successful ingestion triggers an `HL7_IMPORT` audit event. This log persist:
1. **The Raw Message:** The exact string received from the external source.
2. **Metadata:** Extracted facility and message type headers.
3. **Outcome:** The specific validation level used during ingestion.

### Tenant Isolation
The ingestion process is strictly bound by the `tenant_id`. Messages referencing patients outside the current tenant's scope are rejected with a 422 error, preventing cross-tenant data leakage.

## 4. HL7 Specification Used
- **Version:** v2.3 Compatible
- **Supported Messages:** `ORM^O01` (Order Message), `ORU^R01` (Observation Result)
- **Primary Segments:** `MSH` (Header), `PID` (Patient Identity), `OBR` (Observation Request)
