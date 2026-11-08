/**
 * Set G — per-product description cards (1600×2000, sRGB JPEG).
 *
 * Reads DESCRIPTIONS.md and typesets each colourway's "বিবরণ" + "বিস্তারিত বিবরণ"
 * onto a Steel Daylight card, so every product has a ready-made copy block:
 *   <out>/DESC-<slug>.jpg
 *
 * No URL, no phone, no price, no logo, no watermark, no border.
 * Only the client-approved claims appear (butterfly lock / water resistant /
 * quality: good) — nothing else.
 */
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';

const F = 'miqa/brand/fonts';
GlobalFonts.registerFromPath(`${F}/AnekBangla-ExtraBold.ttf`, 'AnekXB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-SemiBold.ttf`, 'AnekSB');
GlobalFonts.registerFromPath(`${F}/AnekBangla-Bold.ttf`, 'AnekB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-SemiBold.ttf`, 'HindSB');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Regular.ttf`, 'HindR');
GlobalFonts.registerFromPath(`${F}/HindSiliguri-Light.ttf`, 'HindL');
GlobalFonts.registerFromPath(`${F}/Montserrat-SemiBold.ttf`, 'MontSB');

const MD = 'miqa/deliveries/2026-11-09_set-g-video/DESCRIPTIONS.md';
const OUT = 'miqa/deliveries/2026-11-09_set-g-video/descriptions';
const W = 1600, H = 2000;

const SLUGS = [
  ['ব্ল্যাক নেভি', 'Black Navy', 'set-g-01-black'],
  ['টু-টোন রয়্যাল ব্লু', 'Two-Tone Royal Blue', 'set-g-02-twotone-navy'],
  ['টু-টোন স্লেট', 'Two-Tone Slate', 'set-g-03-twotone-slate'],
  ['গোল্ড রয়্যাল ব্লু', 'Gold Royal Blue', 'set-g-04-gold-navy'],
  ['গোল্ড শ্যাম্পেন', 'Gold Champagne', 'set-g-05-gold-champagne'],
];

/* ------------------------------------------------ parse DESCRIPTIONS.md */
const md = fs.readFileSync(MD, 'utf8');
const sections = [];
let cur = null;
for (const line of md.split('\n')) {
  const h = line.match(/^## ([০-৯0-9]+)\. (.+?) — (.+)$/);
  if (h) { cur = { n: h[1], bn: h[2].trim(), en: h[3].trim(), fences: [] }; sections.push(cur); continue; }
  if (/^## /.test(line)) cur = null;
  if (!cur) continue;
  if (line.startsWith('```')) {
    if (cur.open === undefined) { cur.open = true; cur.fences.push(''); }
    else { cur.open = undefined; }
    continue;
  }
  if (cur.open && cur.fences.length) cur.fences[cur.fences.length - 1] += line + '\n';
}
const parse = sections.filter((s) => s.fences.length >= 3);
if (parse.length !== 5) throw new Error('expected 5 description sections, got ' + parse.length);

/* ------------------------------------------------ stage */
function stage(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FCFAF6');
  g.addColorStop(0.5, '#F2EEE7');
  g.addColorStop(1, '#DFD9D0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.3, H * 0.18, 0, W * 0.3, H * 0.18, W * 1.0);
  rg.addColorStop(0, 'rgba(255,255,252,0.85)');
  rg.addColorStop(1, 'rgba(200,195,186,0.22)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
}

function linen(ctx) {
  const c = createCanvas(W, H), n = c.getContext('2d');
  const img = n.createImageData(W, H);
  let seed = 90112026;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const v = 128 + Math.sin(x * 1.9) * 3 + Math.sin(y * 1.9) * 3 + (rnd() - 0.5) * 14;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  n.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.14; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(c, 0, 0); ctx.restore();
}

function grain(ctx, amt = 5) {
  const c = createCanvas(W, H), n = c.getContext('2d');
  const img = n.createImageData(W, H);
  let seed = 424242;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 2 * amt;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  n.putImageData(img, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.16; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(c, 0, 0); ctx.restore();
}

/* ------------------------------------------------ type helpers */
const X = 150, CW = W - X * 2;

function wrap(ctx, text, font, maxW) {
  ctx.font = font;
  const out = [];
  for (const para of text.split('\n')) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = line + ' ' + words[i];
      if (ctx.measureText(t).width > maxW) { out.push(line); line = words[i]; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

function block(ctx, text, { font, size, color, lh, y, maxW = CW }) {
  const f = `${size}px ${font}`;
  const lines = wrap(ctx, text, f, maxW);
  ctx.font = f; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const l of lines) { ctx.fillText(l, X, y); y += lh; }
  return y;
}

function sectionLabel(ctx, bn, en, y) {
  ctx.fillStyle = '#C9A45C';
  ctx.fillRect(X, y - 26, 46, 3);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#14181D'; ctx.font = '38px AnekSB';
  ctx.fillText(bn, X, y + 22);
  const w = ctx.measureText(bn).width;
  ctx.fillStyle = '#8A939B'; ctx.font = '22px MontSB';
  ctx.fillText(en, X + w + 22, y + 18);
  return y + 62;
}

function spaced(ctx, text, x, y, font, size, color, sp = 6) {
  ctx.font = `${size}px ${font}`; ctx.fillStyle = color;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let cx = x;
  for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; }
}

/* ------------------------------------------------ card */
async function card(sec, slug, idx) {
  const cnv = createCanvas(W, H);
  const ctx = cnv.getContext('2d');
  stage(ctx); linen(ctx);

  // top wordmark + folio
  spaced(ctx, 'MIQA', X, 118, 'MontSB', 30, '#14181D', 10);
  ctx.textAlign = 'right'; ctx.fillStyle = '#8A939B'; ctx.font = '24px MontSB';
  ctx.fillText(`STEEL NIGHT  ·  0${idx} / 05`, W - X, 116);
  ctx.textAlign = 'left';

  // colour chips of the finish, top-right
  const chipY = 176;
  ctx.fillStyle = '#C9A45C'; ctx.fillRect(X, chipY, Math.round(CW * 0.08), 2);

  // name
  ctx.fillStyle = '#14181D'; ctx.font = '74px AnekXB'; ctx.textAlign = 'left';
  let y = 268;
  ctx.fillText(sec.bn, X, y);
  y += 52;
  spaced(ctx, sec.en.toUpperCase(), X, y, 'MontSB', 26, '#5C646C', 5);

  // five photo chips
  y += 46;
  const labels = ['সামনে', 'অ্যাঙ্গেল', 'ডায়াল', 'ব্রেসলেট', 'হাতে'];
  ctx.font = '26px AnekSB';
  let cx = X;
  for (const l of labels) {
    const w = ctx.measureText(l).width + 40;
    ctx.fillStyle = 'rgba(20,24,29,0.05)';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(cx, y, w, 48, 24); ctx.fill(); }
    else ctx.fillRect(cx, y, w, 48);
    ctx.fillStyle = '#3A4249'; ctx.textBaseline = 'middle';
    ctx.fillText(l, cx + 20, y + 25);
    ctx.textBaseline = 'alphabetic';
    cx += w + 14;
  }

  // ---- বিবরণ
  y += 148;
  y = sectionLabel(ctx, 'বিবরণ', 'DESCRIPTION', y);
  y = block(ctx, sec.fences[0].trim(), {
    font: 'HindSB', size: 44, color: '#232A31', lh: 68, y: y + 46,
  });

  // ---- বিস্তারিত বিবরণ
  y += 92;
  y = sectionLabel(ctx, 'বিস্তারিত বিবরণ', 'DETAILS', y);
  y = block(ctx, sec.fences[2].trim(), {
    font: 'HindR', size: 34, color: '#3A4249', lh: 55, y: y + 40,
  });

  // ---- approved claims strip
  const stripY = H - 168;
  ctx.fillStyle = 'rgba(20,24,29,0.06)';
  ctx.fillRect(X, stripY - 40, CW, 1);
  ctx.fillStyle = '#C9A45C'; ctx.fillRect(X, stripY - 42, 46, 3);
  ctx.font = '32px AnekSB'; ctx.fillStyle = '#14181D'; ctx.textAlign = 'left';
  ctx.fillText('বাটারফ্লাই লক   ·   ওয়াটার রেজিস্ট্যান্ট   ·   কোয়ালিটি: Good', X, stripY + 26);
  ctx.font = '24px MontSB'; ctx.fillStyle = '#8A939B';
  ctx.fillText('MIQA  ·  STEEL NIGHT  ·  FOR MEN', X, stripY + 74);
  ctx.textAlign = 'right'; ctx.fillStyle = '#8A939B'; ctx.font = '24px MontSB';
  ctx.fillText(`set-g-0${idx}`, W - X, stripY + 74);
  ctx.textAlign = 'left';

  grain(ctx);
  return cnv;
}

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (let i = 0; i < parse.length; i++) {
    const sec = parse[i];
    const [bn, en, slug] = SLUGS[i];
    if (!sec.bn.includes(bn.split(' ')[0])) throw new Error(`md/cmd order mismatch at ${i}: ${sec.bn} vs ${bn}`);
    const cnv = await card(sec, slug, i + 1);
    const buf = cnv.toBuffer('image/jpeg', 93);
    const name = `DESC-${slug}.jpg`;
    fs.writeFileSync(`${OUT}/${name}`, buf);
    console.log(name, W + 'x' + H, (buf.length / 1024).toFixed(0) + ' KB');
  }
};
main();
