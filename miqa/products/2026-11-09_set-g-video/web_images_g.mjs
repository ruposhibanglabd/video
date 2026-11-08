/**
 * Set G — men's "Steel Daylight" website photo pack (1600×1600, sRGB JPEG).
 *
 * 5 colourways × 5 photos + 1 group = 26 files, plus 600px thumbnails.
 *   <slug>_1_main.jpg      full watch, straight on
 *   <slug>_2_angle.jpg     three-quarter, fluted bezel depth + crown
 *   <slug>_3_dial.jpg      dial macro (XII, diamond markers, cyclops date)
 *   <slug>_4_bracelet.jpg  bracelet macro (5-link jubilee, butterfly clasp)
 *   <slug>_5_wrist.jpg     on-wrist, shirt cuff
 *   set-g_shared_group.jpg all five, one row
 *
 * Theme: Steel Daylight (miqa/brand/MIQA-MEN-THEME.md) — mist white → steel
 * shadow stage, fine linen texture, graphite ink on light plates.
 * Product is never altered: only staged, cropped, resampled, sharpened.
 * No text, no URL, no price, no logo overlay, no watermark.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const PLATES = 'miqa/products/2026-11-09_set-g-video/plates';
const UW = 'miqa/products/2026-11-09_set-g-video/work/uw';
const OUT = 'miqa/deliveries/2026-11-09_set-g-video/website';
const S = 1600;

/* ---------------------------------------------------------- stage */
function stage(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FAF8F4');
  g.addColorStop(0.55, '#F0ECE4');
  g.addColorStop(1, '#DFD9D0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.46, H * 0.42, 0, W * 0.46, H * 0.42, Math.max(W, H) * 0.72);
  rg.addColorStop(0, 'rgba(255,255,252,0.75)');
  rg.addColorStop(0.6, 'rgba(244,241,235,0.20)');
  rg.addColorStop(1, 'rgba(198,193,184,0.28)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
}

/** fine linen weave — deterministic, very low contrast */
function linen(ctx, W, H) {
  const n = createCanvas(W, H);
  const nx = n.getContext('2d');
  const img = nx.createImageData(W, H);
  let seed = 20261109;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      // weave: two crossing sine gratings + noise
      const w = Math.sin(x * 1.9) * 3 + Math.sin(y * 1.9) * 3;
      const v = 128 + w + (rnd() - 0.5) * 14;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  nx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0);
  ctx.restore();
}

function grain(ctx, W, H, amt = 6) {
  const n = createCanvas(W, H);
  const nx = n.getContext('2d');
  const img = nx.createImageData(W, H);
  let seed = 771109;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 2 * amt;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0);
  ctx.restore();
}

