import requests
import zipfile
import io
import os

URL = "https://github.com/leon-ai/leon/archive/refs/heads/master.zip"
TARGET_DIR = r"g:\Digital Lab\Eira V2"

def download_and_extract():
    print(f"Downloading {URL}...")
    try:
        r = requests.get(URL, stream=True)
        r.raise_for_status()
        print("Download complete. Extracting...")
        
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            z.extractall(TARGET_DIR)
            
        print(f"Extracted to {TARGET_DIR}")
        
        # Check potential folder name
        extracted_dirs = [d for d in os.listdir(TARGET_DIR) if 'leon' in d.lower()]
        print(f"Directories in {TARGET_DIR}: {extracted_dirs}")

    except Exception as e:
        print(f"Error: {e}")
        # Try 'develop' branch if master fails
        if "404" in str(e):
            print("Master branch not found. Trying 'develop'...")
            try:
                develop_url = "https://github.com/leon-ai/leon/archive/refs/heads/develop.zip"
                r = requests.get(develop_url, stream=True)
                r.raise_for_status()
                with zipfile.ZipFile(io.BytesIO(r.content)) as z:
                    z.extractall(TARGET_DIR)
                print(f"Extracted develop branch to {TARGET_DIR}")
            except Exception as e2:
                print(f"Develop branch failed too: {e2}")

if __name__ == "__main__":
    download_and_extract()
