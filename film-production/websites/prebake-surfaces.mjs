// High-Resolution Website, E-Commerce Flow, Admin Dashboard & Workflow Surface Builder
import { createCanvas } from '@napi-rs/canvas';
import {
  fontSpec,
  fillRoundRect,
  strokeRoundRect,
  roundRectPath,
  drawCoverImage,
  wrapTextLines,
  createPrebakedStage,
} from '../render/graphics-kit.mjs';
import { STORES } from './store-catalog.mjs';

function drawNavHeader(ctx, W, store, isDarkHero = false) {
  const navH = 74;
  ctx.fillStyle = isDarkHero ? store.heroBg : store.surface;
  ctx.fillRect(0, 0, W, navH);

  // Brand name left
  ctx.font = fontSpec(800, 24);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = isDarkHero ? '#FFFFFF' : store.ink;
  ctx.fillText(store.brand, 54, navH / 2);

  // Center navigation links
  ctx.font = fontSpec(600, 16);
  let nx = 340;
  for (let i = 0; i < Math.min(4, store.nav.length); i++) {
    ctx.fillStyle = i === 0
      ? (isDarkHero ? '#93C5FD' : store.accent)
      : (isDarkHero ? 'rgba(255,255,255,0.78)' : store.muted);
    ctx.fillText(store.nav[i], nx, navH / 2);
    nx += ctx.measureText(store.nav[i]).width + 34;
  }

  // Right search + cart pill
  const pillColor = isDarkHero ? 'rgba(255,255,255,0.12)' : store.bg;
  fillRoundRect(ctx, W - 238, 17, 184, 40, 20, pillColor);
  ctx.font = fontSpec(600, 14);
  ctx.fillStyle = isDarkHero ? '#FFFFFF' : store.ink;
  ctx.textAlign = 'center';
  ctx.fillText('সার্চ · কার্ট (০)', W - 146, navH / 2);

  ctx.fillStyle = isDarkHero ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)';
  ctx.fillRect(0, navH - 1, W, 1);
  return navH;
}

function drawArchImage(ctx, img, x, y, w, h) {
  ctx.save();
  const r = Math.min(w / 2, 165);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + w / 2, y + r, w / 2, Math.PI, 0, false);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, img, x, y, w, h, 0, 1.04);
  ctx.restore();
}