/** blurred real-photo backdrop of the same plate, glazed to the steel palette */
async function backdrop(ctx, file, { crop = null, blur = 64, glaze = 0.70 } = {}) {
  const im = await loadImage(`${UW}/${file}.png`);
  const bx = im.width * (crop ? crop[0] : 0);
  const by = im.height * (crop ? crop[1] : 0);
  const bw = im.width * (crop ? crop[2] - crop[0] : 1);
  const bh = im.height * (crop ? crop[3] - crop[1] : 1);
  const k = Math.max(S / bw, S / bh);
  ctx.save();
  ctx.filter = `blur(${blur}px) saturate(0.72)`;
  ctx.drawImage(im, bx, by, bw, bh, (S - bw * k) / 2, (S - bh * k) / 2, bw * k, bh * k);
  ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, `rgba(250,248,244,${glaze})`);
  g.addColorStop(0.6, `rgba(240,236,228,${glaze})`);
  g.addColorStop(1, `rgba(223,217,208,${glaze + 0.05})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
}

/**
 * Place a portrait crop of a plate, feathering every edge so the source
 * rectangle dissolves into the stage (never a visible square).
 */
async function place(ctx, file, { cx = S / 2, cy = S / 2, h = S * 0.9, crop = null, feather = 0.12, featherY = null, sharp = 1.4 } = {}) {
  const im = await loadImage(`${UW}/${file}.png`);
  const bx = im.width * (crop ? crop[0] : 0);
  const by = im.height * (crop ? crop[1] : 0);
  const bw = im.width * (crop ? crop[2] - crop[0] : 1);
  const bh = im.height * (crop ? crop[3] - crop[1] : 1);
  const w = Math.round(h * bw / bh);

  const buf = createCanvas(w, h);
  const b = buf.getContext('2d');
  b.imageSmoothingQuality = 'high';
  b.drawImage(im, bx, by, bw, bh, 0, 0, w, h);

  if (sharp) {
    const blur = createCanvas(w, h);
    const bc = blur.getContext('2d');
    bc.filter = `blur(${sharp}px)`;
    bc.drawImage(buf, 0, 0);
    b.save();
    b.globalCompositeOperation = 'overlay';
    b.globalAlpha = 0.45;
    b.drawImage(blur, 0, 0);
    b.restore();
  }

  const fx = Math.max(1, Math.round(w * feather));
  const gx = b.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)');
  gx.addColorStop(fx / w, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - fx / w, 'rgba(0,0,0,1)');
  gx.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in';
  b.fillStyle = gx; b.fillRect(0, 0, w, h);
  const fyy = featherY === null ? feather : featherY;
  if (fyy > 0) {
    const fy = Math.max(1, Math.round(h * fyy));
    const gy = b.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, 'rgba(0,0,0,0)');
    gy.addColorStop(fy / h, 'rgba(0,0,0,1)');
    gy.addColorStop(1 - fy / h, 'rgba(0,0,0,1)');
    gy.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = gy; b.fillRect(0, 0, w, h);
  }
  // radial falloff kills the last trace of the crop's rectangle
  const rg = b.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.22, w / 2, h / 2, Math.max(w, h) * 0.66);
  rg.addColorStop(0, 'rgba(0,0,0,1)');
  rg.addColorStop(0.62, 'rgba(0,0,0,0.97)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = rg; b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'source-over';

  ctx.drawImage(buf, Math.round(cx - w / 2), Math.round(cy - h / 2));
}

/** pale radial light behind a macro shot — keeps the stage clean and airy */
function softGlow(ctx) {
  const rg = ctx.createRadialGradient(S * 0.5, S * 0.46, 0, S * 0.5, S * 0.46, S * 0.72);
  rg.addColorStop(0, 'rgba(255,255,253,0.98)');
  rg.addColorStop(0.55, 'rgba(246,243,238,0.55)');
  rg.addColorStop(1, 'rgba(206,201,192,0.20)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
}

/** full-bleed cover crop of a plate (used for on-wrist + group) */
async function cover(ctx, file, { crop = null, glaze = 0.10, cool = 0.16 } = {}) {
  const im = await loadImage(`${UW}/${file}.png`);
  const bx = im.width * (crop ? crop[0] : 0);
  const by = im.height * (crop ? crop[1] : 0);
  const bw = im.width * (crop ? crop[2] - crop[0] : 1);
  const bh = im.height * (crop ? crop[3] - crop[1] : 1);
  const k = Math.max(S / bw, S / bh);
  const w = bw * k, h = bh * k;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(im, bx, by, bw, bh, (S - w) / 2, (S - h) / 2, w, h);
  if (glaze > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, `rgba(250,248,244,${glaze})`);
    g.addColorStop(1, `rgba(228,223,214,${glaze})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  }
  const rg = ctx.createRadialGradient(S * 0.5, S * 0.46, S * 0.30, S * 0.5, S * 0.46, S * 0.82);
  rg.addColorStop(0, 'rgba(252,251,248,0)');
  rg.addColorStop(1, `rgba(176,172,164,${cool})`);
  ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
}

