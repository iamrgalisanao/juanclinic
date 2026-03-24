# Offline Action Matrix

This document defines the behavior of the JuanClinic HIS during intermittent or sustained loss of cloud connectivity.

## 1. Action Categorization
*   **A: Read-Only (Local Cache)**: Data available from previous syncs. No modifications allowed.
*   **B: Queued-Write**: Modifications allowed and queued locally for later sync.
*   **C: Blocked-Offline**: Action REQUIRES server-side verification and is disabled offline.

## 2. Clinical Action Matrix

| Clinical Area | Read (A) | Write / Update (B) | Delete (C) | Conflict Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Patient Search** | Yes (Cached) | No (Blocked) | No | High |
| **Patient Registration** | No | Yes (Queued) | No | Low |
| **Clinical Orders** | Yes (Own) | Yes (Queued) | No | Moderate |
| **Result Entry** | Yes | Yes (Queued) | No | Low |
| **Prescriptions** | Yes | Yes (Queued) | No | Moderate |
| **Auth / Login** | Yes (Pin) | No (Blocked) | No | High |
| **Reporting** | No | No | No | N/A |

## 3. Financial Action Matrix

| Financial Area | Read (A) | Write / Update (B) | Delete (C) | Conflict Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Invoice Viewing** | Yes | No | No | Low |
| **Payment Entry** | No | No (Blocked) | No | Critical |
| **Refund Processing** | No | No (Blocked) | No | Critical |

## 4. Conflict Resolution Strategy
*   **Clinical Data (SOAP/Orders)**: Merge based on source-author (Doctor vs. Tech). If conflict occurs, the server-side "Reference Content" is kept, and the local version is saved as a "Conflict Draft" for manual review.
*   **Identity Data**: Use the server version. If local changes are rejected, the user is notified to re-verify the identity details.

## 5. User Feedback (UI)
*   **Status Indicator**: A persistent `ConnectivityBadge` (Online/Offline/Syncing) is visible in the top navigation.
*   **Action Blocking**: Buttons for `Blocked-Offline` actions are disabled with a tool-tip: "Connectivity Required for Financial Operations".
