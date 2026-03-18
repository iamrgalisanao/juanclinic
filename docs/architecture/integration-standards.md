## 1. Integration Isolation (Adapter Pattern)
External systems MUST be handled via Adapters in `app/Integrations/`.

- **Canonical State Mapping**:
    - `ORM^O01` -> Triggers `ORDER_CREATED`.
    - `ORU^R01` -> Triggers `RESULT_READY`.
- **Mandatory Control**: All clinical integrations MUST STOP at `RESULT_READY`. Silent transition to `RESULT_RELEASED` is forbidden without specialized sign-off.

- **Structure**:
    - `Integrations/HL7/`: Message parsers and builders.
    - `Integrations/FHIR/`: Resource mappers.
    - `Integrations/External/`: System-specific gateways (e.g., PhilHealth, Labs).

## 2. Message Traceability & Audit
Every inbound/outbound interaction MUST be logged in the **Integration Audit Trail**.

- **Required Fields**:
    - `source_system` / `target_system`
    - `message_type` (e.g., HL7 ORU^R01, FHIR Patient)
    - `correlation_id` (Internal trace ID)
    - `external_reference_id` (External control ID)
    - `status` (SUCCESS, PARTIAL, FAILURE, PENDING_REVIEW)

## 3. Idempotency & Conflict Resolution
- **Process Once Only**: All ingestion flows must verify the `correlation_id` or `message_control_id` to prevent duplicate processing of the same message.
- **Clinical Reconciliation**: If an inbound result arrives for an order that is already `COMPLETED`, the system must flag it for **Clinical Review** instead of silent overwrite.

## 4. Reliability & Failure Handling
- **Retry Policy**: Use exponential backoff for transient network issues (max 3 retries).
- **Dead Letter Queue (DLQ)**: All clinical messages that fail final processing must be moved to the DLQ for manual investigation.
- **Alerting**: Failure of a "STAT" order integration must trigger a **High-Priority Clinical Notification**.

## 5. Payload Security
- **PHI Masking**: Raw integration payloads containing PHI must be masked in general application logs.
- **Storage**: Full raw payloads may be stored in the encrypted Audit Storage for 6 months (DPA compliance), but must not be accessible to standard TECH/ADMIN roles.
