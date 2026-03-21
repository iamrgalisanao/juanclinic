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
| **PhilHealth / eClaims** | Optional | Optional / custom | Yes / expected |
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

## Tier 2 Compliance Hardening (In Progress)

To ensure full compliance with Tier 2 (Group / Multi-Doctor Clinic) standards, the following roadmap items are being prioritized:

1.  **DYNAMISM**: Transitioning `Reports.jsx` analytics from high-fidelity simulations to live clinical/revenue data hooks.
2.  **FORMALIZATION**: Implementing an explicit `physical_branches` entity layer within the single-tenant context.
3.  **INTERCONNECTIVITY**: Enabling consent-based cross-tenant referrals for patient care continuity across branches.
