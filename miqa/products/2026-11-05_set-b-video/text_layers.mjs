// Set B "Petal Light" — Bengali/English text layers (2160x3840, transparent PNG).
// Pango/HarfBuzz shaping via @napi-rs/canvas. Run: node text_layers.mjs
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Medium.ttf`, 'HindM');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/TiroBangla-Regular.ttf`, 'Tiro');
GlobalFonts.registerFromPath(`${F}/Cinzel-Medium.ttf`, 'CinzelM');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-MediumItalic.ttf`, 'CormMI');
GlobalFonts.registerFromPath(`${F}/CormorantGaramond-Light.ttf`, 'CormL');

const W = 2160, H = 3840;
const OUT = 'miqa/products/2026-11-05_set-b-video/plates/layers';
fs.mkdirSync(OUT, { recursive: true });

const INK = '#2A141C', PEARL = '#FBF4F1', ROSEWOOD = '#9E4A63',
  BURGUNDY = '#5A1A2E', CHAMP = '#D9B779', BLUSH = '#F4C9D6';

function layer(name, draw, w = W, h = H) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  fs.writeFileSync(`${OUT}/${name}.png`, c.toBuffer('image/png'));
  console.log('layer', name);
}
function shadow(ctx, blur, color, dx = 0, dy = 8) {
  ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy;
}
function noShadow(ctx) {
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}
function centerText(ctx, text, x, y, font, fill, opts = {}) {
  const { shadowBlur = 0, shadowColor = 'rgba(42,20,28,0.55)', dy = 8, ls = 0 } = opts;
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (shadowBlur) shadow(ctx, shadowBlur, shadowColor, 0, dy);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  noShadow(ctx);
}
function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#B8925A'); g.addColorStop(0.38, '#F6E7BE');
  g.addColorStop(0.62, '#D9B779'); g.addColorStop(1, '#C39A5C');
  return g;
}
function wordmark(ctx, cx, y, size, tracking = 0.36) {
  ctx.font = `${size}px CinzelM`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const chars = [...'MIQA'];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const track = size * tracking;
  const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
  let x = cx - total / 2;
  shadow(ctx, size * 0.14, 'rgba(90,26,46,0.45)', 0, size * 0.03);
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = goldGradient(ctx, x, y - size, x + widths[i], y);
    ctx.fillText(chars[i], x, y);
    x += widths[i] + track;
  }
  noShadow(ctx);
}
function pill(ctx, cx, cy, text, fontPx, opts = {}) {
  const { bg = BURGUNDY, fg = PEARL, padX = 84, padY = 34 } = opts;
  ctx.font = `${fontPx}px HindSB`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2, h = fontPx + padY * 2, r = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r);
  ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r);
  ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r);
  ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r);
  ctx.closePath();
  shadow(ctx, 26, 'rgba(42,14,24,0.38)', 0, 10);
  ctx.fillStyle = bg; ctx.fill();
  noShadow(ctx);
  centerText(ctx, text, cx, cy + fontPx * 0.34, `${fontPx}px HindSB`, fg);
}
function softScrim(ctx, y0, h, alpha = 0.55, color = '30,8,18') {
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(0.30, `rgba(${color},${alpha * 0.55})`);
  g.addColorStop(0.62, `rgba(${color},${alpha})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, h);
}
function chip(ctx, cx, cy, text, fontPx = 66, opts = {}) {
  const { bg = 'rgba(42,20,28,0.34)', fg = PEARL, padX = 52, padY = 24, stroke = 'rgba(217,183,121,0.45)' } = opts;
  ctx.font = `${fontPx}px HindM`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2, h = fontPx + padY * 2, r = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - h / 2);
  ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r);
  ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r);
  ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r);
  ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r);
  ctx.closePath();
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke();
  centerText(ctx, text, cx, cy + fontPx * 0.34, `${fontPx}px HindM`, fg, { shadowBlur: 12 });
}
function dots(ctx, y, active, n = 4, cx = 1080) {
  const gap = 62, r = 11;
  const x0 = cx - (n - 1) * gap / 2;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x0 + i * gap, y, i === active ? r + 2 : r, 0, Math.PI * 2);
    ctx.fillStyle = i === active ? CHAMP : 'rgba(251,244,241,0.42)';
    ctx.fill();
  }
}
function gaugeFrame(ctx, cx, cy, r) {
  ctx.strokeStyle = 'rgba(217,183,121,0.92)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(217,183,121,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.925, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 4);
    ctx.fillStyle = CHAMP; ctx.fillRect(-7, -7, 14, 14); ctx.restore();
  }
}

// ---------- persistent brand bar (drawn into every product scene) ----------
layer('t_brandbar', (ctx) => {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, 'rgba(42,14,24,0.62)'); g.addColorStop(0.55, 'rgba(42,14,24,0.34)');
  g.addColorStop(1, 'rgba(42,14,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 560);
  ctx.font = '54px CinzelM'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = goldGradient(ctx, 168, 168, 470, 236);
  ctx.fillText('MIQA', 168, 232);
  ctx.textAlign = 'right';
  ctx.font = '44px CinzelM';
  ctx.fillStyle = 'rgba(251,244,241,0.80)';
  ctx.fillText('SYLVELLE', 1992, 226);
  ctx.fillStyle = 'rgba(217,183,121,0.55)';
  ctx.fillRect(168, 288, 1824, 2);
  ctx.font = '38px CormL'; ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(251,244,241,0.62)';
  ctx.fillText('WATCH  COLLECTION', 1080, 366);
});

