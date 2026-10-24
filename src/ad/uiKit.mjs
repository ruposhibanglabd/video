/**
 * CodePixel Web — Premium Agency UI, Storefront & Commerce OS Admin Kit
 *
 * All storefronts, products, admin modules, and package figures are verified
 * directly against:
 *   - https://codepixelweb.vercel.app/
 *   - https://fashion-ebon-five.vercel.app/   (NOIRÉ Fashion Store)
 *   - https://watchbd.vercel.app/             (TIMEORA Watch Store)
 *   - https://cosmetics-one-mu.vercel.app/    (LUMÉRA Cosmetics Store)
 *   - https://luxury-footwear-shop.vercel.app/(NEXT IQ Footwear Store)
 *   - https://electronics-liart-three.vercel.app/ (TECHORA Electronics)
 *   - https://demoadmin-jet.vercel.app/       (CodePixel Commerce OS Admin Panel)
 */
import { IMAGES } from '../render/platform.mjs';
import {
  W, H, C, clamp, lerp, easeOut, easeInOut, easeOutBack, easeOutQuint, beat, stag,
  alpha, mix, text, paragraph, fillRR, strokeRR, rr, circle, shadow, noShadow,
  lin, glowOrb, icon, whatsappGlyph, brandMark, chip, fontStr, lightSweep,
} from '../render/kit.mjs';

export const PAL = {
  bgDeep: '#050814',
  bgNavy: '#081022',
  bgPanel: '#0E1833',
  cardDark: 'rgba(13, 23, 48, 0.84)',
  cardBorder: 'rgba(126, 174, 255, 0.22)',
  electric: '#2979FF',
  cyan: '#38D9FF',
  violet: '#7C5CFF',
  gold: '#F5BA62',
  goldDeep: '#C9933B',
  emerald: '#22C983',
  whatsapp: '#25D366',
  white: '#F8FAFF',
  slate: '#9EB0CE',
  muted: '#697B9C',
};

/** Verified live demo stores from codepixelweb.vercel.app/#demos */
export const DEMO_STORES = [
  {
    id: 'fashion',
    brand: 'NOIRÉ',
    catBn: 'পোশাক ও ফ্যাশন',
    url: 'fashion-ebon-five.vercel.app',
    img: 'panjabi',
    img2: 'blazer',
    accent: '#C69B63',
    heroTitle: 'ঈদ ও নতুন সিজন কালেকশন',
    heroSub: 'প্রিমিয়াম লিনেন পাঞ্জাবি ও ক্যাজুয়াল ফ্যাশন',
    itemBn: 'সিগনেচার লিনেন পাঞ্জাবি',
    priceBn: '৳ ২,৪৫০',
    priceNum: 2450,
    stockBn: '৪৫টি স্টকে আছে',
  },
  {
    id: 'watch',
    brand: 'TIMEORA',
    catBn: 'প্রিমিয়াম ঘড়ি',
    url: 'watchbd.vercel.app',
    img: 'watch',
    img2: 'panjabi',
    accent: '#D4A857',
    heroTitle: 'টাইমলেস ক্রোনোগ্রাফ কালেকশন',
    heroSub: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি',
    itemBn: 'এক্সিকিউটিভ স্টিল ক্রোনোগ্রাফ',
    priceBn: '৳ ৫,৪৯০',
    priceNum: 5490,
    stockBn: '২৮টি স্টকে আছে',
  },
  {
    id: 'cosmetics',
    brand: 'LUMÉRA',
    catBn: 'স্কিনকেয়ার ও কসমেটিকস',
    url: 'cosmetics-one-mu.vercel.app',
    img: 'serum',
    img2: 'blazer',
    accent: '#D98F6C',
    heroTitle: 'ডেইলি গ্লো স্কিনকেয়ার রিচুয়াল',
    heroSub: 'অরিজিনাল বিউটি ও স্কিনকেয়ার এসেনশিয়ালস',
    itemBn: 'ভিটামিন সি ব্রাইটেনিং সিরাম',
    priceBn: '৳ ১,৪৯০',
    priceNum: 1490,
    stockBn: '৬২টি স্টকে আছে',
  },
  {
    id: 'footwear',
    brand: 'NEXT IQ',
    catBn: 'লেদার জুতা ও বুটস',
    url: 'luxury-footwear-shop.vercel.app',
    img: 'boot',
    img2: 'watch',
    accent: '#B87B52',
    heroTitle: 'হ্যান্ডক্রাফটেড চেলসি বুট কালেকশন',
    heroSub: 'ফরমাল, স্নিকার্স ও প্রিমিয়াম লেদার বুটস',
    itemBn: 'প্রিমিয়াম চেলসি বুট চকলেট',
    priceBn: '৳ ১,৮৯০',
    priceNum: 1890,
    stockBn: '৩৪টি স্টকে আছে',
  },
  {
    id: 'electronics',
    brand: 'TECHORA',
    catBn: 'ল্যাপটপ ও ইলেকট্রনিক্স',
    url: 'electronics-liart-three.vercel.app',
    img: 'laptop',
    img2: 'watch',
    accent: '#38D9FF',
    heroTitle: 'আধুনিক প্রযুক্তি, এক জায়গায়',
    heroSub: 'ল্যাপটপ, মোবাইল, অডিও ও স্মার্ট গ্যাজেট',
    itemBn: 'TECHORA AirBook 14 · 16GB',
    priceBn: '৳ ৬৮,৫০০',
    priceNum: 68500,
    stockBn: '১৯টি স্টকে আছে',
  },
];

