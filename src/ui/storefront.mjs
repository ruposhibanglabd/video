/**
 * Storefront UI library — fictional demo shop "AURUM" (watches & accessories).
 * Every screen is composed as crisp vector UI with bundled, locally loaded
 * product photography. No runtime network requests, fake reviews, or statistics;
 * a "ডেমো ডেটা" badge marks illustrative content.
 */
import { C, alpha, lin, text, fillRR, strokeRR, rr, circle, shadow, noShadow, icon, fontStr, clamp, lerp, easeOut, beat, line, withClip, createCanvas, drawWatch, drawBag, drawShoe, drawBottle, drawHeadphone, statusChip } from '../render/kit.mjs';
import { getStoreImage } from '../render/platform.mjs';

export const T = {
  cream: '#F7F3EB',
  paper: '#FFFFFF',
  ink: '#15181E',
  ink2: '#3D424C',
  muted: '#7C7768',
  line: '#E7E1D5',
  gold: '#B08A57',
  goldSoft: '#F0E4D2',
  green: '#1E9E74',
  red: '#C8503F',
};

export const PRODUCTS = [
  { name: 'Heritage Chrono', bn: 'হেরিটেজ ক্রোনো', price: 4890, old: 5990, type: 'watch', photo: 'leather', tone: { face: '#F4EEE2', bezel: '#C9A46A', strap: '#2A2118' }, tag: 'নতুন' },
  { name: 'Noir Automatic', bn: 'নয়্যার অটোমেটিক', price: 6450, old: null, type: 'watch', photo: 'noir', tone: { face: '#20242C', bezel: '#3A4250', strap: '#161A22', hands: '#EDEDED', accent: '#C9A46A' }, tag: 'প্রিমিয়াম' },
  { name: 'Aurum Leather', bn: 'অরাম লেদার', price: 3290, old: 3890, type: 'watch', photo: 'leather', tone: { face: '#FBF6EA', bezel: '#D8B77E', strap: '#5A3A26' }, tag: null },
  { name: 'Rose Petite', bn: 'রোজ পেটিট', price: 4150, old: null, type: 'watch', photo: 'leather', tone: { face: '#FBF1F2', bezel: '#D9A6A1', strap: '#B78480', accent: '#C98F89' }, tag: 'নতুন' },
  { name: 'Sport Steel', bn: 'স্পোর্ট স্টিল', price: 5290, old: 6290, type: 'watch', photo: 'noir', tone: { face: '#1C2530', bezel: '#B9C2CE', strap: '#7C8794', hands: '#F2F5F9', accent: '#36D7FF' }, tag: null },
  { name: 'Classic Mesh', bn: 'ক্লাসিক মেশ', price: 3990, old: null, type: 'watch', photo: 'leather', tone: { face: '#F8F2E6', bezel: '#CBB07B', strap: '#C7B08A' }, tag: null },
];

/** Draw a real product photograph using a cached, focal-point-aware cover crop. */
const PHOTO_CROPS = new Map();
export function photoCover(ctx, name, x, y, w, h, { radius = 0, focalX = 0.5, focalY = 0.5 } = {}) {
  const image = getStoreImage(name);
  if (!image) return false;
  const iw = image.width || image.naturalWidth;
  const ih = image.height || image.naturalHeight;
  if (!iw || !ih) return false;
  const cw = Math.max(1, Math.round(w)), ch = Math.max(1, Math.round(h));
  const fx = clamp(focalX), fy = clamp(focalY);
  const key = `${name}:${cw}x${ch}:${fx.toFixed(3)}:${fy.toFixed(3)}`;
  let crop = PHOTO_CROPS.get(key);
  if (!crop) {
    const targetRatio = cw / ch;
    const sourceRatio = iw / ih;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (sourceRatio > targetRatio) {
      sw = ih * targetRatio;
      sx = fx * (iw - sw);
    } else {
      sh = iw / targetRatio;
      sy = fy * (ih - sh);
    }
    crop = createCanvas(cw, ch);
    crop.getContext('2d').drawImage(image, sx, sy, sw, sh, 0, 0, cw, ch);
    PHOTO_CROPS.set(key, crop);
  }
  ctx.save();
  if (radius) { rr(ctx, x, y, w, h, radius); ctx.clip(); }
  ctx.drawImage(crop, x, y, w, h);
  ctx.restore();
  return true;
}

function productPhoto(ctx, product, x, y, w, h, opts = {}) {
  if (!photoCover(ctx, product?.photo || 'leather', x, y, w, h, opts)) {
    fillRR(ctx, x, y, w, h, opts.radius || 0, '#F0E4D2');
    drawWatch(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.31, product?.tone);
  }
}

/* ------------------------------------------------------------------ atoms */
export function demoBadge(ctx, x, y, size = 18, dark = false) {
  const label = 'ডেমো ডেটা';
  ctx.save();
  ctx.font = fontStr(size, 600, label);
  const w = ctx.measureText(label).width + 26;
  fillRR(ctx, x, y, w, size * 1.9, size * 0.95, dark ? 'rgba(255,255,255,0.14)' : 'rgba(21,24,30,0.62)');
  text(ctx, label, x + 13, y + size * 1.28, { size, weight: 600, color: '#FFFFFF' });
  ctx.restore();
}

export function sfLogo(ctx, x, y, size = 30, color = T.ink) {
  ctx.save();
  const s = size;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.14;
  ctx.beginPath();
  ctx.arc(x + s * 0.5, y + s * 0.5, s * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.5, y + s * 0.14);
  ctx.lineTo(x + s * 0.5, y + s * 0.86);
  ctx.stroke();
  text(ctx, 'AURUM', x + s * 1.25, y + s * 0.72, { size: s * 0.82, weight: 700, color, letterSpacing: s * 0.12 });
  ctx.restore();
}

