import json
import os

def seed_tenant_configs():
    print("--- Seeding Tenant Progressive Enforcement Configs ---")
    
    configs = {
        "TENANT-A": {
            "hl7.validation.level": "standard",
            "hl7.queue.enabled": True,
            "tenancy.db.enforcement": "strong",
            "patient.identity.mode": "building_mpi"
        },
        "TENANT-B": {
            "hl7.validation.level": "minimal",
            "hl7.queue.enabled": False,
            "tenancy.db.enforcement": "basic",
            "patient.identity.mode": "per_tenant"
        }
    }
    
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".tmp")
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, "tenant_configs.json")
    
    with open(file_path, "w") as f:
        json.dump(configs, f, indent=2)
        
    print(f"[SUCCESS] Tenant configurations seeded at {file_path}")

if __name__ == "__main__":
    seed_tenant_configs()
