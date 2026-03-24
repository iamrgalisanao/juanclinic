# Client-Server Security Model

This document defines the security boundaries and trust relationships for the JuanClinic HIS, ensuring compliance with the Philippines Data Privacy Act (RA 10173).

## 1. Trust Boundaries
*   **Untrusted Client**: The React frontend is considered an untrusted environment. All logic performed client-side must be re-verified server-side.
*   **Trusted API**: The Laravel backend is the authoritative trust anchor.
*   **Tenant Isolation**: Cross-tenant data access is physically and logically blocked by the `EnsureUserBelongsToTenant` middleware.

## 2. Authentication & Authorization Flow
1.  **Identity Verification**: Multi-factor authentication (MFA) is mandatory for clinical and admin roles.
2.  **JWT / Session Tokens**: Signed tokens are used for stateless API authorization.
3.  **Role-Based Access Control (RBAC)**: All API routes and methods are gated by Laravel Policies (e.g., `PatientPolicy`, `OrderPolicy`).
4.  **Implicit Tenancy**: The `tenant_id` is automatically extracted from the authenticated user context and applied to all Eloquent queries via global scopes.

## 3. Data Protection (At Rest & In Transit)
*   **In Transit**: TLS 1.3 is mandatory for all communications.
*   **At Rest**: Sensitive PHI (Personal Health Information) is encrypted at the storage level.
*   **Field-Level Hashing**: Passwords and PINs are hashed using Argon2id.

## 4. Audit and Compliance
*   **Zero-Blindness Logging**: Every clinical record modification and PHI access event is logged with:
    *   `user_id`
    *   `tenant_id`
    *   `timestamp`
    *   `action_type`
    *   `ip_address`
*   **DPA Enforcement**: Automated "Right to Object" and "Right to Erasure" portals are provided for patients, subject to clinical data retention laws.

## 5. Security Guardrails
*   **CORS Hardening**: Strict origin-mapping for API access.
*   **Rate Limiting**: Throttling to prevent brute-force and DoS attacks.
*   **Input Sanitization**: Multi-layer sanitization (Frontend validation + Backend middleware) for all clinical payloads.
