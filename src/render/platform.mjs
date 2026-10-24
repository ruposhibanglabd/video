/**
 * Platform adapter (Node @napi-rs/canvas + Browser <canvas>).
 * Loads Noto Sans Bengali + Inter fonts AND the 6 studio product photographs
 * deterministically before rendering begins.
 */
const IS_NODE =
  typeof process !== 'undefined' && !!process.versions?.node && typeof document === 'undefined';

export const IS_BROWSER = !IS_NODE;
export const FONT_DIR = 'fonts/';
export const PRODUCT_DIR = 'products/';

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

const PRODUCT_FILES = {
  panjabi: 'fashion-panjabi.jpg',
  blazer: 'fashion-blazer.jpg',
  watch: 'watch-chrono.jpg',
  serum: 'cosmetics-serum.jpg',
  boot: 'footwear-boot.jpg',
  laptop: 'tech-laptop.jpg',
};

export const IMAGES = {};

let createCanvasImpl = null;

async function nodeSetup() {
  const napi = await import('@napi-rs/canvas');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const fontDir = path.join(root, 'assets', 'fonts');
  for (const [file, family] of FONT_FILES) {
    try {
      napi.GlobalFonts.registerFromPath(path.join(fontDir, file), family);
    } catch (err) {
      console.warn(`[font] ${file}: ${err.message}`);
    }
  }
  const prodDir = path.join(root, 'assets', 'products');
  await Promise.all(
    Object.entries(PRODUCT_FILES).map(async ([key, file]) => {
      try {
        IMAGES[key] = await napi.loadImage(path.join(prodDir, file));
      } catch (err) {
        console.warn(`[image] ${file}: ${err.message}`);
      }
    }),
  );
  createCanvasImpl = (w, h) => napi.createCanvas(w, h);
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
  const imgs = typeof Image !== 'undefined'
    ? Object.entries(PRODUCT_FILES).map(
      ([key, file]) =>
        new Promise((resolve) => {
          const im = new Image();
          im.onload = () => {
            IMAGES[key] = im;
            resolve();
          };
          im.onerror = () => resolve();
          im.src = `${PRODUCT_DIR}${file}`;
        }),
    )
    : [];
  await Promise.all([...faces, ...imgs]);
  try {
    await document.fonts.ready;
    await document.fonts.load('700 84px BN', 'মাত্র ৩০০০ টাকা');
    await document.fonts.load('400 40px Inter', 'CodePixel Web');
    await document.fonts.load('800 84px BN', 'কাস্টম ওয়েবসাইট');
  } catch { /* fallback safe */ }
}

export const PLATFORM_READY = (IS_NODE ? nodeSetup() : browserSetup()).then(() => true);

export function createCanvas(w, h) {
  if (!createCanvasImpl) throw new Error('PLATFORM_NOT_READY: await PLATFORM_READY first');
  return createCanvasImpl(w, h);
}
