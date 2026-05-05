# Forensic Asset Cleanup: Seamless Watermark Removal

This document outlines the specialized technique used to remove AI-generated watermarks (e.g., "Gemini") from project assets while preserving resolution and artistic integrity.

## The Challenge
AI-generated backgrounds often include a distinctive watermark in the bottom-right corner. Standard inpainting or "healing" tools can sometimes smudge details or introduce generic AI artifacts that break the noir immersion.

## The Solution: Mirror Patching & Radial Blending
Instead of reconstructing the area from scratch, we use a "Mirror Patch" technique. Because room backgrounds are typically symmetrical in terms of lighting and floor/wall texture, the bottom-left corner often provides a perfect reference for the bottom-right.

### Methodology
1.  **Sampling**: A square patch (300x300px) is cropped from the bottom-left corner.
2.  **Mirroring**: The patch is flipped horizontally to match the perspective/angle of the opposite side.
3.  **Radial Masking**: A circular alpha mask is generated, centered on the bottom-right corner. This ensures the center of the logo area is 100% replaced, while the edges fade out perfectly.
4.  **Gaussian Blurring**: The mask is heavily blurred (25px radius) to eliminate hard edges.
5.  **Seamless Blending**: The mirrored patch is pasted over the watermark using the blurred radial mask.

## Implementation (Python/Pillow)

```python
from PIL import Image, ImageDraw, ImageFilter
import os
import numpy as np

def seamless_watermark_removal(image_path):
    # Load image in RGBA for transparency support
    img = Image.open(image_path).convert('RGBA')
    w, h = img.size
    box = 300 
    
    # 1. Take a patch from the bottom left and flip it
    patch = img.crop((0, h-box, box, h)).transpose(Image.FLIP_LEFT_RIGHT)
    
    # 2. Create a Radial Blend Mask
    mask = Image.new('L', (box, box), 0)
    for y in range(box):
        for x in range(box):
            # Distance from bottom-right corner
            dist = np.sqrt((x - (box-1))**2 + (y - (box-1))**2)
            # Invert for blend (fades out towards the edges of the box)
            alpha = max(0, 255 - int(dist * 0.8)) 
            mask.putpixel((x, y), alpha)
            
    # 3. Apply heavy blur for a seamless transition
    mask = mask.filter(ImageFilter.GaussianBlur(25))
    
    # 4. Composite the patch over the original
    img.paste(patch, (w-box, h-box), mask)
    
    # 5. Save back as high-quality PNG (RGB)
    img.convert('RGB').save(image_path, 'PNG')
    print(f"Cleaned: {image_path}")

# Run for all assets
dirs = [r'./src/assets/rooms', r'./src/assets/cutscenes']
for d in dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith('.png'):
                seamless_watermark_removal(os.path.join(d, f))
```

## Benefits
- **Zero Detail Loss**: Unlike blur-based removal, the actual texture (carpet, wood, wall) is preserved.
- **Lighting Consistency**: Mirroring ensures the light fall-off from windows or lamps matches the scene.
- **Batch Processing**: Can be applied instantly to hundreds of assets.

## Future Use
Use this technique whenever new AI-generated rooms are added to the project to maintain the premium, watermark-free aesthetic of the *NormaLIES* experience.
