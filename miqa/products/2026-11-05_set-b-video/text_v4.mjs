/**
 * Set B v4 — text layers for the 20-second cut.
 *
 * Design rules for this cut:
 *  - one idea per frame, no stacked copy
 *  - never draw a full-frame card in a layer; only type + soft scrims
 *  - no sparkle/glint sprites at all (client: "flash করছে, বন্ধ করো")
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');

const W = 2160, H = 3840;
const OUT = 'miqa/products/2026-11-05_set-b-video/plates/v4';
const OUTC = 'miqa/products/2026-11-05_set-b-video/plates/v4c';
fs.mkdirSync(OUTC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const PEARL = '#FDF6F3';
const CHAMP = '#D9B779';
const INK = '#2A1018';
const BURG = '#5A1A2E';
const ROSEWOOD = '#7C3B4E';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.38, '#F8ECCB');
  g.addColorStop(0.62, '#D9B779'); g.addColorStop(1, '#C09A5E');
  return g;
}
function shadow(ctx, blur, color, x = 0, y = 0) {
  ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
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
function scrim(ctx, y0, h, alpha) {
  // always run to the bottom edge: a scrim that stops short leaves a visible band
  const hh = Math.max(h, H - y0);
  const g = ctx.createLinearGradient(0, y0, 0, H);
  g.addColorStop(0, 'rgba(28,8,16,0)');
  g.addColorStop(0.35, `rgba(28,8,16,${alpha * 0.5})`);
  g.addColorStop(0.72, `rgba(26,6,14,${alpha * 0.88})`);
  g.addColorStop(1, `rgba(22,4,11,${alpha})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, hh);
}
function wordmark(ctx, cx, y, size, color) {
  ctx.font = `${size}px CinzelM`; ctx.textAlign = 'left';
  const chars = [...'MIQA']; const tr = size * 0.36;
  const wid = chars.map(c => ctx.measureText(c).width);
  const total = wid.reduce((a, b) => a + b, 0) + tr * 3;
  let x = cx - total / 2;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = color || gold(ctx, x, y - size, x + wid[i], y);
    ctx.fillText(chars[i], x, y); x += wid[i] + tr;
  }
}

// ---------------------------------------------------------------- 1 brand bar
layer('t_bar', (ctx) => {
  const g = ctx.createLinearGradient(0, 0, 0, 470);
  g.addColorStop(0, 'rgba(30,8,18,0.52)'); g.addColorStop(1, 'rgba(30,8,18,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 470);
  wordmark(ctx, 300, 196, 78);
  ctx.font = '40px CinzelM'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(253,246,243,0.86)';
  ctx.fillText('S Y L V E L L E', W - 150, 186);
  ctx.strokeStyle = 'rgba(217,183,121,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, 248); ctx.lineTo(W - 150, 248); ctx.stroke();
});

// ---------------------------------------------------------------- 2 hook: price
layer('t_hook', (ctx) => {
  scrim(ctx, 2180, 1360, 0.80);
  text(ctx, 'মাত্র ৩৫০ টাকা', W / 2, 2600, '104px HindSB', PEARL, 30);
  ctx.font = '540px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 46, 'rgba(20,2,10,0.72)', 0, 14);
  ctx.fillStyle = gold(ctx, W / 2 - 500, 2660, W / 2 + 500, 3260);
  ctx.fillText('৳৩৫০', W / 2, 3180); noShadow(ctx);
  ctx.fillStyle = 'rgba(217,183,121,0.9)';
  ctx.fillRect(W / 2 - 150, 3252, 300, 4);
});

// ---------------------------------------------------------------- 3 four colourway names
const NAMES = [
  { bn: 'কালো', en: 'BLACK' }, { bn: 'নীল', en: 'BLUE' },
  { bn: 'সাদা', en: 'WHITE' }, { bn: 'সবুজ', en: 'GREEN' },
];
NAMES.forEach((n, i) => {
  layer(`t_c${i + 1}`, (ctx) => {
    scrim(ctx, 2960, 880, 0.62);
    text(ctx, n.bn, W / 2, 3230, '160px HindSB', PEARL, 30);
    text(ctx, `S Y L V E L L E  ·  ${n.en}`, W / 2, 3322, '46px CinzelM', 'rgba(233,199,140,0.98)', 18);
  });
});

// ---------------------------------------------------------------- 4 guarantee
layer('t_guarantee', (ctx) => {
  scrim(ctx, 2200, 1300, 0.86);
  text(ctx, '৭ দিনের মধ্যে', W / 2, 2600, '130px HindSB', PEARL, 34);
  text(ctx, 'রিপ্লেসমেন্ট গ্যারান্টি', W / 2, 2760, '138px HindSB', PEARL, 34);
  ctx.fillStyle = 'rgba(217,183,121,0.92)';
  ctx.fillRect(W / 2 - 190, 2850, 380, 4);
});

// ---------------------------------------------------------------- 5 five percent (verbatim)
layer('t_five', (ctx) => {
  // type only — the pearl card behind it is drawn by the renderer, so this
  // scene can hard-cut in without ghosting over the watch
  ctx.strokeStyle = 'rgba(217,183,121,0.9)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(W / 2, 1400, 300, 0, Math.PI * 2); ctx.stroke();
  text(ctx, '৫%', W / 2, 1510, '300px Tiro', BURG);
  const lg = ctx.createLinearGradient(820, 0, 1340, 0);
  lg.addColorStop(0, 'rgba(217,183,121,0)'); lg.addColorStop(0.5, 'rgba(217,183,121,0.95)');
  lg.addColorStop(1, 'rgba(217,183,121,0)');
  ctx.fillStyle = lg; ctx.fillRect(820, 2180, 520, 4);
  text(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', W / 2, 2440, '104px HindSB', INK);
  text(ctx, 'লভ্যাংশের ৫% পথশিশুদের কর্মসংস্থানে ব্যয় হবে।', W / 2, 2600, '70px HindM',
    'rgba(90,26,46,0.86)');
  wordmark(ctx, W / 2, 2900, 110);
});

// ---------------------------------------------------------------- 6 CTA
layer('t_cta', (ctx) => {
  scrim(ctx, 2050, 1500, 0.72);
  ctx.font = '76px HindSB'; ctx.textAlign = 'center';
  const pillW = 900, pillH = 150, px = (W - pillW) / 2, py = 2320;
  ctx.fillStyle = 'rgba(253,246,243,0.94)';
  ctx.beginPath(); ctx.roundRect(px, py, pillW, pillH, pillH / 2); ctx.fill();
  ctx.fillStyle = BURG; ctx.textBaseline = 'middle';
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, py + pillH / 2 + 4);
  text(ctx, 'এখনই অর্ডার করুন।', W / 2, 2700, '150px HindSB', PEARL, 34);
  text(ctx, 'মাত্র ৩৫০ টাকা · ৪টি রঙ', W / 2, 2860, '74px HindM', CHAMP, 22);
  wordmark(ctx, W / 2, 3180, 170);
  text(ctx, 'Beyond Time, Beyond Style.', W / 2, 3330, 'italic 92px CormMI',
    'rgba(253,246,243,0.92)', 24);
});

// ---------------------------------------------------------------- 7 quiet end
layer('t_end', (ctx) => {
  wordmark(ctx, W / 2, 3000, 190);
  text(ctx, 'Beyond Time, Beyond Style.', W / 2, 3160, 'italic 96px CormMI',
    'rgba(253,246,243,0.94)', 26);
});

// ---------------------------------------------------------------- cover overlays (1080x1920)
function clayer(name, fn) {
  const c = createCanvas(1080, 1920); const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUTC}/${name}.png`, c.toBuffer('image/png'));
  console.log('cover layer', name);
}
clayer('coverA', (ctx) => {
  const g = ctx.createLinearGradient(0, 1180, 0, 1920);
  g.addColorStop(0, 'rgba(28,8,16,0)'); g.addColorStop(0.55, 'rgba(28,8,16,0.55)');
  g.addColorStop(1, 'rgba(22,4,11,0.86)');
  ctx.fillStyle = g; ctx.fillRect(0, 1180, 1080, 740);
  ctx.font = '205px Tiro'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(20,2,10,0.7)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6;
  ctx.fillStyle = gold(ctx, 1080 / 2 - 210, 1330, 1080 / 2 + 210, 1520);
  ctx.fillText('৳৩৫০', 540, 1520); noShadow(ctx);
  text(ctx, 'মাত্র ৩৫০ টাকা', 540, 1612, '58px HindSB', PEARL, 20);
  ctx.fillStyle = 'rgba(217,183,121,0.9)'; ctx.fillRect(460, 1646, 160, 3);
  text(ctx, 'ক্রিস্টাল বেজেল · ফ্লোরাল ব্রেসলেট', 540, 1720, '34px HindM', 'rgba(253,246,243,0.95)', 16);
  wordmark(ctx, 540, 1812, 46);
});
clayer('coverB', (ctx) => {
  text(ctx, 'মাত্র ৩৫০ টাকা', 540, 300, '58px HindSB', '#9E4A63');
  ctx.font = '215px Tiro'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(90,26,46,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
  ctx.fillStyle = gold(ctx, 340, 360, 740, 560);
  ctx.fillText('৳৩৫০', 540, 540); noShadow(ctx);
  ctx.fillStyle = 'rgba(158,74,99,0.5)'; ctx.fillRect(450, 584, 180, 3);
  text(ctx, 'কালো · নীল · সাদা · সবুজ', 540, 690, '46px HindSB', BURG);
  text(ctx, 'চারটি রঙ, একটাই দাম', 540, 748, '32px HindM', 'rgba(90,26,46,0.72)');
  text(ctx, '৭ দিনের মধ্যে রিপ্লেসমেন্ট গ্যারান্টি', 540, 1340, '38px HindSB', BURG);
  text(ctx, 'ক্যাশ অন ডেলিভারি', 540, 1620, '34px HindM', 'rgba(90,26,46,0.82)');
  wordmark(ctx, 540, 1750, 52);
});