export const CATALOG_ITEMS = [
  { img: 'panjabi', nameBn: 'সিগনেচার লিনেন পাঞ্জাবি', catBn: 'পোশাক', priceBn: '৳ ২,৪৫০', stockBn: 'স্টকে আছে', sizes: ['S', 'M', 'L', 'XL'] },
  { img: 'watch', nameBn: 'এক্সিকিউটিভ ক্রোনোগ্রাফ', catBn: 'ঘড়ি', priceBn: '৳ ৫,৪৯০', stockBn: 'স্টকে আছে', sizes: ['40mm', '42mm'] },
  { img: 'serum', nameBn: 'ভিটামিন সি গ্লো সিরাম', catBn: 'স্কিনকেয়ার', priceBn: '৳ ১,৪৯০', stockBn: 'স্টকে আছে', sizes: ['30ml', '50ml'] },
  { img: 'boot', nameBn: 'হ্যান্ডক্রাফটেড চেলসি বুট', catBn: 'বুটস', priceBn: '৳ ১,৮৯০', stockBn: 'স্টকে আছে', sizes: ['40', '41', '42', '43'] },
  { img: 'blazer', nameBn: 'মডার্ন কো-অর্ড ব্লেজার সেট', catBn: 'ফ্যাশন', priceBn: '৳ ২,৯৫০', stockBn: 'স্টকে আছে', sizes: ['S', 'M', 'L'] },
  { img: 'laptop', nameBn: 'TECHORA AirBook 14', catBn: 'গ্যাজেট', priceBn: '৳ ৬৮,৫০০', stockBn: 'স্টকে আছে', sizes: ['16/512GB'] },
];

