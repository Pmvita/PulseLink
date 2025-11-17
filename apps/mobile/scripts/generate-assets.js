#!/usr/bin/env node

/**
 * Generate placeholder assets for PulseLink app
 * Creates simple colored images with text for development
 */

const fs = require('fs');
const path = require('path');

// Check if jimp is available
let Jimp;
try {
  Jimp = require('jimp').default || require('jimp');
} catch (e) {
  console.log('⚠️  jimp not found. Creating minimal placeholder PNG files...');
  console.log('💡 Install jimp for better placeholders: npm install jimp --save-dev');
  
  // Create minimal valid PNG files
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), minimalPNG);
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), minimalPNG);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), minimalPNG);
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), minimalPNG);
  
  console.log('✅ Created minimal placeholder assets');
  process.exit(0);
}

async function generateAssets() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Ensure assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // PulseLink brand color (blue)
  const primaryColor = 0x3B82F6FF; // #3B82F6
  const darkColor = 0x000000FF; // Black
  
  try {
    // Generate icon (1024x1024)
    const icon = await new Jimp(1024, 1024, primaryColor);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    icon.print(font, 0, 400, { text: '⚡', alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 1024);
    await icon.writeAsync(path.join(assetsDir, 'icon.png'));
    
    // Generate adaptive icon (1024x1024)
    const adaptiveIcon = await new Jimp(1024, 1024, primaryColor);
    adaptiveIcon.print(font, 0, 400, { text: '⚡', alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 1024);
    await adaptiveIcon.writeAsync(path.join(assetsDir, 'adaptive-icon.png'));
    
    // Generate splash (1284x2778 - iPhone 14 Pro Max dimensions)
    const splash = await new Jimp(1284, 2778, darkColor);
    const splashFont = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    splash.print(splashFont, 0, 1200, { text: '⚡ PulseLink', alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 1284);
    await splash.writeAsync(path.join(assetsDir, 'splash.png'));
    
    // Generate favicon (64x64)
    const favicon = await new Jimp(64, 64, primaryColor);
    const faviconFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    favicon.print(faviconFont, 0, 16, { text: '⚡', alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 64);
    await favicon.writeAsync(path.join(assetsDir, 'favicon.png'));
    
    console.log('✅ Created placeholder assets in', assetsDir);
    console.log('⚠️  Note: These are development placeholders. Replace with proper assets for production.');
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    console.log('📦 Falling back to minimal placeholders...');
    
    // Fallback to minimal PNG
    const minimalPNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), minimalPNG);
    fs.writeFileSync(path.join(assetsDir, 'splash.png'), minimalPNG);
    fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), minimalPNG);
    fs.writeFileSync(path.join(assetsDir, 'favicon.png'), minimalPNG);
    
    console.log('✅ Created minimal placeholder assets');
  }
}

generateAssets();

