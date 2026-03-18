# PR Review Checklist: JuanClinic HIS

## 0. Automated CI Gates (Mandatory)
- [ ] **PHI Leak Guardrail**: Passed (No PHI in logs/storage/fixtures).
- [ ] **Tenant Isolation Guardrail**: Passed (100% scoped query coverage).
- [ ] **Clinical Unit Tests**: Passed (100% pass rate).

## 1. Tenant Isolation (Row-Level)
| ✅ Verify | ❌ Forbidden |
| :--- | :--- |
| Every tenant table includes `tenant_id` | `Model::all()` or `Model::find()` |
| ORM models use `BelongsToTenant` trait | Raw SQL without `tenant_id` filter |
| Queries are explicitly tenant-scoped | Unscoped background jobs |
| Jobs carry and re-authorize tenant context | Silent tenant isolation bypass |
| Exports enforce `tenant_id` filtering | Cross-tenant access without workflow |

## 2. PHI & Privacy (RA 10173)
| ✅ Verify | ❌ Forbidden |
| :--- | :--- |
| Sensitive data uses `SafeAuditLogger` | PHI logged in plaintext |
| TLS 1.3 enforced in transit | PHI in `localStorage` or `sessionStorage` |
| Restricted data encrypted via AES-256 | PHI embedded in URL parameters |
| Screenshots use only synthetic data | Real patient data in tests or docs |
| Access control applied to all PHI views | PHI sent to external analytics/telemetry |

## 3. Clinical Data Integrity
- [ ] **No Silent Overwrite**: Finalized results use amendment-only flows (history preserved).
- [ ] **State Machines**: Workflow uses explicit states (e.g., `RESULT_VERIFIED`).
- [ ] **Referral Network**: Patient consent recorded and revocable.
- [ ] **Audit Trail**: Every clinical state change triggers an `audit_logs` entry.

## 4. Governance & Extra Approvals
Certain code changes REQUIRE specialized sign-offs:

| Change Type | Extra Review Required |
| :--- | :--- |
| **Clinical Rules/Logic** | Medical Domain Reviewer |
| **Patient Identity/Merge** | Senior Engineer / DPO |
| **Billing/Totals/Refunds** | Finance Domain Reviewer |
| **Tenant Isolation Bypass** | Security Specialist |
| **HL7/FHIR Integrations** | Integration Specialist |

## 5. Security & Privacy (RAIN Audit)
- [ ] **R**esponsibility: Actor identity is verified and authorized.
- [ ] **A**udit: All clinical state changes log to the Audit Engine.
- [ ] **I**solation: No cross-tenant data leakage risk.
- [ ] **N**on-Repudiation: Critical actions (e.g., Result Release) are attributable.
