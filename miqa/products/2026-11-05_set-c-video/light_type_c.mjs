/**
 * Set C video v5 — "Octavia Daylight" type layers (1080×1920).
 *
 * Generated from the locked MIQA Daylight theme (miqa/brand/MIQA-LIGHT-THEME.md),
 * the recipe approved on set D: warm ivory stage, deep plum ink type,
 * rose-gold gradient for the price. Only the accent is nudged a touch pinker
 * than set D so the two collections still feel like siblings, not clones.
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
const OUT = 'miqa/products/2026-11-05_set-c-video/work/ltext';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#2B1118';
const INK_SOFT = 'rgba(43,17,24,0.70)';
const GOLD = '#8E5A3E';          // rose-gold accent (a little pinker than set D)
const CREAM = '#FFF9F1';

function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#7E4A33'); g.addColorStop(0.32, '#C08A6A');
  g.addColorStop(0.60, '#9A6440'); g.addColorStop(1, '#77482A');
  return g;
}
function halo(ctx, blur, a = 0.85) {
  ctx.shadowColor = `rgba(255,250,242,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }
function t(ctx, s, x, y, font, fill, blur = 28) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (blur) halo(ctx, blur);
  ctx.fillStyle = fill; ctx.fillText(s, x, y); noShadow(ctx);
}
function spaced(ctx, s, x, y, font, fill, gap, blur = 22) {
  ctx.font = font; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...s];
  const ws = chars.map(c => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = x - total / 2;
  if (blur) halo(ctx, blur, 0.8);
  ctx.fillStyle = fill;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += ws[i] + gap; });
  noShadow(ctx);
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
function scrim(ctx, y0 = 1360, h = 560, top = 0, bottom = 0.9) {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, `rgba(255,249,241,${top})`);
  g.addColorStop(0.45, `rgba(255,249,241,${bottom * 0.62})`);
  g.addColorStop(1, `rgba(255,249,241,${bottom})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, h);
}

layer('brand', ctx => {
  spaced(ctx, 'MIQA', 540, 152, '38px CinzelM', gold(ctx, 380, 0, 700, 0), 13);
  line(ctx, 540, 176, 300, 0.85, 2);
  t(ctx, 'অক্টেভিয়া', 540, 292, '104px HindB', INK, 34);
  t(ctx, 'পাঁচটি ডিজাইন · একই আভিজাত্য', 540, 354, '38px HindSB', GOLD, 26);
});

layer('hookprice', ctx => {
  scrim(ctx, 1330, 520, 0, 0.9);
  t(ctx, '৳৩৫০', 540, 1610, '150px HindB', gold(ctx, 260, 0, 820, 0), 40);
  t(ctx, 'পাঁচটি ডিজাইন · একটাই দাম', 540, 1682, '40px HindSB', INK, 26);
});

const P = [
  ['০১', 'কালো ডায়াল', 'অষ্টকোণ রোজ-গোল্ড কেস', 'বারোটি ক্রিস্টাল ডট'],
  ['০২', 'শ্যাম্পেন গোলাপি', 'একই অষ্টকোণ কেস', 'নরম, উষ্ণ লুক'],
  ['০৩', 'এমারেল্ড সবুজ', 'ক্রিস্টাল ডট মার্কার', 'সন্ধ্যার লুক'],
  ['০৪', 'পার্ল হোয়াইট', 'মাদার-অব-পার্ল ডায়াল', 'প্রতিদিনের লুক'],
  ['০৫', 'হার্ট ডায়াল', 'ক্রিস্টাল বসানো হার্ট', 'সবচেয়ে আলাদা'],
];
for (const [n, colour, note, tail] of P) {
  layer(`name_${n}`, ctx => {
    scrim(ctx, 1360, 520, 0, 0.9);
    t(ctx, `${n} / ০৫`, 540, 1494, '28px HindSB', 'rgba(142,90,62,0.95)', 22);
    line(ctx, 540, 1518, 180, 0.65, 2);
    t(ctx, colour, 540, 1598, '68px HindB', INK, 32);
    t(ctx, note, 540, 1650, '34px HindSB', GOLD, 24);
    t(ctx, tail, 540, 1702, '30px HindM', INK_SOFT, 22);
  });
}

layer('detail', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'অষ্টকোণ রোজ-গোল্ড কেস', 540, 1546, '64px HindB', INK, 32);
  line(ctx, 540, 1572, 420, 0.7, 2);
  t(ctx, 'ডায়ালে বারোটি ক্রিস্টাল ডট মার্কার', 540, 1636, '34px HindSB', GOLD, 24);
  t(ctx, 'আর হার্ট-কাট ক্রিস্টালের ব্রেসলেট', 540, 1688, '30px HindM', INK_SOFT, 22);
});

layer('gift', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'গিফট বক্সে প্যাক করা', 540, 1546, '62px HindB', INK, 32);
  line(ctx, 540, 1572, 420, 0.7, 2);
  t(ctx, 'নিজের জন্য, বা খুব কাছের কারও জন্য', 540, 1638, '34px HindSB', GOLD, 24);
});

layer('water', ctx => {
  scrim(ctx, 1330, 560, 0, 0.9);
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স', 540, 1546, '62px HindB', INK, 32);
  line(ctx, 540, 1572, 440, 0.7, 2);
  t(ctx, 'হালকা পানির ছিটা সহনশীল', 540, 1634, '34px HindSB', GOLD, 24);
  t(ctx, 'পানিতে ডুবাবেন না', 540, 1684, '30px HindM', INK_SOFT, 22);
});

layer('five', ctx => {
  t(ctx, '৫%', 540, 800, '230px HindB', gold(ctx, 300, 0, 780, 0), 40);
  line(ctx, 540, 860, 320, 0.7, 2.5);
  t(ctx, 'মিকার মুনাফা থেকে', 540, 946, '44px HindSB', INK, 26);
  t(ctx, 'পথশিশুদের কল্যাণে যায়', 540, 1014, '52px HindB', INK, 30);
  t(ctx, 'প্রতিটি অর্ডারের একটি অংশ', 540, 1088, '32px HindM', INK_SOFT, 22);
});

layer('replace', ctx => {
  t(ctx, '৭ দিনের', 540, 830, '96px HindB', INK, 34);
  t(ctx, 'রিপ্লেসমেন্ট', 540, 936, '96px HindB', gold(ctx, 240, 0, 840, 0), 34);
  t(ctx, 'সুবিধা', 540, 1030, '52px HindSB', INK, 26);
  line(ctx, 540, 1072, 300, 0.6, 2);
});

layer('cta', ctx => {
  scrim(ctx, 1290, 600, 0, 0.94);
  spaced(ctx, 'MIQA', 540, 170, '38px CinzelM', gold(ctx, 380, 0, 700, 0), 13);
  t(ctx, 'অক্টেভিয়া', 540, 278, '88px HindB', INK, 34);
  t(ctx, '৳৩৫০', 540, 1508, '156px HindB', gold(ctx, 240, 0, 840, 0), 44);
  t(ctx, 'পাঁচটি ডিজাইন · একটাই দাম', 540, 1582, '40px HindSB', INK, 26);
  t(ctx, 'ওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট', 540, 1640, '32px HindSB', GOLD, 24);
  pill(ctx, 540, 1762, 700, 100, 50, 'rgba(43,17,24,0.94)');
  ctx.font = '40px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText('ক্যাশ অন ডেলিভারি', 540, 1780);
});

layer('kick', ctx => {
  spaced(ctx, 'MIQA', 540, 148, '36px CinzelM', gold(ctx, 380, 0, 700, 0), 12);
  line(ctx, 540, 172, 260, 0.8, 2);
  t(ctx, 'অক্টেভিয়া', 540, 252, '64px HindB', INK, 30);
});
