# Philippines Terminology Strategy for JuanClinic

## Approval

Approved to proceed with a Philippines-oriented terminology strategy for JuanClinic, using ICD-10 as the primary diagnosis coding standard for production workflows while preserving a broader multi-terminology architecture for future growth.

## Objective

Define a practical terminology strategy for JuanClinic that:

1. aligns with Philippine operational and claims realities,
2. supports current diagnosis coding expectations,
3. preserves room for richer clinical discovery and interoperability,
4. avoids overcommitting the system to scraped discovery terms as formal diagnosis truth.

---

## Executive Summary

For Philippine HIS workflows, the safest default diagnosis coding standard is:

* **Primary diagnosis coding standard:** `ICD10`

For procedure coding in claims-oriented workflows:

* **Primary procedure coding standard:** `RVS`

For discovery, search, and local clinical UX:

* **Supplemental local terminology layer:** `LOCAL`

For future interoperability or advanced clinical terminology support:

* **Supplemental terminology layers:** `SNOMED`, `ICD11`, `ICD11MMS`, `ICD10CM`

### Recommended Default

```text
coding_system default = ICD10
```

This should be the production-oriented default for diagnosis records that are intended for formal clinical coding and reimbursement-aligned use.

---

## Why ICD-10 Should Be the Primary Standard

### 1. Practical Philippine Claims Alignment

Philippine operational requirements continue to center on ICD-10 for diagnosis coding in reimbursement and institutional workflows.

### 2. Familiarity in Local Clinical and Administrative Practice

ICD-10 is broadly recognized in:

* hospital records
* billing and claims workflows
* reporting and coding processes

### 3. Lower Adoption Risk

Using ICD-10 as the default reduces implementation friction for:

* coders
* billing personnel
* health information staff
* clinics and hospitals transitioning from simpler systems

---

## Why JuanClinic Should Still Support Multiple Terminology Systems

Even though ICD-10 should be the primary production standard, JuanClinic should remain multi-terminology capable.

### Reasons

* disease-first discovery terms are not always formal diagnoses
* richer clinical concept mapping may benefit from SNOMED later
* future policy or interoperability needs may require ICD-11 support
* local search UX often depends on non-standard consumer-friendly terms

### Recommended Supported Systems

* `ICD10`
* `ICD10CM`
* `ICD11`
* `ICD11MMS`
* `SNOMED`
* `LOCAL`

---

## Recommended Terminology Model for JuanClinic

## 1. Canonical Diagnosis Concept Layer

Use the `diseases` table as the canonical concept layer.

### Recommended Core Fields

* `id`
* `source_id`
* `code`
* `coding_system`
* `name`
* `slug`
* `disease_type`
* `clinical_category`
* `is_system`
* `parent_id`
* `status`
* `review_status`
* timestamps

### Default Rule

If a disease is intended for formal coding or claims relevance, it should default to:

```text
coding_system = ICD10
```

---

## 2. Local Discovery Term Layer

Not every searchable condition term should become a formal coded diagnosis.

### Examples of non-canonical discovery terms

* consumer-friendly labels
* broad symptom entries
* scraped indication-like terms
* wellness or product-oriented phrases

These should be stored under:

```text
coding_system = LOCAL
```

or preferably in a dedicated synonym/search-term table.

### Recommended Table

`disease_terms`

Suggested fields:

* `id`
* `disease_id`
* `term`
* `term_type`
* `source_system`
* `source_id`
* `is_preferred`
* `status`
* timestamps

---

## 3. Code Crosswalk Layer

A single disease concept may need mappings to multiple coding systems.

### Recommended Table

`disease_code_mappings`

Suggested fields:

* `id`
* `disease_id`
* `coding_system`
* `code`
* `display_name`
* `map_type`
* `is_primary`
* `status`
* timestamps

### Example

A JuanClinic internal disease concept for hypertension may have:

* primary mapping: ICD-10 `I10`
* secondary mapping: SNOMED concept id
* future mapping: ICD-11 equivalent

---

## Production Terminology Rules

## Rule 1 — Formal coded diagnoses should prefer ICD-10

Any diagnosis intended for:

* charting
* billing
* claims-aligned reporting
* formal encounter documentation

should use `ICD10` as the primary code unless there is a specific reason not to.

## Rule 2 — LOCAL terms should not be treated as authoritative diagnoses by default

Scraped or imported terms should enter the system as:

* `LOCAL`
* `review_status = imported`

until reviewed or mapped properly.

## Rule 3 — Search UX may use LOCAL and synonym layers

Omni-search and disease-first discovery should be allowed to use:

* LOCAL search terms
* synonyms
* abbreviations
* consumer labels

but formal diagnosis persistence should prefer canonical coded concepts.

## Rule 4 — Procedure coding should be kept distinct from diagnosis coding

