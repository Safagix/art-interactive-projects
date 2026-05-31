import os

file_path = r"G:\Digital Lab\MR\VisionEngine\model\gesture_recognizer.task"

if not os.path.exists(file_path):
    print("❌ FILE NOT FOUND")
else:
    with open(file_path, 'rb') as f:
        header = f.read(4)
    print(f"Header Bytes: {header}")
    if header == b'PK\x03\x04':
        print("✅ Header is ZIP (PK..)")
    else:
        print("❌ Header INVALID (Likely corrupted or HTML)")