export function sfStatusBar(ctx, w, dark = false) {
  const c = dark ? '#FFFFFF' : T.ink;
  text(ctx, '9:41', 26, 30, { size: 19, weight: 600, color: c });
  for (let i = 0; i < 4; i++) fillRR(ctx, w - 92 + i * 9, 24 - i * 2.5, 6, 9 + i * 2.5, 2, c);
  fillRR(ctx, w - 48, 20, 24, 12, 3.5, 'none');
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 1.8;
  rr(ctx, w - 48, 20, 26, 13, 4); ctx.stroke();
  fillRR(ctx, w - 45, 23, 17, 7, 2, c);
  fillRR(ctx, w - 20, 24, 3, 5, 1.5, c);
  ctx.restore();
}

export function sfNav(ctx, w, y, { cart = 1, search = false, dark = false } = {}) {
  const c = dark ? '#FFFFFF' : T.ink;
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(14,18,26,0.92)' : 'rgba(255,255,255,0.96)';
  ctx.fillRect(0, y, w, 74);
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : T.line;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y + 74); ctx.lineTo(w, y + 74); ctx.stroke();
  sfLogo(ctx, 22, y + 22, 28, c);
  icon(ctx, 'search', w - 116, y + 24, 26, c, 2.1);
  icon(ctx, 'bag', w - 62, y + 22, 30, c, 2.1);
  if (cart > 0) {
    circle(ctx, w - 44, y + 22, 9, T.gold);
    text(ctx, String(cart), w - 44, y + 26, { size: 12, weight: 700, color: '#fff', align: 'center' });
  }
  ctx.restore();
}

export function productCard(ctx, x, y, w, h, p, { dim = 1, scale = 1, press = 0, showBtn = true } = {}) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.globalAlpha *= dim;
  shadow(ctx, 'rgba(40,32,20,0.10)', 24, 10);
  fillRR(ctx, 0, 0, w, h, 18, T.paper);
  noShadow(ctx);
  strokeRR(ctx, 0, 0, w, h, 18, T.line, 1.2);
  // image plate
  const imgH = h * 0.6;
  ctx.save();
  rr(ctx, 0, 0, w, imgH, 18);
  ctx.clip();
  const dark = p.tone.face === '#20242C';
  const g = lin(ctx, 0, 0, 0, imgH, dark
    ? [[0, '#2C313B'], [1, '#1B1F26']]
    : [[0, mixHex(p.tone.face, '#FFFFFF', 0.35)], [1, mixHex(p.tone.face, '#8A7A58', 0.32)]]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, imgH);
  productPhoto(ctx, p, 0, 0, w, imgH, { radius: 18, focalX: 0.5, focalY: 0.5 });
  if (p.tag) {
    fillRR(ctx, 12, 12, 76, 28, 14, p.tag === 'নতুন' ? T.ink : T.gold);
    text(ctx, p.tag, 50, 31, { size: 15, weight: 600, color: '#fff', align: 'center' });
  }
  ctx.restore();
  // info
  text(ctx, p.bn, 16, imgH + 32, { size: 24, weight: 600, color: T.ink, maxWidth: w - 32 });
  const priceStr = `৳${fmt(p.price)}`;
  const pw = text(ctx, priceStr, 16, imgH + 68, { size: 25, weight: 700, color: T.ink });
  if (p.old) {
    ctx.save();
    ctx.font = fontStr(18, 500, `৳${fmt(p.old)}`);
    const ow = ctx.measureText(`৳${fmt(p.old)}`).width;
    ctx.restore();
    const ox = 16 + pw + 10;
    if (ox + ow < w - 58) {
      text(ctx, `৳${fmt(p.old)}`, ox, imgH + 69, { size: 18, weight: 500, color: T.muted });
      line(ctx, ox, imgH + 64, ox + ow, imgH + 64, 'rgba(124,119,104,0.7)', 1.3);
    }
  }
  if (showBtn) {
    const bw = 38;
    fillRR(ctx, w - bw - 12, imgH + 34, bw, bw, 12, press > 0.05 ? T.gold : T.ink);
    icon(ctx, 'plus', w - bw - 12 + 8, imgH + 34 + 8, 22, '#fff', 2.4);
  }
  ctx.restore();
}

