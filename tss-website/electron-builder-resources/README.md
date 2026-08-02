# Electron Builder Resources

This directory contains build resources for the Electron desktop application.

## Required Files

### Icon Files
- `icon.ico` - Windows icon (256x256)
- `icon.png` - Linux icon (512x512)
- `icon-16.png` - Small icon (16x16)
- `icon-32.png` - Medium icon (32x32)
- `icon-48.png` - Large icon (48x48)
- `icon-64.png` - Extra large icon (64x64)
- `icon-128.png` - Extra extra large icon (128x128)

### Other Files
- `LICENSE.txt` - License text for the installer

## Generating Icons

To generate icon files from the source logo:

```bash
# First install dependencies
npm install sharp --save-dev

# Then run the generation script
node scripts/generate-icons.js
```

The script will convert the source PNG logo from `public/assets/Logo/Glowne/Two Steps Studio Bez Tła.png` into all required formats.

## Manual Icon Generation

If the script doesn't work, you can manually convert the logo using online tools or image editing software:

1. Open the source PNG: `public/assets/Logo/Glowne/Two Steps Studio Bez Tła.png`
2. Convert to ICO format (256x256) and save as `icon.ico`
3. Create PNG versions at various sizes (16, 32, 48, 64, 128, 512 pixels)
4. Save all files in this directory

## Icon Requirements

- **Windows**: ICO format with multiple sizes embedded (16, 32, 48, 256)
- **Linux**: PNG format at 512x512 pixels
- **Transparency**: Icons should have transparent backgrounds
- **Quality**: Use high-quality source image for best results
