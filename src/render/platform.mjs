/**
 * Platform adapter.
 *
 * The whole scene system is written against the standard Canvas 2D API, so the
 * exact same drawing code renders in Node (@napi-rs/canvas → ffmpeg) and in the
 * browser (<canvas> → WebCodecs). This module is the only place that knows
 * which one we are on.
 */
const IS_NODE =
  typeof process !== 'undefined' && !!process.versions?.node && typeof document === 'undefined';

export const IS_BROWSER = !IS_NODE;
export const FONT_DIR = 'fonts/';

const FONT_FILES = [
  ['NotoSansBengali-Regular.ttf', 'BN', '400'],
  ['NotoSansBengali-SemiBold.ttf', 'BN', '600'],
  ['NotoSansBengali-Bold.ttf', 'BN', '700'],
  ['NotoSansBengali-ExtraBold.ttf', 'BN', '800'],
  ['Inter-Regular.ttf', 'Inter', '400'],
  ['Inter-SemiBold.ttf', 'Inter', '600'],
  ['Inter-Bold.ttf', 'Inter', '700'],
  ['Inter-ExtraBold.ttf', 'Inter', '800'],
];

let createCanvasImpl = null;
const STORE_IMAGES = new Map();
const STORE_IMAGE_FILES = [
  ['hero', 'hero-watch.jpg'],
  ['noir', 'watch-noir.jpg'],
  ['leather', 'watch-leather.jpg'],
  ['bag', 'bag-editorial.jpg'],
  ['shoe', 'sneaker-editorial.jpg'],
  ['fragrance', 'fragrance-editorial.jpg'],
];

/** Preloaded storefront photography shared by Node and browser rendering. */
export function getStoreImage(name) {
  return STORE_IMAGES.get(name) || null;
}

async function nodeSetup() {
  const napi = await import('@napi-rs/canvas');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = path.join(root, 'assets', 'fonts');
  for (const [file, family] of FONT_FILES) {
    try {
      napi.GlobalFonts.registerFromPath(path.join(dir, file), family);
    } catch (err) {
      console.warn(`[font] ${file}: ${err.message}`);
    }
  }
  for (const [name, file] of STORE_IMAGE_FILES) {
    try {
      STORE_IMAGES.set(name, await napi.loadImage(path.join(root, 'assets', 'storefront', file)));
    } catch (err) {
      console.warn(`[image] ${file}: ${err.message}`);
    }
  }
  createCanvasImpl = (w, h) => napi.createCanvas(w, h);
  void fs;
}

async function browserSetup() {
  createCanvasImpl = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };
  const faces = [];
  for (const [file, family, weight] of FONT_FILES) {
    for (const fam of new Set([family, family === 'BN' ? 'Noto Sans Bengali' : family])) {
      const face = new FontFace(fam, `url("${FONT_DIR}${file}")`, { weight });
      document.fonts.add(face);
      faces.push(face.load().catch((err) => console.warn(`[font] ${file}:`, err?.message || err)));
    }
  }
  await Promise.all(faces);
  // make sure the renderer measures the real metrics, not fallback metrics
  try {
    await document.fonts.ready;
    await document.fonts.load('700 84px BN', 'মাত্র ৩,০০০ টাকায় ওয়েবসাইট!');
    await document.fonts.load('400 40px Inter', 'CodePixel Web');
    await document.fonts.load('800 84px BN', 'কাস্টম ডিজাইন');
  } catch { /* measurement fallback is still valid */ }
  await Promise.all(STORE_IMAGE_FILES.map(([name, file]) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => { STORE_IMAGES.set(name, image); resolve(); };
    image.onerror = () => { console.warn(`[image] Could not load ${file}`); resolve(); };
    image.src = new URL(`../../assets/storefront/${file}`, import.meta.url).href;
  })));
}

/** Resolves once fonts + canvas backend are ready. Await before drawing. */
export const PLATFORM_READY = (IS_NODE ? nodeSetup() : browserSetup()).then(() => true);

export function createCanvas(w, h) {
  if (!createCanvasImpl) throw new Error('PLATFORM_NOT_READY: await PLATFORM_READY first');
  return createCanvasImpl(w, h);
}