function fmt(n) { return n.toLocaleString('en-US'); }
function mixHex(a, b, t) {
  const pa = parseInt(a.replace('#', ''), 16), pb = parseInt(b.replace('#', ''), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

/* ------------------------------------------------------------------ screens */
/** Home / hero screen. opts: { scroll, tapHero, tapCat, cart, toast } */
export function sfHome(ctx, w, h, o = {}) {
  const s = clamp(o.scroll || 0);
  const off = s * 430;
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(0, -off);
  // promo strip
  ctx.fillStyle = T.ink;
  ctx.fillRect(0, 0, w, 34);
  text(ctx, 'সারা দেশে ক্যাশ অন ডেলিভারি • ডেমো স্টোর', w / 2, 23, { size: 16, weight: 500, color: '#F3E9D6', align: 'center' });

  // hero
  const hy = 34 + 74;
  ctx.save();
  rr(ctx, 0, hy, w, 340, 0);
  ctx.clip();
  ctx.fillStyle = '#241E17';
  ctx.fillRect(0, hy, w, 340);
  if (photoCover(ctx, 'hero', 0, hy, w, 340, { focalX: 0.62, focalY: 0.55 })) {
    const shade = ctx.createLinearGradient(0, hy, w, hy);
    shade.addColorStop(0, 'rgba(10,12,15,0.70)');
    shade.addColorStop(0.48, 'rgba(10,12,15,0.38)');
    shade.addColorStop(1, 'rgba(10,12,15,0.04)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, hy, w, 340);
  } else {
    const g = ctx.createRadialGradient(w * 0.78, hy + 170, 30, w * 0.72, hy + 200, 300);
    g.addColorStop(0, 'rgba(201,164,106,0.38)');
    g.addColorStop(1, 'rgba(36,30,23,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, hy, w, 340);
    drawWatch(ctx, w * 0.78, hy + 200, 74, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
  }
  text(ctx, 'নতুন কালেকশন', 26, hy + 62, { size: 17, weight: 600, color: '#D9BE8F', letterSpacing: 1.2 });
  text(ctx, 'সময়ের', 26, hy + 118, { size: 44, weight: 700, color: '#FFFFFF' });
  text(ctx, 'নিজস্ব ছন্দ', 26, hy + 168, { size: 44, weight: 700, color: '#FFFFFF' });
  text(ctx, 'প্রিমিয়াম ঘড়ির নতুন সংগ্রহ', 26, hy + 200, { size: 18, weight: 500, color: 'rgba(255,255,255,0.7)' });
  fillRR(ctx, 26, hy + 228, 158, 48, 24, '#D9BE8F');
  text(ctx, 'সংগ্রহ দেখুন', 105, hy + 260, { size: 20, weight: 700, color: '#231C14', align: 'center' });
  ctx.restore();

  // category chips
  const cy = hy + 372;
  text(ctx, 'ক্যাটাগরি', 22, cy + 8, { size: 26, weight: 700, color: T.ink });
  text(ctx, 'সব দেখুন', w - 22, cy + 6, { size: 19, weight: 600, color: T.gold, align: 'right' });
  const cats = ['সব', 'ঘড়ি', 'স্টাইলিশ', 'কাপল', 'অ্যাকসেসরিজ'];
  let cx = 22;
  cats.forEach((c, i) => {
    ctx.font = fontStr(19, 600, c);
    const cw = ctx.measureText(c).width + 34;
    const active = i === (o.activeCat ?? 1);
    const tap = o.tapCat === i ? clamp((o.tapCatP ?? 0)) : 0;
    fillRR(ctx, cx, cy + 26, cw, 46, 23, active ? T.ink : T.paper);
    if (!active) strokeRR(ctx, cx, cy + 26, cw, 46, 23, T.line, 1.2);
    if (tap > 0) strokeRR(ctx, cx, cy + 26, cw + 8 * tap, 46, 23, T.gold, 2);
    text(ctx, c, cx + cw / 2, cy + 56, { size: 19, weight: 600, color: active ? '#fff' : T.ink2, align: 'center' });
    cx += cw + 12;
  });

  // product grid
  const gy = cy + 92;
  const cardW = (w - 22 * 2 - 16) / 2;
  const cardH = 268;
  PRODUCTS.slice(0, 4).forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    productCard(ctx, 22 + col * (cardW + 16), gy + row * (cardH + 16), cardW, cardH, p, {
      scale: 1 - (o.tapCard === i ? 0.03 * clamp(o.tapCardP || 0) : 0),
      press: o.tapCard === i ? clamp(o.tapCardP || 0) : 0,
    });
  });
  ctx.restore();

  sfNav(ctx, w, 34, { cart: o.cart ?? 0 });
  if (o.toast) {
    const a = clamp(o.toast);
    ctx.save();
    ctx.globalAlpha = a;
    shadow(ctx, 'rgba(0,0,0,0.3)', 30, 12);
    fillRR(ctx, 24, h - 118, w - 48, 66, 18, T.ink);
    noShadow(ctx);
    circle(ctx, 58, h - 85, 16, T.green);
    icon(ctx, 'check', 46, h - 97, 24, '#fff', 2.6);
    text(ctx, 'কার্টে যোগ হয়েছে', 86, h - 74, { size: 22, weight: 600, color: '#fff' });
    ctx.restore();
  }
}

/** Product detail screen */
export function sfProduct(ctx, w, h, o = {}) {
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  // back row
  icon(ctx, 'arrow', 22, 62, 26, T.ink);
  ctx.save(); ctx.translate(44, 62); ctx.rotate(Math.PI); ctx.restore();
  text(ctx, 'প্রোডাক্ট', w / 2, 74, { size: 21, weight: 600, color: T.ink, align: 'center' });
  icon(ctx, 'bag', w - 52, 60, 28, T.ink);
  // gallery
  const gy = 96;
  const gw = w - 36, gh = 322;
  const g = lin(ctx, 0, gy, 0, gy + gh, [[0, '#F6F0E4'], [1, '#E9DDC8']]);
  fillRR(ctx, 18, gy, gw, gh, 22, g);
  const zoom = 1 + 0.05 * clamp(o.zoom || 0);
  ctx.save();
  rr(ctx, 18, gy, gw, gh, 22); ctx.clip();
  const span = (o.swap || 0) * gw;
  for (let k = 0; k < 3; k++) {
    const px = 18 + (k - (o.swapPage ?? 0)) * gw + span;
    if (!photoCover(ctx, PRODUCTS[k].photo, px, gy, gw, gh, { radius: 22, focalY: 0.52 })) {
      drawWatch(ctx, px + gw / 2, gy + gh * 0.52, 96 * zoom, PRODUCTS[k].tone);
    }
  }
  ctx.restore();
  fillRR(ctx, 34, gy + 20, 86, 30, 15, 'rgba(255,255,255,0.86)');
  text(ctx, '১৮% ছাড়', 77, gy + 41, { size: 16, weight: 700, color: T.red, align: 'center' });
  // thumbs
  for (let i = 0; i < 3; i++) {
    const ty = gy + gh + 16;
    fillRR(ctx, 18 + i * 74, ty, 62, 62, 14, i === (o.thumb ?? 0) ? '#EFE5D2' : '#F6F1E7');
    photoCover(ctx, PRODUCTS[i].photo, 18 + i * 74, ty, 62, 62, { radius: 14 });
    strokeRR(ctx, 18 + i * 74, ty, 62, 62, 14, i === (o.thumb ?? 0) ? T.gold : T.line, i === (o.thumb ?? 0) ? 2 : 1);
  }
  text(ctx, '৩টি ছবি', w - 24, gy + gh + 44, { size: 16, weight: 500, color: T.muted, align: 'right' });

  // info
  const iy = gy + gh + 116;
  text(ctx, 'হেরিটেজ ক্রোনো', 24, iy, { size: 38, weight: 700, color: T.ink, maxWidth: w - 48 });
  text(ctx, 'Heritage Chrono • 40mm • স্টেইনলেস স্টিল', 24, iy + 30, { size: 18, weight: 500, color: T.muted, maxWidth: w - 48 });
  text(ctx, '৳4,890', 24, iy + 82, { size: 38, weight: 700, color: T.ink });
  text(ctx, '৳5,990', 24 + 122, iy + 80, { size: 21, weight: 500, color: T.muted });
  statusChip(ctx, 'স্টকে আছে', w - 132, iy - 34, 'green', { size: 16, h: 30 });

  // options
  const oy = iy + 122;
  text(ctx, 'কালার', 24, oy, { size: 18, weight: 600, color: T.ink2 });
  ['#2A2118', '#5A3A26', '#C9A46A'].forEach((c, i) => {
    circle(ctx, 30 + i * 44, oy + 28, 16, c);
    if (i === (o.color ?? 0)) {
      ctx.strokeStyle = T.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(30 + i * 44, oy + 28, 21, 0, 7); ctx.stroke();
    }
  });
  text(ctx, 'সাইজ', w / 2 + 24, oy, { size: 18, weight: 600, color: T.ink2 });
  ['40mm', '44mm'].forEach((sz, i) => {
    const bx = w / 2 + 24 + i * 82;
    fillRR(ctx, bx, oy + 10, 74, 38, 12, i === (o.size ?? 0) ? T.ink : T.paper);
    if (i !== (o.size ?? 0)) strokeRR(ctx, bx, oy + 10, 74, 38, 12, T.line, 1.2);
    text(ctx, sz, bx + 37, oy + 35, { size: 17, weight: 600, color: i === (o.size ?? 0) ? '#fff' : T.ink2, align: 'center' });
  });

  // trust strip
  const fy = oy + 74;
  const feats = [['truck', 'ক্যাশ অন ডেলিভারি'], ['shield', 'গ্যারান্টিসহ অরিজিনাল']];
  feats.forEach(([ic, label], i) => {
    const a = o.feat ? clamp((o.feat - i * 0.18) / 0.6) : 0;
    ctx.save(); ctx.globalAlpha *= a;
    icon(ctx, ic, 24 + i * 210, fy + 6, 22, T.gold, 1.9);
    text(ctx, label, 54 + i * 210, fy + 24, { size: 18, weight: 500, color: T.ink2, maxWidth: 170 });
    ctx.restore();
  });

  // sticky CTA
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fillRect(0, h - 122, w, 122);
  ctx.strokeStyle = T.line; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h - 122); ctx.lineTo(w, h - 122); ctx.stroke();
  fillRR(ctx, 22, h - 102, (w - 60) * 0.44, 62, 16, 'rgba(21,24,30,0.05)');
  strokeRR(ctx, 22, h - 102, (w - 60) * 0.44, 62, 16, T.ink, 1.6);
  text(ctx, 'কার্টে যোগ করুন', 22 + (w - 60) * 0.22, h - 62, { size: 20, weight: 700, color: T.ink, align: 'center' });
  const press = clamp(o.addToCart || 0);
  fillRR(ctx, 34 + (w - 60) * 0.44, h - 102, (w - 60) * 0.56, 62, 16, press > 0.1 ? T.gold : T.ink);
  text(ctx, press > 0.35 ? 'যোগ হয়েছে ✓' : 'এখনই কিনুন', 34 + (w - 60) * 0.44 + (w - 60) * 0.28, h - 62, { size: 20, weight: 700, color: '#fff', align: 'center' });
}

export function pctLabel(disc) {
  return disc ? `${disc}` : 'ক্যাশ অন ডেলিভারি';
}

/** Cart screen */
export function sfCart(ctx, w, h, o = {}) {
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  icon(ctx, 'arrow', 22, 62, 26, T.ink);
  text(ctx, 'আমার কার্ট', w / 2, 74, { size: 22, weight: 700, color: T.ink, align: 'center' });
  text(ctx, '৩টি পণ্য', w - 24, 74, { size: 18, weight: 500, color: T.muted, align: 'right' });

  const items = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[2]];
  items.forEach((p, i) => {
    const y = 112 + i * 132;
    const a = o.enter ? clamp((o.enter - i * 0.12) / 0.5) : 1;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate((1 - a) * 40, 0);
    shadow(ctx, 'rgba(40,32,20,0.08)', 20, 8);
    fillRR(ctx, 20, y, w - 40, 116, 18, T.paper);
    noShadow(ctx);
    fillRR(ctx, 32, y + 12, 92, 92, 14, '#F2EADB');
    if (!photoCover(ctx, p.photo, 32, y + 12, 92, 92, { radius: 14 })) drawWatch(ctx, 78, y + 58, 30, p.tone);
    text(ctx, p.bn, 140, y + 40, { size: 22, weight: 600, color: T.ink, maxWidth: w - 260 });
    text(ctx, '৪০mm • ব্রাউন', 140, y + 66, { size: 16, weight: 500, color: T.muted });
    text(ctx, `৳${p.price.toLocaleString('en-US')}`, 140, y + 100, { size: 22, weight: 700, color: T.ink });
    // qty
    fillRR(ctx, w - 152, y + 74, 108, 34, 10, '#F5F0E6');
    icon(ctx, 'minus', w - 144, y + 82, 18, T.ink2, 2);
    text(ctx, '১', w - 98, y + 99, { size: 19, weight: 700, color: T.ink, align: 'center' });
    icon(ctx, 'plus', w - 72, y + 82, 18, T.ink2, 2);
    icon(ctx, 'trash', w - 42, y + 26, 18, T.muted, 2);
    ctx.restore();
  });

  // totals
  const ty = 112 + 3 * 132 + 26;
  fillRR(ctx, 20, ty, w - 40, 176, 18, T.paper);
  const rows = [['সাবটোটাল', '৳13,630'], ['ডেলিভারি চার্জ', '৳70'], ['মোট', '৳13,700']];
  rows.forEach(([k, v], i) => {
    const yy = ty + 44 + i * 44;
    text(ctx, k, 40, yy, { size: i === 2 ? 22 : 19, weight: i === 2 ? 700 : 500, color: i === 2 ? T.ink : T.muted });
    text(ctx, v, w - 40, yy, { size: i === 2 ? 24 : 19, weight: i === 2 ? 700 : 600, color: i === 2 ? T.ink : T.ink2, align: 'right' });
  });
  ctx.strokeStyle = T.line; ctx.beginPath(); ctx.moveTo(40, ty + 130); ctx.lineTo(w - 40, ty + 130); ctx.stroke();

  const press = clamp(o.checkout || 0);
  fillRR(ctx, 20, h - 152, w - 40, 72, 18, press > 0.08 ? T.gold : T.ink);
  text(ctx, 'চেকআউট করুন', w / 2, h - 106, { size: 24, weight: 700, color: '#fff', align: 'center' });
  text(ctx, 'অর্ডার কনফার্ম করতে ২ ধাপ', w / 2, h - 56, { size: 17, weight: 500, color: T.muted, align: 'center' });
  demoBadge(ctx, w - 122, 60, 17);
}

/** Checkout screen. opts: { fill: 0..1 (form typing), paySel, confirm: 0..1 } */
export function sfCheckout(ctx, w, h, o = {}) {
  const fill = clamp(o.fill || 0);
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  icon(ctx, 'arrow', 22, 62, 26, T.ink);
  text(ctx, 'চেকআউট', w / 2, 74, { size: 22, weight: 700, color: T.ink, align: 'center' });
  // stepper
  ['কার্ট', 'ঠিকানা', 'কনফার্ম'].forEach((s, i) => {
    const cx = 74 + i * 150;
    const done = fill > i * 0.3;
    circle(ctx, cx, 118, 12, done ? T.ink : '#E4DDCE');
    text(ctx, String(i + 1), cx, 123, { size: 13, weight: 700, color: done ? '#fff' : T.muted, align: 'center' });
    text(ctx, s, cx + 20, 124, { size: 17, weight: 600, color: done ? T.ink : T.muted });
    if (i < 2) {
      ctx.strokeStyle = '#E0D8C8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 12, 118); ctx.lineTo(cx + 60, 118); ctx.stroke();
    }
  });

  text(ctx, 'ডেলিভারি তথ্য', 24, 172, { size: 23, weight: 700, color: T.ink });
  const fields = [
    ['নাম', 'রাফিদ হাসান'],
    ['মোবাইল নম্বর', '01712-345678'],
    ['ঠিকানা', 'বাসা ১২, রোড ৫, ধানমন্ডি'],
  ];
  fields.forEach(([label, val], i) => {
    const y = 196 + i * 76;
    const typed = clamp((fill - i * 0.26) / 0.42);
    text(ctx, label, 24, y + 16, { size: 16, weight: 500, color: T.muted });
    fillRR(ctx, 24, y + 26, w - 48, 44, 11, T.paper);
    strokeRR(ctx, 24, y + 26, w - 48, 44, 11, typed > 0.1 && typed < 0.95 ? T.gold : T.line, typed > 0.1 && typed < 0.95 ? 1.8 : 1.2);
    const shown = val.slice(0, Math.round(val.length * typed));
    text(ctx, shown || 'লিখুন…', 38, y + 55, { size: 18, weight: 500, color: shown ? T.ink : '#B7B0A2' });
    if (typed > 0 && typed < 1) {
      const cw = ctx.measureText(shown).width;
      fillRR(ctx, 39 + cw + 2, y + 36, 2, 24, 1, T.gold);
    }
  });

  // payment
  const py = 436;
  text(ctx, 'পেমেন্ট মেথড', 24, py + 4, { size: 21, weight: 700, color: T.ink });
  const opts = [['ক্যাশ অন ডেলিভারি', 'cash'], ['অ্যাডভান্স পেমেন্ট (ডেমো)', 'card']];
  opts.forEach(([label, ic], i) => {
    const y = py + 18 + i * 58;
    const sel = i === (o.paySel ?? 0);
    fillRR(ctx, 24, y, w - 48, 50, 12, sel ? '#FFF9EC' : T.paper);
    strokeRR(ctx, 24, y, w - 48, 50, 12, sel ? T.gold : T.line, sel ? 2 : 1.2);
    icon(ctx, ic, 42, y + 13, 22, sel ? T.gold : T.muted, 1.9);
    text(ctx, label, 74, y + 32, { size: 18, weight: 600, color: T.ink });
    circle(ctx, w - 50, y + 25, 9, sel ? T.gold : 'transparent');
    if (!sel) { ctx.strokeStyle = T.line; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(w - 50, y + 25, 9, 0, 7); ctx.stroke(); }
    if (sel) circle(ctx, w - 50, y + 25, 3.6, '#fff');
  });

  // compact total
  const ty = 590;
  fillRR(ctx, 24, ty, w - 48, 86, 12, T.paper);
  strokeRR(ctx, 24, ty, w - 48, 86, 12, T.line, 1.1);
  text(ctx, '৩টি পণ্য • ডেলিভারি চার্জসহ', 40, ty + 34, { size: 16, weight: 500, color: T.muted });
  text(ctx, 'মোট', 40, ty + 66, { size: 19, weight: 600, color: T.ink2 });
  text(ctx, '৳13,700', w - 40, ty + 66, { size: 26, weight: 800, color: T.ink, align: 'right' });

  const press = clamp(o.confirm || 0);
  const enabled = fill > 0.9;
  fillRR(ctx, 24, h - 122, w - 48, 66, 18, !enabled ? '#DCD4C4' : press > 0.05 ? T.gold : T.ink);
  text(ctx, press > 0.4 ? 'অর্ডার হচ্ছে…' : 'অর্ডার কনফার্ম করুন', w / 2, h - 80, { size: 22, weight: 700, color: enabled ? '#fff' : '#9A9384', align: 'center' });
}

/** Order confirmation with success animation */
export function sfConfirm(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  const cy = 300;
  const r = 62 * (0.85 + 0.15 * easeOut(p));
  circle(ctx, w / 2, cy, r + 26, alpha(T.green, 0.1 * p));
  circle(ctx, w / 2, cy, r, T.green);
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const q = clamp((p - 0.15) / 0.5);
  ctx.beginPath();
  ctx.moveTo(w / 2 - 26, cy + 2);
  ctx.lineTo(w / 2 - 8, cy + 22);
  ctx.lineTo(w / 2 + 30, cy - 20);
  ctx.setLineDash([100, 100]);
  ctx.lineDashOffset = 100 * (1 - q);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'অর্ডার সফলভাবে হয়েছে', w / 2, cy + 140, { size: 34, weight: 700, color: T.ink, align: 'center' });
  text(ctx, 'আমরা শীঘ্রই ফোনে কনফার্ম করব', w / 2, cy + 178, { size: 20, weight: 500, color: T.muted, align: 'center' });
  const sy = cy + 214;
  fillRR(ctx, 24, sy, w - 48, 250, 18, T.paper);
  const rows = [['অর্ডার নম্বর', '#AUR-1042'], ['পণ্য', 'হেরিটেজ ক্রোনো × ১'], ['মোট', '৳4,960'], ['পেমেন্ট', 'ক্যাশ অন ডেলিভারি']];
  rows.forEach(([k, v], i) => {
    const a = clamp((p - 0.3 - i * 0.08) / 0.3);
    ctx.save(); ctx.globalAlpha *= a;
    text(ctx, k, 44, sy + 50 + i * 50, { size: 18, weight: 500, color: T.muted });
    text(ctx, v, w - 44, sy + 50 + i * 50, { size: 19, weight: 600, color: T.ink, align: 'right' });
    ctx.restore();
  });
  if (p > 0.6) {
    fillRR(ctx, 24, sy + 270, w - 48, 60, 16, '#F5F0E6');
    text(ctx, 'ধন্যবাদ — AURUM ডেমো স্টোর', w / 2, sy + 308, { size: 18, weight: 600, color: T.ink2, align: 'center' });
  }
  demoBadge(ctx, w - 122, 60, 17);
}

