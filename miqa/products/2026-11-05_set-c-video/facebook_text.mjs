/**
 * Set C — Facebook post text layer (1080×1350).
 * Bengali is shaped by @napi-rs/canvas, so conjuncts stay intact.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Cinzel-Bold.ttf`, 'CinzelB');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');

const W = 1080, H = 1350;
const OUT = 'miqa/products/2026-11-05_set-c-video/plates/facebook_text.png';
const PEARL = '#FDF6F3';
const CHAMP = '#D9B779';
const INK = '#2A101C';
const BURG = '#5A1A2E';
const ROSE = '#9E4A63';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.38, '#F8ECCB');
  g.addColorStop(0.62, '#D9B779'); g.addColorStop(1, '#C09A5E');
  return g;
}
function shadow(ctx, blur, color, x = 0, y = 0) {
  ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}
function noShadow(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function text(ctx, t, x, y, font, fill, blur = 0) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) shadow(ctx, blur, 'rgba(24,6,12,0.45)', 0, 4);
  ctx.fillStyle = fill; ctx.fillText(t, x, y); noShadow(ctx);
}
function wordmark(ctx, cx, y, size, color) {
  ctx.font = `${size}px CinzelM`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...'MIQA']; const tr = size * 0.36;
  const wid = chars.map(c => ctx.measureText(c).width);
  const total = wid.reduce((a, b) => a + b, 0) + tr * (chars.length - 1);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = color || gold(ctx, x, y - size, x + wid[i], y);
    ctx.fillText(chars[i], x, y); x += wid[i] + tr;
  }
}
function spaced(ctx, t, x, y, font, fill, tr) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...t];
  const wid = chars.map(c => ctx.measureText(c).width);
  const total = wid.reduce((a, b) => a + b, 0) + tr * (chars.length - 1);
  let cx = x - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = fill; ctx.fillText(chars[i], cx, y); cx += wid[i] + tr;
  }
}

const c = createCanvas(W, H);
const ctx = c.getContext('2d');

// top brand bar
wordmark(ctx, 92, 74, 40);
spaced(ctx, 'THE OCTAVIA COLLECTION', W - 92, 68, '17px MontSB', 'rgba(90,26,46,0.72)', 3.2);
ctx.fillStyle = 'rgba(184,146,90,0.55)'; ctx.fillRect(60, 96, W - 120, 2);

// headline
text(ctx, '৫টি রঙ · একটাই দাম', W / 2, 196, '64px HindSB', BURG);
text(ctx, 'FIYOTA Octavia  +  TRUE WORTH', W / 2, 238, '21px CinzelM', 'rgba(158,74,99,0.95)');

// labels under the five watches
const LABELS = ['কালো', 'গোলাপি', 'গ্লিটার হার্ট', 'সবুজ', 'সাদা'];
const XS = [150, 345, 540, 735, 930];
LABELS.forEach((s, i) => {
  ctx.beginPath(); ctx.arc(XS[i], 792, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(184,146,90,0.9)'; ctx.fill();
  text(ctx, s, XS[i], 826, '21px HindSB', BURG);
});

// price panel
ctx.fillStyle = 'rgba(253,246,243,0.72)';
ctx.beginPath(); ctx.roundRect(90, 872, W - 180, 300, 28); ctx.fill();
ctx.strokeStyle = 'rgba(184,146,90,0.55)'; ctx.lineWidth = 2;
ctx.beginPath(); ctx.roundRect(90, 872, W - 180, 300, 28); ctx.stroke();

text(ctx, 'মাত্র', W / 2, 928, '27px HindM', ROSE);
ctx.font = '112px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
shadow(ctx, 18, 'rgba(90,26,46,0.18)', 0, 5);
ctx.fillStyle = gold(ctx, W / 2 - 190, 940, W / 2 + 190, 1052);
ctx.fillText('৳৩৫০', W / 2, 1046); noShadow(ctx);
ctx.fillStyle = 'rgba(184,146,90,0.85)'; ctx.fillRect(W / 2 - 90, 1066, 180, 3);
text(ctx, 'ক্যাশ অন ডেলিভারি · ৭ দিনের রিপ্লেসমেন্ট', W / 2, 1112, '23px HindSB', BURG);
text(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', W / 2, 1150, '18px HindM', 'rgba(90,26,46,0.82)');

// footer
text(ctx, 'Beyond Time, Beyond Style.', W / 2, 1218, 'italic 26px CormMI', 'rgba(158,74,99,0.9)');

fs.writeFileSync(OUT, c.toBuffer('image/png'));
console.log('wrote', OUT);
