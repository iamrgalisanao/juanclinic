# Current Focus: Clinical Catalog Ingestion (Medicine Import v1)

## Active Phase
- Phase 17: Ingesting Enterprise Clinical Catalog (90k+ Brands)
- Clinical Safety: Neonatal Age Precision & Corrected Age Logic Hardening

## Key Objectives
- Import `docs/all_brand_details.json` into `medicines` table.
- Implement `ClinicalCatalogService` with Regex-based Packaging Parser.
- Hydrate `MedicineForm` records with bulk stream ingest.
- Ensure system-wide availability (`is_system = true`).

## Completed Objectives
- [x] Orchestrator Expansion (Billing, Portal, EMPI, etc.)
- [x] SuperAdmin UI Categorization
- [x] Route Gating & Entitlement Cache Validation

## Guardrails
- **Strict Isolation**: Feature gating must remain resolved at the tenant level, avoiding any cross-tenant leakage.
- **Entitlement-First**: Centralized logic in `EntitlementService` must be the source of truth for all checks.
- **Schema Discipline**: New columns must be added via additive migrations, maintaining backward compatibility.
- **Audit-Ready**: All orchestration toggles must generate detailed `audit_logs` entries for governance tracking.