/** Draw studio photograph with object-fit: cover + subtle Ken Burns & natural contrast. */
export function drawCoverImage(ctx, key, x, y, w, h, {
  radius = 18, zoom = 1.04, panX = 0, panY = 0, overlay = 0, border = null,
} = {}) {
  const img = IMAGES[key];
  ctx.save();
  rr(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.fillStyle = '#12192B';
  ctx.fillRect(x, y, w, h);
  if (img && img.width && img.height) {
    const ir = img.width / img.height;
    const tr = w / h;
    let dw, dh;
    if (ir > tr) {
      dh = h * zoom;
      dw = dh * ir;
    } else {
      dw = w * zoom;
      dh = dw / ir;
    }
    const dx = x + (w - dw) / 2 + panX * w;
    const dy = y + (h - dh) / 2 + panY * h;
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  if (overlay > 0) {
    const g = lin(ctx, x, y, x, y + h, [
      [0, `rgba(6,10,22,${overlay * 0.25})`],
      [0.55, `rgba(6,10,22,${overlay * 0.15})`],
      [1, `rgba(6,10,22,${overlay})`],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  if (border) strokeRR(ctx, x, y, w, h, radius, border, 1.5);
}

/** Multi-layer graded agency studio backdrop tailored to each scene's mood. */
export function drawGradedBackdrop(ctx, t, mood = 'studio') {
  const themes = {
    hook: { base: '#050814', key: '#2563EB', rim: '#7C5CFF', low: '#0EA5E9', warm: 0.14 },
    store: { base: '#060B19', key: '#1D63ED', rim: '#6D4AFF', low: '#1490B8', warm: 0.10 },
    admin: { base: '#050A17', key: '#1E5EFF', rim: '#38BDF8', low: '#5B46F6', warm: 0.06 },
    offer: { base: '#060916', key: '#2568FF', rim: '#D99B3F', low: '#6D4CFF', warm: 0.28 },
    cta:   { base: '#050B16', key: '#1D68FF', rim: '#1EC973', low: '#36D7FF', warm: 0.12 },
  };
  const th = themes[mood] || themes.store;

  ctx.fillStyle = th.base;
  ctx.fillRect(0, 0, W, H);

  const dx = Math.sin(t * 0.32) * 58;
  const dy = Math.cos(t * 0.24) * 44;

  // Volumetric studio key + backlight + subtle warm rim
  glowOrb(ctx, W * 0.16 + dx, H * 0.18 + dy, W * 0.88, th.key, 0.36);
  glowOrb(ctx, W * 0.88 - dx * 0.7, H * 0.56 - dy * 0.6, W * 0.82, th.rim, 0.26);
  glowOrb(ctx, W * 0.5, H * 0.96, W * 0.85, th.low, 0.2);
  if (th.warm > 0) {
    glowOrb(ctx, W * 0.76, H * 0.22, W * 0.55, '#F5B95F', th.warm);
  }

  // Architectural perspective grid lines (very subtle, high-craft)
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 184, 255, 0.038)';
  ctx.lineWidth = 1;
  const step = 80;
  const offY = (t * 14) % step;
  for (let x = 40; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = offY; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

/** Frosted dark glass card with specular top edge highlight. */
export function glassCard(ctx, x, y, w, h, {
  radius = 28, fill = 'rgba(12, 21, 44, 0.84)', border = 'rgba(132, 178, 255, 0.24)',
  glow = null, blur = 44, oy = 22,
} = {}) {
  ctx.save();
  shadow(ctx, glow || 'rgba(0, 0, 0, 0.52)', blur, oy);
  fillRR(ctx, x, y, w, h, radius, fill);
  noShadow(ctx);
  strokeRR(ctx, x, y, w, h, radius, border, 1.5);
  // Subtle top specular highlight edge
  const hi = lin(ctx, x, y, x + w, y, [
    [0, 'rgba(255,255,255,0)'],
    [0.5, 'rgba(255,255,255,0.22)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.save();
  rr(ctx, x, y, w, 3, 2);
  ctx.fillStyle = hi;
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** Top header bar with CodePixel Web pill + scene progress indicator. */
export function drawSceneHeader(ctx, t, { tagBn = 'CODEPIXEL WEB', sceneNum = '01', totalNum = '11', accent = PAL.cyan } = {}) {
  const p = beat(t, 0.02, 0.45);
  ctx.save();
  ctx.globalAlpha = p;
  const y = 78 + (1 - p) * -14;

  // Brand mini-pill on left
  glassCard(ctx, 64, y, 300, 56, { radius: 28, fill: 'rgba(10,18,38,0.82)', blur: 20, oy: 8 });
  brandMark(ctx, 76, y + 8, 40);
  text(ctx, 'CodePixel Web', 128, y + 36, { size: 22, weight: 700, color: PAL.white });

  // Category/chapter pill on right
  const rightText = `${tagBn}  ·  ${sceneNum}/${totalNum}`;
  ctx.font = fontStr(20, 600, rightText);
  const rw = Math.min(580, ctx.measureText(rightText).width + 44);
  const rx = W - 64 - rw;
  fillRR(ctx, rx, y + 4, rw, 48, 24, alpha(accent, 0.14));
  strokeRR(ctx, rx, y + 4, rw, 48, 24, alpha(accent, 0.38), 1.4);
  text(ctx, rightText, rx + rw / 2, y + 35, { size: 20, weight: 600, color: accent, align: 'center', maxWidth: rw - 28 });
  ctx.restore();
}

/** Crisp two-line Bengali headline with masked slide-up reveal & highlighted second line. */
export function drawHeroTitle(ctx, t, line1, line2, {
  y = 198, size = 58, accent = PAL.cyan, align = 'center',
} = {}) {
  const cx = align === 'center' ? W / 2 : 68;
  const lines = [
    { str: line1, color: PAL.white, delay: 0.05 },
    { str: line2, color: accent, delay: 0.17 },
  ].filter((l) => l.str);

  lines.forEach((ln, i) => {
    const p = beat(t, ln.delay, 0.52, easeOutQuint);
    const ly = y + i * (size * 1.34);
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, ly - size * 1.05, W - 80, size * 1.48);
    ctx.clip();
    ctx.globalAlpha = p;
    text(ctx, ln.str, cx, ly + (1 - p) * (size * 0.72), {
      size,
      weight: 800,
      color: ln.color,
      align,
      maxWidth: W - 128,
    });
    ctx.restore();
  });
}

/** Bottom persistent verified caption & brand bar inside vertical safe zone. */
export function drawBottomBar(ctx, t, captionBn, { pill = 'codepixelweb.vercel.app · WhatsApp 01876892958', accent = PAL.cyan } = {}) {
  const p = beat(t, 0.18, 0.5);
  ctx.save();
  ctx.globalAlpha = p;
  const y = 1716 + (1 - p) * 20;
  glassCard(ctx, 64, y, W - 128, 128, {
    radius: 26,
    fill: 'rgba(8, 15, 32, 0.90)',
    border: 'rgba(130, 178, 255, 0.24)',
    blur: 30,
    oy: 12,
  });
  text(ctx, captionBn, W / 2, y + 54, {
    size: 27,
    weight: 700,
    color: PAL.white,
    align: 'center',
    maxWidth: W - 188,
  });
  text(ctx, pill, W / 2, y + 98, {
    size: 21,
    weight: 600,
    color: accent,
    align: 'center',
    maxWidth: W - 188,
  });
  ctx.restore();
}

/** Animated pointer + touch ripple for realistic UI interaction. */
export function drawTouchCursor(ctx, x, y, clickProgress = 0) {
  ctx.save();
  if (clickProgress > 0 && clickProgress < 1) {
    const r = 16 + 52 * easeOut(clickProgress);
    ctx.strokeStyle = alpha(PAL.cyan, (1 - clickProgress) * 0.85);
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, x, y, 16 * (1 - clickProgress * 0.3), alpha(PAL.cyan, 0.28));
  }
  const scale = 1 - 0.14 * Math.sin(clamp(clickProgress) * Math.PI);
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  shadow(ctx, 'rgba(0,0,0,0.45)', 14, 6);
  circle(ctx, 0, 0, 15, 'rgba(255,255,255,0.95)');
  noShadow(ctx);
  circle(ctx, 0, 0, 7, PAL.electric);
  ctx.restore();
}

/* ============================================================================
 * CUSTOMER-FACING STOREFRONT UI RENDERER (MOBILE + DESKTOP)
 * ========================================================================== */
export function drawStorefrontMobile(ctx, w, h, {
  store = DEMO_STORES[0],
  scrollY = 0,
  activeCat = 0,
  searchQuery = '',
  cartCount = 1,
  highlightCard = -1,
} = {}) {
  ctx.save();
  ctx.fillStyle = '#F8F9FC';
  ctx.fillRect(0, 0, w, h);

  // Clean status bar leaving center clear for Dynamic Island notch
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, 34);
  text(ctx, '9:41', 26, 24, { size: 15, weight: 700, color: '#0F172A' });
  for (let b = 0; b < 4; b++) fillRR(ctx, w - 78 + b * 7, 22 - b * 2.5, 4.5, 7 + b * 2.5, 1.5, '#0F172A');
  strokeRR(ctx, w - 44, 12, 22, 12, 3.5, '#0F172A', 1.5);
  fillRR(ctx, w - 41, 15, 15, 6, 2, '#16A34A');

  // Top promo bar cleanly below the notch
  fillRR(ctx, 0, 34, w, 32, 0, '#0E1528');
  text(ctx, 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি · দ্রুত হোম ডেলিভারি', w / 2, 55, {
    size: 13.5, weight: 600, color: '#E2ECFF', align: 'center', maxWidth: w - 28,
  });

  // Store Header
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 66, w, 64);
  fillRR(ctx, 20, 81, 34, 34, 10, store.accent);
  text(ctx, store.brand[0], 37, 106, { size: 20, weight: 800, color: '#FFFFFF', align: 'center' });
  text(ctx, store.brand, 66, 106, { size: 24, weight: 800, color: '#101626', letterSpacing: 1.5 });

  // Search box / icons
  if (searchQuery) {
    fillRR(ctx, w * 0.42, 78, w * 0.43, 40, 20, '#EEF2F8');
    icon(ctx, 'search', w * 0.445, 87, 20, '#4F5D78');
    text(ctx, searchQuery, w * 0.495, 104, { size: 16, weight: 600, color: '#101626', maxWidth: w * 0.33 });
  } else {
    icon(ctx, 'search', w - 104, 85, 25, '#1D2538');
  }
  icon(ctx, 'bag', w - 54, 83, 27, '#1D2538');
  if (cartCount > 0) {
    circle(ctx, w - 33, 84, 11, PAL.electric);
    text(ctx, String(cartCount), w - 33, 88, { size: 13, weight: 800, color: '#FFFFFF', align: 'center' });
  }

  // Scrollable body viewport
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 130, w, h - 130);
  ctx.clip();
  ctx.translate(0, 130 - scrollY);

  // Hero Editorial Banner with real studio product photograph
  const heroH = Math.round(h * 0.34);
  drawCoverImage(ctx, store.img, 18, 12, w - 36, heroH, { radius: 22, zoom: 1.06, overlay: 0.72 });
  fillRR(ctx, 36, 30, 150, 32, 16, alpha(store.accent, 0.92));
  text(ctx, store.catBn, 111, 52, { size: 15, weight: 700, color: '#FFFFFF', align: 'center', maxWidth: 134 });
  text(ctx, store.heroTitle, 36, heroH - 58, { size: 28, weight: 800, color: '#FFFFFF', maxWidth: w - 84 });
  text(ctx, store.heroSub, 36, heroH - 24, { size: 17, weight: 500, color: 'rgba(255,255,255,0.88)', maxWidth: w - 84 });

  // Category Filter Pills
  const cats = ['সব পণ্য', 'পোশাক', 'ঘড়ি', 'স্কিনকেয়ার', 'বুটস'];
  let cx = 18;
  const catY = heroH + 30;
  cats.forEach((cat, idx) => {
    const active = idx === activeCat;
    ctx.font = fontStr(16, 700, cat);
    const pw = ctx.measureText(cat).width + 32;
    fillRR(ctx, cx, catY, pw, 38, 19, active ? '#101626' : '#E9EEF6');
    text(ctx, cat, cx + pw / 2, catY + 25, {
      size: 16, weight: 700, color: active ? '#FFFFFF' : '#3E4B63', align: 'center',
    });
    cx += pw + 10;
  });

  // 2-Column Product Cards Grid
  const gridY = catY + 56;
  const gap = 16;
  const cardW = (w - 36 - gap) / 2;
  const cardH = 304;
  for (let i = 0; i < CATALOG_ITEMS.length; i++) {
    const item = CATALOG_ITEMS[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 18 + col * (cardW + gap);
    const y = gridY + row * (cardH + gap);
    const isHi = i === highlightCard;

    ctx.save();
    shadow(ctx, isHi ? 'rgba(41,121,255,0.28)' : 'rgba(15,23,42,0.08)', isHi ? 26 : 14, 8);
    fillRR(ctx, x, y, cardW, cardH, 20, '#FFFFFF');
    noShadow(ctx);
    strokeRR(ctx, x, y, cardW, cardH, 20, isHi ? PAL.electric : '#E4EAF3', isHi ? 2.4 : 1.2);

    drawCoverImage(ctx, item.img, x + 10, y + 10, cardW - 20, 152, { radius: 14, zoom: 1.05 });

    // Stock pill on photo
    fillRR(ctx, x + 20, y + 20, 86, 26, 13, 'rgba(16, 24, 40, 0.78)');
    text(ctx, item.stockBn, x + 63, y + 38, { size: 13, weight: 600, color: '#4ADE80', align: 'center' });

    text(ctx, item.nameBn, x + 14, y + 190, { size: 18, weight: 700, color: '#111827', maxWidth: cardW - 28 });
    text(ctx, item.priceBn, x + 14, y + 224, { size: 22, weight: 800, color: '#1D4ED8' });

    // Action buttons ("কার্টে যোগ" + "অর্ডার") matching fashion-ebon-five & luxury-footwear
    fillRR(ctx, x + 12, y + 244, cardW - 24, 44, 12, isHi ? PAL.electric : '#101626');
    text(ctx, 'অর্ডার করুন', x + cardW / 2, y + 272, {
      size: 16, weight: 700, color: '#FFFFFF', align: 'center',
    });
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

/* ============================================================================
 * CODEPIXEL COMMERCE OS — ADMIN PANEL RENDERER (VERIFIED LIVE UI)
 * ========================================================================== */
export function drawAdminDashboard(ctx, w, h, t, { chartProgress = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = '#F3F6FB';
  ctx.fillRect(0, 0, w, h);

  // Dark Sidebar
  const sbw = 205;
  ctx.fillStyle = '#0B1324';
  ctx.fillRect(0, 0, sbw, h);
  brandMark(ctx, 18, 20, 38);
  text(ctx, 'Commerce OS', 66, 40, { size: 18, weight: 800, color: '#FFFFFF' });
  text(ctx, 'স্টোর কন্ট্রোল রুম', 66, 58, { size: 12, weight: 600, color: PAL.cyan });

  const navItems = [
    ['grid', 'ড্যাশবোর্ড', true],
    ['box', 'প্রোডাক্টসমূহ', false],
    ['tag', 'ক্যাটাগরি', false],
    ['list', 'অর্ডার তালিকা', false],
    ['users', 'কাস্টমার', false],
    ['truck', 'কুরিয়ার অটোমেশন', false],
    ['card', 'কুপন ও ডিসকাউন্ট', false],
    ['globe', 'ল্যান্ডিং পেজ', false],
  ];
  navItems.forEach(([ic, lbl, act], i) => {
    const ny = 96 + i * 50;
    if (act) {
      fillRR(ctx, 12, ny - 12, sbw - 24, 42, 12, 'rgba(41, 121, 255, 0.24)');
      fillRR(ctx, 12, ny - 5, 4, 28, 2, PAL.cyan);
    }
    icon(ctx, ic, 24, ny - 4, 20, act ? PAL.cyan : '#8B9BB8');
    text(ctx, lbl, 54, ny + 14, {
      size: 15, weight: act ? 700 : 500, color: act ? '#FFFFFF' : '#9AA9C4', maxWidth: sbw - 72,
    });
  });

  // Main Content Area
  const mx = sbw + 24;
  const mw = w - mx - 24;

  // Header
  text(ctx, 'আপনার স্টোর কন্ট্রোল রুম', mx, 48, { size: 26, weight: 800, color: '#0F172A' });
  fillRR(ctx, w - 196, 22, 172, 38, 19, '#E8F8F0');
  circle(ctx, w - 174, 41, 5, '#16A34A');
  text(ctx, 'লাইভ স্টোর সক্রিয়', w - 158, 47, { size: 15, weight: 700, color: '#15803D' });

  // 4 Verified KPI Cards (from demoadmin-jet.vercel.app)
  const kpis = [
    { label: 'মোট বিক্রি', val: '৳ ৪৮,৫২০', delta: '+১২.৮%', color: '#2563EB' },
    { label: 'মোট অর্ডার', val: '১২৮', delta: '+৮.৪%', color: '#0891B2' },
    { label: 'নতুন কাস্টমার', val: '৮৬', delta: '+৫.৬%', color: '#7C3AED' },
    { label: 'পেন্ডিং অর্ডার', val: '২৪', delta: 'প্রস্তুত', color: '#D97706' },
  ];
  const kw = (mw - 36) / 2;
  const kh = 112;
  kpis.forEach((k, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const kx = mx + col * (kw + 18);
    const ky = 74 + row * (kh + 14);
    const kp = stag(t, i, 0.12, 0.10, 0.45);
    ctx.save();
    ctx.globalAlpha = kp;
    fillRR(ctx, kx, ky + (1 - kp) * 14, kw, kh, 18, '#FFFFFF');
    strokeRR(ctx, kx, ky + (1 - kp) * 14, kw, kh, 18, '#E2E8F0', 1.2);
    text(ctx, k.label, kx + 18, ky + 34, { size: 16, weight: 600, color: '#64748B' });
    text(ctx, k.val, kx + 18, ky + 80, { size: 30, weight: 800, color: '#0F172A' });
    fillRR(ctx, kx + kw - 94, ky + 18, 78, 28, 14, alpha(k.color, 0.12));
    text(ctx, k.delta, kx + kw - 55, ky + 37, { size: 14, weight: 700, color: k.color, align: 'center' });
    ctx.restore();
  });

  // 30-Day Revenue Chart Card ("বিক্রির ওভারভিউ · ৳ ৯.৪২ লাখ")
  const cy = 334;
  const ch = 228;
  fillRR(ctx, mx, cy, mw, ch, 20, '#FFFFFF');
  strokeRR(ctx, mx, cy, mw, ch, 20, '#E2E8F0', 1.2);
  text(ctx, 'বিক্রির ওভারভিউ (গত ৩০ দিন)', mx + 22, cy + 38, { size: 18, weight: 700, color: '#0F172A' });
  text(ctx, '৳ ৯.৪২ লাখ  (+১৮.২%)', mx + mw - 22, cy + 38, { size: 20, weight: 800, color: '#16A34A', align: 'right' });

  const pts = [0.72, 0.64, 0.68, 0.52, 0.46, 0.50, 0.34, 0.28, 0.18];
  const gx0 = mx + 26;
  const gw = mw - 52;
  const gy0 = cy + 66;
  const gh = ch - 94;

  // Grid lines
  for (let g = 0; g < 3; g++) {
    const ly = gy0 + (gh / 2) * g;
    ctx.strokeStyle = '#EEF2F7';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx0, ly); ctx.lineTo(gx0 + gw, ly); ctx.stroke();
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(gx0 - 12, gy0 - 18, (gw + 28) * clamp(chartProgress), gh + 40);
  ctx.clip();

  // Area fill under spline
  ctx.beginPath();
  pts.forEach((py, i) => {
    const px = gx0 + (gw * i) / (pts.length - 1);
    const yy = gy0 + gh * py;
    if (i === 0) ctx.moveTo(px, yy);
    else ctx.lineTo(px, yy);
  });
  ctx.lineTo(gx0 + gw, gy0 + gh);
  ctx.lineTo(gx0, gy0 + gh);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, gy0, 0, gy0 + gh, [
    [0, 'rgba(37, 99, 235, 0.26)'],
    [1, 'rgba(37, 99, 235, 0.0)'],
  ]);
  ctx.fill();

  // Line stroke
  ctx.beginPath();
  pts.forEach((py, i) => {
    const px = gx0 + (gw * i) / (pts.length - 1);
    const yy = gy0 + gh * py;
    if (i === 0) ctx.moveTo(px, yy);
    else ctx.lineTo(px, yy);
  });
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  const lastX = gx0 + gw;
  const lastY = gy0 + gh * pts[pts.length - 1];
  circle(ctx, lastX, lastY, 8, '#2563EB');
  circle(ctx, lastX, lastY, 4, '#FFFFFF');
  ctx.restore();

  // Recent Orders Mini Table at bottom of dashboard
  const oy = cy + ch + 18;
  const oh = h - oy - 18;
  fillRR(ctx, mx, oy, mw, oh, 20, '#FFFFFF');
  strokeRR(ctx, mx, oy, mw, oh, 20, '#E2E8F0', 1.2);
  text(ctx, 'সাম্প্রতিক অর্ডার', mx + 22, oy + 36, { size: 18, weight: 800, color: '#0F172A' });

  const orders = [
    ['#IMS-10482', 'সাদিয়া রহমান', '৳ ২,৪৫০', 'নতুন', '#2563EB'],
    ['#IMS-10481', 'তানভীর হাসান', '৳ ১,৮৫০', 'প্রস্তুত হচ্ছে', '#D97706'],
    ['#IMS-10480', 'মেহেদী ইসলাম', '৳ ৩,২০০', 'ডেলিভারড', '#16A34A'],
  ];
  orders.forEach((o, i) => {
    const ry = oy + 58 + i * 52;
    if (ry + 40 > oy + oh) return;
    fillRR(ctx, mx + 16, ry, mw - 32, 44, 12, '#F8FAFC');
    text(ctx, o[0], mx + 28, ry + 28, { size: 15, weight: 700, color: '#1E293B' });
    text(ctx, o[1], mx + 150, ry + 28, { size: 15, weight: 600, color: '#334155' });
    text(ctx, o[2], mx + mw - 180, ry + 28, { size: 16, weight: 800, color: '#0F172A' });
    fillRR(ctx, mx + mw - 116, ry + 8, 92, 28, 14, alpha(o[4], 0.14));
    text(ctx, o[3], mx + mw - 70, ry + 27, { size: 13, weight: 700, color: o[4], align: 'center', maxWidth: 82 });
  });

  ctx.restore();
}
