/**
 * Set F — "Cushion Stone" ad art (built from the locked Daylight recipe).
 *
 * Why: on the dark plum post the products disappeared into the background —
 * a phone viewer could not tell one colourway from another. Everything here is
 * built on the same warm ivory stage as the new video, so the post, the reel
 * and the website finally look like one brand.
 *
 * Output (facebook-d2/):
 *   set-d-velora_post_1080x1350.jpg     feed 4:5   — 2x2 of the four heroes
 *   set-d-velora_post_1080x1080.jpg     square     — same, refit
 *   set-d-velora_story_1080x1920.jpg    story 9:16 — one watch, big
 *   set-d-velora_carousel-01..04.jpg    ad carousel— one colour per card
 *
 * Rules: price + the client's own feature words only; no URL, phone, discount.
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Bold.ttf`, 'HindB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const PLATES = 'miqa/products/2026-11-08_set-f-video/plates';
const OUT = 'miqa/deliveries/2026-11-08_set-f-video/facebook';
const WHATSAPP = 'https://wa.me/8801700000000';

const INK = '#2B1118';
const INK_SOFT = 'rgba(43,17,24,0.70)';
const GOLD = '#8E5F2E';
const CREAM = '#FFF9F1';

function inkGold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#7E5023'); g.addColorStop(0.32, '#C08A4E');
  g.addColorStop(0.60, '#9A6A38'); g.addColorStop(1, '#77501F');
  return g;
}
function halo(ctx, blur, a = 0.85) {
  ctx.shadowColor = `rgba(255,250,242,${a})`; ctx.shadowBlur = blur;
  ctx.shadowOffsetY = 0; ctx.shadowOffsetX = 0;
}
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }

function text(ctx, s, x, y, font, fill, blur = 26) {
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
function rule(ctx, cx, y, w, a = 0.8, th = 2.5) {
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

/** warm ivory stage, with a soft champagne pool behind the watches */
function stage(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FFFCF7'); g.addColorStop(0.55, '#FBF3E9'); g.addColorStop(1, '#F1E2D3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.66);
  rg.addColorStop(0, 'rgba(255,252,246,0.95)');
  rg.addColorStop(0.55, 'rgba(255,248,238,0.35)');
  rg.addColorStop(1, 'rgba(235,215,196,0.20)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
}

/** draw a plate inside a square, feathering all four edges into the ivory */
async function placePlate(ctx, file, cx, cy, side, crop = null, feather = 0.15) {
  const im = await loadImage(`${PLATES}/${file}.png`);
  // source crop (fractions) -> square cover
  const sw = im.width * (crop ? crop[2] - crop[0] : 1);
  const sh = im.height * (crop ? crop[3] - crop[1] : 1);
  const sx = im.width * (crop ? crop[0] : 0);
  const sy = im.height * (crop ? crop[1] : 0);
  const k = Math.max(side / sw, side / sh);
  const dw = sw * k, dh = sh * k;
  const dx = sx + (sw - dw / k) / 2, dy = sy + (sh - dh / k) / 2;

  const buf = createCanvas(side, side);
  const bx = buf.getContext('2d');
  bx.drawImage(im, dx, dy, dw / k, dh / k, 0, 0, side, side);
  // in-place feather (a detached mask canvas returns an empty buffer here)
  const f = Math.max(1, Math.round(side * feather));
  const gx = bx.createLinearGradient(0, 0, side, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)');
  gx.addColorStop(f / side, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - f / side, 'rgba(0,0,0,1)');
  gx.addColorStop(1, 'rgba(0,0,0,0)');
  const gy = bx.createLinearGradient(0, 0, 0, side);
  gy.addColorStop(0, 'rgba(0,0,0,0)');
  gy.addColorStop(f / side, 'rgba(0,0,0,1)');
  gy.addColorStop(1 - f / side, 'rgba(0,0,0,1)');
  gy.addColorStop(1, 'rgba(0,0,0,0)');
  // plus a soft radial falloff, so the tile corners melt away instead of
  // leaving a visible square of plate background
  const rg = bx.createRadialGradient(side / 2, side / 2, side * 0.20,
    side / 2, side / 2, side * 0.52);
  rg.addColorStop(0, 'rgba(0,0,0,1)');
  rg.addColorStop(0.62, 'rgba(0,0,0,0.98)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  bx.globalCompositeOperation = 'destination-in';
  bx.fillStyle = gx; bx.fillRect(0, 0, side, side);
  bx.fillStyle = gy; bx.fillRect(0, 0, side, side);
  bx.fillStyle = rg; bx.fillRect(0, 0, side, side);
  bx.globalCompositeOperation = 'source-over';
  ctx.drawImage(buf, cx - side / 2, cy - side / 2, side, side);
}

const HEROES = [
  { plate: 'p01_ivory', crop: [0.22, 0.09, 0.78, 0.91], name: 'আইভরি পার্ল', note: 'কুশন-স্কয়ার সোনালি কেস' },
  { plate: 'p02_white', crop: [0.22, 0.09, 0.78, 0.91], name: 'সিলভার হোয়াইট', note: 'স্কয়ার স্টোন লিংক' },
  { plate: 'p03_lavender', crop: [0.22, 0.09, 0.78, 0.91], name: 'ল্যাভেন্ডার', note: 'একই রঙের স্টোন লিংক' },
  { plate: 'p04_green', crop: [0.22, 0.09, 0.78, 0.91], name: 'এমারেল্ড সবুজ', note: 'মিন্ট-সবুজ স্টোন লিংক' },
  { plate: 'p05_pink', crop: [0.22, 0.09, 0.78, 0.91], name: 'রোজ পিংক', note: 'কোরাল পিংক লিংক' },
];

const BRAND_TOP = (ctx, W, y, nameSize, taglineSize) => {
  spaced(ctx, 'MIQA', W / 2, y, `${Math.round(nameSize * 0.35)}px CinzelM`,
    inkGold(ctx, W * 0.36, 0, W * 0.64, 0), Math.round(nameSize * 0.12));
  rule(ctx, W / 2, y + 24, W * 0.28, 0.85, 2.5);
  text(ctx, 'ভেলোরা', W / 2, y + nameSize + 30, `${nameSize}px HindB`, INK, 30);
  text(ctx, 'মেয়েদের স্পেশাল কালেকশন', W / 2, y + nameSize + 30 + taglineSize + 12,
    `${taglineSize}px HindSB`, GOLD, 22);
};

/* ------------------------------------------------------------ feed / square */
async function gridPost(W, H, o) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  stage(ctx, W, H);

  // ---- head
  spaced(ctx, 'MIQA', W / 2, o.logoY, `${o.logoPx}px CinzelM`,
    inkGold(ctx, W * 0.36, 0, W * 0.64, 0), Math.round(o.logoPx * 0.34));
  rule(ctx, W / 2, o.logoY + 26, W * 0.28, 0.85, 2.5);
  text(ctx, 'কুশন স্টোন', W / 2, o.nameY, `${o.namePx - 8}px HindB`, INK, 30);
  text(ctx, 'পাঁচটি রঙ · একই কুশন কেস', W / 2, o.tagY, `${o.tagPx}px HindSB`, GOLD, 22);

  // ---- five colourways: three on the top row, two below. A five-across row
  //      would shrink every dial; this keeps them big and still shows all five.
  const gap = o.gap;
  const box = o.gridBottom - o.gridTop;
  const sideTop = Math.floor((W * 0.94 - gap * 2) / 3);
  const sideBot = Math.floor(Math.min(sideTop * 1.16, (box - sideTop - gap) / 1.02));
  const yTop = o.gridTop + sideTop / 2;
  const yBot = o.gridTop + sideTop + gap + sideBot / 2;
  const xs3 = [-1, 0, 1].map(k => W / 2 + k * (sideTop + gap));
  const xs2 = [-0.5, 0.5].map(k => W / 2 + k * (sideBot + gap));
  for (let i = 0; i < 5; i++) {
    const cx = i < 3 ? xs3[i] : xs2[i - 3];
    const cy = i < 3 ? yTop : yBot;
    await placePlate(ctx, HEROES[i].plate, cx, cy, i < 3 ? sideTop : sideBot,
      HEROES[i].crop, 0.20);
  }

  // ---- price block
  text(ctx, '৳৩৫০', W / 2, o.priceY, `${o.pricePx}px HindB`,
    inkGold(ctx, W * 0.26, 0, W * 0.74, 0), 34);
  text(ctx, 'পাঁচটি রঙ · একটাই দাম', W / 2, o.countY, `${o.countPx}px HindSB`, INK, 22);
  if (o.featY) {
    text(ctx, 'কুশন-স্কয়ার কেস · স্টোন লিংক ব্রেসলেট', W / 2, o.featY,
      `${o.featPx}px HindSB`, GOLD, 18);
  }

  // ---- call to action
  pill(ctx, W / 2, o.pillY, W * 0.56, o.pillH, o.pillH / 2, 'rgba(43,17,24,0.95)');
  ctx.font = `${Math.round(o.pillH * 0.42)}px HindSB`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = CREAM;
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, o.pillY + 2);
  return c;
}