Procedure standards such as `RVS` should live in their own coding model or procedure domain, not inside the disease table.

---

## Recommended Clinical Categories

To improve terminology quality, add a semantic classification field such as:

```text
clinical_category
```

Suggested values:

* `DIAGNOSIS`
* `SYMPTOM`
* `SIGN`
* `FINDING`
* `SYNDROME`
* `DISCOVERY_ONLY`
* `WELLNESS_TERM`

### Why this matters

It prevents the system from treating all search terms as equally valid formal diagnoses.

---

## Import Strategy for Scraped or External Disease Terms

## Stage 1 — Import as LOCAL

When importing scraped disease/indication terms:

* store them as `coding_system = LOCAL`
* mark `is_system = true` if they belong to the protected system catalog
* set `review_status = imported`

## Stage 2 — Normalize

Review for:

* duplicates
* non-disease entries
* spelling variants
* consumer terms vs formal concepts

## Stage 3 — Map to ICD-10

Where clinically appropriate, map LOCAL terms to canonical ICD-10 diagnoses.

## Stage 4 — Promote Reviewed Concepts

Only reviewed and approved concepts should be treated as trusted production diagnosis concepts.

---

## Recommended Review Status Workflow

Suggested values for `review_status`:

* `IMPORTED`
* `MAPPED`
* `CLINICALLY_REVIEWED`
* `APPROVED`
* `REJECTED`

This helps keep discovery imports and formal coding quality separate.

---

## Search and Discovery Strategy

## For Clinical Discovery

Use a blended strategy:

* canonical disease concepts
* LOCAL synonyms/search aliases
* medicine mappings

This supports:

* disease-first search
* omni-search
* broader UX labels like `Acid reflux` while still resolving to a canonical coded diagnosis if available

## For Formal Diagnosis Entry

Prefer:

* ICD-10-coded canonical concepts
* reviewed clinical terms
* explicit concept selection rather than loose free text

---

## Suggested Default System Behavior

### When creating system master diagnoses

Default to:

* `coding_system = ICD10` when sourced from formal coding standards
* `coding_system = LOCAL` when imported from scraped discovery terms or user-friendly non-authoritative lists

### When users search

Search across:

* disease `name`
* `slug`
* `disease_terms.term`
* active code mappings

### When users save a diagnosis

Persist the canonical disease concept id, not just the free-text search term.

---

## Recommended Schema Enhancements

## `diseases`

Recommended additions beyond current core structure:

* `clinical_category`
* `review_status`
* optional `definition_status`

## `disease_terms`

Add synonym and discovery term support.

## `disease_code_mappings`

Add crosswalk support for ICD-10, SNOMED, ICD-11, and future mappings.

## Optional `disease_relationships`

Add richer hierarchy support beyond a single `parent_id` if needed later.

---

## Governance Recommendations

### 1. Keep ICD-10 as the operational default

This is the most practical Philippine production stance.

### 2. Treat LOCAL as a staging and discovery layer

Do not let LOCAL discovery imports automatically become formal diagnoses without review.

### 3. Separate coding authority from search convenience

A searchable term does not always equal a billable or standards-based diagnosis concept.

### 4. Support future standards without forcing premature adoption

Keep architecture ready for SNOMED and ICD-11, but do not make them the mandatory default for current Philippine workflows.

---

## Implementation Sequence Recommendation

1. confirm `ICD10` as the default diagnosis coding system in JuanClinic
2. add `review_status` and `clinical_category` to the disease model if missing
3. introduce `disease_terms` for synonyms and discovery terms
4. introduce `disease_code_mappings` for crosswalks
5. import scraped disease/discovery terms as `LOCAL`
6. review and map the clinically valid ones into ICD-10-coded canonical concepts
7. keep diagnosis persistence tied to canonical disease concepts

---

## Success Criteria

This strategy is successful when:

1. JuanClinic can support Philippine diagnosis workflows primarily through ICD-10
2. discovery/search remains flexible through LOCAL and synonym terms
3. imported scraped disease terms do not corrupt the formal coded diagnosis catalog
4. the system can later support SNOMED or ICD-11 mappings without redesigning the disease layer

---

## After Execution Return Items

After applying this strategy, return:

1. final `diseases` schema
2. whether `review_status` and `clinical_category` were added
3. whether `disease_terms` was introduced
4. whether `disease_code_mappings` was introduced
5. default coding rules used for diagnosis save workflows
6. policy for importing scraped disease terms as `LOCAL`

---

## Decision Summary

Proceed with a Philippines-oriented terminology strategy using:

* **ICD-10** as the primary diagnosis coding standard,
* **RVS** as the procedure coding standard in claims-oriented workflows,
* **LOCAL** as the search/discovery term layer,
* and a multi-terminology architecture that preserves future support for SNOMED and ICD-11.

This approach gives JuanClinic both real-world local usability and a scalable clinical terminology foundation.
