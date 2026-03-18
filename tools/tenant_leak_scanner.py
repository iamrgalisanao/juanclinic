import os
import re
import sys

# Configuration based on JuanClinic Spec
TARGET_DIR = "backend/app/Http/Controllers/Api"
PROTECTED_MODELS = ["Patient", "Order", "Prescription", "ClinicalNote", "Appointment", "Invoice"]
TENANT_SCOPE_PATTERN = r"(->where\(|scope|tenant_id|BelongsToTenant)"

def scan_for_tenant_leaks():
    findings = []
    
    if not os.path.exists(TARGET_DIR):
        print(f"Error: Target directory {TARGET_DIR} not found.")
        return

    # Regex to find Eloquent queries that might bypass tenant scopes
    # Specifically looking for ::all(), ::get(), or ::find() without a following 'where'
    unsafe_query_pattern = re.compile(r"(\w+)::(all|get|find|pluck|first)\(")

    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(".php"):
                path = os.path.join(root, file)
                with open(path, "r") as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        match = unsafe_query_pattern.search(line)
                        if match:
                            model_name = match.group(1)
                            # Only flag if it's a protected clinical model
                            if model_name in PROTECTED_MODELS:
                                # Check if the same line or next line contains tenant logic
                                context = line + (lines[i+1] if i+1 < len(lines) else "")
                                if not re.search(TENANT_SCOPE_PATTERN, context):
                                    findings.append({
                                        "file": path,
                                        "line": i + 1,
                                        "issue": f"Potential Tenant Leak: {model_name} queried without explicit tenant scoping.",
                                        "fix": f"Ensure {model_name} uses 'TenantScope' or add ->where('tenant_id', $tenantId)."
                                    })
    return findings

if __name__ == "__main__":
    print("--- JuanClinic Layer 3: Tenant Leak Scan Started ---")
    leaks = scan_for_tenant_leaks()
    
    if leaks:
        for leak in leaks:
            print(f"🔴 CRITICAL | File: {leak['file']} | Line: {leak['line']}")
            print(f"   Issue: {leak['issue']}")
            print(f"   Fix: {leak['fix']}\n")
        print(f"Summary: Found {len(leaks)} potential tenant isolation breaches.")
        sys.exit(1) # Signal failure for CI/CD or Subagent gating
    else:
        print("✅ No tenant leaks detected in API Controllers.")
        sys.exit(0)