/**
 * Set F "Cushion Stone" — website product images (2000×2000, sRGB JPEG).
 *
 * One folder per colourway → miqa/deliveries/2026-11-08_set-f-video/website/
 *   set-f-01-ivory_main.jpg       full watch, straight on, Daylight stage
 *   set-f-01-ivory_detail.jpg     case + dial macro (stones, hands, markers)
 *   set-f-01-ivory_wrist.jpg      on-wrist lifestyle
 * …and shared cards:
 *   set-f_shared_group.jpg        all five colourways, one row
 *   set-f_shared_gift.jpg         boxed, open lid, ribbon
 *
 * Rules: product render untouched (case, dial, hands, stones, colour) — only
 * staged, cropped, resampled and sharpened. Text-free: no URL, phone, discount,
 * logo or watermark, and no price (that lives in the video / FB art / site copy).
 * Stage and grain come from the locked Daylight theme.
 */
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const PLATES = 'miqa/products/2026-11-08_set-f-video/plates';      // 896 × 1195
const UW = 'miqa/products/2026-11-08_set-f-video/work/uw';         // same, 2× lanczos + unsharp
const OUT = 'miqa/deliveries/2026-11-08_set-f-video/website';
const S = 1600;

/* ------------------------------------------------------------- Daylight */
function stage(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#FFFCF7');
  g.addColorStop(0.55, '#FBF3E9');
  g.addColorStop(1, '#F1E2D3');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * 0.5, H * 0.44, 0, W * 0.5, H * 0.44, Math.max(W, H) * 0.68);
  rg.addColorStop(0, 'rgba(255,253,248,0.92)');
  rg.addColorStop(0.55, 'rgba(255,248,238,0.30)');
  rg.addColorStop(1, 'rgba(232,211,190,0.26)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
}

/** deterministic film grain, σ≈1.5 */
function grain(ctx, W, H, amt = 7) {
  const n = createCanvas(W, H);
  const nx = n.getContext('2d');
  const img = nx.createImageData(W, H);
  let seed = 20261108;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 2 * amt;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(n, 0, 0);
  ctx.restore();
}

/** soft elliptical contact shadow */
function contact(ctx, cx, cy, w, h, a = 0.15) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, `rgba(122,88,60,${a})`);
  g.addColorStop(0.5, `rgba(122,88,60,${a * 0.42})`);
  g.addColorStop(1, 'rgba(122,88,60,0)');
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(1, h / w);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * Full-bleed backdrop: the plate itself, cover-cropped and heavily blurred, so
 * the whole square is real product photography rather than a flat gradient —
 * then the Daylight stage glaze on top to keep it bright and on-brand.
 */
async function backdrop(ctx, file, { dir = PLATES, crop = null, blur = 42, glaze = 0.52 } = {}) {
  const im = await loadImage(`${dir}/${file}.png`);
  const bx = im.width * (crop ? crop[0] : 0);
  const by = im.height * (crop ? crop[1] : 0);
  const bw = im.width * (crop ? crop[2] - crop[0] : 1);
  const bh = im.height * (crop ? crop[3] - crop[1] : 1);
  const k = Math.max(S / bw, S / bh);
  const w = bw * k, h = bh * k;
  ctx.save();
  ctx.filter = `blur(${blur}px) saturate(1.02)`;
  ctx.drawImage(im, bx, by, bw, bh, (S - w) / 2, (S - h) / 2, w, h);
  ctx.restore();

  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, `rgba(255,252,247,${glaze})`);
  g.addColorStop(0.55, `rgba(251,243,233,${glaze})`);
  g.addColorStop(1, `rgba(241,226,211,${glaze + 0.06})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  const rg = ctx.createRadialGradient(S * 0.5, S * 0.44, 0, S * 0.5, S * 0.44, S * 0.78);
  rg.addColorStop(0, 'rgba(255,253,248,0.55)');
  rg.addColorStop(0.6, 'rgba(255,248,238,0.10)');
  rg.addColorStop(1, 'rgba(226,203,181,0.24)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
}

/** full-bleed: the plate itself, cover-cropped to the square, lightly glazed */
async function cover(ctx, file, { dir = PLATES, crop = null, glaze = 0.13, dark = 0 } = {}) {
  const im = await loadImage(`${dir}/${file}.png`);
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
    g.addColorStop(0, `rgba(255,252,247,${glaze})`);
    g.addColorStop(1, `rgba(243,229,215,${glaze})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  }
  const rg = ctx.createRadialGradient(S * 0.5, S * 0.46, S * 0.30, S * 0.5, S * 0.46, S * 0.80);
  rg.addColorStop(0, 'rgba(255,252,246,0)');
  rg.addColorStop(1, `rgba(236,214,193,${0.20 + dark})`);
  ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
}

/** bottom fade so the product's plate edge disappears into the backdrop */
function bottomFade(ctx, from = 0.72, to = 1) {
  const g = ctx.createLinearGradient(0, S * from, 0, S * to);
  g.addColorStop(0, 'rgba(249,240,230,0)');
  g.addColorStop(0.55, 'rgba(247,236,224,0.62)');
  g.addColorStop(1, 'rgba(243,229,215,0.97)');
  ctx.fillStyle = g; ctx.fillRect(0, S * from, S, S * (to - from));
}

/**
 * Place a portrait plate inside the canvas at a chosen height, feathering every
 * edge so the plate's ivory silk dissolves into the stage. Optionally crop the
 * plate first (normalised box) and pass an extra post-sharpen pass.
 */