export function buildDesktopStoreSurface(store, images, activeCatIdx = 0) {
  const W = 1200;
  const H = 1520;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = store.bg;
  ctx.fillRect(0, 0, W, H);

  const heroImg = images.get(store.heroImg);
  const isDarkHero = store.layoutStyle === 'dark-hero-light-grid' || store.id === 'food' || store.id === 'jewel';
  const y0 = drawNavHeader(ctx, W, store, isDarkHero);

  let gridStartY = 560;

  if (store.layoutStyle === 'editorial-split') {
    // Full split fashion hero
    ctx.fillStyle = store.heroBg;
    ctx.fillRect(0, y0, W, 456);
    drawCoverImage(ctx, heroImg, W * 0.48, y0, W * 0.52, 456, 0, 1.03, 0.5, 0.25);
    // Subtle soft blend from left stone panel
    const fade = ctx.createLinearGradient(W * 0.45, y0, W * 0.58, y0);
    fade.addColorStop(0, store.heroBg);
    fade.addColorStop(1, 'rgba(241,234,224,0)');
    ctx.fillStyle = fade;
    ctx.fillRect(W * 0.44, y0, W * 0.16, 456);

    fillRoundRect(ctx, 56, y0 + 58, 200, 34, 17, store.accentSoft);
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = store.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.heroTag, 156, y0 + 75);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 40);
    ctx.fillStyle = store.ink;
    const hLines = wrapTextLines(ctx, store.heroTitle, 470).slice(0, 3);
    hLines.forEach((l, i) => ctx.fillText(l, 56, y0 + 114 + i * 54));

    const subY = y0 + 120 + hLines.length * 54;
    ctx.font = fontSpec(400, 18);
    ctx.fillStyle = store.muted;
    wrapTextLines(ctx, store.heroSub, 455).slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, subY + i * 28));

    fillRoundRect(ctx, 56, y0 + 362, 208, 52, 12, store.accent);
    ctx.font = fontSpec(700, 17);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.cta, 160, y0 + 388);
    gridStartY = y0 + 486;
  } else if (store.layoutStyle === 'dark-hero-light-grid') {
    ctx.fillStyle = store.heroBg;
    ctx.fillRect(0, y0, W, 440);
    drawCoverImage(ctx, heroImg, W * 0.46, y0 + 24, W * 0.49, 392, 24, 1.05);

    fillRoundRect(ctx, 56, y0 + 52, 210, 34, 17, 'rgba(59,130,246,0.22)');
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = '#93C5FD';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.heroTag, 161, y0 + 69);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 39);
    ctx.fillStyle = '#FFFFFF';
    const hLines = wrapTextLines(ctx, store.heroTitle, 450).slice(0, 3);
    hLines.forEach((l, i) => ctx.fillText(l, 56, y0 + 108 + i * 52));

    ctx.font = fontSpec(400, 17);
    ctx.fillStyle = 'rgba(226,232,240,0.84)';
    wrapTextLines(ctx, store.heroSub, 440).slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, y0 + 272 + i * 27));

    fillRoundRect(ctx, 56, y0 + 346, 198, 50, 25, store.accent);
    ctx.font = fontSpec(700, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.cta, 155, y0 + 371);
    gridStartY = y0 + 472;
  } else if (store.layoutStyle === 'botanical-arch') {
    ctx.fillStyle = store.heroBg;
    ctx.fillRect(0, y0, W, 448);
    drawArchImage(ctx, heroImg, W - 455, y0 + 26, 385, 422);

    const textCol = store.id === 'jewel' ? '#FFFFFF' : store.ink;
    const subCol = store.id === 'jewel' ? 'rgba(255,255,255,0.82)' : store.muted;

    fillRoundRect(ctx, 60, y0 + 58, 215, 34, 17, store.accentSoft);
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = store.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.heroTag, 167, y0 + 75);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 40);
    ctx.fillStyle = textCol;
    const hLines = wrapTextLines(ctx, store.heroTitle, 560).slice(0, 3);
    hLines.forEach((l, i) => ctx.fillText(l, 60, y0 + 116 + i * 54));

    ctx.font = fontSpec(400, 18);
    ctx.fillStyle = subCol;
    wrapTextLines(ctx, store.heroSub, 540).slice(0, 2).forEach((l, i) => ctx.fillText(l, 60, y0 + 282 + i * 28));

    fillRoundRect(ctx, 60, y0 + 356, 214, 50, 25, store.accent);
    ctx.font = fontSpec(700, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.cta, 167, y0 + 381);
    gridStartY = y0 + 478;
  } else if (store.layoutStyle === 'architectural-wide') {
    // Full-bleed interior lookbook card with floating info panel
    drawCoverImage(ctx, heroImg, 48, y0 + 22, W - 96, 420, 26, 1.02, 0.5, 0.58);
    fillRoundRect(ctx, 84, y0 + 62, 500, 340, 22, 'rgba(255,255,255,0.93)');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = store.accent;
    ctx.fillText(store.heroTag, 114, y0 + 92);

    ctx.font = fontSpec(800, 35);
    ctx.fillStyle = store.ink;
    wrapTextLines(ctx, store.heroTitle, 440).slice(0, 3).forEach((l, i) => ctx.fillText(l, 114, y0 + 124 + i * 47));

    ctx.font = fontSpec(400, 16);
    ctx.fillStyle = store.muted;
    wrapTextLines(ctx, store.heroSub, 430).slice(0, 2).forEach((l, i) => ctx.fillText(l, 114, y0 + 268 + i * 25));

    fillRoundRect(ctx, 114, y0 + 332, 194, 46, 12, store.accent);
    ctx.font = fontSpec(700, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.cta, 211, y0 + 355);
    gridStartY = y0 + 474;
  } else {
    // Bold inset card banner (Footwear & Restaurant)
    fillRoundRect(ctx, 48, y0 + 22, W - 96, 420, 28, store.heroBg);
    drawCoverImage(ctx, heroImg, W * 0.52, y0 + 42, W * 0.42, 380, 22, 1.04);

    const textCol = store.id === 'food' ? '#FFFFFF' : store.ink;
    const subCol = store.id === 'food' ? 'rgba(255,237,213,0.85)' : store.muted;

    fillRoundRect(ctx, 90, y0 + 64, 236, 34, 17, store.accentSoft);
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = store.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.heroTag, 208, y0 + 81);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 38);
    ctx.fillStyle = textCol;
    wrapTextLines(ctx, store.heroTitle, 470).slice(0, 3).forEach((l, i) => ctx.fillText(l, 90, y0 + 120 + i * 50));

    ctx.font = fontSpec(400, 17);
    ctx.fillStyle = subCol;
    wrapTextLines(ctx, store.heroSub, 460).slice(0, 2).forEach((l, i) => ctx.fillText(l, 90, y0 + 276 + i * 26));

    fillRoundRect(ctx, 90, y0 + 346, 228, 50, 14, store.accent);
    ctx.font = fontSpec(700, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(store.cta, 204, y0 + 371);
    gridStartY = y0 + 474;
  }

  // Category filter bar
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = fontSpec(800, 24);
  ctx.fillStyle = store.ink;
  ctx.fillText(`${store.categoryBn} — নির্বাচিত পণ্যসমূহ`, 54, gridStartY + 18);

  let cxPill = 54;
  const pillY = gridStartY + 52;
  store.nav.slice(0, 5).forEach((cat, idx) => {
    ctx.font = fontSpec(600, 15);
    const pw = ctx.measureText(cat).width + 38;
    const active = idx === activeCatIdx;
    fillRoundRect(ctx, cxPill, pillY, pw, 38, 19, active ? store.accent : store.surface);
    strokeRoundRect(ctx, cxPill, pillY, pw, 38, 19, active ? store.accent : 'rgba(15,23,42,0.10)', 1.2);
    ctx.fillStyle = active ? '#FFFFFF' : store.ink;
    ctx.textAlign = 'center';
    ctx.fillText(cat, cxPill + pw / 2, pillY + 19);
    cxPill += pw + 14;
  });

  // Product Cards Grid (distinct 2-column horizontal menu cards for Restaurant vs 4/2 architectural cards)
  const cardsY = pillY + 62;
  const products = store.products;

  if (store.layoutStyle === 'restaurant-menu') {
    // 2x2 horizontal restaurant dish cards
    const cw = 532;
    const ch = 228;
    products.slice(0, 4).forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 54 + col * (cw + 28);
      const y = cardsY + row * (ch + 24);
      fillRoundRect(ctx, x, y, cw, ch, 20, store.surface);
      strokeRoundRect(ctx, x, y, cw, ch, 20, 'rgba(15,23,42,0.08)', 1.2);
      drawCoverImage(ctx, images.get(p.img), x + 16, y + 16, 196, ch - 32, 14, 1.04);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = fontSpec(700, 13);
      ctx.fillStyle = store.accent;
      ctx.fillText(p.tag, x + 232, y + 26);

      ctx.font = fontSpec(700, 20);
      ctx.fillStyle = store.ink;
      wrapTextLines(ctx, p.name, 276).slice(0, 2).forEach((l, li) => ctx.fillText(l, x + 232, y + 54 + li * 28));

      ctx.font = fontSpec(800, 23);
      ctx.fillStyle = store.ink;
      ctx.fillText(p.price, x + 232, y + 128);

      fillRoundRect(ctx, x + 232, y + 166, 168, 40, 10, store.accent);
      ctx.font = fontSpec(700, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+ অর্ডার যোগ করুন', x + 316, y + 186);
    });
  } else {
    // Clean 2-row x 2-column rich large product cards (highly legible inside 9:16 mobile frame!)
    const cols = products.length >= 4 ? 2 : 2;
    const cw = 532;
    const ch = 392;
    products.slice(0, 4).forEach((p, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = 54 + col * (cw + 28);
      const y = cardsY + row * (ch + 24);

      fillRoundRect(ctx, x, y, cw, ch, 22, store.surface);
      strokeRoundRect(ctx, x, y, cw, ch, 22, 'rgba(15,23,42,0.08)', 1.2);
      drawCoverImage(ctx, images.get(p.img), x + 16, y + 16, cw - 32, 246, 15, 1.02, 0.5, 0.35);

      // Clean stock pill top-right
      fillRoundRect(ctx, x + cw - 122, y + 28, 92, 28, 14, 'rgba(255,255,255,0.92)');
      ctx.font = fontSpec(700, 12);
      ctx.fillStyle = '#0F766E';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('স্টকে আছে', x + cw - 76, y + 42);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = fontSpec(600, 14);
      ctx.fillStyle = store.accent;
      ctx.fillText(p.tag, x + 24, y + 278);

      ctx.font = fontSpec(700, 21);
      ctx.fillStyle = store.ink;
      const tLines = wrapTextLines(ctx, p.name, cw - 48).slice(0, 1);
      ctx.fillText(tLines[0], x + 24, y + 302);

      ctx.font = fontSpec(800, 24);
      ctx.fillStyle = store.ink;
      ctx.fillText(p.price, x + 24, y + 340);

      fillRoundRect(ctx, x + cw - 178, y + 334, 154, 42, 11, store.accent);
      ctx.font = fontSpec(700, 15);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('বিস্তারিত দেখুন', x + cw - 101, y + 355);
    });
  }

  return c;
}

