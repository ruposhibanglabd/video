/**
 * Set D video v2 — "Velora Daylight" type layers (1080×1920).
 *
 * A deliberately LIGHT set: the client said the dark plum stage buried the
 * watches. Here the stage is warm ivory, the product plates are high-key
 * studio shots, and the type is deep plum + rose-gold, so the dial is always
 * the brightest, sharpest thing in the frame.
 *
 * Rules kept: one idea per frame, type never covers the dial, no sparkle
 * sprites, Bengali letterSpacing never set (it breaks conjuncts).
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
const OUT = 'miqa/products/2026-11-06_set-d-video/work/ltext';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#2B1118';          // deep plum ink
const INK_SOFT = 'rgba(43,17,24,0.72)';
const GOLD = '#8E5F2E';         // deep rose-gold, readable on ivory
const CREAM = '#FFF9F1';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#7E5023'); g.addColorStop(0.32, '#C08A4E');
  g.addColorStop(0.60, '#9A6A38'); g.addColorStop(1, '#77501F');
  return g;
}
function warm(ctx, blur, x = 0, y = 0, a = 0.7) {
  ctx.shadowColor = `rgba(255,250,242,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = x; ctx.shadowOffsetY = y;
}
function warmoff(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
/** ivory halo behind dark type — keeps it legible over photo detail */
function t(ctx, s, x, y, font, fill, halo = 30) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (halo) warm(ctx, halo, 0, 0, 0.85);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); warmoff(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap, halo = 24) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  warm(ctx, halo, 0, 0, 0.8);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  warmoff(ctx);
}
function line(ctx, cx, y, w, a = 0.8, th = 2.5) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(154,106,56,0)');
  g.addColorStop(0.5, `rgba(154,106,56,${a})`);
  g.addColorStop(1, 'rgba(154,106,56,0)');
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
/** ivory bed so the bottom type never fights the photo */
function scrim(ctx, y0 = 1380, h = 540, top = 0, bottom = 0.92) {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, `rgba(255,249,241,${top})`);
  g.addColorStop(0.45, `rgba(255,249,241,${bottom * 0.62})`);
  g.addColorStop(1, `rgba(255,249,241,${bottom})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, h);
}

/* ------------------------------------------------------------------ brand */
layer('brand', ctx => {
  spaced(ctx, 'MIQA', 540, 152, '38px CinzelM', gold(ctx, 380, 0, 700, 0), 13);
  line(ctx, 540, 176, 300, 0.85, 2);
  t(ctx, 'ভেলোরা', 540, 290, '108px HindB', INK, 34);
  t(ctx, 'মেয়েদের স্পেশাল কালেকশন', 540, 352, '38px HindSB', GOLD, 26);
});

/* -------------------------------------------------------------- hook price */
layer('hookprice', ctx => {
  scrim(ctx, 1330, 520, 0, 0.9);
  t(ctx, '৳৩৯৯', 540, 1610, '150px HindB', gold(ctx, 260, 0, 820, 0), 40);
  t(ctx, 'চোদ্দটি ডিজাইন · একটাই দাম', 540, 1682, '40px HindSB', INK, 26);
});

/* ------------------------------------------------------------ name cards */
// index, Bengali colour, what makes this one different (design words, not "red")
const P = [
  ['০১', 'কালো ডায়াল', 'কালো সিরামিক ব্রেসলেট', 'সবচেয়ে স্ট্রং লুক'],
  ['০২', 'ব্লাশ পিংক', 'গোলাপি সিরামিক ব্রেসলেট', 'নরম, মেয়েলি'],
  ['০৩', 'নেভি ব্লু', 'নীল সিরামিক ব্রেসলেট', 'সন্ধ্যার লুক'],
  ['০৪', 'সিলভার হোয়াইট', 'কালো সিরামিক ব্রেসলেট', 'প্রতিদিনের লুক'],
];
for (const [n, colour, bracelet, note] of P) {
  layer(`name_${n}`, ctx => {
    scrim(ctx, 1360, 520, 0, 0.9);
    t(ctx, `${n} / ০৪`, 540, 1494, '28px HindSB', 'rgba(142,95,46,0.95)', 22);
    line(ctx, 540, 1518, 180, 0.65, 2);
    t(ctx, colour, 540, 1598, '68px HindB', INK, 32);
    t(ctx, bracelet, 540, 1650, '34px HindSB', GOLD, 24);
    t(ctx, note, 540, 1702, '30px HindM', INK_SOFT, 22);
  });
}

/* -------------------------------------------------------------- detail label */
layer('detail', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'ক্রিস্টাল বসানো বেজেল', 540, 1546, '64px HindB', INK, 32);
  line(ctx, 540, 1572, 380, 0.7, 2);
  t(ctx, 'হাতে বসানো ক্রিস্টাল · রোজ-গোল্ড কেস', 540, 1636, '34px HindSB', GOLD, 24);
  t(ctx, 'আর তিনটি ক্রোনোগ্রাফ সাব-ডায়াল', 540, 1688, '30px HindM', INK_SOFT, 22);
});

/* --------------------------------------------------------------- gift label */
layer('gift', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'গিফট বক্সে প্যাক করা', 540, 1546, '62px HindB', INK, 32);
  line(ctx, 540, 1572, 420, 0.7, 2);
  t(ctx, 'নিজের জন্য, বা খুব কাছের কারও জন্য', 540, 1638, '34px HindSB', GOLD, 24);
});

/* ------------------------------------------------------- water (on-wrist) */
layer('water', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স', 540, 1546, '62px HindB', INK, 32);
  line(ctx, 540, 1572, 440, 0.7, 2);
  t(ctx, 'হালকা পানির ছিটা সহনশীল', 540, 1634, '34px HindSB', GOLD, 24);
  t(ctx, 'পানিতে ডুবাবেন না', 540, 1684, '30px HindM', INK_SOFT, 22);
});

/* --------------------------------------------------- 5 % pledge (type card) */
layer('five', ctx => {
  t(ctx, '৫%', 540, 800, '230px HindB', gold(ctx, 300, 0, 780, 0), 40);
  line(ctx, 540, 860, 320, 0.7, 2.5);
  t(ctx, 'মিকার মুনাফা থেকে', 540, 946, '44px HindSB', INK, 26);
  t(ctx, 'পথশিশুদের কল্যাণে যায়', 540, 1014, '52px HindB', INK, 30);
  t(ctx, 'প্রতিটি অর্ডারের একটি অংশ', 540, 1088, '32px HindM', INK_SOFT, 22);
});

/* ------------------------------------------------------------- replace card */
layer('replace', ctx => {
  t(ctx, '৭ দিনের', 540, 830, '96px HindB', INK, 34);
  t(ctx, 'রিপ্লেসমেন্ট', 540, 936, '96px HindB', gold(ctx, 240, 0, 840, 0), 34);
  t(ctx, 'গ্যারান্টি', 540, 1030, '52px HindSB', INK, 26);
  line(ctx, 540, 1072, 300, 0.6, 2);
});

/* ------------------------------------------------------------------- CTA */
layer('cta', ctx => {
  scrim(ctx, 1290, 600, 0, 0.94);
  spaced(ctx, 'MIQA', 540, 170, '38px CinzelM', gold(ctx, 380, 0, 700, 0), 13);
  t(ctx, 'ভেলোরা', 540, 276, '92px HindB', INK, 34);
  t(ctx, '৳৩৯৯', 540, 1508, '156px HindB', gold(ctx, 240, 0, 840, 0), 44);
  t(ctx, 'চোদ্দটি ডিজাইন · একটাই দাম', 540, 1582, '40px HindSB', INK, 26);
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট', 540, 1640, '32px HindSB', GOLD, 24);
  pill(ctx, 540, 1762, 700, 100, 50, 'rgba(43,17,24,0.94)');
  ctx.font = '40px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1780);
});

/* -------------------------------------------------------------- top kicker */
layer('kick', ctx => {
  spaced(ctx, 'MIQA', 540, 148, '36px CinzelM', gold(ctx, 380, 0, 700, 0), 12);
  line(ctx, 540, 172, 260, 0.8, 2);
  t(ctx, 'ভেলোরা', 540, 250, '66px HindB', INK, 30);
});

/* ------------------------------------- bottom price bar for the photo scenes */
layer('pricebar', ctx => {
  scrim(ctx, 1480, 440, 0, 0.86);
  t(ctx, '৳৩৯৯', 300, 1700, '84px HindB', gold(ctx, 170, 0, 430, 0), 30);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(154,106,56,0.45)';
  ctx.fillRect(452, 1630, 2, 84);
  ctx.font = '30px HindSB'; ctx.fillStyle = INK;
  warm(ctx, 20, 0, 0, 0.7);
  ctx.fillText('১৪টি ডিজাইন', 492, 1656);
  ctx.fillText('একটাই দাম', 492, 1700);
  warmoff(ctx);
});
