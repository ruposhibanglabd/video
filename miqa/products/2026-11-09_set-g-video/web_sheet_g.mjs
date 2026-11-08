/**
 * Contact sheet — Set G website photo pack (Steel Daylight).
 * miqa/deliveries/2026-11-09_set-g-video/CONTACT-SHEET-WEBSITE.jpg
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const W = 'miqa/deliveries/2026-11-09_set-g-video/website';
const COLS = [
  ['ব্ল্যাক নেভি', 'set-g-01-black'],
  ['টু-টোন রয়্যাল ব্লু', 'set-g-02-twotone-navy'],
  ['টু-টোন স্লেট', 'set-g-03-twotone-slate'],
  ['গোল্ড রয়্যাল ব্লু', 'set-g-04-gold-navy'],
  ['গোল্ড শ্যাম্পেন', 'set-g-05-gold-champagne'],
];
const ROWS = [
  ['1_main', '১ · মেইন'],
  ['2_angle', '২ · অ্যাঙ্গেল'],
  ['3_dial', '৩ · ডায়াল'],
  ['4_bracelet', '৪ · ব্রেসলেট'],
  ['5_wrist', '৫ · হাতে'],
];

const cell = 262, gap = 12, padX = 40, headH = 232, rowLab = 46;
const cw = padX * 2 + COLS.length * cell + (COLS.length - 1) * gap;
const ch = headH + ROWS.length * (cell + rowLab + 40 + gap) + 360 + 60;

const cnv = createCanvas(cw, ch);
const ctx = cnv.getContext('2d');
const g = ctx.createLinearGradient(0, 0, 0, ch);
g.addColorStop(0, '#FAF8F4');
g.addColorStop(1, '#E4DFD6');
ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);

ctx.textAlign = 'center';
ctx.fillStyle = '#8A939B';
ctx.font = '28px MontSB';
ctx.fillText('M I Q A   ·   M E N   ·   W E B S I T E   P H O T O S', cw / 2, 74);
ctx.fillStyle = '#14181D';
ctx.font = '54px AnekXB';
ctx.fillText('সেট G — ওয়েবসাইট প্যাক', cw / 2, 146);
ctx.fillStyle = 'rgba(20,24,29,0.66)';
ctx.font = '26px AnekSB';
ctx.fillText('প্রতি প্রোডাক্টে ৫টি ছবি (১৬০০×১৬০০) · পাঁচ কালারওয়ে · মোট ২৫টি + গ্রুপ', cw / 2, 190);
ctx.fillStyle = '#8A939B';
ctx.font = '22px HindSB';
ctx.fillText('Steel Daylight থিম · বাটারফ্লাই লক · ওয়াটার রেজিস্ট্যান্ট · কোয়ালিটি: Good', cw / 2, 222);

let y = headH;
for (const [rn, rl] of ROWS) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8A939B';
  ctx.font = '24px AnekSB';
  ctx.fillText(rl, padX, y + 30);
  const ty = y + rowLab;
  for (const [ci, [name, slug]] of COLS.entries()) {
    const x = padX + ci * (cell + gap);
    const im = await loadImage(`${W}/${slug}_${rn}.jpg`);
    ctx.drawImage(im, x, ty, cell, cell);
    ctx.strokeStyle = 'rgba(138,147,155,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, ty, cell, cell);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(20,24,29,0.82)';
    ctx.font = '22px AnekSB';
    ctx.fillText(name, x + cell / 2, ty + cell + 30);
  }
  y = ty + cell + 40 + gap;
}

// shared group card
const sb = 320;
const gy = y + 14;
const gx = (cw - sb) / 2;
const gim = await loadImage(`${W}/set-g_shared_group.jpg`);
ctx.drawImage(gim, gx, gy, sb, sb);
ctx.strokeStyle = 'rgba(138,147,155,0.35)'; ctx.lineWidth = 2;
ctx.strokeRect(gx, gy, sb, sb);
ctx.textAlign = 'center';
ctx.fillStyle = 'rgba(20,24,29,0.82)';
ctx.font = '24px AnekSB';
ctx.fillText('পাঁচ কালারওয়ে একসাথে', cw / 2, gy + sb + 34);

fs.writeFileSync('miqa/deliveries/2026-11-09_set-g-video/CONTACT-SHEET-WEBSITE.jpg', cnv.toBuffer('image/jpeg', 90));
console.log('sheet', cw + 'x' + ch);
