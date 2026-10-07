/**
 * Generates PWA icons, the favicon and iOS splash screens from SVG.
 * Run with `npm run icons`. Output is committed under /public, so this only
 * needs to run again when the artwork changes.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const iconsDir = path.join(root, 'public', 'icons')
const splashDir = path.join(root, 'public', 'splash')

const TEAL_LIGHT = '#17605b'
const TEAL_DARK = '#0b3436'
const CREAM = '#f3e8cf'

/** Eight-pointed star (two overlapping squares) with a centre ring. */
function emblem({ size, stroke, color }) {
  const s = size / 2
  const half = s * 0.43
  const sw = stroke
  return `
  <g transform="translate(${s} ${s})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round">
    <rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="${half * 0.08}"/>
    <rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="${half * 0.08}" transform="rotate(45)"/>
    <circle r="${half * 0.46}"/>
    <circle r="${half * 0.13}" fill="${color}" stroke="none"/>
  </g>`
}

function iconSvg({ size = 512, rounded = false }) {
  const radius = rounded ? size * 0.22 : 0
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TEAL_LIGHT}"/>
      <stop offset="1" stop-color="${TEAL_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
  ${emblem({ size, stroke: size * 0.028, color: CREAM })}
</svg>`
}

function splashSvg({ width, height, dark }) {
  const bg = dark ? '#0b1517' : '#f6f3ec'
  const color = dark ? CREAM : TEAL_LIGHT
  const mark = Math.round(Math.min(width, height) * 0.42)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  <g transform="translate(${(width - mark) / 2} ${(height - mark) / 2})">${emblem({ size: mark, stroke: mark * 0.02, color })}</g>
</svg>`
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer()

/** Wraps a PNG in a minimal ICO container. */
function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size >= 256 ? 0 : size, 0)
  entry.writeUInt8(size >= 256 ? 0 : size, 1)
  entry.writeUInt8(0, 2)
  entry.writeUInt8(0, 3)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(pngBuffer.length, 8)
  entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, pngBuffer])
}

/** iPhone portrait screens: CSS width × height @ pixel ratio. */
export const SPLASH_SCREENS = [
  [440, 956, 3], // 16 Pro Max
  [402, 874, 3], // 16 Pro
  [430, 932, 3], // 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // 12/13 Pro Max, 14 Plus
  [390, 844, 3], // 12, 13, 14
  [375, 812, 3], // X, XS, 11 Pro, 12/13 mini
  [414, 896, 2], // XR, 11
  [375, 667, 2], // SE (2nd/3rd gen), 8
]

async function main() {
  await mkdir(iconsDir, { recursive: true })
  await mkdir(splashDir, { recursive: true })

  const rounded = iconSvg({ rounded: true })
  const square = iconSvg({ rounded: false })

  await writeFile(path.join(iconsDir, 'icon-192.png'), await png(rounded, 192))
  await writeFile(path.join(iconsDir, 'icon-512.png'), await png(rounded, 512))
  await writeFile(path.join(iconsDir, 'maskable-512.png'), await png(square, 512))
  await writeFile(path.join(iconsDir, 'apple-touch-icon.png'), await png(square, 180))
  await writeFile(path.join(root, 'public', 'favicon.ico'), pngToIco(await png(rounded, 48), 48))
  await writeFile(path.join(root, 'app', 'icon.svg'), rounded)

  for (const [w, h, ratio] of SPLASH_SCREENS) {
    for (const dark of [false, true]) {
      const width = w * ratio
      const height = h * ratio
      const file = path.join(splashDir, `splash-${width}x${height}${dark ? '-dark' : ''}.png`)
      await sharp(Buffer.from(splashSvg({ width, height, dark }))).png({ compressionLevel: 9, palette: true }).toFile(file)
    }
  }
  console.log('Icons and splash screens generated.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
