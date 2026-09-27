/**
 * Icon Generator for myCrib PWA
 * Generates icons from docs/logo.png
 * Sizes: 192px and 512px, both "any" and "maskable" variants, plus the
 * apple touch icon and favicon.
 *
 * "any" icons keep the source's own transparency (the artwork's rounded
 * corners show through). "maskable" and the apple touch icon/favicon are
 * flattened onto the brand accent color (#6C3AED) first, since those
 * contexts render the whole square themselves and a transparent corner
 * would otherwise show as a hole or a default background.
 *
 * Usage: node scripts/generate-icons.js
 * Dependencies: sharp (devDependency)
 */

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = join(__dirname, '..', 'public');
const SOURCE = join(__dirname, '..', 'docs', 'logo.png');
const FLATTEN_BG = '#6C3AED';

mkdirSync(ICONS_DIR, { recursive: true });

const icons = [
  { name: 'icon-192.png',          size: 192, flatten: false },
  { name: 'icon-512.png',          size: 512, flatten: false },
  { name: 'icon-maskable-192.png', size: 192, flatten: true  },
  { name: 'icon-maskable-512.png', size: 512, flatten: true  },
  { name: 'apple-touch-icon.png',  size: 180, flatten: true  },
  { name: 'favicon-32.png',        size: 32,  flatten: true  },
];

for (const icon of icons) {
  const outputPath = join(ICONS_DIR, icon.name);
  let pipeline = sharp(SOURCE).resize(icon.size, icon.size, { fit: 'cover' });
  if (icon.flatten) {
    pipeline = pipeline.flatten({ background: FLATTEN_BG });
  }
  await pipeline.png().toFile(outputPath);
  console.log(`  ✓ ${icon.name} (${icon.size}x${icon.size})`);
}

// favicon.ico: ein Container aus mehreren eingebetteten PNGs (seit Vista
// unterstuetzt, kein BMP-Umweg noetig). sharp kann kein .ico schreiben, also
// von Hand gepackt - ICONDIR-Header + eine ICONDIRENTRY pro Groesse, dann die
// PNG-Bytes hintereinander.
const FAVICON_SIZES = [16, 32, 48];
const faviconPngs = await Promise.all(
  FAVICON_SIZES.map((size) =>
    sharp(SOURCE).resize(size, size, { fit: 'cover' }).flatten({ background: FLATTEN_BG }).png().toBuffer()
  )
);

const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;
let offset = ICONDIR_SIZE + ICONDIRENTRY_SIZE * FAVICON_SIZES.length;
const dir = Buffer.alloc(ICONDIR_SIZE);
dir.writeUInt16LE(0, 0); // reserved
dir.writeUInt16LE(1, 2); // type: icon
dir.writeUInt16LE(FAVICON_SIZES.length, 4);

const entries = FAVICON_SIZES.map((size, i) => {
  const png = faviconPngs[i];
  const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color count (0 = no palette)
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), Buffer.concat([dir, ...entries, ...faviconPngs]));
console.log(`  ✓ favicon.ico (${FAVICON_SIZES.join('/')}px)`);

console.log('\nIcons generated in public/icons/');
