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
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
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

console.log('\nIcons generated in public/icons/');