/** Category / collection screen */
export function sfCategories(ctx, w, h, o = {}) {
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  sfNav(ctx, w, 30, { cart: 1 });
  text(ctx, 'ক্যাটাগরি', 22, 160, { size: 34, weight: 700, color: T.ink });
  text(ctx, 'আপনার পছন্দের সংগ্রহ বেছে নিন', 22, 192, { size: 18, weight: 500, color: T.muted });
  const tiles = [
    ['ঘড়ি', '৩৬টি পণ্য', 'watch', 'hero'],
    ['ব্যাগ', '১৮টি পণ্য', 'bag', 'bag'],
    ['জুতা', '২৪টি পণ্য', 'shoe', 'shoe'],
    ['অ্যাকসেসরিজ', '৩১টি পণ্য', 'bottle', 'fragrance'],
  ];
  tiles.forEach(([name, count, kind, photo], i) => {
    const a = clamp((o.p ?? 0) * 1.6 - i * 0.15);
    const col = i % 2, row = Math.floor(i / 2);
    const x = 22 + col * (w / 2 - 11), y = 220 + row * 210;
    const tileW = w / 2 - 33;
    ctx.save();
    ctx.globalAlpha *= clamp(a);
    ctx.translate(0, (1 - a) * 24);
    shadow(ctx, 'rgba(40,32,20,0.16)', 22, 8);
    fillRR(ctx, x, y, tileW, 194, 18, '#33291F');
    noShadow(ctx);
    const hasPhoto = photoCover(ctx, photo, x, y, tileW, 194, { radius: 18, focalX: photo === 'hero' ? 0.68 : 0.5, focalY: 0.52 });
    if (hasPhoto) {
      ctx.save(); rr(ctx, x, y, tileW, 194, 18); ctx.clip();
      const shade = ctx.createLinearGradient(x, y + 78, x, y + 194);
      shade.addColorStop(0, 'rgba(20,17,13,0.02)'); shade.addColorStop(1, 'rgba(20,17,13,0.78)');
      ctx.fillStyle = shade; ctx.fillRect(x, y + 78, tileW, 116); ctx.restore();
    } else {
      if (kind === 'watch') drawWatch(ctx, x + tileW / 2, y + 82, 34, { face: '#F4EEE2', bezel: '#C9A46A', strap: '#3B2A1D' });
      if (kind === 'bag') drawBag(ctx, x + tileW / 2, y + 82, 36, {});
      if (kind === 'shoe') drawShoe(ctx, x + tileW / 2, y + 86, 40);
      if (kind === 'bottle') drawBottle(ctx, x + tileW / 2, y + 78, 34);
    }
    text(ctx, name, x + 16, y + 151, { size: 23, weight: 700, color: '#FFFFFF', maxWidth: tileW - 32 });
    text(ctx, count, x + 16, y + 178, { size: 16, weight: 500, color: 'rgba(255,255,255,0.82)' });
    icon(ctx, 'arrowUpRight', x + tileW - 42, y + 148, 20, '#F3D5A4', 2);
    ctx.restore();
  });
  demoBadge(ctx, w - 122, 60, 17);
}

