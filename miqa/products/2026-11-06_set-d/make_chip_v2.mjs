// Two-pill Bengali feature bar for the Set D "new design family" primaries.
// usage: node make_chip_v2.mjs <inset1.png> <inset2.png> <out.png>
import fs from 'node:fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';

const FONT_DIR = 'miqa/brand/fonts';
const FONT = 'HindSiliguri-SemiBold';
GlobalFonts.registerFromPath(`${FONT_DIR}/${FONT}.ttf`, FONT);

const [inset1, inset2, out] = process.argv.slice(2);

const W = 2000, H = 2000;
const CY = 1790;            // vertical centre of the pill row
const PILL_H = 190;
const R = PILL_H / 2;
const INSET_R = 76;
const GAP_IN = 30;          // inset → text
const PAD_R = 62;
const GAP_PILLS = 34;
const TEXT_PX = 78;

const labels = ['ওয়াটার রেজিস্ট্যান্স', '৭ দিনের রিপ্লেসমেন্ট'];

const c = createCanvas(W, H);
const g = c.getContext('2d');
g.font = `${TEXT_PX}px "${FONT}"`;

const widths = labels.map((t) => {
  const tw = Math.ceil(g.measureText(t).width);
  return Math.round(2 * R + GAP_IN + tw + PAD_R);
});
const totalW = widths[0] + GAP_PILLS + widths[1];
let x = Math.round(W / 2 - totalW / 2);
const y = CY - PILL_H / 2;

const insets = [await loadImage(fs.readFileSync(inset1)), await loadImage(fs.readFileSync(inset2))];

labels.forEach((label, i) => {
  const w = widths[i];
  // soft plate + shadow
  g.save();
  g.shadowColor = 'rgba(90,26,46,0.14)';
  g.shadowBlur = 34;
  g.shadowOffsetY = 9;
  g.beginPath();
  g.roundRect(x, y, w, PILL_H, R);
  g.fillStyle = 'rgba(253,246,243,0.94)';
  g.fill();
  g.restore();

  g.beginPath();
  g.roundRect(x + 1, y + 1, w - 2, PILL_H - 2, R - 1);
  g.lineWidth = 2;
  g.strokeStyle = 'rgba(184,146,90,0.75)';
  g.stroke();

  // real dial crop, concentric with the left cap
  const icx = x + R, icy = CY;
  g.save();
  g.beginPath();
  g.arc(icx, icy, INSET_R, 0, Math.PI * 2);
  g.clip();
  g.drawImage(insets[i], icx - INSET_R, icy - INSET_R, INSET_R * 2, INSET_R * 2);
  g.restore();
  g.beginPath();
  g.arc(icx, icy, INSET_R + 3, 0, Math.PI * 2);
  g.lineWidth = 6;
  g.strokeStyle = '#D9B779';
  g.stroke();

  // label — Bengali has a headline, so centre on the glyph box
  const m = g.measureText(label);
  const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  g.fillStyle = '#5A1A2E';
  g.textBaseline = 'alphabetic';
  g.fillText(label, x + 2 * R + GAP_IN, CY + (asc - desc) / 2);

  x += w + GAP_PILLS;
});

fs.writeFileSync(out, c.toBuffer('image/png'));
console.log(JSON.stringify({ totalW, widths }));
