# Implementation Plan: Clinical Catalog Import (Phase 12 Foundation)
**Plan ID**: 20260501_clinical_catalog_import_v1

This plan outlines the process for importing the `docs/all_disease_brands.json` dataset into the JuanClinic database to power the "Disease-First Drug Discovery" feature.

## Architectural Self-Audit
- **Guardrail Check**: PASSED. All clinical entities use `AuditLogTrait`.
- **Tenant Isolation**: PASSED. System-wide catalog uses `is_system = true`.
- **Idempotency**: PASSED. Command uses `updateOrCreate`.

## User Review Required

> [!IMPORTANT]
> The import will populate the `diseases`, `medicines`, and `medicine_disease_map` tables. If there is existing data with conflicting names, it will be updated or skipped based on the final command logic.
> 
> [!NOTE]
> The JSON contains absolute image URLs (CloudFront). These will be stored in the `metadata` or `image_url` fields if applicable, but we will not download the assets during this phase.

## Proposed Changes

### Backend: Artisan Command

#### [NEW] [ImportClinicalCatalog.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Console/Commands/ImportClinicalCatalog.php)
- **Purpose**: A dedicated CLI tool to parse the 1.3MB JSON file and populate clinical master tables.
- **Key Features**:
    - **Transaction Safety**: Wrap the entire import or batches in database transactions.
    - **Normalization**: Ensure `is_system = true` for all imported records.
    - **Conflict Resolution**: Key `Disease` by name and `Medicine` by brand name to prevent duplicates.
    - **Audit Log**: Every record creation will trigger the `AuditLogTrait`.

### Data Mapping

| JSON Field | Target Model | Target Column |
| :--- | :--- | :--- |
| `disease_name` | `Disease` | `name` |
| `disease_id` | `Disease` | `source_id` |
| `brand_name` | `Medicine` | `brand_name` |
| `brand_id` | `Medicine` | `source_id` |
| `generic_content` | `Medicine` | `generic_name` |
| `company_name` | `Medicine` | `company_name` |
| `brands[]` | `MedicineDiseaseMap` | (Relationship) |

## Verification Plan

### Automated Tests
- **Pre-Import Check**: Verify current counts (`Disease: 15`, `Medicine: 29`).
- **Post-Import Check**: Run the command and verify counts increase significantly.
- **Sample Query**: Query a specific disease (e.g., "Abdominal pain") and verify its mapped medicines (e.g., "Buscopan Plus") are correctly linked.

### Manual Verification
- Execute `php artisan juanclinic:import-clinical-catalog` and monitor console output for errors or progress.
- Verify `audit_logs` table reflects the bulk creation.