// Genuinely Reflowed Mobile Responsive Website Surface (400 x 1380)
export function buildMobileStoreSurface(store, images) {
  const W = 400;
  const H = 1380;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = store.bg;
  ctx.fillRect(0, 0, W, H);

  // Status bar + mobile app header
  ctx.fillStyle = store.surface;
  ctx.fillRect(0, 0, W, 94);
  // Hamburger lines
  for (let i = 0; i < 3; i++) {
    fillRoundRect(ctx, 22, 52 + i * 6.5, 20, 2.4, 1.2, store.ink);
  }
  ctx.font = fontSpec(800, 19);
  ctx.fillStyle = store.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(store.brand, W / 2, 60);

  fillRoundRect(ctx, W - 74, 44, 54, 32, 16, store.accentSoft);
  ctx.font = fontSpec(700, 12);
  ctx.fillStyle = store.accent;
  ctx.fillText('কার্ট ০', W - 47, 60);

  // Mobile vertical hero card
  const hy = 108;
  fillRoundRect(ctx, 16, hy, W - 32, 386, 22, store.heroBg);
  drawCoverImage(ctx, images.get(store.heroImg), 16, hy, W - 32, 226, 22, 1.04, 0.5, 0.3);

  const darkHero = store.layoutStyle === 'dark-hero-light-grid' || store.id === 'food' || store.id === 'jewel';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 22);
  ctx.fillStyle = darkHero ? '#FFFFFF' : store.ink;
  wrapTextLines(ctx, store.heroTitle, W - 68).slice(0, 2).forEach((l, i) => ctx.fillText(l, 34, hy + 242 + i * 31));

  fillRoundRect(ctx, 34, hy + 322, 168, 44, 12, store.accent);
  ctx.font = fontSpec(700, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(store.cta, 118, hy + 344);

  // Horizontal scrollable pills
  let px = 16;
  const py = hy + 406;
  store.nav.slice(0, 3).forEach((cat, idx) => {
    ctx.font = fontSpec(600, 13);
    const pw = ctx.measureText(cat).width + 28;
    fillRoundRect(ctx, px, py, pw, 34, 17, idx === 0 ? store.accent : store.surface);
    strokeRoundRect(ctx, px, py, pw, 34, 17, 'rgba(15,23,42,0.10)', 1);
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : store.ink;
    ctx.fillText(cat, px + pw / 2, py + 17);
    px += pw + 8;
  });

  // 2-column responsive mobile product cards
  const gy = py + 50;
  const cw = 178;
  const ch = 268;
  store.products.slice(0, 4).forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 16 + col * (cw + 12);
    const y = gy + row * (ch + 14);

    fillRoundRect(ctx, x, y, cw, ch, 16, store.surface);
    strokeRoundRect(ctx, x, y, cw, ch, 16, 'rgba(15,23,42,0.08)', 1);
    drawCoverImage(ctx, images.get(p.img), x + 8, y + 8, cw - 16, 152, 11, 1.03, 0.5, 0.35);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(700, 14);
    ctx.fillStyle = store.ink;
    wrapTextLines(ctx, p.name, cw - 20).slice(0, 2).forEach((l, li) => ctx.fillText(l, x + 10, y + 168 + li * 19));

    ctx.font = fontSpec(800, 16);
    ctx.fillStyle = store.accent;
    ctx.fillText(p.price, x + 10, y + 236);
  });

  // Bottom sticky mobile navigation bar
  fillRoundRect(ctx, 16, H - 72, W - 32, 54, 27, '#0F172A');
  ctx.font = fontSpec(600, 13);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ['হোম', 'ক্যাটাগরি', 'সার্চ', 'অর্ডার'].forEach((item, i) => {
    ctx.fillStyle = i === 0 ? '#8DEBFF' : 'rgba(255,255,255,0.78)';
    ctx.fillText(item, 62 + i * 92, H - 45);
  });

  return c;
}

