/**
 * Set D video — type layers (2160×3840, transparent) for the Velora slide reel.
 *
 * Rules kept from the set-B/set-C cuts the client approved:
 *  - one idea per frame, never stacked copy
 *  - type never sits on the watch itself (top band / bottom band only)
 *  - no sparkle / glint / wipe sprites
 *  - Bengali letterSpacing is never set (it breaks conjuncts)
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');
GlobalFonts.registerFromPath(`${F}/Montserrat-Medium.ttf`, 'MontM');

const W = 2160, H = 3840;
const OUT = 'miqa/products/2026-11-06_set-d-video/work/text';
fs.mkdirSync(OUT, { recursive: true });

const BURG = '#5A1A2E';
const INK = '#3B1220';
const GOLD = '#B8925A';
const TAKA = '৳';

/* ---------------------------------------------------------------- helpers */
function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.38, '#EFD9A8');
  g.addColorStop(0.62, '#D9B779'); g.addColorStop(1, '#B07F44');
  return g;
}

function glow(ctx, blur, color, x = 0, y = 0) {
  ctx.shadowColor = color; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}
function noGlow(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

/** soft ivory halo so type stays readable over any backdrop */
function halo(ctx) { glow(ctx, 46, 'rgba(255,250,244,0.95)'); }

function ctext(ctx, t, x, y, font, fill, haloOn = true) {
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (haloOn) halo(ctx);
  ctx.fillStyle = fill;
  ctx.fillText(t, x, y);
  noGlow(ctx);
}

function spaced(ctx, t, x, y, font, fill, spacing) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = [...t];
  const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  halo(ctx);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  noGlow(ctx);
}

function rule(ctx, cx, y, w, thick = 3, alpha = 0.75) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(184,146,90,0)');
  g.addColorStop(0.5, `rgba(184,146,90,${alpha})`);
  g.addColorStop(1, 'rgba(184,146,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, y, w, thick);
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

/* --------------------------------------------------------------- products */
const PRODUCTS = [
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

/* ------------------------------------------------------------------ intro */
layer('brand', ctx => {
  spaced(ctx, 'MIQA', 1080, 470, '78px CinzelM', gold(ctx, 700, 0, 1460, 0), 26);
  rule(ctx, 1080, 520, 520, 3, 0.8);
  ctext(ctx, 'ভেলোরা', 1080, 800, '248px HindB', BURG);
  ctext(ctx, 'মেয়েদের স্পেশাল কালেকশন', 1080, 935, '82px HindSB', GOLD);
});

layer('intro_price', ctx => {
  ctext(ctx, '১৪টি ডিজাইন · একটাই দাম', 1080, 3210, '86px HindSB', INK);
  ctext(ctx, `${TAKA}৩৯৯`, 1080, 3450, '210px HindB', gold(ctx, 600, 0, 1560, 0));
  ctext(ctx, 'সব ঘড়িতে একই দাম', 1080, 3560, '62px HindM', 'rgba(90,26,46,0.78)');
});

/* ------------------------------------------------------------- name cards */
for (const [n, family, colour] of PRODUCTS) {
  layer(`name_${n}`, ctx => {
    ctext(ctx, `${n} / ১৪`, 1080, 250, '56px HindSB', 'rgba(184,146,90,0.92)');
    ctext(ctx, family, 1080, 420, '150px HindB', BURG);
    ctext(ctx, colour, 1080, 530, '86px HindSB', GOLD);
  });
}

/* --------------------------------------------------- permanent bottom bar */
layer('bar', ctx => {
  pill(ctx, 1080, 3580, 1940, 186, 93, 'rgba(255,251,246,0.92)', 'rgba(184,146,90,0.55)');
  ctext(ctx, `${TAKA}৩৯৯`, 430, 3638, '118px HindB', BURG, false);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = GOLD;
  ctx.fillRect(690, 3512, 3, 136);
  ctx.globalAlpha = 1;
  ctext(ctx, '৭ দিনের রিপ্লেসমেন্ট', 1010, 3582, '60px HindSB', INK, false);
  ctext(ctx, 'ওয়াটার রেজিস্ট্যান্স', 1010, 3660, '60px HindSB', INK, false);
  ctx.font = '54px HindM';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(90,26,46,0.66)';
  ctx.fillText('১৪টি ডিজাইন', 1720, 3636);
});

/* ------------------------------------------------------- feature moments */
layer('water', ctx => {
  ctext(ctx, 'ওয়াটার', 1080, 400, '170px HindB', BURG);
  ctext(ctx, 'রেজিস্ট্যান্স', 1080, 570, '170px HindB', BURG);
  rule(ctx, 1080, 640, 620, 3, 0.8);
  ctext(ctx, 'হালকা পানির ছিটা সহনশীল', 1080, 760, '78px HindSB', GOLD);
  ctext(ctx, 'পানিতে ডুবাবেন না', 1080, 880, '70px HindM', 'rgba(59,18,32,0.72)');
});

layer('replace', ctx => {
  ctext(ctx, '৭ দিনের', 1080, 400, '170px HindB', BURG);
  ctext(ctx, 'রিপ্লেসমেন্ট', 1080, 570, '170px HindB', BURG);
  rule(ctx, 1080, 640, 620, 3, 0.8);
  ctext(ctx, 'সুবিধা', 1080, 780, '110px HindSB', GOLD);
});

layer('cta', ctx => {
  spaced(ctx, 'MIQA', 1080, 370, '64px CinzelM', gold(ctx, 760, 0, 1400, 0), 22);
  rule(ctx, 1080, 415, 440, 2, 0.7);
  ctext(ctx, 'ভেলোরা', 1080, 570, '120px HindB', BURG);
  ctext(ctx, `${TAKA}৩৯৯`, 1080, 3310, '250px HindB', gold(ctx, 560, 0, 1600, 0));
  ctext(ctx, 'মাত্র — ১৪টি ডিজাইন, একটাই দাম', 1080, 3440, '66px HindSB', INK);
  pill(ctx, 1080, 3610, 1180, 150, 75, 'rgba(90,26,46,0.94)', null);
  ctext(ctx, 'ক্যাশ অন ডেলিভারি', 1080, 3665, '76px HindSB', '#FDF6F3', false);
});
