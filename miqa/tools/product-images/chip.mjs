// Primary-image feature chip: [real lock photo inset] + Bengali label, one pill, bottom centre.
import fs from 'node:fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
const [,, label, insetPath, outPath, line = 'women'] = process.argv;
const FONT_DIR = '/home/user/video/miqa/brand/fonts';
const T = {
  women:  { font: 'HindSiliguri-SemiBold', fill: 'rgba(251,244,241,0.90)', border: '#D9B779', ring: '#D9B779', text: '#5A1A2E', shadow: 'rgba(90,26,46,0.16)' },
  men:    { font: 'AnekBangla-SemiBold',   fill: 'rgba(43,49,56,0.82)',    border: '#C9A45C', ring: '#C9A45C', text: '#F2F0EB', shadow: 'rgba(0,0,0,0.35)' },
  couple: { font: 'HindSiliguri-SemiBold', fill: 'rgba(255,253,248,0.90)', border: '#D9B779', ring: '#D9B779', text: '#2A141C', shadow: 'rgba(42,20,28,0.14)' },
}[line];
GlobalFonts.registerFromPath(`${FONT_DIR}/${T.font}.ttf`, T.font);
const W = 2000, H = 2000, CY = 1730, CH = 220, R = 110, INSET_R = 94, RING = 6, GAP = 36, PAD_R = 72;
const c = createCanvas(W, H); const g = c.getContext('2d');
g.font = `88px "${T.font}"`;
const m = g.measureText(label);
const tw = m.width;
const w = Math.round(2 * R + GAP + tw + PAD_R);
const x0 = Math.round(W / 2 - w / 2), y0 = CY - CH / 2;
// pill with soft shadow
g.save(); g.shadowColor = T.shadow; g.shadowBlur = 46; g.shadowOffsetY = 12;
g.beginPath(); g.roundRect(x0, y0, w, CH, R); g.fillStyle = T.fill; g.fill(); g.restore();
g.beginPath(); g.roundRect(x0 + 1, y0 + 1, w - 2, CH - 2, R - 1); g.lineWidth = 2; g.strokeStyle = T.border; g.stroke();
// inset (concentric with the pill's left cap)
const img = await loadImage(fs.readFileSync(insetPath));
const icx = x0 + R, icy = CY;
g.save(); g.beginPath(); g.arc(icx, icy, INSET_R, 0, Math.PI * 2); g.clip();
g.drawImage(img, icx - INSET_R, icy - INSET_R, INSET_R * 2, INSET_R * 2); g.restore();
g.beginPath(); g.arc(icx, icy, INSET_R + RING / 2, 0, Math.PI * 2); g.lineWidth = RING; g.strokeStyle = T.ring; g.stroke();
// label — vertically centred on the glyph box (Bengali has a top headline)
const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
g.fillStyle = T.text; g.textBaseline = 'alphabetic';
g.fillText(label, x0 + 2 * R + GAP, CY + (asc - desc) / 2);
fs.writeFileSync(outPath, c.toBuffer('image/png'));
console.log(JSON.stringify({ x0, w, tw: Math.round(tw), asc: Math.round(asc), desc: Math.round(desc) }));
