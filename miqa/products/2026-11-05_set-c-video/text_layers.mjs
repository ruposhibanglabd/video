/**
 * Set C — text layers (2160×3840) for the 20 s cut.
 *
 * Same rules as the Set B v4 cut that the client approved:
 *  - one idea per frame, no stacked copy
 *  - never paint a full-frame card here; the renderer owns the picture,
 *    these are type + soft scrims only
 *  - no sparkle / glint / wipe sprites anywhere
 *  - Bengali letterSpacing is never set (breaks conjuncts)
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');

const W = 2160, H = 3840;
const BASE = 'miqa/products/2026-11-05_set-c-video';
const OUT = `${BASE}/plates/text`;
const OUTC = `${BASE}/plates/covers`;
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(OUTC, { recursive: true });

const PEARL = '#FDF6F3';
const CHAMP = '#D9B779';
const INK = '#2A101C';
const BURG = '#5A1A2E';
const ROSEWOOD = '#9E4A63';

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
  if (blur) shadow(ctx, blur, 'rgba(24,6,12,0.62)', 0, 6);
  ctx.fillStyle = fill; ctx.fillText(t, x, y); noShadow(ctx);
}
function layer(name, fn) {
  const c = createCanvas(W, H); const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}
/** scrim always runs to the bottom edge, otherwise it leaves a visible band */
function scrim(ctx, y0, alpha) {
  const g = ctx.createLinearGradient(0, y0, 0, H);
  g.addColorStop(0, 'rgba(40,12,24,0)');
  g.addColorStop(0.35, `rgba(40,12,24,${alpha * 0.5})`);
  g.addColorStop(0.72, `rgba(36,8,20,${alpha * 0.88})`);
  g.addColorStop(1, `rgba(30,6,16,${alpha})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
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
function rule(ctx, y, w = 380, alpha = 0.9) {
  ctx.fillStyle = `rgba(217,183,121,${alpha})`;
  ctx.fillRect(W / 2 - w / 2, y, w, 4);
}

// ---------------------------------------------------------------- 1 brand bar
layer('t_bar', (ctx) => {
  const g = ctx.createLinearGradient(0, 0, 0, 470);
  g.addColorStop(0, 'rgba(32,8,20,0.50)'); g.addColorStop(1, 'rgba(32,8,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
  wordmark(ctx, 300, 196, 78);
  ctx.font = '40px CinzelM'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(253,246,243,0.86)';
  ctx.fillText('O C T A V I A', W - 150, 186);
  ctx.strokeStyle = 'rgba(217,183,121,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, 248); ctx.lineTo(W - 150, 248); ctx.stroke();
});

// ---------------------------------------------------------------- 2 hook: price
layer('t_hook', (ctx) => {
  scrim(ctx, 2180, 0.80);
  text(ctx, 'মাত্র ৩৫০ টাকা', W / 2, 2596, '104px HindSB', PEARL, 30);
  ctx.font = '520px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 46, 'rgba(20,2,10,0.72)', 0, 14);
  ctx.fillStyle = gold(ctx, W / 2 - 500, 2660, W / 2 + 500, 3240);
  ctx.fillText('৳৩৫০', W / 2, 3170); noShadow(ctx);
  rule(ctx, 3246, 300);
  text(ctx, 'অষ্টকোণ কেস · হার্ট-ক্রিস্টাল ব্রেসলেট · ৫টি রঙ', W / 2, 3360, '66px HindM',
    'rgba(253,246,243,0.95)', 20);
  // colour dots: five
  for (let i = 0; i < 5; i++) {
    const x = W / 2 + (i - 2) * 78;
    ctx.beginPath(); ctx.arc(x, 3468, 11, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? 'rgba(217,183,121,0.95)' : 'rgba(253,246,243,0.38)';
    ctx.fill();
  }
});

// ---------------------------------------------------------------- 3 colourway names
const NAMES = [
  { bn: 'কালো', en: 'BLACK', sub: '' },
  { bn: 'গোলাপি', en: 'PINK', sub: '' },
  { bn: 'গ্লিটার হার্ট', en: 'TRUE WORTH · BLACK', sub: '' },
  { bn: 'সবুজ', en: 'GREEN', sub: '' },
  { bn: 'সাদা', en: 'WHITE', sub: '' },
];
NAMES.forEach((n, i) => {
  layer(`t_c${i + 1}`, (ctx) => {
    scrim(ctx, 2900, 0.78);
    text(ctx, n.bn, W / 2, 3236, '156px HindSB', PEARL, 30);
    text(ctx, `O C T A V I A  ·  ${n.en}`, W / 2, 3328, '46px CinzelM',
      'rgba(233,199,140,0.98)', 18);
  });
});

// ---------------------------------------------------------------- 4 water resistance
layer('t_water', (ctx) => {
  scrim(ctx, 2180, 0.86);
  // thin gold rule instead of an icon — the type carries the idea
  rule(ctx, 2288, 220, 0.75);
  text(ctx, 'ওয়াটার রেজিস্ট্যান্স', W / 2, 2660, '126px HindSB', PEARL, 34);
  text(ctx, 'হালকা পানির ছিটা সহনশীল', W / 2, 2790, '96px HindSB',
    'rgba(253,246,243,0.96)', 26);
  rule(ctx, 2848, 300);
  text(ctx, 'পানিতে ডুবাবেন না', W / 2, 2966, '78px HindM',
    'rgba(233,199,140,0.98)', 22);
});

// ---------------------------------------------------------------- 5 replacement
layer('t_replace', (ctx) => {
  scrim(ctx, 2180, 0.86);
  text(ctx, '৭ দিনের', W / 2, 2580, '132px HindSB', PEARL, 34);
  text(ctx, 'রিপ্লেসমেন্ট সুবিধা', W / 2, 2742, '138px HindSB', PEARL, 34);
  rule(ctx, 2836, 380);
  text(ctx, 'নিশ্চিন্তে কিনুন', W / 2, 2962, '82px HindM',
    'rgba(233,199,140,0.98)', 22);
});

// ---------------------------------------------------------------- 6 five percent (verbatim)
layer('t_five', (ctx) => {
  ctx.strokeStyle = 'rgba(217,183,121,0.9)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(W / 2, 1400, 300, 0, Math.PI * 2); ctx.stroke();
  text(ctx, '৫%', W / 2, 1510, '300px Tiro', BURG);
  const lg = ctx.createLinearGradient(820, 0, 1340, 0);
  lg.addColorStop(0, 'rgba(217,183,121,0)'); lg.addColorStop(0.5, 'rgba(217,183,121,0.95)');
  lg.addColorStop(1, 'rgba(217,183,121,0)');
  ctx.fillStyle = lg; ctx.fillRect(820, 2180, 520, 4);
  text(ctx, 'MIQA-এর মুনাফার ৫%', W / 2, 2400, '104px HindSB', INK);
  text(ctx, 'পথশিশুদের কল্যাণে।', W / 2, 2540, '104px HindSB', INK);
  wordmark(ctx, W / 2, 2800, 110);
});

// ---------------------------------------------------------------- 7 CTA
layer('t_cta', (ctx) => {
  scrim(ctx, 2020, 0.74);
  ctx.font = '76px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const pillW = 900, pillH = 150, px = (W - pillW) / 2, py = 2300;
  ctx.fillStyle = 'rgba(253,246,243,0.94)';
  ctx.beginPath(); ctx.roundRect(px, py, pillW, pillH, pillH / 2); ctx.fill();
  ctx.fillStyle = BURG;
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, py + pillH / 2 + 4);
  text(ctx, 'এখনই অর্ডার করুন।', W / 2, 2686, '146px HindSB', PEARL, 34);
  text(ctx, 'মাত্র ৩৫০ টাকা · ৫টি রঙ', W / 2, 2846, '74px HindM', CHAMP, 22);
  wordmark(ctx, W / 2, 3170, 170);
  text(ctx, 'Beyond Time, Beyond Style.', W / 2, 3320, 'italic 92px CormMI',
    'rgba(253,246,243,0.92)', 24);
});

// ---------------------------------------------------------------- covers (1080×1920)
function clayer(name, fn) {
  const c = createCanvas(1080, 1920); const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUTC}/${name}.png`, c.toBuffer('image/png'));
  console.log('cover', name);
}
clayer('coverA', (ctx) => {
  const g = ctx.createLinearGradient(0, 1120, 0, 1920);
  g.addColorStop(0, 'rgba(32,8,20,0)'); g.addColorStop(0.55, 'rgba(32,8,20,0.55)');
  g.addColorStop(1, 'rgba(24,4,14,0.86)');
  ctx.fillStyle = g; ctx.fillRect(0, 1120, 1080, 800);
  ctx.font = '200px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 22, 'rgba(20,2,10,0.7)', 0, 6);
  ctx.fillStyle = gold(ctx, 330, 1320, 750, 1500);
  ctx.fillText('৳৩৫০', 540, 1508); noShadow(ctx);
  text(ctx, 'মাত্র ৩৫০ টাকা', 540, 1600, '58px HindSB', PEARL, 20);
  ctx.fillStyle = 'rgba(217,183,121,0.9)'; ctx.fillRect(460, 1634, 160, 3);
  text(ctx, 'অষ্টকোণ কেস · হার্ট-ক্রিস্টাল ব্রেসলেট', 540, 1704, '34px HindM',
    'rgba(253,246,243,0.95)', 16);
  text(ctx, '৫টি রঙ', 540, 1758, '32px HindSB', 'rgba(233,199,140,0.95)', 14);
  wordmark(ctx, 540, 1836, 46);
});
clayer('coverB', (ctx) => {
  const g = ctx.createLinearGradient(0, 1140, 0, 1920);
  g.addColorStop(0, 'rgba(40,12,24,0)'); g.addColorStop(0.40, 'rgba(40,12,24,0.52)');
  g.addColorStop(1, 'rgba(30,6,16,0.90)');
  ctx.fillStyle = g; ctx.fillRect(0, 1140, 1080, 780);
  text(ctx, '৫টি রঙ · একটাই দাম', 540, 1290, '42px HindSB', 'rgba(253,246,243,0.95)', 16);
  ctx.font = '180px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 20, 'rgba(20,2,10,0.6)', 0, 6);
  ctx.fillStyle = gold(ctx, 350, 1340, 730, 1490);
  ctx.fillText('৳৩৫০', 540, 1482); noShadow(ctx);
  ctx.fillStyle = 'rgba(217,183,121,0.9)'; ctx.fillRect(470, 1520, 140, 3);
  text(ctx, 'ওয়াটার রেজিস্ট্যান্স · হালকা পানির ছিটা সহনশীল', 540, 1592, '30px HindM',
    'rgba(253,246,243,0.9)', 14);
  text(ctx, '৭ দিনের রিপ্লেসমেন্ট সুবিধা', 540, 1650, '34px HindSB', CHAMP, 16);
  text(ctx, 'ক্যাশ অন ডেলিভারি', 540, 1706, '30px HindM', 'rgba(253,246,243,0.88)', 12);
  wordmark(ctx, 540, 1834, 48);
});
