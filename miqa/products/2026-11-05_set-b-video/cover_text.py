#!/usr/bin/env python3
"""Set B covers (1080x1920) with verbatim Bengali text via Skia canvas."""
import subprocess, os

MJS = '''
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');

const W = 1080, H = 1920;
const { loadImage } = await import('@napi-rs/canvas');
const ART = 'miqa/deliveries/2026-11-05_set-b';
const COLS = ['01_fiyota-floral-black', '02_fiyota-floral-blue', '03_fiyota-floral-white', '04_fiyota-floral-green'];
const STEMS = ['fiyota-floral-black', 'fiyota-floral-blue', 'fiyota-floral-white', 'fiyota-floral-green'];
const IMGS = [];
for (let i = 0; i < 4; i++) {
  try { IMGS.push(await loadImage(`${ART}/${COLS[i]}/website-images/${STEMS[i]}_03_dial-closeup.jpg`)); }
  catch (e) { IMGS.push(null); }
}
const PEARL = '#FBF4F1', CHAMP = '#D9B779', BURGUNDY = '#5A1A2E';
function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.4, '#F6E7BE');
  g.addColorStop(0.65, '#D9B779'); g.addColorStop(1, '#C39A5C');
  return g;
}
function center(ctx, t, x, y, font, fill, blur = 0) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) { ctx.shadowColor = 'rgba(26,6,14,0.75)'; ctx.shadowBlur = blur; ctx.shadowOffsetY = 4; }
  ctx.fillStyle = fill; ctx.fillText(t, x, y);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}
function wordmark(ctx, cx, y, size) {
  ctx.font = `${size}px CinzelM`; ctx.textAlign = 'left';
  const chars = [...'MIQA']; const tr = size * 0.36;
  const wid = chars.map(c => ctx.measureText(c).width);
  const total = wid.reduce((a, b) => a + b, 0) + tr * 3;
  let x = cx - total / 2;
  ctx.shadowColor = 'rgba(30,8,18,0.5)'; ctx.shadowBlur = size * 0.16; ctx.shadowOffsetY = size * 0.03;
  for (let i = 0; i < 4; i++) { ctx.fillStyle = gold(ctx, x, y - size, x + wid[i], y); ctx.fillText(chars[i], x, y); x += wid[i] + tr; }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}
function scrim(ctx, y0, h) {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, 'rgba(30,8,18,0)'); g.addColorStop(0.35, 'rgba(30,8,18,0.42)');
  g.addColorStop(1, 'rgba(24,4,12,0.86)');
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, h);
}

function frame(kind) {
  const c = createCanvas(W, H); const ctx = c.getContext('2d');
  if (kind === 'B') {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#FBF4F1'); bg.addColorStop(0.55, '#FAF0EC'); bg.addColorStop(1, '#F6E2E3');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }
  if (kind === 'A') {
    scrim(ctx, 980, 940);
    ctx.font = '260px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(20,2,10,0.8)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.fillStyle = gold(ctx, W/2 - 230, 1300, W/2 + 230, 1520);
    ctx.fillText('৳৩৫০', W / 2, 1490);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    center(ctx, 'মাত্র ৩৫০ টাকা', W / 2, 1590, '60px HindSB', PEARL, 22);
    ctx.fillStyle = 'rgba(217,183,121,0.95)'; ctx.fillRect(W/2 - 80, 1622, 160, 3);
    center(ctx, 'ক্রিস্টাল বেজেল · ফ্লোরাল ব্রেসলেট', W / 2, 1720, '36px HindM', 'rgba(251,244,241,0.95)', 16);
    center(ctx, '৪টি রঙ', W / 2, 1778, '38px HindSB', CHAMP, 16);
    wordmark(ctx, W / 2, 1860, 44);
  } else {
    // B: price block on the pearl field (middle), strip sits underneath
    center(ctx, 'মাত্র ৩৫০ টাকা', W / 2, 470, '52px HindSB', '#9E4A63', 0);
    ctx.font = '250px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(90,26,46,0.28)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = gold(ctx, W/2 - 215, 560, W/2 + 215, 780);
    ctx.fillText('৳৩৫০', W / 2, 760);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(158,74,99,0.55)'; ctx.fillRect(W/2 - 90, 800, 180, 3);
    center(ctx, 'কালো · নীল · সাদা · সবুজ', W / 2, 900, '44px HindSB', BURGUNDY, 0);
    center(ctx, 'চারটি রঙ, একটাই দাম', W / 2, 962, '32px HindM', 'rgba(90,26,46,0.72)', 0);

    // four colourway thumbs, evenly spaced
    const names = ['কালো', 'নীল', 'সাদা', 'সবুজ'];
    const n = 4, tw = 214, gap = (W - n * tw) / (n + 1);
    for (let i = 0; i < n; i++) {
      const x = gap + i * (tw + gap);
      ctx.save();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 1032, tw, tw, 26) : ctx.rect(x, 1032, tw, tw);
      ctx.clip();
      const im = IMGS[i];
      if (im) ctx.drawImage(im, x, 1032, tw, tw);
      ctx.restore();
      ctx.strokeStyle = 'rgba(217,183,121,0.85)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 1032, tw, tw, 26) : ctx.rect(x, 1032, tw, tw);
      ctx.stroke();
      center(ctx, names[i], x + tw / 2, 1310, '34px HindSB', BURGUNDY, 0);
    }
    center(ctx, '৭ দিনের মধ্যে রিপ্লেসমেন্ট গ্যারান্টি', W / 2, 1436, '42px HindSB', BURGUNDY, 0);
    ctx.fillStyle = 'rgba(158,74,99,0.4)'; ctx.fillRect(W/2 - 120, 1478, 240, 2);
    center(ctx, 'ক্যাশ অন ডেলিভারি', W / 2, 1552, '34px HindM', 'rgba(90,26,46,0.8)', 0);
    wordmark(ctx, W / 2, 1690, 52);
  }
  return c;
}
for (const k of ['A', 'B']) {
  const c = frame(k);
  fs.writeFileSync(`/tmp/cover_text_${k}.png`, c.toBuffer('image/png'));
  console.log('cover text', k);
}
'''
os.makedirs('miqa/products/2026-11-05_set-b-video/work', exist_ok=True)
open('miqa/products/2026-11-05_set-b-video/work/cover_text.mjs', 'w').write(MJS)
subprocess.run(['node', 'miqa/products/2026-11-05_set-b-video/work/cover_text.mjs'], check=True)
print('text layers done')
