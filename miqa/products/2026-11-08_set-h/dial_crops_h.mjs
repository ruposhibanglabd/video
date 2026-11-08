#!/usr/bin/env node
/**
 * Set H — dial-closeup (_3_dial) crops from the Steel Daylight plates.
 * The dial is the centre of the plate; crop a square around it and upscale to 1600².
 * No retouching of the watch (D51).
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'miqa/products/2026-11-08_set-h/work/uw';
const OUT = 'miqa/deliveries/2026-11-08_set-h/website';
const THUMBS = path.join(OUT, 'thumbs');
const SIZE = 1600;
const THUMB = 600;

// slug -> [plate, cropPx, cx, cy]  (crop size in source px, source is 2048²)
const JOBS = JSON.parse(process.argv[2] || '{}');

fs.mkdirSync(THUMBS, { recursive: true });

for (const [slug, [plate, crop, cx, cy]] of Object.entries(JOBS)) {
  const img = await loadImage(path.join(BASE, plate));
  const x = Math.max(0, Math.min(img.width - crop, cx - crop / 2));
  const y = Math.max(0, Math.min(img.height - crop, cy - crop / 2));
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x, y, crop, crop, 0, 0, SIZE, SIZE);
  fs.writeFileSync(path.join(OUT, `${slug}_3_dial.jpg`), c.toBuffer('image/jpeg', 92));

  const tc = createCanvas(THUMB, THUMB);
  tc.getContext('2d').drawImage(c, 0, 0, THUMB, THUMB);
  fs.writeFileSync(path.join(THUMBS, `${slug}_3_dial_600.jpg`), tc.toBuffer('image/jpeg', 82));
  console.log(`${slug}: crop ${crop} @ ${cx},${cy}`);
}
