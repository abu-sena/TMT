/**
 * Generate Android launcher icons from source PNG.
 * Usage: node scripts/generate-icons.cjs
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.resolve(__dirname, '..', 'src', 'components', 'icon.png');
const RES_DIR = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android launcher icon sizes
const LAUNCHER_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Adaptive icon sizes (foreground = 108dp = 432px at xxxhdpi, scaled down)
const ADAPTIVE_FOREGROUND = 432; // xxxhdpi foreground size
const ADAPTIVE_BACKGROUND = 432;

async function generate() {
  console.log('🔧 Generating Android launcher icons...');
  console.log(`   Source: ${SOURCE}`);

  if (!fs.existsSync(SOURCE)) {
    console.error('❌ Source icon not found!');
    process.exit(1);
  }

  // 1. Generate PNG launcher icons (standard, not adaptive)
  for (const [folder, size] of Object.entries(LAUNCHER_SIZES)) {
    const outDir = path.join(RES_DIR, folder);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'ic_launcher.png');
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`   ✅ ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // 2. Generate adaptive icon foreground (108dp safe zone centered)
  // The adaptive icon foreground should be 108dp (= 432px at xxxhdpi) with content centered
  // We create a 432x432 foreground with the icon centered
  const fgSize = ADAPTIVE_FOREGROUND;
  const fgInnerSize = Math.round(fgSize * 0.7); // 70% of foreground = ~302px

  // Resize source to fit within the safe zone (inner 66% area)
  const fgResized = await sharp(SOURCE)
    .resize(fgInnerSize, fgInnerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Place on a transparent 432x432 canvas
  const fgOffset = Math.round((fgSize - fgInnerSize) / 2);
  const foreground = await sharp({
    create: {
      width: fgSize,
      height: fgSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fgResized, top: fgOffset, left: fgOffset }])
    .png()
    .toBuffer();

  const drawableDir = path.join(RES_DIR, 'drawable');
  if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });

  await sharp(foreground).toFile(path.join(drawableDir, 'ic_launcher_foreground.png'));
  console.log('   ✅ drawable/ic_launcher_foreground.png (432x432)');

  // 3. Generate background (solid color matching app theme)
  const bgColor = { r: 42, g: 141, b: 232 }; // TMT blue (#2A8DE8)
  const background = await sharp({
    create: {
      width: ADAPTIVE_BACKGROUND,
      height: ADAPTIVE_BACKGROUND,
      channels: 4,
      background: bgColor,
    },
  })
    .png()
    .toFile(path.join(drawableDir, 'ic_launcher_background.png'));
  console.log('   ✅ drawable/ic_launcher_background.png (432x432)');

  console.log('\n🎉 All icons generated successfully!');
}

generate().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
