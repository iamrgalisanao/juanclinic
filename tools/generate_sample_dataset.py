import json
import os
import uuid
import random
from datetime import datetime, timedelta

def generate_sample_data(num_tenants=2, patients_per_tenant=5):
    print(f"--- Generating Sample Multi-Tenant Dataset ({num_tenants} tenants) ---")
    dataset = []
    
    for _ in range(num_tenants):
        tenant_id = str(uuid.uuid4())
        for i in range(patients_per_tenant):
            patient = {
                "tenant_id": tenant_id,
                "patient_id": f"P-{random.randint(1000, 9999)}",
                "demographics": {
                    "first_name": f"Patient_{i}",
                    "last_name": f"Tenant_{tenant_id[:4]}",
                    "dob": (datetime.now() - timedelta(days=random.randint(3650, 20000))).strftime("%Y-%m-%d"),
                    "gender": random.choice(["M", "F"]),
                    "contact": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
                }
            }
            dataset.append(patient)
            
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, ".tmp", "sample_patients.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"[SUCCESS] {len(dataset)} sample patients generated at {output_path}.")


if __name__ == "__main__":
    import os
    generate_sample_data()
