import os
import uuid
from datetime import datetime

def generate_hl7_oru(tenant_id, patient_id, order_id, test_code, result_value, result_unit):
    print(f"--- Generating Simulated HL7 ORU Message ---")
    msh = f"MSH|^~\\&|LAB_SYS|{tenant_id}|HIS_SYS|{tenant_id}|{datetime.now().strftime('%Y%m%d%H%M%S')}||ORU^R01|{uuid.uuid4().hex[:10]}|P|2.3|"
    pid = f"PID|1||{patient_id}||DOE^JOHN||19800101|M|||123 MAIN ST||555-0199||||||"
    obr = f"OBR|1||{order_id}|{test_code}^GLUCOSE^L|||202310271000|||||||||||||||||F|"
    obx = f"OBX|1|NM|{test_code}^GLUCOSE^L||{result_value}|{result_unit}|70-100|H|||F|||202310271030|"
    
    hl7_content = f"{msh}\n{pid}\n{obr}\n{obx}"
    
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".tmp")
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"sample_oru_{order_id}.hl7")
    
    with open(file_path, "w") as f:
        f.write(hl7_content)
        
    print(f"[SUCCESS] HL7 ORU message generated at {file_path}")
    return hl7_content

if __name__ == "__main__":
    generate_hl7_oru("TENANT-A", "PAT-001", "ORD-123", "GLU", "120", "mg/dL")
