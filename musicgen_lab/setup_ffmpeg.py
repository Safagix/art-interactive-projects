import os
import zipfile
import urllib.request
import shutil
import sys

FFMPEG_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
TARGET_DIR = os.path.join(os.getcwd(), "ffmpeg")
ZIP_PATH = "ffmpeg.zip"

def setup_ffmpeg():
    print(f"Downloading FFmpeg from {FFMPEG_URL}...")
    try:
        urllib.request.urlretrieve(FFMPEG_URL, ZIP_PATH)
        print("Download complete.")
    except Exception as e:
        print(f"Error downloading: {e}")
        return

    print("Extracting...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
        zip_ref.extractall(".")
    
    # Find the extracted folder (it changes name with versions)
    extracted_folders = [f for f in os.listdir(".") if f.startswith("ffmpeg-") and os.path.isdir(f)]
    if not extracted_folders:
        print("Could not find extracted folder.")
        return
    
    src_dir = extracted_folders[0]
    
    # Move bin contents to target or just rename folder
    # We want musicgen_lab\ffmpeg\bin\ffmpeg.exe
    
    if os.path.exists(TARGET_DIR):
        shutil.rmtree(TARGET_DIR)
        
    shutil.move(src_dir, TARGET_DIR)
    
    # Startup cleanup
    os.remove(ZIP_PATH)
    
    bin_path = os.path.join(TARGET_DIR, "bin")
    print(f"FFmpeg setup complete. Binary path: {bin_path}")
    print("Add this to your script to use it:")
    print(f"os.environ['PATH'] += os.pathsep + r'{bin_path}'")

if __name__ == "__main__":
    setup_ffmpeg()