// Tablet Surface (800 x 1140) for Scene 08 Responsive Showcase
export function buildTabletStoreSurface(store, images) {
  const W = 800;
  const H = 1140;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = store.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = store.surface;
  ctx.fillRect(0, 0, W, 68);
  ctx.font = fontSpec(800, 22);
  ctx.fillStyle = store.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(store.brand, 36, 34);

  ctx.font = fontSpec(600, 15);
  store.nav.slice(0, 4).forEach((n, i) => {
    ctx.fillStyle = i === 0 ? store.accent : store.muted;
    ctx.fillText(n, 290 + i * 118, 34);
  });

  fillRoundRect(ctx, 32, 86, W - 64, 330, 22, store.heroBg);
  drawCoverImage(ctx, images.get(store.heroImg), W * 0.48, 86, W * 0.48, 330, 22, 1.03, 0.5, 0.28);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 30);
  ctx.fillStyle = store.ink;
  wrapTextLines(ctx, store.heroTitle, 320).slice(0, 3).forEach((l, i) => ctx.fillText(l, 58, 128 + i * 42));

  fillRoundRect(ctx, 58, 336, 178, 44, 11, store.accent);
  ctx.font = fontSpec(700, 15);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(store.cta, 147, 358);

  // 2-column tablet grid
  const cw = 356;
  const ch = 310;
  store.products.slice(0, 4).forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 32 + col * (cw + 24);
    const y = 442 + row * (ch + 20);
    fillRoundRect(ctx, x, y, cw, ch, 18, store.surface);
    strokeRoundRect(ctx, x, y, cw, ch, 18, 'rgba(15,23,42,0.08)', 1);
    drawCoverImage(ctx, images.get(p.img), x + 12, y + 12, cw - 24, 198, 12, 1.03, 0.5, 0.35);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(700, 18);
    ctx.fillStyle = store.ink;
    ctx.fillText(wrapTextLines(ctx, p.name, cw - 28)[0], x + 14, y + 224);
    ctx.font = fontSpec(800, 20);
    ctx.fillStyle = store.accent;
    ctx.fillText(p.price, x + 14, y + 262);
  });

  return c;
}

// Scene 05: Interactive Product Detail Surface (selectedSizeIdx: 0='M', 1='L', 2='XL')
export function buildProductDetailSurface(store, images, selectedSizeIdx = 1) {
  const W = 940;
  const H = 1120;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  drawNavHeader(ctx, W, store, false);

  const p = store.products[1]; // Maroon Panjabi
  drawCoverImage(ctx, images.get(p.img), 44, 108, 410, 520, 22, 1.02, 0.5, 0.3);

  // Secondary thumbnail previews
  ['fashion-panjabi-1.jpg', 'fashion-saree-2.jpg', 'fashion-kurti-3.jpg'].forEach((im, i) => {
    drawCoverImage(ctx, images.get(im), 44 + i * 142, 646, 126, 126, 14, 1.05);
    if (i === 0) strokeRoundRect(ctx, 44, 646, 126, 126, 14, store.accent, 3);
  });

  const rx = 490;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  fillRoundRect(ctx, rx, 114, 156, 32, 16, '#E6F4F1');
  ctx.font = fontSpec(700, 14);
  ctx.fillStyle = '#0F766E';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('● স্টকে প্রস্তুত আছে', rx + 78, 130);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 32);
  ctx.fillStyle = store.ink;
  wrapTextLines(ctx, p.name, 405).slice(0, 2).forEach((l, i) => ctx.fillText(l, rx, 166 + i * 44));

  ctx.font = fontSpec(800, 38);
  ctx.fillStyle = store.accent;
  ctx.fillText(p.price, rx, 268);

  // Specifications box
  fillRoundRect(ctx, rx, 330, 404, 150, 16, '#FFFFFF');
  strokeRoundRect(ctx, rx, 330, 404, 150, 16, 'rgba(15,23,42,0.08)', 1.2);
  ctx.font = fontSpec(600, 16);
  ctx.fillStyle = '#475569';
  const specs = [
    '• ফেব্রিক: ১০০% প্রিমিয়াম কটন-সিল্ক ব্লেন্ড',
    '• কলার ও প্ল্যাকেটে সূক্ষ্ম এমব্রয়ডারি কাজ',
    '• আরামদায়ক রেগুলার ফিট · ক্যাশ অন ডেলিভারি',
  ];
  specs.forEach((s, i) => ctx.fillText(s, rx + 20, 352 + i * 40));

  // Size selector pills
  ctx.font = fontSpec(700, 18);
  ctx.fillStyle = store.ink;
  ctx.fillText('সাইজ নির্বাচন করুন:', rx, 504);

  const sizes = ['M (40)', 'L (42)', 'XL (44)'];
  sizes.forEach((sz, idx) => {
    const sx = rx + idx * 124;
    const active = idx === selectedSizeIdx;
    fillRoundRect(ctx, sx, 542, 110, 52, 14, active ? store.accent : '#FFFFFF');
    strokeRoundRect(ctx, sx, 542, 110, 52, 14, active ? store.accent : 'rgba(15,23,42,0.16)', 2);
    ctx.font = fontSpec(700, 18);
    ctx.fillStyle = active ? '#FFFFFF' : store.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sz, sx + 55, 568);
  });

  // Action buttons
  fillRoundRect(ctx, rx, 624, 404, 62, 16, store.accent);
  ctx.font = fontSpec(800, 21);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('এখনই অর্ডার করুন  →', rx + 202, 655);

  fillRoundRect(ctx, rx, 702, 404, 56, 16, '#FFFFFF');
  strokeRoundRect(ctx, rx, 702, 404, 56, 16, store.accent, 2);
  ctx.font = fontSpec(700, 19);
  ctx.fillStyle = store.accent;
  ctx.fillText('কার্টে যোগ করুন', rx + 202, 730);

  // Delivery info bar at bottom
  fillRoundRect(ctx, 44, 810, W - 88, 250, 22, '#FFFFFF');
  strokeRoundRect(ctx, 44, 810, W - 88, 250, 22, 'rgba(15,23,42,0.08)', 1.2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 22);
  ctx.fillStyle = store.ink;
  ctx.fillText('পণ্যের বিবরণ ও ডেলিভারি তথ্য (ডেমো প্রদর্শনী)', 76, 842);
  ctx.font = fontSpec(400, 18);
  ctx.fillStyle = '#475569';
  const notes = [
    '• ঢাকা শহরে ও সারাদেশে হোম ডেলিভারি অপশন যুক্ত করার ব্যবস্থা।',
    '• প্রোডাক্টের সাইজ চার্ট, একাধিক ছবি ও স্টক স্ট্যাটাস স্পষ্টভাবে দেখানো যায়।',
    '• গ্রাহক মোবাইল থেকেই খুব সহজে অর্ডার সম্পন্ন করতে পারেন।',
  ];
  notes.forEach((n, i) => ctx.fillText(n, 76, 892 + i * 44));

  return c;
}

