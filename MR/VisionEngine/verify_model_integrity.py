import os
import zipfile

model_path = r"G:\Digital Lab\MR\VisionEngine\model\gesture_recognizer.task"

print("="*60)
print("COMPREHENSIVE MODEL FILE INTEGRITY CHECK")
print("="*60)

# 1. File existence and size
if not os.path.exists(model_path):
    print("❌ FILE NOT FOUND")
    exit(1)

file_size = os.path.getsize(model_path)
print(f"\n✅ File exists: {model_path}")
print(f"📊 File size: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")

# 2. Read file header (first 100 bytes)
with open(model_path, 'rb') as f:
    header = f.read(100)

print(f"\n📋 First 100 bytes (hex):")
print(header.hex())

print(f"\n📋 First 20 bytes (raw):")
print(header[:20])

# 3. Check if it's a valid zip file
print(f"\n🔍 ZIP VALIDATION TEST:")
try:
    with zipfile.ZipFile(model_path, 'r') as zip_ref:
        file_list = zip_ref.namelist()
        print(f"✅ VALID ZIP ARCHIVE")
        print(f"📁 Contents ({len(file_list)} files):")
        for name in file_list[:10]:  # Show first 10
            print(f"   - {name}")
        if len(file_list) > 10:
            print(f"   ... and {len(file_list) - 10} more")
except zipfile.BadZipFile as e:
    print(f"❌ INVALID ZIP: {e}")
except Exception as e:
    print(f"❌ ERROR: {e}")

# 4. Try to read as binary and check for null bytes
with open(model_path, 'rb') as f:
    first_mb = f.read(1024 * 1024)  # First 1MB
    
null_count = first_mb.count(b'\x00')
print(f"\n📊 Null byte analysis (first 1MB):")
print(f"   Total null bytes: {null_count:,}")
print(f"   Percentage: {(null_count / len(first_mb)) * 100:.2f}%")

print("\n" + "="*60)