async function place(ctx, file, { dir = PLATES, cx = S / 2, cy = S / 2, h = S * 0.88, crop = null, feather = 0.13, featherY = null, sharp = 0 } = {}) {
  const im = await loadImage(`${dir}/${file}.png`);
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
    // unsharp mask via difference-of-blur
    const blur = createCanvas(w, h);
    const bc = blur.getContext('2d');
    bc.filter = `blur(${sharp}px)`;
    bc.drawImage(buf, 0, 0);
    b.save();
    b.globalCompositeOperation = 'overlay';
    b.globalAlpha = 0.5;
    b.filter = 'none';
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
  // radial falloff kills the last trace of the plate's rectangular edge
  const rg = b.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.20, w / 2, h / 2, Math.max(w, h) * 0.62);
  rg.addColorStop(0, 'rgba(0,0,0,1)');
  rg.addColorStop(0.60, 'rgba(0,0,0,0.96)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = rg; b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'source-over';

  ctx.drawImage(buf, Math.round(cx - w / 2), Math.round(cy - h / 2));
}

/** landscape strip for the 5-up card */
async function strip(ctx, file, { dir = PLATES, w = 1960, cy = S / 2, crop = null, feather = 0.09 } = {}) {
  const im = await loadImage(`${dir}/${file}.png`);
  const bx = im.width * (crop ? crop[0] : 0);
  const by = im.height * (crop ? crop[1] : 0);
  const bw = im.width * (crop ? crop[2] - crop[0] : 1);
  const bh = im.height * (crop ? crop[3] - crop[1] : 1);
  const h = Math.round(w * bh / bw);
  const buf = createCanvas(w, h);
  const b = buf.getContext('2d');
  b.imageSmoothingQuality = 'high';
  b.drawImage(im, bx, by, bw, bh, 0, 0, w, h);
  const fx = Math.round(w * 0.06), fy = Math.round(h * feather);
  const gx = b.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(fx / w, 'rgba(0,0,0,1)');
  gx.addColorStop(1 - fx / w, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
  const gy = b.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(fy / h, 'rgba(0,0,0,1)');
  gy.addColorStop(1 - fy / h, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
  b.globalCompositeOperation = 'destination-in';
  b.fillStyle = gx; b.fillRect(0, 0, w, h);
  b.fillStyle = gy; b.fillRect(0, 0, w, h);
  b.globalCompositeOperation = 'source-over';
  ctx.drawImage(buf, Math.round((S - w) / 2), Math.round(cy - h / 2));
}

/* ----------------------------------------------------------------- sets */
const COLOURS = [
  { slug: 'set-f-01-ivory',    bn: 'আইভরি পার্ল',     plate: 'p01_ivory',    wrist: 'web_wrist_ivory' },
  { slug: 'set-f-02-white',    bn: 'সিলভার হোয়াইট',  plate: 'p02_white',    wrist: 'web_wrist_white' },
  { slug: 'set-f-03-lavender', bn: 'ল্যাভেন্ডার',     plate: 'p03_lavender', wrist: 'web_wrist_lavender' },
  { slug: 'set-f-04-emerald',  bn: 'এমারেল্ড সবুজ',   plate: 'p04_green',    wrist: 'web_wrist_green' },
  { slug: 'set-f-05-rose',     bn: 'রোজ পিংক',        plate: 'p05_pink',     wrist: 'web_wrist_pink' },
];

/** dial region inside a plate, normalised */
// crop ends above the plate's mirror reflection so no ghost watch appears
const HEAD = [0.185, 0.215, 0.815, 0.695];
const WRISTBOX = [0.06, 0.01, 0.995, 0.845];

/** full watch, centred, on a soft real-photo backdrop */
async function main_(c) {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  await backdrop(ctx, c.plate, { crop: [0.18, 0.16, 0.82, 0.90], blur: 64, glaze: 0.72 });
  await place(ctx, c.plate, { dir: UW, crop: [0.10, 0.02, 0.92, 0.99], h: S * 1.0, cy: S * 0.5, feather: 0.10, featherY: 0.03, sharp: 1.2 });
  grain(ctx, S, S);
  return cnv;
}

/** case + dial macro — the stones and markers read clearly at thumbnail size */
async function detail(c) {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  await backdrop(ctx, c.plate, { crop: HEAD, blur: 64, glaze: 0.74 });
  await place(ctx, c.plate, { dir: UW, crop: HEAD, h: S * 0.76, cy: S * 0.5, feather: 0.15, featherY: 0.12, sharp: 2 });
  grain(ctx, S, S);
  return cnv;
}

/** on-wrist lifestyle */
async function wrist(c) {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  // full-bleed: the lifestyle photo *is* the square, so nothing is composited
  // and there is no seam — a light Daylight glaze keeps it airy and on-brand
  await cover(ctx, c.wrist, { dir: UW, crop: WRISTBOX, glaze: 0.12, dark: 0.02 });
  grain(ctx, S, S);
  return cnv;
}

/** all five colourways in one row */
async function group() {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  await cover(ctx, 'p06_group', { crop: [0.045, 0.16, 0.955, 0.865], glaze: 0.10 });
  grain(ctx, S, S);
  return cnv;
}

/** boxed, open lid, ribbon — the gift shot */
async function gift() {
  const cnv = createCanvas(S, S);
  const ctx = cnv.getContext('2d');
  await cover(ctx, 'p08_box', { crop: [0.05, 0.06, 0.99, 0.94], glaze: 0.10 });
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
    write(`${c.slug}_main.jpg`, await main_(c));
    write(`${c.slug}_detail.jpg`, await detail(c));
    write(`${c.slug}_wrist.jpg`, await wrist(c));
  }
  write('set-f_shared_group.jpg', await group());
  write('set-f_shared_gift.jpg', await gift());
};
main();
