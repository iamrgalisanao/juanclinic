# Disease-First Drug Discovery Feature Implementation Plan

## Approval

Approved to proceed with a disease-first drug discovery workflow, subject to the execution boundaries and safeguards below.

## Objective

Implement a clinically guided medicine discovery flow in JuanClinic HIS where the user:

1. searches by disease or symptom term,
2. selects a normalized disease entry,
3. views medicines mapped to that disease,
4. selects a medicine,
5. reviews medicine details,
6. optionally proceeds to form/strength selection for prescribing or formulary actions.

This feature is intended to improve search relevance, support safer prescribing workflows, and align the UI with the structured medicine/disease relationships observed in the source workflow.

---

## Execution Boundaries

### In Scope

* Disease-first search UX for medicine discovery
* Disease suggestion lookup
* Disease-to-medicine result listing
* Medicine detail view integration
* Optional medicine form selection for prescribing/formulary workflows
* Backend support for disease, medicine mapping, and detail retrieval
* Search and retrieval APIs required for this workflow

### Out of Scope for Phase 1

* AI-assisted differential diagnosis
* ranking logic based on patient-specific comorbidities
* automated prescribing recommendations
* insurance or formulary optimization logic
* dosage calculators and interaction alerts beyond current medicine detail display
* offline sync or mobile-specific optimization

### Key Constraints

* Do not collapse disease suggestions and medicine results into one ambiguous search result list
* Do not allow prescribing to persist against broad `medicine_id` when exact `medicine_form_id` is required downstream
* Do not make disease mapping tenant-only if the intent is to support a shared system knowledge base
* Do not assume free-text symptom search is sufficient without normalized disease selection

---

## Problem Summary

A flat medicine search is noisy and clinically weak because a user typing a complaint like `cough` may need:

* the broad disease term `Cough`
* a more specific normalized condition like `Dry cough`
* or the set of medicines mapped to the selected condition

A direct medicine-only search forces the clinician to sift through brands or content strings without a structured clinical anchor.

A disease-first flow improves:

* search precision
* UX clarity
* structured mapping
* future decision support opportunities

---

## Target User Flow

## Step 1 — Choose Search Mode

The user selects a search mode such as:

* Disease
* Brand
* Generic
* Formulary

For this feature, the primary path is **Disease**.

## Step 2 — Enter Disease/Symptom Term

The user types a broad clinical term, for example:

* cough
* fever
* hypertension

## Step 3 — Show Disease Suggestions

The system returns normalized disease suggestions, for example:

* Cough
* Cough with phlegm
* Dry cough

## Step 4 — Select Disease

The user selects one disease entry.

## Step 5 — Show Mapped Medicines

The left panel changes from disease suggestions to a medicine result list such as:

* Ambroxyl
* Amucogen
* Ascof
* Ascof Forte

## Step 6 — Select Medicine

The user selects a medicine from the disease-linked result list.

## Step 7 — Show Medicine Details

The right panel displays:

* brand
* company
* generic/content
* therapeutic class
* regulatory classification
* indications
* dose
* contraindications
* precautions
* side effects
* drug interactions
* packaging

## Step 8 — Optional Prescribing/Form Selection

If the user is prescribing or adding to formulary, the workflow continues into:

* form selection
* strength selection
* dose selection
* other SIG-related selections as supported

---

## Functional Requirements

## FR1 — Search Mode Selector

The UI shall provide a mode selector that supports at least:

* Disease
* Brand
* Generic

The selected mode shall affect the left-panel search behavior.

## FR2 — Disease Suggestion Search

When the user types into Disease mode, the system shall return normalized disease suggestions instead of medicines directly.

## FR3 — Disease Selection State

Once a disease is selected, the UI shall switch the left panel into a medicine-result state tied to that disease.

## FR4 — Disease-to-Medicine Listing

The system shall return all medicines mapped to the selected disease and display them in the left panel.

## FR5 — Medicine Detail Display

When a medicine is selected, the right panel shall display the medicine detail view.

## FR6 — Form-Aware Prescribing Handoff

If the user proceeds to prescribing or formulary actions, the selected medicine shall transition to form-aware selection and eventually resolve to `medicine_form_id`.

## FR7 — Search Context Visibility

The UI shall clearly show the active search context, for example:

* `3 disease drugs found for "cough"`
* `Drugs containing "Cough"`

## FR8 — Back Navigation

The user shall be able to navigate back from medicine results to disease suggestions without retyping the original term.

---

## UX Design Principles

### Principle 1 — Disease Before Drug

