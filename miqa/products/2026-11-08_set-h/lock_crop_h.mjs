#!/usr/bin/env node
/**
 * Set H — shared lock/bracelet close-up from the p09 plate (Steel Daylight).
 * Crop around the embossed crown clasp, upscale to 1600².
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';

const OUT = 'miqa/deliveries/2026-11-08_set-h/website';
const THUMBS = `${OUT}/thumbs`;
fs.mkdirSync(THUMBS, { recursive: true });

const img = await loadImage('miqa/products/2026-11-08_set-h/work/uw/p09_lock.png');
const crop = 780, cx = 1024, cy = 980;
const x = Math.max(0, Math.min(img.width - crop, cx - crop / 2));
const y = Math.max(0, Math.min(img.height - crop, cy - crop / 2));

const c = createCanvas(1600, 1600);
const ctx = c.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(img, x, y, crop, crop, 0, 0, 1600, 1600);
fs.writeFileSync(`${OUT}/set-h_shared_lock.jpg`, c.toBuffer('image/jpeg', 92));

const tc = createCanvas(600, 600);
tc.getContext('2d').drawImage(c, 0, 0, 600, 600);
fs.writeFileSync(`${THUMBS}/set-h_shared_lock_600.jpg`, tc.toBuffer('image/jpeg', 82));
console.log('lock ok');
