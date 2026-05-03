# Implementation Plan: MD Referral Integration (Phase 14)

Integrating an "MD Referral" feature that allows clinicians to refer patients to external specialists using the `all_doctors.json` catalog.

## User Review Required

> [!IMPORTANT]
> The `all_doctors.json` catalog contains ~8,000 records but lacks **Email Addresses** and **PRC License Numbers** for many entries. These are legally required for formal Philippine referrals. 
> We will implement a "Shadow Data" strategy where clinicians can fill in these details the first time they refer to a specific external doctor.

## Proposed Changes

### 1. Data Foundation (Backend)

#### [NEW] [ExternalProvider.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Models/ExternalProvider.php)
- Model to store external doctors from the JSON catalog.
- Fields: `name`, `specialty`, `sub_specialty`, `clinic_name`, `address`, `contact_details` (JSON), `prc_no` (nullable), `email` (nullable).

#### [NEW] [create_external_providers_table.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/database/migrations/2026_05_01_110000_create_external_providers_table.php)
- Migration for the `external_providers` table.

#### [NEW] [ImportReferralNetwork.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Console/Commands/ImportReferralNetwork.php)
- Artisan command `juanclinic:import-referral-network` to parse `all_doctors.json` and populate the table.

### 2. API Layer

#### [MODIFY] [api.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/routes/api.php)
- Add `GET /api/external-providers/search` for search-as-you-type specialist discovery.
- Add `POST /api/external-providers/{id}/refer` to record the referral.

### 3. Frontend UI

#### [MODIFY] [PatientProfile.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/PatientProfile.jsx)
- Add "MD REFERRAL (EXTERNAL)" option to the "NEW ORDER" dropdown.
- Add state for `showExternalReferralForm`.

#### [NEW] [ExternalReferralForm.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/ExternalReferralForm.jsx)
- A new form allowing search by name/specialty.
- Displays doctor details and allows the user to input the missing Email/PRC if needed.
- Enforces DPA consent proof.

## Verification Plan

### Automated Tests
- `php artisan juanclinic:import-referral-network` (Verify records created).
- Test search endpoint with various specialties (e.g., "Cardiology").

### Manual Verification
- Open "New Order" -> Select "MD Referral".
- Search for "Angel Rafael Dilig" (from JSON).
- Confirm selection and submission.
- Verify entry appears in Patient History/Timeline.
