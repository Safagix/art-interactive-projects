# Alternative download using requests library with streaming
import requests
import zipfile
import os

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
OUTPUT_PATH = r"G:\Digital Lab\MR\VisionEngine\model\gesture_recognizer.task"

print("="*70)
print("ALTERNATIVE DOWNLOAD METHOD - HTTP STREAMING")
print("="*70)

# Clean up
if os.path.exists(OUTPUT_PATH):
    os.remove(OUTPUT_PATH)

try:
    # Try to import requests, if not available, install it
    import requests
except ImportError:
    print("Installing requests library...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'requests'])
    import requests

print(f"\n⬇️ Downloading from: {MODEL_URL}")
print(f"   Using streaming download to prevent corruption...")

try:
    response = requests.get(MODEL_URL, stream=True, timeout=30)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    print(f"   Total size: {total_size/1024/1024:.2f} MB")
    
    downloaded = 0
    chunk_size = 8192
    
    with open(OUTPUT_PATH, 'wb') as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r   Progress: {percent:.1f}%", end='', flush=True)
    
    print(f"\n✅ Downloaded: {downloaded:,} bytes")
    
    # Validate ZIP
    print(f"\n🔍 Validating ZIP structure...")
    with zipfile.ZipFile(OUTPUT_PATH, 'r') as zf:
        files = zf.namelist()
        print(f"✅ Valid ZIP with {len(files)} file(s)")
        
        # Test integrity
        bad_file = zf.testzip()
        if bad_file is None:
            print(f"✅ All files passed integrity check")
        else:
            print(f"❌ Corrupted file: {bad_file}")
            exit(1)
    
    print("\n" + "="*70)
    print("✅ DOWNLOAD SUCCESSFUL")
    print("="*70)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    if os.path.exists(OUTPUT_PATH):
        os.remove(OUTPUT_PATH)
    exit(1)
