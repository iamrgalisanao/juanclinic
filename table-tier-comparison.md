# JuanClinic: Tier Comparison Matrix

| Feature | Tier 1: Solo Clinic | Tier 2: Group / Multi-Doctor Clinic | Tier 3: Hospital / Enterprise HIS |
| :--- | :--- | :--- | :--- |
| **Target customer** | 1 doctor / small clinic | Multi-doctor clinic / branches | Hospital / medical center / enterprise group |
| **Deployment model** | Cloud SaaS | Cloud SaaS / hybrid | Cloud, on-prem, or hybrid |
| **Tenancy** | Single clinic tenant | Multi-branch tenant | Multi-facility / enterprise multi-tenant |
| **Users included** | Doctor + secretary / assistant | Multiple doctors, nurses, cashiers, admins | Department-wide users with role hierarchy |
| **Patient registration** | Yes | Yes | Yes |
| **Appointment scheduling** | Yes | Yes | Yes |
| **EMR / encounter notes** | Yes | Yes | Yes |
| **E-prescription** | Yes | Yes | Yes |
| **Lab requests** | Yes | Yes | Yes |
| **Medical certificates** | Yes | Yes | Yes |
| **Billing / invoices** | Basic | Standard with cashiering | Advanced hospital billing |
| **Patient search** | Yes | Yes | Yes |
| **Document upload** | Yes | Yes | Yes |
| **Mobile access** | Yes | Yes | Usually yes, plus workstation workflows |
| **Branch support** | No / limited | Yes | Yes |
| **Shared patient records** | No / optional | Yes | Yes |
| **Doctor calendar mgt.** | Basic | Advanced | Advanced |
| **Clinical templates** | Limited | Yes | Yes |
| **Role-based access** | Basic | Yes | Advanced |
| **Audit trail** | Basic | Yes | Full audit trail |
| **Inventory / pharmacy** | No / optional | Optional | Yes |
| **LIS integration** | No / optional | Optional | Yes |
| **RIS / PACS integration** | No | No / optional | Yes |
| **Specialty Care (Pediatrics, etc.)** | No / optional | **Premium / Optional** | Yes |
| **PhilHealth / eClaims** | Roadmap Refined | Roadmap Refined | Yes / expected |
| **Queue management** | No / optional | Optional | Yes |
| **HR / payroll** | No | No | Optional / available in enterprise suites |
| **Telemedicine** | Optional | Optional | Optional / integrated |
| **Reports / analytics** | Basic | Standard management reports | Enterprise and regulatory reports |
| **API / third-party** | Limited | Moderate | Advanced |
| **Data migration** | Minimal | Moderate | Full migration project |
| **Training** | Basic onboarding | Structured onboarding | Full implementation training |
| **Support** | Business-hours support | Priority support | SLA-based support |
| **Customization** | Minimal | Moderate | Extensive |
| **Pricing model** | Monthly subscription | Monthly subscription + fee | Implementation fee + maintenance |

---

## Tier 2 Compliance Hardened (2026-03-24)

The system now fully complies with Tier 2 (Group / Multi-Doctor Clinic) standards through the following hardened implementations:

1.  **DYNAMISM**: All `Reports.jsx` analytics are powered by live database queries via `ReportController`.
2.  **FORMALIZATION**: Global `branch_id` isolation is enforced at the model level for all clinical and administrative entities.
3.  **INTERCONNECTIVITY**: Consent-based referrals are secured with cross-tenant cryptographic isolation.
4.  **SCALABILITY**: Implemented server-side pagination for **Medicine Management**, ensuring inventory performance for large multi-branch stocks.
5.  **COORDINATION**: Harmonized `DIAGNOSTIC_APPROVER` RBAC to allow direct clinical messaging between Radiologists/Pathologists and ordering physicians.
6.  **ENTITLEMENT**: Integrated commercial feature gating to allow module-specific subscription granting for specialty care (Pediatrics, Neonatal).