// Scene 05 Step 6: Clean Checkout Form Demonstration Surface
export function buildCheckoutSurface(store, images, submitted = false) {
  const W = 940;
  const H = 1060;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, W, H);

  drawNavHeader(ctx, W, store, false);

  // Demo badge
  fillRoundRect(ctx, 44, 96, W - 88, 52, 14, '#EFF6FF');
  strokeRoundRect(ctx, 44, 96, W - 88, 52, 14, '#BFDBFE', 1.2);
  ctx.font = fontSpec(700, 17);
  ctx.fillStyle = '#1D4ED8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('চেকআউট ডেমো প্রবাহ — গ্রাহকের অর্ডার তথ্য পূরণের নমুনা', W / 2, 122);

  // Left: Customer delivery form card
  fillRoundRect(ctx, 44, 170, 500, 620, 22, '#FFFFFF');
  strokeRoundRect(ctx, 44, 170, 500, 620, 22, 'rgba(15,23,42,0.08)', 1.2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 24);
  ctx.fillStyle = '#0F172A';
  ctx.fillText('ডেলিভারি তথ্য দিন', 74, 200);

  const fields = [
    ['গ্রাহকের নাম', 'তানভীর আহমেদ'],
    ['মোবাইল নম্বর', '017XXXXXXXX (নমুনা নম্বর)'],
    ['ডেলিভারি ঠিকানা', 'বাড়ি ১২, রোড ৭, ধানমন্ডি, ঢাকা'],
    ['ডেলিভারি এলাকা', 'ঢাকা সিটি (৳ ৭০)'],
  ];
  fields.forEach(([label, val], i) => {
    const fy = 258 + i * 114;
    ctx.font = fontSpec(600, 15);
    ctx.fillStyle = '#64748B';
    ctx.fillText(label, 74, fy);
    fillRoundRect(ctx, 74, fy + 28, 440, 56, 12, '#F8FAFC');
    strokeRoundRect(ctx, 74, fy + 28, 440, 56, 12, '#CBD5E1', 1.4);
    ctx.font = fontSpec(600, 18);
    ctx.fillStyle = '#0F172A';
    ctx.fillText(val, 94, fy + 44);
  });

  // Right: Order summary card
  fillRoundRect(ctx, 568, 170, 328, 620, 22, '#FFFFFF');
  strokeRoundRect(ctx, 568, 170, 328, 620, 22, 'rgba(15,23,42,0.08)', 1.2);

  ctx.font = fontSpec(800, 22);
  ctx.fillStyle = '#0F172A';
  ctx.fillText('অর্ডার সামারি', 596, 200);

  drawCoverImage(ctx, images.get('fashion-panjabi-1.jpg'), 596, 250, 92, 112, 12, 1.05);
  ctx.font = fontSpec(700, 17);
  ctx.fillStyle = '#0F172A';
  wrapTextLines(ctx, 'মেরুন কটন-সিল্ক পাঞ্জাবি (সাইজ: L)', 174).slice(0, 3).forEach((l, i) => ctx.fillText(l, 704, 254 + i * 24));
  ctx.font = fontSpec(800, 19);
  ctx.fillStyle = store.accent;
  ctx.fillText('৳ ২,৮৫০ × ১', 704, 334);

  const summaryRows = [
    ['সাবটোটাল', '৳ ২,৮৫০'],
    ['ডেলিভারি চার্জ', '৳ ৭০'],
    ['সর্বমোট প্রদেয়', '৳ ২,৯২০'],
  ];
  summaryRows.forEach(([k, v], i) => {
    const ry = 408 + i * 54;
    if (i === 2) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(596, ry - 12, 272, 1.5);
    }
    ctx.font = fontSpec(i === 2 ? 800 : 600, i === 2 ? 20 : 17);
    ctx.fillStyle = i === 2 ? '#0F172A' : '#64748B';
    ctx.textAlign = 'left';
    ctx.fillText(k, 596, ry);
    ctx.textAlign = 'right';
    ctx.fillText(v, 868, ry);
  });

  fillRoundRect(ctx, 596, 600, 272, 62, 16, submitted ? '#059669' : store.accent);
  ctx.font = fontSpec(800, 19);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(submitted ? '✓ ডেমো অর্ডার গৃহীত হয়েছে' : 'অর্ডার কনফার্ম করুন', 732, 631);

  if (submitted) {
    fillRoundRect(ctx, 44, 816, W - 88, 178, 22, '#ECFDF5');
    strokeRoundRect(ctx, 44, 816, W - 88, 178, 22, '#6EE7B7', 2);
    ctx.font = fontSpec(800, 26);
    ctx.fillStyle = '#065F46';
    ctx.fillText('✓ ধন্যবাদ! আপনার ডেমো অর্ডার #CP-1048 সফলভাবে নথিভুক্ত হয়েছে', W / 2, 874);
    ctx.font = fontSpec(600, 18);
    ctx.fillStyle = '#047857';
    ctx.fillText('অর্ডারটি এখন অ্যাডমিন প্যানেলের অর্ডার তালিকায় সঙ্গে সঙ্গে দেখা যাবে।', W / 2, 932);
  }

  return c;
}

