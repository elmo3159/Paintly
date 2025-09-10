const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

const ICON_SIZES = [16, 32, 96, 192, 512]
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

async function generateIcons() {
  console.log('Generating PWA icons...')
  
  // Create a base SVG icon
  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#3b82f6"/>
      <g transform="translate(256, 256)">
        <!-- Paint brush shape -->
        <path d="M -80 -120 Q -60 -140, -40 -120 L 40 -40 Q 60 -20, 40 0 L -40 80 Q -60 100, -80 80 L -100 60 Q -120 40, -100 20 Z" 
              fill="#ffffff" stroke="#1e40af" stroke-width="4"/>
        <!-- Paint drops -->
        <circle cx="60" cy="40" r="20" fill="#ef4444"/>
        <circle cx="80" cy="80" r="15" fill="#10b981"/>
        <circle cx="40" cy="100" r="18" fill="#f59e0b"/>
        <!-- Letter P -->
        <text x="-50" y="20" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#ffffff">P</text>
      </g>
    </svg>
  `

  // Save the SVG
  await fs.writeFile(path.join(PUBLIC_DIR, 'icon.svg'), svgIcon)
  console.log('Created icon.svg')

  // Generate PNG icons for each size
  for (const size of ICON_SIZES) {
    try {
      await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toFile(path.join(PUBLIC_DIR, `icon-${size}.png`))
      
      console.log(`Generated icon-${size}.png`)
    } catch (error) {
      console.error(`Failed to generate icon-${size}.png:`, error)
    }
  }

  // Generate Apple Touch Icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'))
  console.log('Generated apple-touch-icon.png')

  // Generate favicon.ico (multi-size)
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'))
  console.log('Generated favicon.ico')

  console.log('✅ All icons generated successfully!')
}

generateIcons().catch(console.error)