// ---------- 01 hook ----------
layer('t_hook_a', (ctx) => {
  softScrim(ctx, 2280, 1300, 0.80);
  const f = '470px Tiro';
  ctx.font = f; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 54, 'rgba(24,4,12,0.82)', 0, 16);
  ctx.fillStyle = goldGradient(ctx, 1080 - 430, 2550, 1080 + 430, 3010);
  ctx.fillText('৳৩৫০', 1080, 2952);
  noShadow(ctx);
  centerText(ctx, 'মাত্র ৩৫০ টাকা', 1080, 3092, '100px HindSB', PEARL, { shadowBlur: 34 });
  ctx.fillStyle = 'rgba(217,183,121,0.95)'; ctx.fillRect(1080 - 140, 3148, 280, 4);
});

layer('t_hook_b', (ctx) => {
  softScrim(ctx, 2880, 620, 0.40);
  centerText(ctx, 'ক্রিস্টাল বেজেল · ফ্লোরাল ব্রেসলেট · ৪টি রঙ',
    1080, 3252, '60px HindM', 'rgba(251,244,241,0.95)', { shadowBlur: 26 });
});

// ---------- 02-05 colourway chips ----------
const COLORS = [
  { id: '01', bn: 'কালো', en: 'BLACK' },
  { id: '02', bn: 'নীল', en: 'BLUE' },
  { id: '03', bn: 'সাদা', en: 'WHITE' },
  { id: '04', bn: 'সবুজ', en: 'GREEN' },
];
COLORS.forEach((c, i) => {
  layer(`t_color_${i + 1}`, (ctx) => {
    softScrim(ctx, 2740, 940, 0.44);
    centerText(ctx, `${c.id} · ${c.bn}`, 1080, 3030, '96px HindSB', PEARL, { shadowBlur: 30 });
    centerText(ctx, `SYLVELLE — ${c.en}`, 1080, 3102, '42px CinzelM', CHAMP, { shadowBlur: 18 });
    dots(ctx, 3202, i);
  });
});

