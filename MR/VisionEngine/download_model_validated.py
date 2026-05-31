import urllib.request
import hashlib
import zipfile
import os

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
OUTPUT_PATH = r"G:\Digital Lab\MR\VisionEngine\model\gesture_recognizer.task"
EXPECTED_SIZE_MIN = 8000000  # 8MB minimum
EXPECTED_SIZE_MAX = 9000000  # 9MB maximum

print("="*70)
print("ROBUST MODEL DOWNLOAD WITH VALIDATION")
print("="*70)

# Remove old file if exists
if os.path.exists(OUTPUT_PATH):
    os.remove(OUTPUT_PATH)
    print(f"🗑️ Removed old file")

# Download with proper headers
print(f"\n⬇️ Downloading from Google Cloud Storage...")
print(f"   URL: {MODEL_URL}")

try:
    req = urllib.request.Request(
        MODEL_URL,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
        
    print(f"✅ Downloaded {len(data):,} bytes")
    
    # Validate size
    if len(data) < EXPECTED_SIZE_MIN or len(data) > EXPECTED_SIZE_MAX:
        print(f"❌ SIZE MISMATCH: Expected 8-9MB, got {len(data)/1024/1024:.2f}MB")
        exit(1)
    
    # Validate it's not all null bytes
    null_count = data.count(b'\x00')
    null_percentage = (null_count / len(data)) * 100
    print(f"\n📊 Null byte analysis: {null_percentage:.2f}%")
    
    if null_percentage > 50:
        print(f"❌ FILE APPEARS CORRUPTED (>50% null bytes)")
        exit(1)
    
    # Check ZIP signature
    if not data.startswith(b'PK'):
        print(f"❌ INVALID ZIP SIGNATURE")
        print(f"   First 10 bytes: {data[:10]}")
        exit(1)
    
    print(f"✅ ZIP signature valid")
    
    # Write to file
    with open(OUTPUT_PATH, 'wb') as f:
        f.write(data)
    
    print(f"✅ Saved to: {OUTPUT_PATH}")
    
    # Final validation with zipfile
    print(f"\n🔍 Final ZIP validation...")
    try:
        with zipfile.ZipFile(OUTPUT_PATH, 'r') as zf:
            file_count = len(zf.namelist())
            print(f"✅ VALID ZIP: {file_count} files inside")
            
            # Test integrity
            result = zf.testzip()
            if result is None:
                print(f"✅ ALL FILES INTACT")
            else:
                print(f"⚠️ Corrupted file found: {result}")
                
    except zipfile.BadZipFile as e:
        print(f"❌ ZIP VALIDATION FAILED: {e}")
        os.remove(OUTPUT_PATH)
        exit(1)
    
    print("\n" + "="*70)
    print("✅ MODEL DOWNLOAD SUCCESSFUL AND VALIDATED")
    print("="*70)
    
except Exception as e:
    print(f"❌ DOWNLOAD FAILED: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
