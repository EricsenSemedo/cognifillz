#!/bin/bash

# Simple icon creator for CogniFillz
# Creates placeholder PNG icons using ImageMagick

ICON_DIR="icons"

echo "🧠 Creating CogniFillz icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Creating simple text-based icons instead..."
    
    # Create 16x16 icon using Python PIL (if available)
    python3 << 'EOF'
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    os.makedirs("icons", exist_ok=True)
    
    # Create icons with gradient and text
    for size in [16, 48, 128]:
        img = Image.new('RGB', (size, size), color='#667eea')
        draw = ImageDraw.Draw(img)
        
        # Add brain emoji or CF text
        if size >= 48:
            try:
                font_size = int(size * 0.6)
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
                text = "CF"
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                x = (size - text_width) / 2
                y = (size - text_height) / 2 - bbox[1]
                draw.text((x, y), text, fill='white', font=font)
            except:
                pass
        
        img.save(f"icons/icon{size}.png")
        print(f"✓ Created icon{size}.png")
    
    print("✅ Icons created successfully!")
except ImportError:
    print("❌ Python PIL not available. Please install ImageMagick or python3-pil")
    exit(1)
EOF
    
else
    # Use ImageMagick
    mkdir -p "$ICON_DIR"
    
    # Create 16x16 icon
    convert -size 16x16 xc:'#667eea' \
      -gravity center \
      -pointsize 10 -fill white \
      -font DejaVu-Sans-Bold \
      -annotate +0+0 "CF" \
      "$ICON_DIR/icon16.png"
    
    # Create 48x48 icon
    convert -size 48x48 xc:'#667eea' \
      -gravity center \
      -pointsize 30 -fill white \
      -font DejaVu-Sans-Bold \
      -annotate +0+0 "CF" \
      "$ICON_DIR/icon48.png"
    
    # Create 128x128 icon
    convert -size 128x128 xc:'#667eea' \
      -gravity center \
      -pointsize 80 -fill white \
      -font DejaVu-Sans-Bold \
      -annotate +0+0 "CF" \
      "$ICON_DIR/icon128.png"
    
    echo "✅ Icons created successfully using ImageMagick!"
fi

ls -lh "$ICON_DIR/"