/* ---------------------------------------------------------- sets */
// measured watch bounds per plate (2× plate pixels) — crops are derived from
// these so no crop box drifts between colourways
const BOX = {
  'p01_black': [384, 272, 1408, 2048],
  'p02_twotone_navy': [440, 0, 1306, 2378],
  'p03_twotone_slate': [500, 120, 1000, 2100],
  'p04_gold_navy': [268, 286, 1517, 1939],
  'p05_gold_champagne': [300, 283, 1400, 2000],
};
const UWW = 1792, UWH = 2390;
/**
 * bracelet macro: a square centred on the lower link run. Sized from the watch
 * width and clamped inside the plate so the crop never runs off the edge (the
 * plates end in a mirror reflection, not in a full bracelet).
 */
const bandBox = (b) => {
  const [x, y, w, h] = b;
  const side = Math.min(w * 0.55, 900);
  const cx = x + w / 2;
  let cy = y + h * 0.865;
  const top = Math.max(4, cy - side / 2);
  const bot = Math.min(UWH - 4, cy + side / 2);
  cy = (top + bot) / 2;
  const s2 = Math.min(side, bot - top);
  return [(cx - s2 / 2) / UWW, (cy - s2 / 2) / UWH, (cx + s2 / 2) / UWW, (cy + s2 / 2) / UWH];
};
/** dial: the upper-middle part of the watch (case + bezel), square-ish */
const dialBox = (b) => {
  const [x, y, w, h] = b;
  const side = Math.min(w, h * 0.55);
  const cx = x + w / 2, cy = y + h * 0.30;
  return [(cx - side / 2) / UWW, (cy - side * 0.46) / UWH, (cx + side / 2) / UWW, (cy + side * 0.54) / UWH];
};

const COLOURS = [
  { slug: 'set-g-01-black', bn: 'ব্ল্যাক নেভি', plate: 'p01_black', angle: 'a01_black', wrist: 'w01_black', box: BOX.p01_black },
  { slug: 'set-g-02-twotone-navy', bn: 'টু-টোন রয়্যাল ব্লু', plate: 'p02_twotone_navy', angle: 'a02_twotone_navy', wrist: 'w02_twotone_navy', box: BOX.p02_twotone_navy },
  { slug: 'set-g-03-twotone-slate', bn: 'টু-টোন স্লেট', plate: 'p03_twotone_slate', angle: 'a03_twotone_slate', wrist: 'w03_twotone_slate', box: BOX.p03_twotone_slate },
  { slug: 'set-g-04-gold-navy', bn: 'গোল্ড রয়্যাল ব্লু', plate: 'p04_gold_navy', angle: 'a04_gold_navy', wrist: 'w04_gold_navy', box: BOX.p04_gold_navy },
  { slug: 'set-g-05-gold-champagne', bn: 'গোল্ড শ্যাম্পেন', plate: 'p05_gold_champagne', angle: 'a05_gold_champagne', wrist: 'w05_gold_champagne', box: BOX.p05_gold_champagne },
];

const newSheet = () => {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  stage(ctx, S, S);
  linen(ctx, S, S);
  return { cnv, ctx };
};

/** 1 · full watch, straight on */
async function shotMain(c) {
  const { cnv, ctx } = newSheet();
  await backdrop(ctx, c.plate, { crop: [0.18, 0.14, 0.82, 0.92], blur: 72, glaze: 0.78 });
  await place(ctx, c.plate, { crop: [0.06, 0.02, 0.94, 0.99], h: S * 1.0, cy: S * 0.5, feather: 0.09, featherY: 0.025, sharp: 1.6 });
  grain(ctx, S, S);
  return cnv;
}