/** Search screen with results */
export function sfSearch(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  ctx.fillStyle = T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w);
  fillRR(ctx, 20, 52, w - 40, 54, 14, T.paper);
  strokeRR(ctx, 20, 52, w - 40, 54, 14, T.line, 1.2);
  icon(ctx, 'search', 38, 66, 24, T.muted, 2);
  const q = 'ঘড়ি'.slice(0, Math.max(0, Math.round(p * 4)));
  text(ctx, q ? `“${q}”` : 'খুঁজুন…', 74, 86, { size: 21, weight: 500, color: q ? T.ink : '#B7B0A2' });
  if (q) {
    const cw = ctx.measureText(`“${q}”`).width;
    fillRR(ctx, 78 + cw, 66, 2, 26, 1, T.gold);
  }
  if (p > 0.5) {
    text(ctx, 'প্রোডাক্ট', 22, 146, { size: 22, weight: 700, color: T.ink });
    PRODUCTS.slice(0, 4).forEach((pr, i) => {
      const a = clamp((p - 0.4 - i * 0.1) / 0.3);
      const y = 164 + i * 108;
      ctx.save(); ctx.globalAlpha *= a;
      fillRR(ctx, 20, y, w - 40, 96, 14, T.paper);
      fillRR(ctx, 32, y + 10, 76, 76, 10, '#F2EADB');
      if (!photoCover(ctx, pr.photo, 32, y + 10, 76, 76, { radius: 10 })) drawWatch(ctx, 70, y + 48, 25, pr.tone);
      text(ctx, pr.bn, 124, y + 40, { size: 20, weight: 600, color: T.ink });
      text(ctx, `৳${pr.price.toLocaleString('en-US')}`, 124, y + 70, { size: 19, weight: 700, color: T.ink });
      text(ctx, 'স্টকে আছে', w - 36, y + 70, { size: 15, weight: 600, color: T.green, align: 'right' });
      ctx.restore();
    });
    ['ঘড়ি', 'কাপল ঘড়ি', 'স্মার্ট ঘড়ি'].forEach((t, i) => {
      const y = 164 + 4 * 108 + i * 54;
      icon(ctx, 'search', 24, y + 8, 20, T.muted, 2);
      text(ctx, t, 56, y + 26, { size: 19, weight: 500, color: T.ink2 });
    });
  }
  demoBadge(ctx, w - 122, 60, 17);
}

