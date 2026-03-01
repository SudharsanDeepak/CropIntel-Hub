#!/usr/bin/env python3
"""
Generate Android app icons from source logo
Requires: pip install Pillow
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed!")
    print("Run: pip install Pillow")
    exit(1)

# Source logo
SOURCE_LOGO = Path("AIML Project - App/public/tablogo.png")

# Android icon sizes (density: size)
ICON_SIZES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

# Output directory
RES_DIR = Path("AIML Project - App/android/app/src/main/res")

def generate_icons():
    """Generate all required icon sizes"""
    
    print("=" * 70)
    print("🎨 GENERATING ANDROID APP ICONS")
    print("=" * 70)
    print()
    
    # Check if source logo exists
    if not SOURCE_LOGO.exists():
        print(f"❌ Source logo not found: {SOURCE_LOGO}")
        return False
    
    print(f"📁 Source: {SOURCE_LOGO}")
    print()
    
    # Load source image
    try:
        img = Image.open(SOURCE_LOGO)
        print(f"✅ Loaded image: {img.size[0]}x{img.size[1]} pixels")
        print()
    except Exception as e:
        print(f"❌ Failed to load image: {e}")
        return False
    
    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Generate icons for each density
    for density, size in ICON_SIZES.items():
        print(f"Generating {density} ({size}x{size})...")
        
        # Create output directory
        mipmap_dir = RES_DIR / f"mipmap-{density}"
        mipmap_dir.mkdir(parents=True, exist_ok=True)
        
        # Resize image
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save as PNG
        output_path = mipmap_dir / "ic_launcher.png"
        resized.save(output_path, "PNG")
        print(f"  ✅ Saved: {output_path}")
        
        # Also save as ic_launcher_round.png
        output_path_round = mipmap_dir / "ic_launcher_round.png"
        resized.save(output_path_round, "PNG")
        print(f"  ✅ Saved: {output_path_round}")
        
        # Save foreground (for adaptive icons)
        output_path_foreground = mipmap_dir / "ic_launcher_foreground.png"
        resized.save(output_path_foreground, "PNG")
        print(f"  ✅ Saved: {output_path_foreground}")
        print()
    
    print("=" * 70)
    print("✅ ALL ICONS GENERATED SUCCESSFULLY!")
    print("=" * 70)
    print()
    print("📱 Next steps:")
    print("   1. Run: npx cap sync android")
    print("   2. Build APK")
    print("   3. Install on your phone")
    print("   4. Your app will have the new logo!")
    print()
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    success = generate_icons()
    
    if not success:
        print()
        print("=" * 70)
        print("⚠️  ICON GENERATION FAILED")
        print("=" * 70)
        print()
        print("Alternative: Use online icon generator")
        print("1. Go to: https://icon.kitchen/")
        print("2. Upload: AIML Project - App\\public\\tablogo.png")
        print("3. Download icon pack")
        print("4. Extract to: AIML Project - App\\android\\app\\src\\main\\res\\")
        print()
        input("Press Enter to exit...")
        exit(1)
    
    input("Press Enter to exit...")
