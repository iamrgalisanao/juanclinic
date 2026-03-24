# Client-Server Sync Contract

This document defines the interface and reliability protocols between the React PWA (Client) and the Laravel API (Server) for clinical data synchronization.

## 1. Protocol Fundamentals
*   **RESTful JSON API**: All state transitions occur over defined API endpoints.
*   **State-Awareness**: The client MUST track the `sync_status` (Pending, Synced, Conflict) of all locally modified clinical records.
*   **Tenant Scoping**: All requests MUST include the `X-Tenant-ID` header for strict isolation.

## 2. Synchronization Flow

### Outbound (Client to Server)
1.  **Queueing**: Locally modified records are added to the `OutgoingSyncQueue` in `IndexedDB`.
2.  **Transmission**: Background synchronization worker attempts to post queued actions to the server.
3.  **Acknowledgment**: Server responds with `201 Created` or `200 OK` and the persisted record ID.
4.  **Local Commit**: Client marks the record as `Synced` upon acknowledgment.

### Inbound (Server to Client)
1.  **Polling / WebSockets**: Client listens for state updates via Laravel Reverb (Pusher protocol).
2.  **Versioning**: Each clinical entity MUST include a `version_id` or `updated_at` timestamp for cache invalidation.
3.  **Merge**: Client updates local `IndexedDB` with server-authoritative data.

## 3. Resilience and Retries

### Retry Strategy
*   **Exponential Backoff**: Failed requests due to connectivity issues (5xx, 0) MUST retry with exponential backoff (starting at 1s, max 60s).
*   **Idempotency**: All clinical write operations MUST use an `X-Idempotency-Key` (client-generated UUID) to prevent duplicate record creation during retries.

### Handling 4xx Errors
*   `401/403 (Auth/RBAC)`: Immediately stop sync and prompt for re-authentication.
*   `422 (Validation)`: Move action to `DeadLetterQueue` and alert the user for manual correction.

## 4. Conflict Resolution Model
*   **Last-Write-Wins (LWW)**: Default for non-clinical metadata.
*   **Semantic Merging**: For Clinical Notes (SOAP), attempt to reconcile changes based on line-by-line differences.
*   **Clinical Override**: In case of severe divergence, the user MUST be prompted to "Keep Server Version" or "Keep Local Version" (subject to Audit Log tracking).