/** 2 · three-quarter — fluted bezel depth and crown */
async function shotAngle(c) {
  const { cnv, ctx } = newSheet();
  await backdrop(ctx, c.angle, { crop: [0.10, 0.03, 0.90, 0.98], blur: 74, glaze: 0.74 });
  await place(ctx, c.angle, { crop: [0.05, 0.02, 0.95, 0.99], h: S * 1.0, cy: S * 0.5, feather: 0.085, featherY: 0.03, sharp: 1.5 });
  grain(ctx, S, S);
  return cnv;
}

/** 3 · dial macro */
async function shotDial(c) {
  const { cnv, ctx } = newSheet();
  // full-bleed cover crop: no composite seams, the dial itself is the frame
  await cover(ctx, c.plate, { crop: dialBox(c.box), glaze: 0.05, cool: 0.10 });
  grain(ctx, S, S);
  return cnv;
}

/** 4 · bracelet macro — five-link jubilee, butterfly clasp area */
async function shotBracelet(c) {
  const { cnv, ctx } = newSheet();
  // plain steel stage (no photo backdrop): a blown-up link photo would show its
  // own soft shadow bands and a visible edge, which reads as a mistake
  await cover(ctx, c.plate, { crop: bandBox(c.box), glaze: 0.04, cool: 0.10 });
  grain(ctx, S, S);
  return cnv;
}

/** 5 · on the wrist, full bleed */
async function shotWrist(c) {
  const { cnv, ctx } = newSheet();
  await cover(ctx, c.wrist, { crop: [0.055, 0.05, 0.985, 0.92], glaze: 0.10, cool: 0.14 });
  grain(ctx, S, S);
  return cnv;
}

/**
 * shared group card — the group plate is landscape, so it is fitted (not
 * cover-cropped) and every one of its four edges is feathered, so the photo
 * melts into the stage instead of sitting there as a rectangle.
 */
async function group() {
  const { cnv, ctx } = newSheet();
  const im = await loadImage(`${UW}/p06_group.png`);
  const crop = [0.035, 0.10, 0.965, 0.93];
  const bx = im.width * crop[0], by = im.height * crop[1];
  const bw = im.width * (crop[2] - crop[0]), bh = im.height * (crop[3] - crop[1]);
  const w = Math.round(S * 0.99), h = Math.round(w * bh / bw);

  const buf = createCanvas(w, h);
  const b = buf.getContext('2d');
  b.imageSmoothingQuality = 'high';
  b.drawImage(im, bx, by, bw, bh, 0, 0, w, h);

  const fx = Math.round(w * 0.10), fy = Math.round(h * 0.16);
  const gx = b.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)');
  gx.addColorStop(fx / w, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - fx / w, 'rgba(0,0,0,1)');
  gx.addColorStop(1, 'rgba(0,0,0,0)');
  const gy = b.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(0,0,0,0)');
  gy.addColorStop(fy / h, 'rgba(0,0,0,1)');
  gy.addColorStop(1 - fy / h, 'rgba(0,0,0,1)');
  gy.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in';
  b.fillStyle = gx; b.fillRect(0, 0, w, h);
  b.fillStyle = gy; b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'source-over';

  ctx.drawImage(buf, Math.round((S - w) / 2), Math.round((S - h) / 2));
  grain(ctx, S, S);
  return cnv;
}

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const write = (name, cnv) => {
    const buf = cnv.toBuffer('image/jpeg', 92);
    fs.writeFileSync(`${OUT}/${name}`, buf);
    console.log(name, (buf.length / 1024).toFixed(0) + ' KB');
  };
  for (const c of COLOURS) {
    write(`${c.slug}_1_main.jpg`, await shotMain(c));
    write(`${c.slug}_2_angle.jpg`, await shotAngle(c));
    write(`${c.slug}_3_dial.jpg`, await shotDial(c));
    write(`${c.slug}_4_bracelet.jpg`, await shotBracelet(c));
    write(`${c.slug}_5_wrist.jpg`, await shotWrist(c));
  }
  write('set-g_shared_group.jpg', await group());
};
main();
