# SOP: HL7 v2 Integration (ORU/ORM)

## 1. Objective
Implement a deterministic, secure, tenant-isolated HL7 pipeline for lab/radiology orders and results.

## 2. Enforcement Modes (Admin Config)
- **Mode 0 (MVP):** Basic MSH validation, facility-to-tenant mapping, and sync ACKs.
- **Mode 1 (Standard):** Required PID/OBR/OBX field validation, structured logging.
- **Mode 2 (Accreditation):** Message idempotency (MSH-10), detect replay, LOINC mapping rules, async queueing.
- **Mode 3 (Enterprise):** Per-tenant encryption keys, WORM audit logs, IP whitelisting.

## 3. Message Flow
1. **Ingress:** Receive via MLLP or HTTPS.
2. **Tenant Resolution:** Map `SendingFacility` (MSH-4) to `tenant_id`. Reject unknown/mismatched facilities.
3. **Validation:** Level dictated by `hl7.validation.level` setting.
4. **Queue & Process:** If queued, return ACK immediately and process asynchronously.
5. **Persistence:** Write to DB ensuring `tenant_id` scope.

## 4. Audit & Security
- Log raw messages (redacted if PHI rules apply).
- Traceability: Store `correlation_id`, `tenant_id`, and `control_id`.
