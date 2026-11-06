/**
 * Set C video — "Octavia Rosewood" type layers (1080×1920 design grid).
 *
 * Deep rosewood stage, candle-warm key light, blush-gold type. Independent of
 * the pale Blush Mist website look, and nothing is reused from set D.
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const W = 1080, H = 1920;
const OUT = 'miqa/products/2026-11-05_set-c-video/work/dtextc';
fs.mkdirSync(OUT, { recursive: true });

const CREAM = '#FDF1E7';
const BLUSH = '#F6C9B4';
const GOLD = '#EBC59B';
const DEEP = '#2B0D12';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#D9A276'); g.addColorStop(0.33, '#FBE7CE');
  g.addColorStop(0.62, '#EBC59B'); g.addColorStop(1, '#C08F63');
  return g;
}
function warm(ctx, blur, x = 0, y = 0, a = 0.68) {
  ctx.shadowColor = `rgba(26,6,10,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}
function warmoff(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function t(ctx, s, x, y, font, fill, shadow = 34) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (shadow) warm(ctx, shadow, 0, 7, 0.66);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); warmoff(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  warm(ctx, 26, 0, 5, 0.6);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  warmoff(ctx);
}
function line(ctx, cx, y, w, a = 0.72, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(235,197,155,0)');
  g.addColorStop(0.5, `rgba(235,197,155,${a})`);
  g.addColorStop(1, 'rgba(235,197,155,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function pill(ctx, cx, cy, w, h, r, fill) {
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}
function layer(name, fn) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}

/* ------------------------------------------------------------------- hook */
layer('brand', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '36px CinzelM', gold(ctx, 380, 0, 700, 0), 12);
  line(ctx, 540, 172, 280, 0.75, 2);
  t(ctx, 'অক্টেভিয়া', 540, 290, '104px HindB', CREAM, 40);
  t(ctx, 'পাঁচটি রঙ · একই আভিজাত্য', 540, 350, '34px HindSB', BLUSH, 30);
});

layer('price', ctx => {
  t(ctx, '৳৩৫০', 540, 1452, '126px HindB', gold(ctx, 310, 0, 770, 0), 46);
  t(ctx, 'পাঁচটি রঙ · একটাই দাম', 540, 1518, '35px HindSB', CREAM, 30);
});

layer('kick', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'অক্টেভিয়া', 540, 240, '60px HindB', CREAM, 34);
});

/* -------------------------------------------------------------- name cards */
const P = [
  ['01', 'ফিয়োটা অক্টেভিয়া', 'কালো'],
  ['02', 'ফিয়োটা অক্টেভিয়া', 'গোলাপি'],
  ['03', 'ট্রু ওয়ার্থ অক্টেভিয়া', 'হার্ট কালো'],
  ['04', 'ফিয়োটা অক্টেভিয়া', 'সবুজ'],
  ['05', 'ফিয়োটা অক্টেভিয়া', 'সাদা'],
];
for (const [n, family, colour] of P) {
  layer(`name_${n}`, ctx => {
    t(ctx, `${n} / ৫`, 540, 1502, '26px HindSB', 'rgba(235,197,155,0.95)', 26);
    line(ctx, 540, 1524, 170, 0.6, 2);
    t(ctx, family, 540, 1600, '58px HindB', CREAM, 40);
    t(ctx, colour, 540, 1652, '36px HindSB', BLUSH, 30);
  });
}

layer('namescrim', ctx => {
  const g = ctx.createLinearGradient(0, 1330, 0, 1700);
  g.addColorStop(0, 'rgba(22,6,10,0)');
  g.addColorStop(0.42, 'rgba(22,6,10,0.34)');
  g.addColorStop(1, 'rgba(22,6,10,0.72)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 1330, W, 370);
});

/* -------------------------------------------------------------- bottom strip */
layer('strip', ctx => {
  const g = ctx.createLinearGradient(0, 1700, 0, H);
  g.addColorStop(0, 'rgba(22,6,10,0)');
  g.addColorStop(0.55, 'rgba(22,6,10,0.55)');
  g.addColorStop(1, 'rgba(22,6,10,0.84)');
  ctx.fillStyle = g; ctx.fillRect(0, 1700, W, 220);
  t(ctx, '৳৩৫০', 152, 1846, '58px HindB', GOLD, 0);
  ctx.globalAlpha = 0.5; ctx.fillStyle = GOLD;
  ctx.fillRect(258, 1798, 2, 62); ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.font = '27px HindSB'; ctx.fillStyle = CREAM;
  warm(ctx, 20, 0, 4, 0.6);
  ctx.fillText('৭ দিনের রিপ্লেসমেন্ট', 292, 1824);
  ctx.fillText('ওয়াটার রেজিস্ট্যান্স', 292, 1858);
  warmoff(ctx);
  ctx.textAlign = 'right';
  ctx.font = '26px HindM'; ctx.fillStyle = 'rgba(253,241,231,0.72)';
  ctx.fillText('৫টি রঙ', 1010, 1846);
});

/* ----------------------------------------------------------------- features */
layer('water', ctx => {
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স', 540, 300, '62px HindB', CREAM, 40);
  line(ctx, 540, 330, 420, 0.75, 2);
  t(ctx, 'হালকা পানির ছিটা সহনশীল', 540, 392, '34px HindSB', BLUSH, 30);
  t(ctx, 'পানিতে ডুবাবেন না', 540, 440, '30px HindM', 'rgba(253,241,231,0.78)', 26);
});

layer('replace', ctx => {
  t(ctx, '৭ দিনের রিপ্লেসমেন্ট', 540, 300, '62px HindB', CREAM, 40);
  line(ctx, 540, 330, 460, 0.75, 2);
  t(ctx, 'সুবিধা', 540, 400, '40px HindSB', BLUSH, 30);
});

layer('five', ctx => {
  t(ctx, '৫%', 540, 236, '112px HindB', gold(ctx, 440, 0, 640, 0), 40);
  t(ctx, 'মুনাফার পাঁচ শতাংশ', 540, 300, '42px HindB', CREAM, 30);
  line(ctx, 540, 324, 380, 0.7, 2);
  t(ctx, 'পথশিশুদের কল্যাণে', 540, 374, '33px HindSB', BLUSH, 26);
});

layer('cta', ctx => {
  spaced(ctx, 'MIQA', 540, 176, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'অক্টেভিয়া', 540, 250, '56px HindB', CREAM, 34);
  t(ctx, '৳৩৫০', 540, 1585, '150px HindB', gold(ctx, 260, 0, 820, 0), 48);
  t(ctx, 'পাঁচটি রঙ · একটাই দাম', 540, 1652, '36px HindSB', CREAM, 30);
  pill(ctx, 540, 1790, 660, 96, 48, 'rgba(235,197,155,0.94)');
  ctx.font = '38px HindSB'; ctx.textAlign = 'center'; ctx.fillStyle = DEEP;
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1806);
});
