# PROCESSED PAYLOAD: Clinical Result (Multi-Tenant Delivery)

## Payload Metadata
- **Tenant ID**: `TENANT-A`
- **Patient ID**: `PAT-001`
- **Order ID**: `ORD-123`
- **Status**: `COMPLETED`
- **Delivery Format**: HL7 v2 / JSON

---

## 📄 JSON Representation
```json
{
  "tenant_id": "TENANT-A",
  "patient_id": "PAT-001",
  "result": {
    "order_id": "ORD-123",
    "test": "GLUCOSE",
    "value": "120",
    "unit": "mg/dL",
    "range": "70-100",
    "interpretation": "H",
    "timestamp": "2023-10-27T10:30:00Z"
  }
}
```

---

## 🧬 HL7 v2 Representation
```hl7
MSH|^~\&|LAB_SYS|TENANT-A|HIS_SYS|TENANT-A|202310271030||ORU^R01|7f3d9b1c|P|2.3|
PID|1||PAT-001||DOE^JOHN||19800101|M|||123 MAIN ST||555-0199||||||
OBR|1||ORD-123|GLU^GLUCOSE^L|||202310271000|||||||||||||||||F|
OBX|1|NM|GLU^GLUCOSE^L||120|mg/dL|70-100|H|||F|||202310271030|
```