Do not immediately dump medicine results for broad symptom text. Normalize the clinical term first.

### Principle 2 — Left Panel as Guided Funnel

The left panel should function as a progressive selection funnel:

* disease suggestions first
* disease-linked medicines second

### Principle 3 — Right Panel as Evidence Pane

The right panel should remain focused on the currently selected medicine detail.

### Principle 4 — Preserve Search Context

The UI should clearly indicate whether the user is currently viewing:

* disease suggestions
* disease-linked medicine results
* medicine detail

### Principle 5 — Prescribing Precision

The workflow may begin at disease level, but the final prescribing action must resolve to an exact form/strength variant.

---

## Proposed Backend Data Model Support

## 1. `diseases`

Represents normalized disease or clinical condition terms.

### Suggested Columns

* `id`
* `name`
* `key_code` nullable
* `disease_type` nullable
* `status`
* timestamps

## 2. `medicine_disease_map`

Maps diseases to medicines or forms.

### Suggested Columns

* `id`
* `disease_id`
* `medicine_id` nullable
* `medicine_form_id` nullable
* `source` nullable
* `is_system` boolean default true
* timestamps

### Rule

For discovery, the UI may list by `medicine_id`. For final prescribing, the system must resolve to `medicine_form_id`.

## 3. `medicines`

Catalog master record.

## 4. `medicine_forms`

Specific dispensable/prescribable variants.

---

## Relationship Model

The recommended conceptual flow is:

```text
search term -> disease suggestions -> selected disease -> mapped medicines -> selected medicine -> medicine forms -> prescribing/formulary action
```

This should be implemented as:

* `Disease hasMany medicine mappings`
* `Medicine hasMany forms`
* `Prescription references medicine_form_id`

---

## API Design Proposal

## Endpoint 1 — Disease Search

### Purpose

Return normalized disease suggestions for a user-entered term.

### Example

```text
GET /api/clinical/diseases/search?q=cough
```

### Response Shape

```json
{
  "data": [
    { "id": 1, "name": "Cough" },
    { "id": 2, "name": "Cough with phlegm" },
    { "id": 3, "name": "Dry cough" }
  ]
}
```

## Endpoint 2 — Disease Medicines

### Purpose

Return medicines mapped to a selected disease.

### Example

```text
GET /api/clinical/diseases/{id}/medicines
```

### Response Shape

```json
{
  "disease": { "id": 1, "name": "Cough" },
  "data": [
    {
      "medicine_id": 101,
      "brand_name": "Ambroxyl",
      "generic_name": "Ambroxol HCl",
      "company_name": "Nurturemed Pharma Inc."
    }
  ]
}
```

## Endpoint 3 — Medicine Detail

### Purpose

Return medicine detail for the right panel.

### Example

```text
GET /api/medicines/{id}
```

## Endpoint 4 — Medicine Forms

### Purpose

Return available forms/strengths for downstream prescribing or formulary workflows.

### Example

```text
GET /api/medicines/{id}/forms
```

---

## Frontend Component Plan

## Component A — Search Mode Control

### Responsibilities

* switch between Disease, Brand, Generic modes
* clear or preserve search term appropriately
* reset left-panel state safely

## Component B — Disease Search List

### Responsibilities

* render disease suggestions
* handle loading, empty state, and selection
* emit `disease:selected`

## Component C — Disease Medicine Result List

### Responsibilities

* render medicines mapped to the selected disease
* show context header such as `Drugs containing "Cough"`
* support back navigation to disease suggestions
* emit `medicine:selected`

## Component D — Medicine Detail Panel

### Responsibilities

* render medicine details
* display clinical metadata sections
* expose actions for prescribing or add-to-formulary flows

## Component E — Optional Prescribing/Form Selector

### Responsibilities

* load and display available forms for the selected medicine
* support downstream prescription workflows
* ensure final selection resolves to `medicine_form_id`

---

## State Management Proposal

Track at least the following state:

* `searchMode`
* `searchTerm`
* `diseaseSuggestions`
* `selectedDisease`
* `diseaseMedicines`
* `selectedMedicine`
* `medicineDetails`
* `medicineForms`
* `leftPanelState` where values may be:

  * `disease_suggestions`
  * `disease_medicines`

### Important Rule

Changing the search mode or clearing the term must reset dependent state to avoid stale results.

---

## Search Behavior Rules

### Disease Mode

* typed text returns disease suggestions
* selecting a disease returns mapped medicines

### Brand Mode

* typed text returns medicine/brand matches directly

### Generic Mode

* typed text returns generic-based medicine matches directly