// Scene 06: Executive Admin Panel Surface (mode: 'overview' | 'products' | 'orders')
export function buildAdminPanelSurface(mode, images) {
  const W = 1120;
  const H = 980;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, W, H);

  // Left navy sidebar
  fillRoundRect(ctx, 0, 0, 248, H, 0, '#081426');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = fontSpec(800, 22);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('CodePixel', 28, 48);
  ctx.fillStyle = '#8DEBFF';
  ctx.fillText(' Admin', 28 + ctx.measureText('CodePixel').width, 48);

  const menu = [
    ['overview', 'ড্যাশবোর্ড সারসংক্ষেপ'],
    ['products', 'প্রোডাক্ট ম্যানেজমেন্ট'],
    ['orders', 'অর্ডার ও স্ট্যাটাস'],
    ['cat', 'ক্যাটাগরি বিন্যাস'],
    ['settings', 'সাইট সেটিংস'],
  ];
  menu.forEach(([key, label], i) => {
    const my = 118 + i * 62;
    const active = key === mode;
    if (active) {
      fillRoundRect(ctx, 16, my, 216, 48, 12, '#397BFF');
    }
    ctx.font = fontSpec(active ? 700 : 600, 16);
    ctx.fillStyle = active ? '#FFFFFF' : 'rgba(226,232,240,0.75)';
    ctx.fillText(label, 34, my + 24);
  });

  // Top bar
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(248, 0, W - 248, 76);
  ctx.fillStyle = '#0F172A';
  ctx.font = fontSpec(800, 24);
  const titles = {
    overview: 'ব্যবসা ব্যবস্থাপনা ড্যাশবোর্ড',
    products: 'প্রোডাক্ট তালিকা ও সম্পাদনা প্যানেল',
    orders: 'অর্ডার তালিকা ও স্ট্যাটাস ব্যবস্থাপনা',
  };
  ctx.fillText(titles[mode], 284, 38);

  // Honest sample data badge
  fillRoundRect(ctx, W - 270, 20, 236, 36, 18, '#EFF6FF');
  strokeRoundRect(ctx, W - 270, 20, 236, 36, 18, '#93C5FD', 1.2);
  ctx.font = fontSpec(700, 14);
  ctx.fillStyle = '#1D4ED8';
  ctx.textAlign = 'center';
  ctx.fillText('ডেমো ইন্টারফেস · নমুনা তথ্য', W - 152, 38);

  const mx = 282;
  const mw = W - 282 - 34;

  if (mode === 'overview') {
    const kpis = [
      ['আজকের নমুনা অর্ডার', '১৮ টি', '#397BFF'],
      ['মোট তালিকাভুক্ত পণ্য', '৪৮ টি', '#0D9488'],
      ['পেন্ডিং ভেরিফিকেশন', '০৫ টি', '#D97706'],
      ['ডেলিভারি প্রস্তুত', '১৩ টি', '#059669'],
    ];
    const kw = (mw - 42) / 4;
    kpis.forEach(([label, val, col], i) => {
      const kx = mx + i * (kw + 14);
      fillRoundRect(ctx, kx, 104, kw, 134, 18, '#FFFFFF');
      strokeRoundRect(ctx, kx, 104, kw, 134, 18, 'rgba(15,23,42,0.07)', 1);
      fillRoundRect(ctx, kx + 20, 124, 42, 6, 3, col);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = fontSpec(600, 15);
      ctx.fillStyle = '#64748B';
      ctx.fillText(label, kx + 20, 146);
      ctx.font = fontSpec(800, 34);
      ctx.fillStyle = '#0F172A';
      ctx.fillText(val, kx + 20, 182);
    });

    // Weekly order bar chart card
    fillRoundRect(ctx, mx, 264, mw, 340, 20, '#FFFFFF');
    strokeRoundRect(ctx, mx, 264, mw, 340, 20, 'rgba(15,23,42,0.07)', 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillText('সাপ্তাহিক অর্ডার প্রবাহ (ডেমো চার্ট)', mx + 28, 292);

    const days = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
    const vals = [0.52, 0.68, 0.61, 0.79, 0.74, 0.91, 0.85];
    days.forEach((d, i) => {
      const bx = mx + 58 + i * 104;
      const maxH = 190;
      const bh = maxH * vals[i];
      fillRoundRect(ctx, bx, 540 - maxH, 54, maxH, 12, '#F1F5F9');
      const bg = ctx.createLinearGradient(0, 540 - bh, 0, 540);
      bg.addColorStop(0, '#397BFF');
      bg.addColorStop(1, '#102544');
      fillRoundRect(ctx, bx, 540 - bh, 54, bh, 12, bg);
      ctx.font = fontSpec(600, 15);
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(d, bx + 27, 554);
    });

    // Recent orders mini-table
    fillRoundRect(ctx, mx, 628, mw, 316, 20, '#FFFFFF');
    strokeRoundRect(ctx, mx, 628, mw, 316, 20, 'rgba(15,23,42,0.07)', 1);
    ctx.textAlign = 'left';
    ctx.font = fontSpec(800, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillText('সাম্প্রতিক অর্ডার তালিকা', mx + 28, 654);

    const rows = [
      ['#CP-1048', 'তানভীর আহমেদ', 'মেরুন কটন-সিল্ক পাঞ্জাবি', '৳ ২,৯২০', 'নতুন অর্ডার', '#DBEAFE', '#1D4ED8'],
      ['#CP-1047', 'ফারজানা রহমান', 'আইভরি জামদানি শাড়ি', '৳ ৪,২৭০', 'কনফার্মড', '#DCFCE7', '#15803D'],
      ['#CP-1046', 'মাহমুদুল হাসান', 'ক্রোনোগ্রাফ স্টিল ওয়াচ', '৳ ৫,৪৭০', 'প্যাকিং সম্পন্ন', '#FEF3C7', '#B45309'],
    ];
    rows.forEach((r, idx) => {
      const ry = 716 + idx * 68;
      fillRoundRect(ctx, mx + 24, ry, mw - 48, 56, 12, '#F8FAFC');
      ctx.font = fontSpec(700, 16);
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText(r[0], mx + 42, ry + 18);
      ctx.font = fontSpec(600, 16);
      ctx.fillText(r[1], mx + 158, ry + 18);
      ctx.fillStyle = '#475569';
      ctx.fillText(r[2], mx + 336, ry + 18);
      ctx.font = fontSpec(800, 16);
      ctx.fillStyle = '#0F172A';
      ctx.fillText(r[3], mx + 572, ry + 18);

      fillRoundRect(ctx, mx + mw - 186, ry + 11, 144, 34, 17, r[5]);
      ctx.font = fontSpec(700, 14);
      ctx.fillStyle = r[6];
      ctx.textAlign = 'center';
      ctx.fillText(r[4], mx + mw - 114, ry + 19);
    });
  } else if (mode === 'products') {
    // Left product catalog + Right live edit panel
    fillRoundRect(ctx, mx, 104, 468, 840, 20, '#FFFFFF');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillText('ক্যাটালগ পণ্যসমূহ', mx + 24, 130);

    const items = [
      ['fashion-panjabi-1.jpg', 'মেরুন কটন-সিল্ক পাঞ্জাবি', '৳ ২,৮৫০', 'স্টক: ২৪ টি'],
      ['fashion-saree-2.jpg', 'হ্যান্ডলুম আইভরি জামদানি', '৳ ৪,২০০', 'স্টক: ১২ টি'],
      ['watch-hero-1.jpg', 'মিডনাইট ক্রোনোগ্রাফ ওয়াচ', '৳ ৫,৪০০', 'স্টক: ০৯ টি'],
      ['shoe-hero-1.jpg', 'কগন্যাক লেদার অক্সফোর্ড', '৳ ৩,৪৫০', 'স্টক: ১৬ টি'],
    ];
    items.forEach((it, idx) => {
      const iy = 186 + idx * 176;
      const active = idx === 0;
      fillRoundRect(ctx, mx + 20, iy, 428, 154, 16, active ? '#EFF6FF' : '#F8FAFC');
      strokeRoundRect(ctx, mx + 20, iy, 428, 154, 16, active ? '#397BFF' : 'rgba(15,23,42,0.08)', active ? 2 : 1);
      drawCoverImage(ctx, images.get(it[0]), mx + 36, iy + 18, 108, 118, 12, 1.04);
      ctx.font = fontSpec(700, 18);
      ctx.fillStyle = '#0F172A';
      wrapTextLines(ctx, it[1], 265).slice(0, 2).forEach((l, li) => ctx.fillText(l, mx + 162, iy + 26 + li * 25));
      ctx.font = fontSpec(800, 19);
      ctx.fillStyle = '#2563EB';
      ctx.fillText(it[2], mx + 162, iy + 84);
      ctx.font = fontSpec(600, 14);
      ctx.fillStyle = '#0F766E';
      ctx.fillText(it[3], mx + 162, iy + 114);
    });

    // Right live edit card
    const ex = mx + 492;
    const ew = mw - 492;
    fillRoundRect(ctx, ex, 104, ew, 840, 20, '#FFFFFF');
    strokeRoundRect(ctx, ex, 104, ew, 840, 20, '#93C5FD', 1.5);
    ctx.font = fontSpec(800, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillText('প্রোডাক্ট সম্পাদনা ফর্ম', ex + 24, 130);

    drawCoverImage(ctx, images.get('fashion-panjabi-1.jpg'), ex + 24, 178, ew - 48, 250, 14, 1.02, 0.5, 0.3);

    const editFields = [
      ['পণ্যের নাম', 'মেরুন এমব্রয়ডারি কটন-সিল্ক পাঞ্জাবি'],
      ['বিক্রয় মূল্য (BDT)', '৳ ২,৮৫০'],
      ['উপলব্ধ সাইজ ভ্যারিয়েন্ট', 'M, L, XL'],
      ['স্টক স্ট্যাটাস', 'স্টকে আছে (২৪ পিস)'],
    ];
    editFields.forEach(([k, v], i) => {
      const fy = 452 + i * 94;
      ctx.font = fontSpec(600, 14);
      ctx.fillStyle = '#64748B';
      ctx.fillText(k, ex + 24, fy);
      fillRoundRect(ctx, ex + 24, fy + 24, ew - 48, 50, 10, '#F8FAFC');
      strokeRoundRect(ctx, ex + 24, fy + 24, ew - 48, 50, 10, '#CBD5E1', 1.2);
      ctx.font = fontSpec(700, 15);
      ctx.fillStyle = '#0F172A';
      ctx.fillText(wrapTextLines(ctx, v, ew - 76)[0], ex + 40, fy + 39);
    });

    fillRoundRect(ctx, ex + 24, 850, ew - 48, 56, 14, '#397BFF');
    ctx.font = fontSpec(800, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ পরিবর্তন সেভ করুন', ex + ew / 2, 878);
  } else {
    // Orders management detailed table
    fillRoundRect(ctx, mx, 104, mw, 840, 20, '#FFFFFF');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 22);
    ctx.fillStyle = '#0F172A';
    ctx.fillText('সকল অর্ডার ও স্ট্যাটাস আপডেট (নমুনা তালিকা)', mx + 28, 134);

    const orders = [
      ['#CP-1048', 'তানভীর আহমেদ · ধানমন্ডি, ঢাকা', 'মেরুন পাঞ্জাবি (L)', '৳ ২,৯২০', 'কনফার্মড ✓', '#DCFCE7', '#15803D'],
      ['#CP-1047', 'ফারজানা রহমান · উত্তরা, ঢাকা', 'আইভরি জামদানি শাড়ি', '৳ ৪,২৭০', 'প্যাকিং সম্পন্ন', '#DBEAFE', '#1D4ED8'],
      ['#CP-1046', 'মাহমুদুল হাসান · চট্টগ্রাম', 'ক্রোনোগ্রাফ ওয়াচ', '৳ ৫,৪৭০', 'ডিসপ্যাচ প্রস্তুত', '#FEF3C7', '#B45309'],
      ['#CP-1045', 'নুসরাত জাহান · সিলেট', 'স্কিনকেয়ার সিরাম সেট', '৳ ১,৫৭০', 'ডেলিভারি সম্পন্ন', '#ECFDF5', '#047857'],
      ['#CP-1044', 'রাশেদুল করিম · রাজশাহী', 'লেদার অক্সফোর্ড জুতা', '৳ ৩,৫৭০', 'ডেলিভারি সম্পন্ন', '#ECFDF5', '#047857'],
    ];
    orders.forEach((o, idx) => {
      const oy = 200 + idx * 138;
      const highlight = idx === 0;
      fillRoundRect(ctx, mx + 24, oy, mw - 48, 118, 16, highlight ? '#EFF6FF' : '#F8FAFC');
      strokeRoundRect(ctx, mx + 24, oy, mw - 48, 118, 16, highlight ? '#397BFF' : 'rgba(15,23,42,0.08)', highlight ? 2 : 1);

      ctx.font = fontSpec(800, 19);
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText(`${o[0]}  —  ${o[1]}`, mx + 46, oy + 24);

      ctx.font = fontSpec(600, 17);
      ctx.fillStyle = '#475569';
      ctx.fillText(`পণ্য: ${o[2]}   ·   মোট বিল: ${o[3]}`, mx + 46, oy + 68);

      fillRoundRect(ctx, mx + mw - 224, oy + 36, 176, 46, 23, o[5]);
      ctx.font = fontSpec(700, 15);
      ctx.fillStyle = o[6];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o[4], mx + mw - 136, oy + 59);
    });
  }

  return c;
}

export function buildAllPrebakedSurfaces(images) {
  const desktopStores = new Map();
  const mobileStores = new Map();
  const tabletStores = new Map();

  for (const store of STORES) {
    desktopStores.set(store.id, buildDesktopStoreSurface(store, images, 0));
    mobileStores.set(store.id, buildMobileStoreSurface(store, images));
  }
  tabletStores.set('fashion', buildTabletStoreSurface(STORES[0], images));

  return {
    stageNavy: createPrebakedStage(1080, 1920, 'navy'),
    stageLight: createPrebakedStage(1080, 1920, 'light'),
    desktopStores,
    mobileStores,
    tabletStores,
    desktopFiltered: buildDesktopStoreSurface(STORES[0], images, 2), // 'পাঞ্জাবি' active
    pdpSizeM: buildProductDetailSurface(STORES[0], images, 0),
    pdpSizeL: buildProductDetailSurface(STORES[0], images, 1),
    checkoutFill: buildCheckoutSurface(STORES[0], images, false),
    checkoutDone: buildCheckoutSurface(STORES[0], images, true),
    adminOverview: buildAdminPanelSurface('overview', images),
    adminProducts: buildAdminPanelSurface('products', images),
    adminOrders: buildAdminPanelSurface('orders', images),
    // Reusable scratch canvases for live scrolled viewports per frame (zero GC allocation!)
    scratchDesktopA: createCanvas(980, 680),
    scratchDesktopB: createCanvas(980, 680),
    scratchTablet: createCanvas(700, 920),
    scratchMobileA: createCanvas(430, 880),
    scratchMobileB: createCanvas(430, 880),
  };
}
