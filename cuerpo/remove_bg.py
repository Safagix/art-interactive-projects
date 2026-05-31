from PIL import Image
import os

ASSETS_DIR = r"cuerpo\assets\ava_anime"

def remove_green_bg():
    # Green key (approximate)
    target_green = (150, 255, 0) # Adjust based on screen if needed, but standard green screen is this
    # Actually, let's use a robust range or just force transparent generation if this fails.
    # Given the screenshot, it's a solid flat green.
    
    files = ["base_neutral.png"]
    
    for f in files:
        path = os.path.join(ASSETS_DIR, f)
        if not os.path.exists(path): continue
        
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # Check for green-ish pixel
            # R < 100, G > 200, B < 100 is a safe bet for pure green
            if item[0] < 120 and item[1] > 180 and item[2] < 120:
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(path)
        print(f"Processed {f}")

if __name__ == "__main__":
    remove_green_bg()