### Future Optional Rule

Support a unified fallback search only if the user explicitly requests broad matching.

---

## Database and Query Considerations

## Recommended Query Pattern

### Disease search

```sql
SELECT id, name
FROM diseases
WHERE name LIKE '%cough%'
ORDER BY name;
```

### Disease-to-medicine mapping

```sql
SELECT m.id, m.brand_name, m.generic_name, m.company_name
FROM medicine_disease_map mdm
JOIN medicines m ON m.id = mdm.medicine_id
WHERE mdm.disease_id = ?;
```

### Form lookup

```sql
SELECT *
FROM medicine_forms
WHERE medicine_id = ?;
```

### Clinical note

If disease mappings are eventually form-specific, move downstream actions to `medicine_form_id` while preserving the broader medicine list UX.

---

## Implementation Phases

## Phase 1 — Backend Foundation

### Tasks

1. create or confirm `diseases` table
2. create `medicine_disease_map`
3. implement disease search endpoint
4. implement disease-to-medicines endpoint
5. implement medicine detail endpoint compatibility
6. implement medicine forms endpoint compatibility

## Phase 2 — Frontend Disease-First Workflow

### Tasks

1. add search mode selector
2. build disease suggestion state
3. build disease medicine result state
4. wire back navigation
5. preserve right-panel medicine detail rendering

## Phase 3 — Prescribing/Form Integration

### Tasks

1. connect selected medicine to form lookup
2. ensure prescribing/formulary workflow uses `medicine_form_id`
3. validate detail consistency across drug discovery and prescribing flows

## Phase 4 — Verification and Hardening

### Tasks

1. verify left-panel transitions
2. verify disease search accuracy
3. verify mapped medicines render correctly
4. verify medicine details remain correct
5. verify prescribing handoff resolves exact form variants

---

## Verification Plan

## Automated Verification

### Backend

* disease search returns expected matches
* selected disease returns mapped medicines
* medicine detail endpoint returns expected clinical fields
* medicine forms endpoint returns expected form variants

### Frontend

* search mode switching resets state correctly
* disease suggestions render correctly
* selecting a disease replaces suggestion list with medicine results
* back navigation restores the disease suggestion list
* selected medicine renders in the detail panel

### Data Integrity

* no disease result is shown without a valid disease id
* no medicine detail panel is shown for an invalid medicine id
* form selection resolves exact `medicine_form_id`

## Manual Verification

Use the following flow:

1. set search mode to Disease
2. type `cough`
3. verify suggestions such as:

   * Cough
   * Cough with phlegm
   * Dry cough
4. select `Cough`
5. verify medicine result list appears
6. select one medicine such as `Ambroxyl`
7. verify detail panel renders correctly
8. verify downstream form selection works if prescribing/formulary flow is entered

---

## Risks and Mitigations

## Risk 1 — Disease list quality is inconsistent

### Mitigation

Normalize disease names and define a canonical disease table rather than relying solely on free-text labels.

## Risk 2 — Mapping quality is sparse or noisy

### Mitigation

Add auditable `medicine_disease_map.source` and validate core diseases manually before broad rollout.

## Risk 3 — Prescribing remains too broad

### Mitigation

Require downstream selection of `medicine_form_id` for actual prescription creation.

## Risk 4 — UI state becomes confusing

### Mitigation

Use explicit left-panel state modes and clear context labels.

## Risk 5 — Duplicate search logic across modes

### Mitigation

Use a shared search orchestration layer with mode-specific handlers.

---

## Deferred Enhancements

These should be explicitly deferred from Phase 1:

* disease synonym expansion
* patient-specific ranking
* interaction warnings in search results
* insurance/formulary restrictions during disease search
* AI-assisted recommendation ranking
* evidence or guideline overlays

---

## Success Criteria

This feature is successful when:

1. users can type a disease term and get normalized disease suggestions
2. selecting a disease returns clinically relevant medicines
3. selecting a medicine shows correct detail data
4. downstream workflows can continue to exact form/strength selection
5. the UI clearly distinguishes disease search from medicine result state

---

## After Execution Return Items

After implementation, return:

1. final endpoint list
2. schema updates made
3. component list changed or added
4. screenshots or walkthrough notes for the full disease-first flow
5. known gaps or deferred enhancements

---

## Decision Summary

Proceed with a disease-first drug discovery feature using a normalized disease suggestion step followed by disease-linked medicine discovery.

This approach is clinically safer, easier to understand, and more aligned with a structured HIS medicine architecture than a flat direct-drug search.
