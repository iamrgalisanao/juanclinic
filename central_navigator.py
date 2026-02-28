import os
import json
import subprocess
import sys

def main_navigator(data_path, action="register_patient"):
    print(f"--- HIS Central Navigator [Action: {action}] ---")
    
    # Layer 1: Check SOPs (Conceptual Check)
    print("[Layer 1] Referencing Layer 1 SOPs for business logic...")
    
    # Layer 2: Decision Making & Routing
    print(f"[Layer 2] Routing data at {data_path} to validation...")
    
    # Step 1: Validate Schema (Layer 3)
    val_cmd = ["python", "tools/schema_validator.py"]
    # For now, we simulate the validation by checking if it exists
    if not os.path.exists(data_path):
        print(f"[ERROR] Input data not found at {data_path}")
        return
        
    with open(data_path, "r") as f:
        payload = json.load(f)
        
    # Layer 3: Execute Deterministic Tools
    if action == "register_patient":
        print("[Layer 3] Executing Patient Registration Tools...")
        # Simulated validation check
        if "tenant_id" in payload and "patient_id" in payload:
            print(f"[SUCCESS] Patient {payload['patient_id']} validated for tenant {payload['tenant_id']}.")
        else:
            print("[ERROR] Payload invalid.")
            
    elif action == "process_hl7":
        print("[Layer 3] Executing HL7 Processing Tools...")
        # Simulating HL7 to JSON conversion
        print("[SUCCESS] HL7 message parsed and mapped to Clinical Order schema.")

def run_simulation():
    # Simulate a patient registration request
    sample_file = os.path.join(".tmp", "sample_patients.json")
    if os.path.exists(sample_file):
        with open(sample_file, "r") as f:
            first_patient = json.load(f)[0]
            
        temp_patient_path = os.path.join(".tmp", "temp_reg.json")
        with open(temp_patient_path, "w") as f:
            json.dump(first_patient, f)
            
        main_navigator(temp_patient_path, "register_patient")

if __name__ == "__main__":
    run_simulation()
    
# This script represents the 'Navigation' layer (Layer 2)
# that routes data between SOPs and Tools.
