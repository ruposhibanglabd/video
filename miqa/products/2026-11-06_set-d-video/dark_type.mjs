/**
 * Set D video — "Velora After Dark" type layers (1080×1920 design grid).
 *
 * The video lives in its own look: deep wine-plum stage, candle-warm key light,
 * champagne-gold type. Nothing here is reused from the website stills.
 * Rules kept: one idea per frame, type never covers the watch face, no
 * sparkle/glint sprites, Bengali letterSpacing never set (breaks conjuncts).
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
const OUT = 'miqa/products/2026-11-06_set-d-video/work/dtext';
fs.mkdirSync(OUT, { recursive: true });

const CREAM = '#FBF3E9';
const GOLD = '#E3C489';
const ROSE = '#F2C9CF';
const DEEP = '#2A0C16';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#C79E5E'); g.addColorStop(0.34, '#F6E3B8');
  g.addColorStop(0.62, '#DDB877'); g.addColorStop(1, '#B98B4A');
  return g;
}
function warm(ctx, blur, x = 0, y = 0, a = 0.7) {
  ctx.shadowColor = `rgba(22,4,9,${a})`; ctx.shadowBlur = blur;
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
function line(ctx, cx, y, w, a = 0.7, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(227,196,137,0)');
  g.addColorStop(0.5, `rgba(227,196,137,${a})`);
  g.addColorStop(1, 'rgba(227,196,137,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, th);
}
function pill(ctx, cx, cy, w, h, r, fill, stroke) {
  const x = cx - w / 2, y = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
function layer(name, fn) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  fn(ctx);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}

/* --------------------------------------------------------------- hook/scene */
layer('brand', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '36px CinzelM', gold(ctx, 380, 0, 700, 0), 12);
  line(ctx, 540, 172, 280, 0.75, 2);
  t(ctx, 'ভেলোরা', 540, 282, '106px HindB', CREAM, 40);
  t(ctx, 'মেয়েদের স্পেশাল কালেকশন', 540, 342, '36px HindSB', GOLD, 30);
});

layer('price', ctx => {
  t(ctx, '৳৩৯৯', 540, 1572, '130px HindB', gold(ctx, 300, 0, 780, 0), 46);
  t(ctx, '১৪টি ডিজাইন · একটাই দাম', 540, 1640, '36px HindSB', CREAM, 30);
});

/** soft dark bed under the watch name, so the type never sits bare on the photo */
layer('namescrim', ctx => {
  const g = ctx.createLinearGradient(0, 1330, 0, 1700);
  g.addColorStop(0, 'rgba(18,3,8,0)');
  g.addColorStop(0.42, 'rgba(18,3,8,0.34)');
  g.addColorStop(1, 'rgba(18,3,8,0.72)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 1330, W, 370);
});

layer('kick', ctx => {
  spaced(ctx, 'MIQA', 540, 150, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'ভেলোরা', 540, 236, '62px HindB', CREAM, 34);
});

/* ------------------------------------------------------------- name cards */
const P = [
  ['01', 'নভেলা', 'কালো'],
  ['02', 'নভেলা', 'গোলাপি'],
  ['03', 'নভেলা', 'সাদা'],
  ['04', 'নভেলা', 'পিংক ক্রিস্টাল'],
  ['05', 'লুনেল', 'আইভরি'],
  ['06', 'লুনেল', 'গোলাপি'],
  ['07', 'লুনেল', 'সাদা'],
  ['08', 'লুনেল', 'নীল'],
  ['09', 'নভেলা বাগেট', 'কালো'],
  ['10', 'রভেলা', 'কালো'],
  ['11', 'রভেলা', 'পার্ল'],
  ['12', 'রভেলা', 'শ্যাম্পেন'],
  ['13', 'নভেলা বাগেট', 'সাদা'],
  ['14', 'নভেলা বাগেট', 'আইভরি'],
];
for (const [n, family, colour] of P) {
  layer(`name_${n}`, ctx => {
    t(ctx, `${n} / ১৪`, 540, 1502, '26px HindSB', 'rgba(227,196,137,0.95)', 26);
    line(ctx, 540, 1524, 170, 0.6, 2);
    t(ctx, family, 540, 1600, '64px HindB', CREAM, 40);
    t(ctx, colour, 540, 1652, '34px HindSB', GOLD, 30);
  });
}

/* ------------------------------------------------------------ bottom strip */
layer('strip', ctx => {
  const g = ctx.createLinearGradient(0, 1700, 0, H);
  g.addColorStop(0, 'rgba(20,4,8,0)');
  g.addColorStop(0.55, 'rgba(20,4,8,0.55)');
  g.addColorStop(1, 'rgba(20,4,8,0.82)');
  ctx.fillStyle = g; ctx.fillRect(0, 1700, W, 220);
  t(ctx, '৳৩৯৯', 152, 1846, '58px HindB', GOLD, 0);
  ctx.globalAlpha = 0.5; ctx.fillStyle = GOLD;
  ctx.fillRect(258, 1798, 2, 62); ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.font = '27px HindSB'; ctx.fillStyle = CREAM;
  warm(ctx, 20, 0, 4, 0.6);
  ctx.fillText('৭ দিনের রিপ্লেসমেন্ট', 292, 1824);
  ctx.fillText('ওয়াটার রেজিস্ট্যান্স', 292, 1858);
  warmoff(ctx);
  ctx.textAlign = 'right';
  ctx.font = '26px HindM'; ctx.fillStyle = 'rgba(251,243,233,0.72)';
  ctx.fillText('১৪টি ডিজাইন', 1010, 1846);
});

/* --------------------------------------------------------------- features */
layer('water', ctx => {
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স', 540, 300, '62px HindB', CREAM, 40);
  line(ctx, 540, 330, 420, 0.75, 2);
  t(ctx, 'হালকা পানির ছিটা সহনশীল', 540, 392, '34px HindSB', GOLD, 30);
  t(ctx, 'পানিতে ডুবাবেন না', 540, 440, '30px HindM', 'rgba(251,243,233,0.78)', 26);
});

layer('replace', ctx => {
  t(ctx, '৭ দিনের রিপ্লেসমেন্ট', 540, 300, '62px HindB', CREAM, 40);
  line(ctx, 540, 330, 460, 0.75, 2);
  t(ctx, 'সুবিধা', 540, 400, '40px HindSB', GOLD, 30);
});

layer('cta', ctx => {
  spaced(ctx, 'MIQA', 540, 176, '34px CinzelM', gold(ctx, 380, 0, 700, 0), 11);
  t(ctx, 'ভেলোরা', 540, 248, '58px HindB', CREAM, 34);
  t(ctx, '৳৩৯৯', 540, 1600, '150px HindB', gold(ctx, 260, 0, 820, 0), 48);
  t(ctx, '১৪টি ডিজাইন · একটাই দাম', 540, 1668, '36px HindSB', CREAM, 30);
  pill(ctx, 540, 1800, 660, 96, 48, 'rgba(227,196,137,0.94)', null);
  ctx.font = '38px HindSB'; ctx.textAlign = 'center'; ctx.fillStyle = DEEP;
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1816);
});
