// Set D (new design family) — 2000×2000 finish + Bengali feature chip.
// usage: node compose_v2.mjs <raw.png> <inset1.png> <inset2.png> <out.png> <mode>
//   primary — watch occupies the upper square, empty bottom band carries the two pills
//   plain   — full-bleed (on-wrist / close-up), no pills
import fs from 'node:fs';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const FONT_DIR = 'miqa/brand/fonts';
const FONT = 'HindSiliguri-SemiBold';
GlobalFonts.registerFromPath(`${FONT_DIR}/${FONT}.ttf`, FONT);

const [raw, inset1, inset2, out, mode = 'primary'] = process.argv.slice(2);
const W = 2000;
const img = await loadImage(fs.readFileSync(raw));

// ---- sample the render's own backdrop so the extension matches its gradient
const probe = createCanvas(img.width, img.height);
const pg = probe.getContext('2d');
pg.drawImage(img, 0, 0);
const avgRow = (y, h) => {
  const d = pg.getImageData(0, y, img.width, h).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  return `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
};
const edgeFill = avgRow(img.height - 3, 2);

// geometry
const S = mode === 'primary' ? 1860 : W;
const X0 = Math.round((W - S) / 2);
const Y0 = 0;
const FE = 60; // feather width

const c = createCanvas(W, W);
const g = c.getContext('2d');

// ---- 1. backdrop: fill with the render's own bottom-edge tone, then clamp edges outward
g.fillStyle = edgeFill;
g.fillRect(0, 0, W, W);

// ---- 2. the render itself (slightly graded), composited through a feathered mask
const layer = createCanvas(W, W);
const lg = layer.getContext('2d');
lg.filter = 'saturate(1.05) contrast(1.02) brightness(1.004)';
lg.drawImage(img, X0, Y0, S, S);
lg.filter = 'none';

const mask = createCanvas(W, W);
const mg = mask.getContext('2d');
mg.fillStyle = '#fff';
mg.fillRect(0, 0, W, W);
mg.globalCompositeOperation = 'destination-out';
const fade = (x0, y0, x1, y1) => {
  const vertical = x0 === x1;
  const gr = vertical ? mg.createLinearGradient(0, y0, 0, y1) : mg.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, 'rgba(0,0,0,1)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  mg.fillStyle = gr;
  if (vertical) mg.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
  else mg.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), W);
};
if (X0 > 0) {
  fade(X0, 0, X0 + FE, 0);         // left edge
  fade(W - X0, 0, W - X0 - FE, 0); // right edge
}
if (Y0 + S < W) fade(0, Y0 + S, 0, Y0 + S - FE); // bottom edge
lg.globalCompositeOperation = 'destination-in';
lg.drawImage(mask, 0, 0);
lg.globalCompositeOperation = 'source-over';
g.drawImage(layer, 0, 0);

// ---- 3. very soft corner vignette in the ivory family
const vg = g.createRadialGradient(W / 2, W * 0.44, W * 0.34, W / 2, W * 0.5, W * 0.84);
vg.addColorStop(0, 'rgba(255,250,246,0)');
vg.addColorStop(0.65, 'rgba(240,226,210,0.05)');
vg.addColorStop(1, 'rgba(224,202,178,0.16)');
g.fillStyle = vg;
g.fillRect(0, 0, W, W);

// ---- 4. primaries get the two Bengali feature pills
if (mode === 'primary') g.drawImage(await makeChip(inset1, inset2), 0, 0);

fs.writeFileSync(out, c.toBuffer('image/png'));
console.log(`composed ${out} (${mode}, S=${S}, X0=${X0}, fill=${edgeFill})`);

// ---------------------------------------------------------------------------
async function makeChip(i1, i2) {
  const CY = 1812, PILL_H = 186, R = PILL_H / 2, INSET_R = 74;
  const GAP_IN = 30, PAD_R = 60, GAP_PILLS = 32, TEXT_PX = 76;
  const labels = ['ওয়াটার রেজিস্ট্যান্স', '৭ দিনের রিপ্লেসমেন্ট'];
  const cc = createCanvas(W, W);
  const p = cc.getContext('2d');
  p.font = `${TEXT_PX}px "${FONT}"`;
  const widths = labels.map((t) => Math.round(2 * R + GAP_IN + Math.ceil(p.measureText(t).width) + PAD_R));
  const totalW = widths[0] + GAP_PILLS + widths[1];
  let x = Math.round(W / 2 - totalW / 2);
  const y = CY - PILL_H / 2;
  const insets = [await loadImage(fs.readFileSync(i1)), await loadImage(fs.readFileSync(i2))];

  labels.forEach((label, i) => {
    const w = widths[i];
    p.save();
    p.shadowColor = 'rgba(90,26,46,0.15)';
    p.shadowBlur = 38;
    p.shadowOffsetY = 10;
    p.beginPath();
    p.roundRect(x, y, w, PILL_H, R);
    p.fillStyle = 'rgba(253,247,243,0.95)';
    p.fill();
    p.restore();
    p.beginPath();
    p.roundRect(x + 1, y + 1, w - 2, PILL_H - 2, R - 1);
    p.lineWidth = 2;
    p.strokeStyle = 'rgba(184,146,90,0.72)';
    p.stroke();

    const icx = x + R, icy = CY;
    p.save();
    p.beginPath();
    p.arc(icx, icy, INSET_R, 0, Math.PI * 2);
    p.clip();
    p.drawImage(insets[i], icx - INSET_R, icy - INSET_R, INSET_R * 2, INSET_R * 2);
    p.restore();
    p.beginPath();
    p.arc(icx, icy, INSET_R + 3, 0, Math.PI * 2);
    p.lineWidth = 6;
    p.strokeStyle = '#D9B779';
    p.stroke();

    const m = p.measureText(label);
    const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    p.fillStyle = '#5A1A2E';
    p.textBaseline = 'alphabetic';
    p.fillText(label, x + 2 * R + GAP_IN, CY + (asc - desc) / 2);
    x += w + GAP_PILLS;
  });
  return cc;
}