const FEED = {
  logoY: 110, logoPx: 36, nameY: 212, namePx: 96, tagY: 266, tagPx: 34,
  gridTop: 292, gridBottom: 1010, gap: 14,
  priceY: 1116, pricePx: 118, countY: 1172, countPx: 36, featY: 1224, featPx: 29,
  pillY: 1300, pillH: 80,
};

const SQUARE = {
  logoY: 92, logoPx: 32, nameY: 184, namePx: 86, tagY: 234, tagPx: 30,
  gridTop: 256, gridBottom: 800, gap: 12,
  priceY: 890, pricePx: 100, countY: 940, countPx: 32, featY: 0,
  pillY: 1012, pillH: 72,
};

/* ------------------------------------------------------------------- story */
async function story(W, H) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  stage(ctx, W, H);
  BRAND_TOP(ctx, W, 150, 96, 38);
  await placePlate(ctx, 'p01_ivory', W / 2, 900, 1060, HEROES[0].crop, 0.15);
  text(ctx, '৳৩৫০', W / 2, 1520, '150px HindB', inkGold(ctx, W * 0.26, 0, W * 0.74, 0), 36);
  text(ctx, 'পাঁচটি রঙ · একটাই দাম', W / 2, 1586, '40px HindSB', INK, 24);
  text(ctx, 'ওয়াটার রেজিস্ট্যান্স · ৭ দিনের রিপ্লেসমেন্ট', W / 2, 1644, '31px HindSB', GOLD, 20);
  pill(ctx, W / 2, 1794, W * 0.60, 88, 44, 'rgba(43,17,24,0.95)');
  ctx.font = '36px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, 1796);
  return c;
}

