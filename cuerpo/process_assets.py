from PIL import Image
import os

ASSETS_DIR = r"cuerpo\assets\ava_anime"
SHEET_PATH = os.path.join(ASSETS_DIR, "expression_sheet.png")

def process_sheet():
    if not os.path.exists(SHEET_PATH):
        print("Sheet not found!")
        return

    img = Image.open(SHEET_PATH)
    width, height = img.size
    
    # Assuming 2x2 grid based on generation prompt
    half_w = width // 2
    half_h = height // 2
    
    # Crop Quadrants
    # Top-Left: Face 1 (Happy/Smiling usually)
    face_1 = img.crop((0, 0, half_w, half_h))
    face_1.save(os.path.join(ASSETS_DIR, "face_happy.png"))
    
    # Top-Right: Face 2 (Thinking)
    face_2 = img.crop((half_w, 0, width, half_h))
    face_2.save(os.path.join(ASSETS_DIR, "face_thinking.png"))
    
    # Bottom-Left: Face 3 (Surprised)
    face_3 = img.crop((0, half_h, half_w, height))
    face_3.save(os.path.join(ASSETS_DIR, "face_surprise.png"))
    
    # Bottom-Right: Face 4 (Talking)
    face_4 = img.crop((half_w, half_h, width, height))
    face_4.save(os.path.join(ASSETS_DIR, "face_talk.png"))
    
    print("Assets processed successfully!")

if __name__ == "__main__":
    process_sheet()
