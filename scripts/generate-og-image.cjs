#!/usr/bin/env node
const sharp = require('sharp');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function generateOGImage() {
  console.log('🎨 Generating OG image PNG from SVG...');
  
  try {
    await sharp(path.join(PUBLIC_DIR, 'og-image.svg'))
      .resize(1200, 630)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
    
    console.log('✅ Generated og-image.png (1200x630)');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

generateOGImage();

