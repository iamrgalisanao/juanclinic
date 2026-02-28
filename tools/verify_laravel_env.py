import os
import sys

def verify_env():
    print("--- Laravel Environment Verification ---")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base_dir, ".env")
    
    if not os.path.exists(env_path):
        print(f"[ERROR] .env file not found at {env_path}")
        return False

        
    required_keys = ["DB_CONNECTION", "DB_HOST", "DB_DATABASE", "DB_USERNAME", "DB_PASSWORD"]
    missing = []
    
    with open(env_path, "r") as f:
        content = f.read()
        for key in required_keys:
            if key not in content:
                missing.append(key)
                
    if missing:
        print(f"[ERROR] Missing keys in .env: {', '.join(missing)}")
        return False
        
    print("[SUCCESS] Essential database keys found in .env.")
    return True

if __name__ == "__main__":
    if verify_env():
        sys.exit(0)
    else:
        sys.exit(1)
