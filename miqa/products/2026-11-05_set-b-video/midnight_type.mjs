/**
 * Set B video — "Midnight Garden" type layers (1080x1920 design grid).
 *
 * Deep midnight-teal stage, cool moonlight key, crystal-white type with a warm
 * gold accent. Independent of the set-B website look and of sets C/D.
 * Rules: one idea per frame, type never covers a dial, no sparkle sprites,
 * Bengali letterSpacing never set (breaks conjuncts).
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
const OUT = 'miqa/products/2026-11-05_set-b-video/work/dtextb';
fs.mkdirSync(OUT, { recursive: true });

const ICE = '#F2FBFA';
const MINT = '#BFE6DC';
const GOLD = '#EBCFA2';
const DEEP = '#07211E';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#C9A46B'); g.addColorStop(0.34, '#F7E7C6');
  g.addColorStop(0.62, '#E4C795'); g.addColorStop(1, '#B9905A');
  return g;
}
function shade(ctx, blur, a = 0.66, y = 7) {
  ctx.shadowColor = `rgba(2,14,12,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = y;
}
function noshade(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}
function t(ctx, s, x, y, font, fill, blur = 34) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) shade(ctx, blur);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); noshade(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  shade(ctx, 26, 0.6, 5);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  noshade(ctx);
}
function line(ctx, cx, y, w, a = 0.72, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(235,207,162,0)');
  g.addColorStop(0.5, `rgba(235,207,162,${a})`);
  g.addColorStop(1, 'rgba(235,207,162,0)');
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
  ctx.fillStyle = fill; ctx.fill();
}
function layer(name, fn) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}

/* -------------------------------------------------------------------- hook */
layer('brand', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '36px CinzelM', gold(ctx, 380, 0, 700, 0), 12);
  line(ctx, 540, 172, 280, 0.75, 2);
  t(ctx, 'সিলভেল', 540, 292, '108px HindB', ICE, 40);
  t(ctx, 'চারটি রঙ · একই ফ্লোরাল ডিজাইন', 540, 352, '34px HindSB', MINT, 30);
});

layer('price', ctx => {
  t(ctx, '৳৩৫০', 540, 1500, '130px HindB', gold(ctx, 300, 0, 780, 0), 46);
  t(ctx, 'চারটি রঙ · একটাই দাম', 540, 1568, '36px HindSB', ICE, 30);
});

layer('kick', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'সিলভেল', 540, 242, '60px HindB', ICE, 34);
});

/* --------------------------------------------------------------- name cards */
const P = [
  ['01', 'সিলভেল', 'কালো ডায়াল'],
  ['02', 'সিলভেল', 'নীল ডায়াল'],
  ['03', 'সিলভেল', 'সাদা ডায়াল'],
  ['04', 'সিলভেল', 'সবুজ ডায়াল'],
];
for (const [n, family, colour] of P) {
  layer(`name_${n}`, ctx => {
    t(ctx, `${n} / ৪`, 540, 1502, '26px HindSB', 'rgba(235,207,162,0.95)', 26);
    line(ctx, 540, 1524, 170, 0.6, 2);
    t(ctx, family, 540, 1600, '62px HindB', ICE, 40);
    t(ctx, colour, 540, 1652, '36px HindSB', MINT, 30);
  });
}

layer('namescrim', ctx => {
  const g = ctx.createLinearGradient(0, 1330, 0, 1700);
  g.addColorStop(0, 'rgba(4,20,18,0)');
  g.addColorStop(0.42, 'rgba(4,20,18,0.34)');
  g.addColorStop(1, 'rgba(4,20,18,0.74)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 1330, W, 370);
});

/* ------------------------------------------------------------- bottom strip */
layer('strip', ctx => {
  const g = ctx.createLinearGradient(0, 1700, 0, H);
  g.addColorStop(0, 'rgba(4,20,18,0)');
  g.addColorStop(0.55, 'rgba(4,20,18,0.55)');
  g.addColorStop(1, 'rgba(4,20,18,0.84)');
  ctx.fillStyle = g; ctx.fillRect(0, 1700, W, 220);
  t(ctx, '৳৩৫০', 152, 1846, '58px HindB', GOLD, 0);
  ctx.globalAlpha = 0.5; ctx.fillStyle = GOLD;
  ctx.fillRect(258, 1798, 2, 62); ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.font = '26px HindSB'; ctx.fillStyle = ICE;
  shade(ctx, 20, 0.6, 4);
  ctx.fillText('৭ দিনের রিপ্লেসমেন্ট', 292, 1824);
  ctx.fillText('গ্যারান্টি', 292, 1858);
  noshade(ctx);
  ctx.textAlign = 'right';
  ctx.font = '26px HindM'; ctx.fillStyle = 'rgba(242,251,250,0.72)';
  ctx.fillText('৪টি রং', 1010, 1846);
});

/* ------------------------------------------------------------------ features */
layer('replace', ctx => {
  t(ctx, '৭ দিনের মধ্যে', 540, 268, '68px HindB', ICE, 40);
  t(ctx, 'রিপ্লেসমেন্ট গ্যারান্টি', 540, 352, '62px HindB', gold(ctx, 220, 0, 860, 0), 40);
  line(ctx, 540, 382, 430, 0.7, 2);
  t(ctx, 'চিন্তা ছাড়াই নিতে পারেন', 540, 434, '32px HindSB', MINT, 26);
});

layer('five', ctx => {
  t(ctx, '৫%', 540, 236, '112px HindB', gold(ctx, 440, 0, 640, 0), 40);
  t(ctx, 'মুনাফার পাঁচ শতাংশ', 540, 300, '42px HindB', ICE, 30);
  line(ctx, 540, 324, 380, 0.7, 2);
  t(ctx, 'পথশিশুদের কল্যাণে', 540, 374, '33px HindSB', MINT, 26);
});

layer('cta', ctx => {
  spaced(ctx, 'MIQA', 540, 176, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'সিলভেল', 540, 250, '58px HindB', ICE, 34);
  t(ctx, '৳৩৫০', 540, 1580, '150px HindB', gold(ctx, 260, 0, 820, 0), 48);
  t(ctx, 'চারটি রঙ · একটাই দাম', 540, 1648, '36px HindSB', ICE, 30);
  pill(ctx, 540, 1786, 660, 96, 48, 'rgba(235,207,162,0.94)');
  ctx.font = '38px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = DEEP;
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1788);
});
