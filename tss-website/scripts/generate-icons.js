/**
 * Icon generation script for Electron app
 * Converts PNG logo to required formats (ICO, etc.)
 * 
 * Prerequisites: npm install png-to-ico sharp
 * 
 * Usage: node scripts/generate-icons.js
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SOURCE_LOGO = path.join(__dirname, '../public/assets/Logo/Glowne/Two Steps Studio Bez Tła.png');
const OUTPUT_DIR = path.join(__dirname, '../electron-builder-resources');

async function generateIcons() {
  console.log('Generating icons for Electron app...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Generate ICO file for Windows (multiple sizes)
    console.log('Generating Windows ICO icon...');
    await sharp(SOURCE_LOGO)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon.ico'));

    // Generate PNG for Linux and other uses
    console.log('Generating PNG icon...');
    await sharp(SOURCE_LOGO)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon.png'));

    // Generate 16x16 for taskbar
    console.log('Generating small icon (16x16)...');
    await sharp(SOURCE_LOGO)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon-16.png'));

    // Generate 32x32 for file explorer
    console.log('Generating medium icon (32x32)...');
    await sharp(SOURCE_LOGO)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon-32.png'));

    // Generate 48x48 for control panel
    console.log('Generating large icon (48x48)...');
    await sharp(SOURCE_LOGO)
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon-48.png'));

    // Generate 64x64 for high DPI
    console.log('Generating extra large icon (64x64)...');
    await sharp(SOURCE_LOGO)
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon-64.png'));

    // Generate 128x128 for high DPI
    console.log('Generating extra extra large icon (128x128)...');
    await sharp(SOURCE_LOGO)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(OUTPUT_DIR, 'icon-128.png'));

    console.log('✓ Icons generated successfully!');
    console.log(`Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Check if source logo exists
if (!fs.existsSync(SOURCE_LOGO)) {
  console.error(`Source logo not found: ${SOURCE_LOGO}`);
  console.error('Please ensure the logo file exists at the specified path.');
  process.exit(1);
}

generateIcons();
