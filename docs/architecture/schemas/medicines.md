# Medicine 3-Tier Structure

This document defines the schema for the multi-tier medicine and inventory system.

## 1. Medicines (Master Molecule)
Represents the catalog master record (Generic/Drug Molecule).

| Column | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `bigint` | PK | Unique Molecule ID. |
| **`tenant_id`** | `bigint` | Nullable | Null for system drug, set for custom tenant drug. |
| **`source_id`** | `string` | Nullable, Indexed | External reference ID (e.g. FDA/MIMS). |
| **`generic_name`** | `string` | Indexed | Chemical/Generic name. |
| **`brand_name`** | `string` | Nullable, Indexed | Master brand name. |
| **`indications_text`** | `longText` | Nullable | Clinical indications. |
| **`contraindications_text`**| `longText` | Nullable | Clinical contraindications. |
| ... | ... | ... | See migration for full clinical metadata. |

## 2. Medicine Forms (Product Layer)
Represents specific prescribable/dispensable form variants.

| Column | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `bigint` | PK | Unique Form ID. |
| **`medicine_id`** | `bigint` | FK | Link to Master Medicine. |
| **`form_name`** | `string` | Nullable | e.g., Tablet, Capsule, Syrup. |
| **`strength`** | `string` | Nullable | e.g., 500mg, 125mg/5mL. |
| **`price`** | `decimal(10,2)` | Nullable | Default base price. |
| **`is_dangerous`** | `boolean` | Default false| Controlled substance flag. |

## 3. Tenant Medicine Inventory (Inventory Layer)
Represents tenant-specific stock and overrides.

| Column | Data Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `bigint` | PK | Unique Inventory ID. |
| **`tenant_id`** | `bigint` | FK | Owning Tenant. |
| **`medicine_form_id`**| `bigint` | FK | Link to specific Form. |
| **`stock`** | `integer` | Default 0 | Current clinic stock. |
| **`price_override`**| `decimal(10,2)` | Nullable | Clinic-specific price override. |

## Relationships
- `Prescription` -> `MedicineForm` (Precision prescribing)
- `MedicineLot` -> `MedicineForm` (Batch tracking)
- `MedicineForm` -> `Medicine` (Clinical lookup)