/** Product landing page (for campaign scenes). variant: 0..2 */
export function sfLanding(ctx, w, h, variant = 0, o = {}) {
  const p = clamp(o.p || 0);
  ctx.fillStyle = variant === 1 ? '#1B1712' : T.cream;
  ctx.fillRect(0, 0, w, h);
  sfStatusBar(ctx, w, variant === 1);
  sfNav(ctx, w, 30, { cart: 0, dark: variant === 1 });
  const ink = variant === 1 ? '#fff' : T.ink;
  const sub = variant === 1 ? 'rgba(255,255,255,0.66)' : T.muted;
  const hy = 104;
  if (variant === 0) {
    // big banner + offer
    fillRR(ctx, 16, hy, w - 32, 340, 18, '#241E17');
    if (photoCover(ctx, 'hero', 16, hy, w - 32, 340, { radius: 18, focalX: 0.62, focalY: 0.55 })) {
      const shade = ctx.createLinearGradient(16, hy, w - 16, hy);
      shade.addColorStop(0, 'rgba(10,12,15,0.74)');
      shade.addColorStop(0.5, 'rgba(10,12,15,0.40)');
      shade.addColorStop(1, 'rgba(10,12,15,0.04)');
      ctx.fillStyle = shade; ctx.fillRect(16, hy, w - 32, 340);
    } else {
      const g = ctx.createRadialGradient(w * 0.7, hy + 120, 30, w * 0.6, hy + 170, 320);
      g.addColorStop(0, 'rgba(201,164,106,0.4)'); g.addColorStop(1, 'rgba(36,30,23,0)');
      ctx.fillStyle = g; ctx.fillRect(16, hy, w - 32, 340);
      drawWatch(ctx, w * 0.7, hy + 176, 96, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
    }
    text(ctx, 'বিশেষ অফার', 40, hy + 78, { size: 18, weight: 600, color: '#D9BE8F' });
    text(ctx, 'ঈদ কালেকশন', 40, hy + 130, { size: 42, weight: 700, color: '#fff' });
    text(ctx, 'সীমিত সময়ের জন্য', 40, hy + 168, { size: 20, weight: 500, color: 'rgba(255,255,255,0.7)' });
    fillRR(ctx, 40, hy + 196, 130, 46, 23, '#D9BE8F');
    text(ctx, 'অর্ডার করুন', 105, hy + 226, { size: 20, weight: 700, color: '#231C14', align: 'center' });
    // countdown-ish chips (no fake urgency wording)
    ['ক্যাশ অন ডেলিভারি', 'সারা দেশে'].forEach((t, i) => {
      chipOnLight(ctx, t, 40, hy + 262 + i * 0, i);
    });
  }
  if (variant === 1) {
    photoCover(ctx, 'noir', 22, hy + 54, w - 44, 238, { radius: 20, focalY: 0.5 });
    const shade = ctx.createLinearGradient(0, hy + 220, 0, hy + 292);
    shade.addColorStop(0, 'rgba(27,23,18,0)'); shade.addColorStop(1, 'rgba(27,23,18,0.82)');
    fillRR(ctx, 22, hy + 54, w - 44, 238, 20, 'rgba(0,0,0,0)');
    ctx.save(); rr(ctx, 22, hy + 54, w - 44, 238, 20); ctx.clip();
    ctx.fillStyle = shade; ctx.fillRect(22, hy + 54, w - 44, 238); ctx.restore();
    text(ctx, 'নতুন প্রোডাক্ট', w / 2, hy + 40, { size: 17, weight: 600, color: '#D9BE8F', align: 'center', letterSpacing: 2 });
    text(ctx, 'Noir Automatic', w / 2, hy + 310, { size: 34, weight: 700, color: '#fff', align: 'center' });
    text(ctx, '৳6,450', w / 2, hy + 352, { size: 30, weight: 700, color: '#D9BE8F', align: 'center' });
  }
  if (variant === 2) {
    text(ctx, 'ক্যাম্পেইন ল্যান্ডিং পেজ', 22, hy + 34, { size: 28, weight: 700, color: ink });
    text(ctx, 'বিজ্ঞাপনের জন্য আলাদা পেজ', 22, hy + 62, { size: 18, weight: 500, color: sub });
    fillRR(ctx, 20, hy + 84, w - 40, 210, 16, '#EFE7D8');
    photoCover(ctx, 'leather', 20, hy + 84, w - 40, 210, { radius: 16, focalX: 0.7, focalY: 0.5 });
    const veil = ctx.createLinearGradient(20, hy + 84, w - 20, hy + 84);
    veil.addColorStop(0, 'rgba(255,252,246,0.96)'); veil.addColorStop(0.56, 'rgba(255,252,246,0.74)'); veil.addColorStop(1, 'rgba(255,252,246,0.02)');
    ctx.save(); rr(ctx, 20, hy + 84, w - 40, 210, 16); ctx.clip();
    ctx.fillStyle = veil; ctx.fillRect(20, hy + 84, w - 40, 210); ctx.restore();
    text(ctx, 'ফ্রি হোম ডেলিভারি', 36, hy + 150, { size: 26, weight: 700, color: T.ink });
    text(ctx, 'নির্বাচিত পণ্যে', 36, hy + 180, { size: 18, weight: 500, color: T.muted });
    fillRR(ctx, 36, hy + 200, 150, 44, 22, T.ink);
    text(ctx, 'অফার দেখুন', 111, hy + 229, { size: 18, weight: 700, color: '#fff', align: 'center' });
  }
  // product strip
  const listY = hy + 380;
  text(ctx, 'আরও দেখুন', 22, listY, { size: 22, weight: 700, color: ink });
  PRODUCTS.slice(0, 3).forEach((pr, i) => {
    const x = 20 + i * ((w - 40) / 3);
    const cardW = (w - 40) / 3 - 10;
    fillRR(ctx, x, listY + 18, cardW, 150, 12, variant === 1 ? '#252019' : T.paper);
    photoCover(ctx, pr.photo, x, listY + 18, cardW, 104, { radius: 12 });
    text(ctx, `৳${pr.price.toLocaleString('en-US')}`, x + 12, listY + 138, { size: 17, weight: 700, color: ink });
  });
  // CTA bar
  fillRR(ctx, 20, h - 104, w - 40, 62, 16, variant === 1 ? '#D9BE8F' : T.ink);
  text(ctx, 'সরাসরি অর্ডার করুন', w / 2, h - 64, { size: 22, weight: 700, color: variant === 1 ? '#231C14' : '#fff', align: 'center' });
  demoBadge(ctx, w - 122, 60, 17);
}

function chipOnLight(ctx, label, x, y, i) {
  ctx.save();
  ctx.font = fontStr(15, 600, label);
  const w = ctx.measureText(label).width + 24;
  fillRR(ctx, x, y, w, 30, 15, 'rgba(255,255,255,0.12)');
  text(ctx, label, x + w / 2, y + 21, { size: 15, weight: 600, color: '#E8D9BF', align: 'center' });
  ctx.restore();
}

/** Toast / floating mini card used for notifications. */
export function floatingToast(ctx, x, y, w, title, body, { iconName = 'bell', tone = C.cyan, p = 1, dark = false } = {}) {
  ctx.save();
  const a = clamp(p);
  ctx.globalAlpha *= a;
  ctx.translate(0, (1 - a) * 24);
  shadow(ctx, 'rgba(0,0,0,0.45)', 40, 16);
  fillRR(ctx, x, y, w, 96, 22, dark ? 'rgba(20,27,44,0.96)' : 'rgba(255,255,255,0.97)');
  noShadow(ctx);
  strokeRR(ctx, x, y, w, 96, 22, alpha(tone, 0.3), 1.4);
  fillRR(ctx, x + 16, y + 16, 64, 64, 18, alpha(tone, 0.16));
  icon(ctx, iconName, x + 32, y + 32, 32, tone, 2);
  text(ctx, title, x + 96, y + 40, { size: 21, weight: 700, color: dark ? '#fff' : '#15181E', maxWidth: w - 120 });
  text(ctx, body, x + 96, y + 68, { size: 17, weight: 500, color: dark ? 'rgba(255,255,255,0.62)' : '#7C7768', maxWidth: w - 120 });
  ctx.restore();
}
