# Findings & Constraints

## Tech Stack
- **Frontend:** ReactJS
- **Backend:** Laravel PHP
- **Database:** MySQL
- **Architecture:** Web-based Multi-Tenancy

## Discovery (from HIS Architecture Doc)
- **North Star:** A multi-tenant HIS (EMR + LIS + RIS/PACS) enabling clinics to register patients, place clinical/diagnostic orders, performing laboratory/radiology workflows, and deliver validated clinical results. Guarantees strict tenant isolation, full auditability, standards-based interoperability (HL7/FHIR/DICOM), and regulatory compliance.
- **Integrations:**
    - **Laboratory Analyzers / Middleware:** HL7 v2 ORU/ORM for automatic result import, status updates, and worklists (e.g., Roche, Abbott).
- **Source of Truth:** *(Inferred: Multi-tenant database system following HI isolation standards)*
- **Delivery Payload:** Validated clinical results (likely PDF or HL7/FHIR feeds).
- **Behavioral Rules:** Strict tenant isolation and healthcare regulatory compliance (e.g., HIPAA/GDPR equivalent).

## Research Logs
### GitHub Resources
- [Health-Care-Management-System-Python-FastAPI](https://github.com/devalentineomonya/Health-Care-Management-System-Python-FastAPI): Modern healthcare platform for patient data and scheduling.
- [MedicalSystem (Python/PostgreSQL)](https://github.com/bl33h/medicalSystem): Manages doctors, facilities, and supplies.
- [Clinic-Management-Project (Django)](https://github.com/chazuttu/Clinic-Management-Project): Receptionist and doctor dashboards with online booking.

### Industry Best Practices
- **Prioritize routine tasks**: Automate appointment reminders, prescription refills, and patient intake.
- **Workflow Automation**: AI scribes for clinical documentation, automated billing, and medical coding are trending for 2026.
- **Gradual Approach**: Start with small, non-critical workflows to ensure reliability before scaling.

## Constraints
- **Strict Tenant Isolation**: Critical for multi-tenant safety.
- **Compliance**: HL7, FHIR, DICOM, and healthcare regulations.


