#!/usr/bin/env node

/**
 * Generate PNG favicons from SVG
 * Run: node scripts/generate-favicons.js
 * 
 * Requires: npm install sharp
 * Or use online tools: https://realfavicongenerator.net/
 * 
 * This script generates all required favicon sizes from favicon.svg
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Install with: npm install sharp -D');
  console.log('');
  console.log('Alternative: Use online tools to generate favicons:');
  console.log('1. Go to https://realfavicongenerator.net/');
  console.log('2. Upload public/favicon.svg');
  console.log('3. Download and extract to public/ folder');
  console.log('');
  console.log('Required files:');
  console.log('  - favicon-16x16.png');
  console.log('  - favicon-32x32.png');
  console.log('  - favicon-192x192.png');
  console.log('  - favicon-512x512.png');
  console.log('  - apple-touch-icon.png (180x180)');
  process.exit(0);
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const FAVICON_SVG = path.join(PUBLIC_DIR, 'favicon.svg');
const APPLE_ICON_SVG = path.join(PUBLIC_DIR, 'apple-touch-icon.svg');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('🎨 Generating favicon PNGs from SVG...\n');

  for (const { name, size } of sizes) {
    try {
      await sharp(FAVICON_SVG)
        .resize(size, size)
        .png()
        .toFile(path.join(PUBLIC_DIR, name));
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (err) {
      console.error(`❌ Failed to generate ${name}:`, err.message);
    }
  }

  // Generate apple-touch-icon
  try {
    const appleIconSource = fs.existsSync(APPLE_ICON_SVG) ? APPLE_ICON_SVG : FAVICON_SVG;
    await sharp(appleIconSource)
      .resize(180, 180)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png (180x180)');
  } catch (err) {
    console.error('❌ Failed to generate apple-touch-icon.png:', err.message);
  }

  console.log('\n🎉 Favicon generation complete!');
}

generateFavicons();

