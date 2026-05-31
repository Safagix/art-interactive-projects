"""
Expression Sheet Processor for Eira Avatar
Splits a 2x4 grid expression sheet into individual PNG files.
"""

from PIL import Image
import os

# Configuration
SOURCE_IMAGE = r"assets/source_image.png"
OUTPUT_DIR = r"g:\Digital Lab\cuerpo\assets\avatar"

# Grid mapping: (row, col) -> filename
GRID_MAP = {
    (0, 0): "neutral.png",
    (0, 1): "smile.png",
    (1, 0): "talk_low.png",
    (1, 1): "talk_mid.png",
    (2, 0): "blink.png",
    (2, 1): "talk_high.png",
    (3, 0): "thinking.png",
    (3, 1): "warm.png",
}

ROWS = 4
COLS = 2


def process_expression_sheet():
    """Split the expression sheet into individual tiles."""
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"📁 Output directory: {OUTPUT_DIR}")
    
    # Load source image
    if not os.path.exists(SOURCE_IMAGE):
        print(f"❌ Source image not found: {SOURCE_IMAGE}")
        return False
    
    img = Image.open(SOURCE_IMAGE)
    width, height = img.size
    print(f"📷 Source image size: {width}x{height}")
    
    # Calculate tile dimensions
    tile_width = width // COLS
    tile_height = height // ROWS
    print(f"✂️ Tile size: {tile_width}x{tile_height}")
    
    # Extract and save each tile
    for (row, col), filename in GRID_MAP.items():
        # Calculate crop box (left, upper, right, lower)
        left = col * tile_width
        upper = row * tile_height
        right = left + tile_width
        lower = upper + tile_height
        
        # Crop the tile
        tile = img.crop((left, upper, right, lower))
        
        # Save with transparency support
        output_path = os.path.join(OUTPUT_DIR, filename)
        tile.save(output_path, "PNG")
        print(f"✅ Saved: {filename} ({tile_width}x{tile_height})")
    
    print(f"\n🎉 Successfully processed {len(GRID_MAP)} expression tiles!")
    return True


if __name__ == "__main__":
    process_expression_sheet()
