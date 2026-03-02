# Multi-Tenant HIS – Architecture & Operational Definition

---

# North Star

A **multi-tenant HIS (EMR + LIS + RIS/PACS)** that enables clinics to:

- Register patients  
- Place clinical and diagnostic orders  
- Perform laboratory and radiology workflows  
- Deliver validated clinical results  

While guaranteeing:

- **Strict tenant isolation**
- **Full auditability**
- **Standards-based interoperability (HL7 / FHIR / DICOM)**
- **Healthcare regulatory compliance**

---

# Integrations

The system must integrate with the following external systems (some optional depending on deployment model).

---

## 1. Laboratory Analyzers / Middleware (HL7 v2 ORU/ORM)

**Purpose**
- Automatic result import  
- Instrument status updates  
- Analyzer worklists  

**Typical Integrations**
- Analyzer middleware (e.g., Roche, Abbott)
- Direct HL7 feeds

**`.env` Requirements (Examples)**
