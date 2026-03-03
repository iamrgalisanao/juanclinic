import json
import sys
import os
from datetime import datetime

import jsonschema

# Schemas mapped from gemini.md
PATIENT_SCHEMA = {
    "type": "object",
    "properties": {
        "tenant_id": {"type": "string"},
        "patient_id": {"type": "string"},
        "demographics": {
            "type": "object",
            "properties": {
                "first_name": {"type": "string"},
                "last_name": {"type": "string"},
                "dob": {"type": "string", "format": "date"},
                "gender": {"type": "string", "enum": ["M", "F", "O"]},
                "contact": {"type": "string"}
            },
            "required": ["first_name", "last_name", "dob", "gender"]
        }
    },
    "required": ["tenant_id", "patient_id", "demographics"]
}

ORDER_SCHEMA = {
    "type": "object",
    "properties": {
        "order_id": {"type": "string"},
        "patient_id": {"type": "string"},
        "order_type": {"type": "string", "enum": ["LAB", "RAD"]},
        "request_details": {"type": "object"},
        "priority": {"type": "string", "enum": ["ROUTINE", "STAT"]},
        "status": {"type": "string", "enum": ["PENDING", "IN_PROGRESS", "COMPLETED"]}
    },
    "required": ["order_id", "patient_id", "order_type", "priority", "status"]
}

def validate_payload(data, schema_type="patient", level="minimal"):
    """
    level: minimal (Mode 0), standard (Mode 1), strict (Mode 2+)
    """
    if schema_type == "patient":
        schema = PATIENT_SCHEMA
    elif schema_type == "order":
        schema = ORDER_SCHEMA
    else:
        print(f"[ERROR] Unknown schema type: {schema_type}")
        return False
        
    # Standard level requirements
    if level in ["standard", "strict"]:
        if schema_type == "patient" and "demographics" in data and "dob" in data["demographics"]:
            # Example: DOB must be in the past
            try:
                dob = datetime.strptime(data["demographics"]["dob"], "%Y-%m-%d")
                if dob > datetime.now():
                    print("[ERROR] DOB cannot be in the future (Standard Validation)")
                    return False
            except ValueError:
                # Let jsonschema handle format/type errors
                pass
                
    try:
        jsonschema.validate(instance=data, schema=schema)
        print(f"[SUCCESS] [{level.upper()}] Payload matches {schema_type} schema.")
        return True
    except jsonschema.exceptions.ValidationError as e:
        print(f"[ERROR] [{level.upper()}] Validation failed for {schema_type}: {e.message}")
        return False



if __name__ == "__main__":
    # Test with sample data if --test is provided
    if "--test" in sys.argv:
        tmp_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".tmp", "sample_patients.json")
        if os.path.exists(tmp_file):
            with open(tmp_file, "r") as f:
                samples = json.load(f)
                for sample in samples:
                    if not validate_payload(sample):
                        sys.exit(1)
            sys.exit(0)
        else:
            print("[ERROR] Sample file not found. Run generate_sample_dataset.py first to create sample_patients.json.")
            sys.exit(1)