// ---------- 06 crystal bezel ----------
layer('t_feat_crystal', (ctx) => {
  softScrim(ctx, 2760, 940, 0.52);
  centerText(ctx, 'ক্রিস্টাল হ্যালো বেজেল', 1080, 3026, '122px HindSB', PEARL, { shadowBlur: 34 });
  centerText(ctx, 'ডায়ালে ১২টি ক্রিস্টাল আওয়ার মার্কার',
    1080, 3128, '68px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 24 });
  ctx.fillStyle = 'rgba(217,183,121,0.85)'; ctx.fillRect(1080 - 110, 2972, 220, 3);
});

// ---------- 07 floral bracelet ----------
layer('t_feat_bracelet', (ctx) => {
  softScrim(ctx, 2760, 940, 0.52);
  centerText(ctx, 'ফ্লোরাল মার্কিজ ব্রেসলেট', 1080, 3026, '118px HindSB', PEARL, { shadowBlur: 34 });
  centerText(ctx, 'প্রান্তে হার্ট লিংক ও ফোল্ড-ওভার লক',
    1080, 3128, '68px HindM', 'rgba(251,244,241,0.92)', { shadowBlur: 24 });
  ctx.fillStyle = 'rgba(217,183,121,0.85)'; ctx.fillRect(1080 - 110, 2972, 220, 3);
});

// ---------- 08 7-day replacement guarantee ----------
layer('t_gauge', (ctx) => {
  gaugeFrame(ctx, 1080, 2320, 200);
  centerText(ctx, '৭ দিন', 1080, 2364, '112px Tiro', BURGUNDY);
  centerText(ctx, 'রিপ্লেসমেন্ট', 1080, 2456, '44px HindM', ROSEWOOD);
});

layer('t_guarantee', (ctx) => {
  centerText(ctx, '৭ দিনের মধ্যে', 1080, 2660, '108px HindSB', INK);
  centerText(ctx, 'রিপ্লেসমেন্ট গ্যারান্টি', 1080, 2800, '112px HindSB', INK);
  ctx.fillStyle = 'rgba(158,74,99,0.85)'; ctx.fillRect(1080 - 130, 2708, 260, 3);
  centerText(ctx, 'ক্রয়ের তারিখ থেকে ৭ দিন', 1080, 2960, '66px HindM', 'rgba(90,26,46,0.86)');
});

// ---------- 09 price recap ----------
layer('t_price_big', (ctx) => {
  const f = '400px Tiro';
  ctx.font = f; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  shadow(ctx, 40, 'rgba(30,8,18,0.66)', 0, 12);
  ctx.fillStyle = goldGradient(ctx, 1080 - 400, 2620, 1080 + 400, 3000);
  ctx.fillText('৳৩৫০', 1080, 2952);
  noShadow(ctx);
});

layer('t_price', (ctx) => {
  softScrim(ctx, 2380, 1060, 0.34);
  centerText(ctx, 'মাত্র ৩৫০ টাকা · ৪টি রঙ', 1080, 3100, '88px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'কালো · নীল · সাদা · সবুজ', 1080, 3210, '54px HindM', CHAMP, { shadowBlur: 18 });
});

// ---------- 10 five percent (verbatim) ----------
layer('t_five', (ctx) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FBF4F1'); g.addColorStop(0.55, '#FAF0EC'); g.addColorStop(1, '#F6E2E3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  gaugeFrame(ctx, 1080, 1450, 320);
  centerText(ctx, '৫%', 1080, 1552, '250px Tiro', BURGUNDY);

  // hairline divider
  const lg = ctx.createLinearGradient(820, 0, 1340, 0);
  lg.addColorStop(0, 'rgba(217,183,121,0)'); lg.addColorStop(0.5, 'rgba(217,183,121,0.95)');
  lg.addColorStop(1, 'rgba(217,183,121,0)');
  ctx.fillStyle = lg; ctx.fillRect(820, 2000, 520, 3);

  centerText(ctx, 'MIQA-এর মুনাফার ৫% পথশিশুদের কল্যাণে।', 1080, 2250, '98px HindSB', INK);
  centerText(ctx, 'লভ্যাংশের ৫% পথশিশুদের কর্মসংস্থানে ব্যয় হবে।',
    1080, 2404, '68px HindM', 'rgba(90,26,46,0.84)');
  wordmark(ctx, 1080, 2660, 92);
});

// ---------- 11 CTA ----------
layer('t_cta', (ctx) => {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#5A1A2E'); g.addColorStop(0.52, '#4A1526'); g.addColorStop(1, '#38101C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(1080, 1500, 80, 1080, 1500, 1250);
  rg.addColorStop(0, 'rgba(226,169,154,0.20)'); rg.addColorStop(1, 'rgba(226,169,154,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  pill(ctx, 1080, 1120, 'ক্যাশ অন ডেলিভারি', 86);
  centerText(ctx, 'নিচে দেওয়া অর্ডার বাটনে ক্লিক করে', 1080, 1660, '112px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'এখনই অর্ডার করুন।', 1080, 1812, '112px HindSB', PEARL, { shadowBlur: 26 });
  centerText(ctx, 'মাত্র ৩৫০ টাকা · ৪টি রঙ', 1080, 1962, '66px HindM', CHAMP);

  wordmark(ctx, 1080, 3090, 132);
  centerText(ctx, 'Beyond Time, Beyond Style.', 1080, 3252, 'italic 84px CormMI', 'rgba(251,244,241,0.86)');
});

layer('t_cta_chev', (ctx) => {
  ctx.strokeStyle = CHAMP; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(217,183,121,0.45)'; ctx.shadowBlur = 28;
  for (const dy of [0, 150]) {
    ctx.beginPath();
    ctx.moveTo(980, 2260 + dy); ctx.lineTo(1080, 2360 + dy); ctx.lineTo(1180, 2260 + dy);
    ctx.stroke();
  }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
});

// ---------- end card (over the hero watch plate) ----------
layer('t_endcard', (ctx) => {
  wordmark(ctx, 1080, 3050, 168);
  centerText(ctx, 'Beyond Time, Beyond Style.', 1080, 3252, 'italic 100px CormMI', 'rgba(251,244,241,0.94)', { shadowBlur: 24 });
});

// ---------- petal sprite (soft bokeh petal) ----------
layer('t_petal', (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,236,232,0.95)');
  g.addColorStop(0.35, 'rgba(244,201,214,0.55)');
  g.addColorStop(0.75, 'rgba(226,169,154,0.20)');
  g.addColorStop(1, 'rgba(226,169,154,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2, h / 2.9, -0.35, 0, Math.PI * 2);
  ctx.fill();
}, 220, 220);

// ---------- sparkle sprite (4-point crystal glint) ----------
layer('t_glint', (ctx, w) => {
  const g = ctx.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2);
  g.addColorStop(0, 'rgba(255,250,235,1)');
  g.addColorStop(0.22, 'rgba(255,241,210,0.55)');
  g.addColorStop(1, 'rgba(255,235,200,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (const rot of [0, Math.PI / 2]) {
    ctx.save(); ctx.translate(w / 2, w / 2); ctx.rotate(rot);
    const lg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    lg.addColorStop(0, 'rgba(255,240,205,0)');
    lg.addColorStop(0.5, 'rgba(255,252,240,0.92)');
    lg.addColorStop(1, 'rgba(255,240,205,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(0, -w * 0.035);
    ctx.lineTo(w / 2, 0); ctx.lineTo(0, w * 0.035); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}, 260, 260);

console.log('ALL SET-B LAYERS DONE');
