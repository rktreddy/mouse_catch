// Run: node icons/generate-icons.js
// Generates SVG icons at required sizes for app stores
// Convert to PNG via: https://svgtopng.com or Xcode asset catalog
const fs = require('fs');
const path = require('path');

const SIZES = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024];

SIZES.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="8.6" fill="#f5f0e8"/>
  <ellipse cx="24" cy="30" rx="12" ry="10" fill="#3a3226"/>
  <circle cx="14" cy="18" r="5" fill="#3a3226"/>
  <circle cx="34" cy="18" r="5" fill="#3a3226"/>
  <circle cx="8" cy="26" r="4" fill="#3a3226"/>
  <circle cx="40" cy="26" r="4" fill="#3a3226"/>
</svg>`;
  const filePath = path.join(__dirname, `icon-${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`  icons/icon-${size}.svg`);
});

console.log(`\nGenerated ${SIZES.length} SVG icons.`);
console.log('Convert to PNG for app stores: https://svgtopng.com');
console.log('Or use: sips -s format png icon-1024.svg --out icon-1024.png (macOS)');
