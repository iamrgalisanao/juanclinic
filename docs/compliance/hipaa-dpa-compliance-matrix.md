# HIPAA & DPA (RA 10173) Compliance Matrix

| Requirement | Implementation | JuanClinic Feature |
| :--- | :--- | :--- |
| **Right to Inform** | Privacy Notice on Login | Landing Page / Tenant Portal |
| **Right to Access** | Export as PDF/HL7 | EMR Timeline / Result Viewer |
| **Audit Trails** | `audit_logs` table | `AuditLogTrait` (Eloquent) |
| **Least Privilege** | Role-based Middleware | RBAC (Doctors/Techs) |
| **Data Integrity** | Standards-based Validation | HL7 Schema Validator |
| **Encryption** | Laravel Encrypted Casts | Demographics Persistence |
| **Transmissibility** | TLS 1.3 | API Connectivity |
| **Data Portability** | FHIR Resource Profiles | Export API (JSON/FHIR) |

## DPA Exceptions & Lawful Basis
- **Clinical Contract**: Processing is necessary for the provision of medical diagnosis or treatment.
- **Emergency**: Processing is necessary to protect the life and health of the data subject.
