juanclinic/
├── architecture/                 # LAYER 1: STRATEGIC (SOPs & Business Rules)
│   ├── hl7_integration_sop.md
│   ├── laravel_multitenancy_sop.md
│   ├── patient_navigation_sop.md
│   └── system_architecture.md
├── docs/                         # Detailed Documentation & Operational Truth
│   ├── architecture/             # Technical Models & Guardrails (Execution Truth)
│   │   ├── subagents/            # Operational Architectural Logic (Subagents)
│   │   │   ├── patient_validator.md
│   │   │   ├── code-scanner.md
│   │   │   ├── auth-auditor.md
│   │   │   └── refactor-scanner.md
│   │   ├── clinical-state-machine-map.md
│   │   ├── database-persistence-guardrails.md
│   │   ├── integration-standards.md
│   │   ├── multi-tenancy-model.md
│   │   └── unified-clinical-architecture.md
│   ├── compliance/               # RA 10173 & HIPAA Compliance Docs
│   ├── security/                 # Security Models & Guardrails
│   │   ├── patient-data-security-model.md
│   │   └── security-hygiene-guardrails.md
│   ├── standards/                # Mandatory Engineering Standards
│   │   ├── clinical-data-integrity-model.md
│   │   └── pr-review-checklist.md
│   └── RBAC_matrix.md            # Role-Based Access Control
├── backend/                      # LAYER 2: NAVIGATION (Context & Logic)
│   ├── app/
│   │   ├── Http/                 # Controllers & Middleware
│   │   │   ├── Controllers/Api/  # PrescriptionController, OrderController
│   │   │   └── Middleware/       # CheckRole, TenantUser
│   │   ├── Models/               # Patient, Order, Prescription, User
│   │   ├── Policies/             # PrescriptionPolicy, OrderPolicy
│   │   └── Traits/               # HasAmendments (CDIM Versioning)
│   ├── routes/
│   │   └── api.php               # Protected Tenant Routes
│   └── database/                 # Migrations & Seeders
├── frontend/                     # LAYER 2: NAVIGATION (UI & Flow)
│   ├── src/
│   │   ├── components/           # UI Components (PrescriptionForm, Sidebar)
│   │   ├── services/             # api.js (Backend integration)
│   │   └── App.jsx               # Main Router & Worklist Logic
├── tools/                        # LAYER 3: TOOLS (Deterministic Scripts)
│   ├── hl7_generator.py          # HL7 v2/FHIR message creation
│   ├── schema_validator.py       # JSON Schema enforcement
│   └── tenant_config_seeder.py   # Automated tenant provisioning
├── gemini.md                     # PROJECT CONSTITUTION (Strategy)
├── spec.md                       # DOMAIN SPECIFICATIONS (Compliance)
├── CHANGELOG.md
├── ROADMAP.md                    # Quartet: Milestone tracking
├── progress.md                   # Quartet: Milestone percentages & Readiness
├── findings.md                   # Quartet: Security & Compliance scan results
└── Operational_protocol.md       # LAYER 1: EXECUTION (Task Gating)
