#!/usr/bin/env node
/**
 * Set H — caption on the main shot (client request, 8 Nov 2026).
 *
 * The client wants "রোলেক্স লক" written on the main image. Set G did the same
 * thing with a bottom-left printed plate, so this follows that recipe exactly:
 * brass hairline, graphite Bengali display line, steel sub-line, never on top
 * of the watch. Only the approved claim words go in — no price, no URL, no
 * phone, no logo mark, no border (D26/D51).
 *
 *   node caption_h.mjs            → writes *_1_main.jpg in place + thumbs
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'miqa/deliveries/2026-11-08_set-h/website';
const S = 1600;

GlobalFonts.registerFromPath('miqa/brand/fonts/AnekBangla-SemiBold.ttf', 'AnekSB');
GlobalFonts.registerFromPath('miqa/brand/fonts/AnekBangla-ExtraBold.ttf', 'AnekXB');
GlobalFonts.registerFromPath('miqa/brand/fonts/Montserrat-Medium.ttf', 'MontMed');

const SLUGS = [
  'set-h-01-green',
  'set-h-02-champagne',
  'set-h-03-black',
  'set-h-04-silver',
  'set-h-05-blue',
  'set-h-06-red',
  'set-h-07-black-steel',
];

const EYEBROW = 'MIQA · মন্টভেয়ার';
const TITLE = 'রোলেক্স লক';
const SUB = 'ক্ল্যাশে উঁচু ক্রাউন এমবস, ভেতরে হিডেন';

for (const slug of SLUGS) {
  const file = path.join(DIR, `${slug}_1_main.jpg`);
  const img = await loadImage(file);
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, S, S);

  const X = Math.round(S * 0.075);
  const BASE = Math.round(S - 190);

  // soft wash so the type sits on clean paper, never on the watch's shadow
  const wg = ctx.createRadialGradient(X + 150, BASE - 70, 0, X + 150, BASE - 70, S * 0.50);
  wg.addColorStop(0, 'rgba(252,251,247,0.86)');
  wg.addColorStop(0.55, 'rgba(250,248,244,0.48)');
  wg.addColorStop(1, 'rgba(250,248,244,0)');
  ctx.fillStyle = wg;
  ctx.fillRect(0, 0, S, S);

  // brass hairline
  ctx.fillStyle = '#C9A45C';
  ctx.fillRect(X, BASE - 168, Math.round(S * 0.060), 3);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = 'rgba(20,24,29,0.62)';
  ctx.font = '32px AnekSB';
  ctx.fillText(EYEBROW, X, BASE - 118);

  const grd = ctx.createLinearGradient(X, BASE - 100, X, BASE - 10);
  grd.addColorStop(0, '#14181D');
  grd.addColorStop(1, '#2C333A');
  ctx.fillStyle = grd;
  ctx.font = '84px AnekXB';
  ctx.fillText(TITLE, X, BASE - 14);

  ctx.fillStyle = '#5C646C';
  ctx.font = '38px AnekSB';
  ctx.fillText(SUB, X, BASE + 46);

  fs.writeFileSync(file, c.toBuffer('image/jpeg', 92));

  const t = createCanvas(600, 600);
  t.getContext('2d').drawImage(c, 0, 0, 600, 600);
  fs.writeFileSync(path.join(DIR, 'thumbs', `${slug}_1_main_600.jpg`), t.toBuffer('image/jpeg', 82));
  console.log(`${slug}_1_main: caption added`);
}