/* ---------------------------------------------------------- carousel cards */
async function carousel(W, H, i) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  const h = HEROES[i];
  stage(ctx, W, H);
  spaced(ctx, 'MIQA', W / 2, 110, '34px CinzelM', inkGold(ctx, W * 0.36, 0, W * 0.64, 0), 12);
  rule(ctx, W / 2, 132, W * 0.28, 0.85, 2.5);
  text(ctx, 'ভেলোরা', W / 2, 232, '92px HindB', INK, 30);

  await placePlate(ctx, h.plate, W / 2, 700, 900, h.crop, 0.14);

  text(ctx, `${['০১', '০২', '০৩', '০৪', '০৫'][i]} / ০৫`, W / 2, 1180, '30px HindSB', GOLD, 20);
  text(ctx, h.name, W / 2, 1258, '66px HindB', INK, 28);
  text(ctx, h.note, W / 2, 1310, '34px HindSB', GOLD, 20);
  text(ctx, '৳৩৫০', W / 2, 1440, '108px HindB', inkGold(ctx, W * 0.3, 0, W * 0.7, 0), 30);
  text(ctx, 'পাঁচটি রঙ · একটাই দাম', W / 2, 1498, '34px HindSB', INK, 20);
  pill(ctx, W / 2, 1600, W * 0.5, 84, 42, 'rgba(43,17,24,0.95)');
  ctx.font = '34px HindSB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText('ক্যাশ অন ডেলিভারি', W / 2, 1602);
  return c;
}

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const write = (name, c) =>
    fs.writeFileSync(`${OUT}/${name}`, c.toBuffer('image/jpeg', 93));
  write('set-f-cushion_post_1080x1350.jpg', await gridPost(1080, 1350, FEED));
  write('set-f-cushion_post_1080x1080.jpg', await gridPost(1080, 1080, SQUARE));
  write('set-f-cushion_story_1080x1920.jpg', await story(1080, 1920));
  for (let i = 0; i < 5; i++) {
    write(`set-f-cushion_carousel-0${i + 1}.jpg`, await carousel(1080, 1350, i));
  }
  console.log('done set-f');
};
main();
