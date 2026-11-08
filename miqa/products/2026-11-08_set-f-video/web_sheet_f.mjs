/**
 * Contact sheet for the Set F website photo pack.
 * miqa/deliveries/2026-11-08_set-f-video/CONTACT-SHEET-WEBSITE.jpg
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const W = 'miqa/deliveries/2026-11-08_set-f-video/website';
const COLS = [
  ['আইভরি পার্ল', 'set-f-01-ivory'],
  ['সিলভার হোয়াইট', 'set-f-02-white'],
  ['ল্যাভেন্ডার', 'set-f-03-lavender'],
  ['এমারেল্ড সবুজ', 'set-f-04-emerald'],
  ['রোজ পিংক', 'set-f-05-rose'],
];
const ROWS = [['main', 'মেইন'], ['detail', 'ডায়াল ক্লোজ-আপ'], ['wrist', 'হাতে']];

const cell = 380, gap = 18, padX = 48, headH = 210, rowLab = 54;
const cw = padX * 2 + COLS.length * cell + (COLS.length - 1) * gap;
const ch = headH + ROWS.length * (cell + rowLab + 46 + gap) + 300 + 140;

const cnv = createCanvas(cw, ch);
const ctx = cnv.getContext('2d');
const g = ctx.createLinearGradient(0, 0, 0, ch);
g.addColorStop(0, '#FFFCF7'); g.addColorStop(1, '#F3E5D6');
ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);

ctx.textAlign = 'center';
ctx.fillStyle = '#8A6440';
ctx.font = '30px MontSB';
ctx.fillText('M I Q A   ·   W E B S I T E   P H O T O S', cw / 2, 74);
ctx.fillStyle = '#2B1118';
ctx.font = '62px HindSB';
ctx.fillText('কুশন স্টোন — ওয়েবসাইট প্যাক', cw / 2, 148);
ctx.fillStyle = 'rgba(43,17,24,0.62)';
ctx.font = '30px HindSB';
ctx.fillText('প্রতি রঙে ৩টি ছবি (১৬০০×১৬০০) + গ্রুপ ও গিফট বক্স', cw / 2, 192);

let y = headH;
for (const [rn, rl] of ROWS) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8A6440';
  ctx.font = '30px HindSB';
  ctx.fillText(rl, padX, y + 34);
  const ty = y + rowLab;
  for (const [ci, [name, slug]] of COLS.entries()) {
    const x = padX + ci * (cell + gap);
    const im = await loadImage(`${W}/${slug}_${rn}.jpg`);
    ctx.drawImage(im, x, ty, cell, cell);
    ctx.strokeStyle = 'rgba(138,100,64,0.30)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, ty, cell, cell);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(43,17,24,0.80)';
    ctx.font = '26px HindSB';
    ctx.fillText(name, x + cell / 2, ty + cell + 34);
  }
  y = ty + cell + 46 + gap;
}

// shared row
const sy = y + 6;
const shared = [['set-f_shared_group', 'পাঁচ রঙ একসাথে'], ['set-f_shared_gift', 'গিফট বক্স']];
const sb = 300;
const totalW = shared.length * sb + (shared.length - 1) * 26;
let sx = (cw - totalW) / 2;
for (const [f, lab] of shared) {
  const im = await loadImage(`${W}/${f}.jpg`);
  ctx.drawImage(im, sx, sy, sb, sb);
  ctx.strokeStyle = 'rgba(138,100,64,0.30)'; ctx.lineWidth = 2;
  ctx.strokeRect(sx, sy, sb, sb);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(43,17,24,0.80)';
  ctx.font = '26px HindSB';
  ctx.fillText(lab, sx + sb / 2, sy + sb + 32);
  sx += sb + 26;
}

fs.writeFileSync('miqa/deliveries/2026-11-08_set-f-video/CONTACT-SHEET-WEBSITE.jpg',
  cnv.toBuffer('image/jpeg', 90));
console.log('sheet', cw + 'x' + ch);
