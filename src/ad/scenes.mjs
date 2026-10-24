/**
 * CodePixel Web — 11 Master Commercial Scenes (1080 × 1920, 30 FPS)
 *
 * Every scene uses proportional sub-beat ratios derived directly from `AD_SYNC`
 * millisecond measurements so that on our 133.87s master audio EVERY visual
 * beat hits on the exact spoken word/pause to +/-1 frame, AND scales smoothly
 * if a custom voiceover duration is ever loaded in the browser renderer.
 */
import {
  W, H, clamp, lerp, easeOut, easeInOut, easeOutBack, easeOutQuint, beat, stag,
  alpha, text, paragraph, fillRR, strokeRR, rr, circle, shadow, noShadow, lin, glowOrb,
  icon, whatsappGlyph, brandMark, browserFrame, phoneFrame, fontStr, lightSweep,
} from '../render/kit.mjs';
import {
  PAL, DEMO_STORES, CATALOG_ITEMS, drawCoverImage, drawGradedBackdrop,
  glassCard, drawSceneHeader, drawHeroTitle, drawBottomBar, drawTouchCursor,
  drawStorefrontMobile, drawAdminDashboard,
} from './uiKit.mjs';

/* ============================================================================
 * SCENE 01 — HOOK (0.00s – 7.03s)
 * "আপনার ব্যবসার জন্য প্রিমিয়াম ওয়েবসাইট চান? মাত্র ৩০০০ টাকায়—তাও কোনো অগ্রিম পেমেন্ট ছাড়াই!"
 * Beats:
 *   0.00 -> 0.22*dur (1.55s): Chaotic Facebook Inbox messages piling up
 *   0.22*dur (1.55s): Diagonal electric light-blade slices screen -> Sleek Storefront
 *   0.404*dur (2.84s): Hero badge "মাত্র ৩০০০ টাকা" drops with gold/cyan light sweep
 *   0.679*dur (4.78s): "কোনো অগ্রিম পেমেন্ট নেই · ডেলিভারির পর পেমেন্ট" snaps in
 * ========================================================================== */
function scene01Hook(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'hook');

  const tReveal = dur * 0.22;     // 1.55s
  const tPrice = dur * 0.404;     // 2.84s ("মাত্র তিন হাজার টাকায়")
  const tZeroAdv = dur * 0.679;   // 4.78s ("তাও কোনো অগ্রিম পেমেন্ট ছাড়াই!")

  const wipe = clamp((t - (tReveal - 0.12)) / 0.52);
  const wiped = easeInOut(wipe);

  // Layer A: Pre-wipe chaotic inbox order struggle (visible 0 .. 2.0s)
  if (wiped < 0.999) {
    ctx.save();
    // Clip to un-wiped top-left diagonal polygon
    if (wiped > 0) {
      const cutY = lerp(-240, H + 320, wiped);
      ctx.beginPath();
      ctx.moveTo(0, cutY);
      ctx.lineTo(W, cutY - 260);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.clip();
    }

    // Dramatic dark red-amber stress tint in inbox chaos
    glowOrb(ctx, W * 0.5, H * 0.45, W * 0.78, '#EF4444', 0.20);
    text(ctx, 'শুধু ফেসবুক ইনবক্সে অর্ডার সামলাচ্ছেন?', W / 2, 230, {
      size: 50, weight: 800, color: '#FFFFFF', align: 'center', maxWidth: W - 120,
    });
    text(ctx, 'অগোছালো মেসেজ মানেই প্রতিদিন কাস্টমার হারানো', W / 2, 294, {
      size: 27, weight: 600, color: '#FCA5A5', align: 'center', maxWidth: W - 140,
    });

    const msgs = [
      { user: 'কাস্টমার মেসেজ · ২ মিনিট আগে', msg: 'ভাই এই পাঞ্জাবিটার দাম কত? L সাইজ হবে?', y: 400, x: 72 },
      { user: 'কাস্টমার কমেন্ট · ৫ মিনিট আগে', msg: 'ইনবক্স চেক করেন প্লিজ! অর্ডার কনফার্ম হয়েছে?', y: 590, x: 112 },
      { user: 'কাস্টমার মেসেজ · ১২ মিনিট আগে', msg: 'কালো রঙের ঘড়িটা স্টকে আছে? ছবি দেন!', y: 780, x: 68 },
      { user: 'অপেক্ষমাণ রিপ্লাই · ৯৯+ মেসেজ', msg: 'দাম ও সাইজ খুঁজে না পেয়ে কাস্টমার চলে যাচ্ছে…', y: 970, x: 104 },
    ];
    msgs.forEach((m, i) => {
      const mp = stag(t, i, 0.04, 0.14, 0.4);
      const floatY = Math.sin(t * 2.4 + i) * 5;
      ctx.save();
      ctx.globalAlpha = mp;
      const cx = m.x;
      const cy = m.y + (1 - mp) * 35 + floatY;
      glassCard(ctx, cx, cy, 888, 152, {
        radius: 26,
        fill: 'rgba(24, 18, 36, 0.92)',
        border: 'rgba(248, 113, 113, 0.36)',
      });
      circle(ctx, cx + 48, cy + 52, 20, '#DC2626');
      text(ctx, '!', cx + 48, cy + 60, { size: 24, weight: 800, color: '#FFFFFF', align: 'center' });
      text(ctx, m.user, cx + 84, cy + 56, { size: 22, weight: 600, color: '#FCA5A5' });
      text(ctx, m.msg, cx + 44, cy + 112, { size: 30, weight: 700, color: '#FFFFFF', maxWidth: 804 });
      ctx.restore();
    });
    ctx.restore();
  }

  // Layer B: Post-wipe gleaming E-Commerce Storefront + Bold 3000 BDT Hook Offer
  if (wiped > 0.01) {
    ctx.save();
    if (wiped < 1) {
      const cutY = lerp(-240, H + 320, wiped);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, cutY - 260);
      ctx.lineTo(0, cutY);
      ctx.closePath();
      ctx.clip();
    }

    drawSceneHeader(ctx, Math.max(0, t - tReveal + 0.2), {
      tagBn: 'প্রিমিয়াম ই-কমার্স সলিউশন', sceneNum: '০১', totalNum: '১১', accent: PAL.gold,
    });
    drawHeroTitle(
      ctx,
      Math.max(0, t - tReveal + 0.25),
      'আপনার ব্যবসার জন্য',
      'প্রিমিয়াম ওয়েবসাইট চান?',
      { y: 204, size: 62, accent: PAL.cyan },
    );

    // Sleek Mobile Storefront Preview on Left + Live Watch/Cosmetics Cards on Right
    const devP = beat(t, tReveal - 0.05, 0.65, easeOutQuint);
    const phoneW = 470;
    const phoneH = 850;
    const phoneX = 68;
    const phoneY = 390 + (1 - devP) * 60;

    phoneFrame(ctx, phoneX, phoneY, phoneW, phoneH, (sw, sh) => {
      drawStorefrontMobile(ctx, sw, sh, {
        store: DEMO_STORES[0],
        scrollY: lerp(0, 88, easeInOut(clamp((t - tReveal) / 4.2))),
        activeCat: 0,
        cartCount: 2,
        highlightCard: 0,
      });
    }, { radius: 44, bezel: 11 });

    // Right column floating showcase cards (Watch + Cosmetics real studio imagery)
    const sideCards = [
      { img: 'watch', title: 'TIMEORA Watch Store', price: '৳ ৫,৪৯০', sub: 'কাস্টম ব্র্যান্ড ডিজাইন', y: 404 },
      { img: 'serum', title: 'LUMÉRA Beauty Shop', price: '৳ ১,৪৯০', sub: 'স্মার্ট কার্ট ও চেকআউট', y: 696 },
    ];
    sideCards.forEach((sc, i) => {
      const sp = beat(t, tReveal + 0.14 + i * 0.16, 0.55, easeOutQuint);
      ctx.save();
      ctx.globalAlpha = sp;
      const sx = 568;
      const sy = sc.y + (1 - sp) * 40;
      glassCard(ctx, sx, sy, 444, 266, { radius: 26, fill: 'rgba(12, 22, 46, 0.90)' });
      drawCoverImage(ctx, sc.img, sx + 16, sy + 16, 412, 150, { radius: 18, zoom: 1.06 });
      text(ctx, sc.title, sx + 22, sy + 204, { size: 22, weight: 800, color: PAL.white, maxWidth: 270 });
      text(ctx, sc.price, sx + 422, sy + 204, { size: 22, weight: 800, color: PAL.gold, align: 'right' });
      text(ctx, sc.sub, sx + 22, sy + 240, { size: 18, weight: 600, color: PAL.cyan });
      ctx.restore();
    });

    // HERO PRICE BANNER AT EXACT `tPrice` (2.84s — "মাত্র ৩০০০ টাকায়!")
    const priceP = beat(t, tPrice - 0.10, 0.52, easeOutBack);
    if (priceP > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(priceP);
      const bx = 64;
      const by = 1300 + (1 - clamp(priceP)) * 44;
      const bw = W - 128;
      const bh = 212;
      glassCard(ctx, bx, by, bw, bh, {
        radius: 32,
        fill: lin(ctx, bx, by, bx + bw, by + bh, [
          [0, 'rgba(18, 36, 78, 0.96)'],
          [0.55, 'rgba(14, 27, 60, 0.96)'],
          [1, 'rgba(38, 29, 68, 0.96)'],
        ]),
        border: alpha(PAL.gold, 0.68),
        glow: 'rgba(41, 121, 255, 0.42)',
        blur: 56,
      });

      text(ctx, 'পূর্ণাঙ্গ কাস্টম ওয়েবসাইট + অ্যাডমিন প্যানেল', W / 2, by + 56, {
        size: 26, weight: 700, color: PAL.cyan, align: 'center', maxWidth: bw - 60,
      });
      text(ctx, 'মাত্র ৩০০০ টাকা', W / 2, by + 158, {
        size: 86, weight: 800, color: PAL.gold, align: 'center', maxWidth: bw - 60,
      });
      lightSweep(ctx, bx, by, bw, bh, clamp((t - tPrice) / 1.15), 'rgba(255, 224, 150, 0.28)', 190);
      ctx.restore();
    }

    // ZERO ADVANCE BANNER AT EXACT `tZeroAdv` (4.78s — "তাও কোনো অগ্রিম পেমেন্ট ছাড়াই!")
    const advP = beat(t, tZeroAdv - 0.08, 0.48, easeOutBack);
    if (advP > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(advP);
      const ay = 1542 + (1 - clamp(advP)) * 30;
      fillRR(ctx, 64, ay, W - 128, 124, 28, lin(ctx, 64, ay, W - 64, ay, [
        [0, 'rgba(16, 185, 129, 0.24)'],
        [1, 'rgba(41, 121, 255, 0.26)'],
      ]));
      strokeRR(ctx, 64, ay, W - 128, 124, 28, alpha(PAL.emerald, 0.72), 2);
      icon(ctx, 'checkCircle', 108, ay + 40, 44, PAL.emerald, 2.4);
      text(ctx, 'কোনো অগ্রিম পেমেন্ট নেই — ডেলিভারির পর পেমেন্ট!', 172, ay + 75, {
        size: 33, weight: 800, color: '#FFFFFF', maxWidth: W - 260,
      });
      ctx.restore();
    }

    drawBottomBar(ctx, Math.max(0, t - tReveal), 'নিজস্ব ব্র্যান্ডের ই-কমার্স ওয়েবসাইট শুরু করুন ঝুঁকি ছাড়াই', {
      accent: PAL.gold,
    });
    ctx.restore();

    // Glowing diagonal light blade on the wipe edge itself
    if (wiped > 0.02 && wiped < 0.98) {
      const cutY = lerp(-240, H + 320, wiped);
      ctx.save();
      ctx.strokeStyle = PAL.cyan;
      ctx.shadowColor = PAL.cyan;
      ctx.shadowBlur = 36;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, cutY);
      ctx.lineTo(W, cutY - 260);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/* ============================================================================
 * SCENE 02 — CUSTOMER WEBSITE & MULTI-INDUSTRY SHOWCASE (7.03s – 23.83s)
 * Part A (0 .. 0.46*dur): Desktop + Mobile synced branded storefront
 * Part B (0.46*dur .. dur): 5-Industry Carousel (Fashion, Watch, Cosmetics, Shoe, Electronics)
 * ========================================================================== */
function scene02Website(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'store');
  drawSceneHeader(ctx, t, { tagBn: 'ব্র্যান্ডেড অনলাইন স্টোর', sceneNum: '০২', totalNum: '১১', accent: PAL.cyan });

  const splitT = dur * 0.462; // ~7.77s in scene = exact sentence pause before "পোশাক, ঘড়ি..."
  const inCarousel = clamp((t - (splitT - 0.25)) / 0.55);

  if (inCarousel < 0.5) {
    drawHeroTitle(ctx, t, 'নিজস্ব ব্র্যান্ডের গোছানো', 'প্রফেশনাল অনলাইন স্টোর', {
      y: 204, size: 58, accent: PAL.cyan,
    });
  } else {
    drawHeroTitle(ctx, t - splitT + 0.3, 'পোশাক, ঘড়ি, কসমেটিকস,', 'জুতা কিংবা ইলেকট্রনিক্স', {
      y: 204, size: 56, accent: PAL.gold,
    });
  }

  // Active store cycles cleanly through all 5 verified categories during Part B!
  let storeIdx = 0;
  if (t >= splitT) {
    const span = Math.max(0.5, dur - splitT);
    storeIdx = Math.min(4, Math.floor(((t - splitT) / span) * 5));
  }
  const activeStore = DEMO_STORES[storeIdx];

  // Desktop Browser Frame (Upper-Center Stage: Desktop Responsive View)
  const deskP = beat(t, 0.08, 0.65, easeOutQuint);
  const bx = 64;
  const by = 382 + (1 - deskP) * 45;
  const bw = W - 128; // 952
  const bh = 620;

  browserFrame(ctx, bx, by, bw, bh, (sw, sh) => {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, sw, sh);

    // Desktop Navbar
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sw, 64);
    fillRR(ctx, 26, 14, 36, 36, 10, activeStore.accent);
    text(ctx, activeStore.brand[0], 44, 40, { size: 20, weight: 800, color: '#FFFFFF', align: 'center' });
    text(ctx, activeStore.brand, 76, 40, { size: 24, weight: 800, color: '#0F172A', letterSpacing: 1.5 });

    const navLinks = ['হোম', 'নতুন কালেকশন', 'ক্যাটাগরি', 'অফার', 'ট্র্যাক অর্ডার'];
    navLinks.forEach((nl, ni) => {
      text(ctx, nl, 268 + ni * 124, 39, {
        size: 16, weight: ni === 0 ? 700 : 500, color: ni === 0 ? PAL.electric : '#475569',
      });
    });

    // Split Desktop Hero: Editorial Copy Left + Studio Product Photo Right
    fillRR(ctx, 24, 82, sw - 48, 290, 24, '#0D1528');
    drawCoverImage(ctx, activeStore.img, sw * 0.46, 96, sw * 0.50, 262, {
      radius: 18, zoom: 1.06 + 0.04 * Math.sin(t * 0.6),
    });
    fillRR(ctx, 48, 110, 178, 34, 17, alpha(activeStore.accent, 0.9));
    text(ctx, activeStore.catBn, 137, 133, { size: 15, weight: 700, color: '#FFFFFF', align: 'center', maxWidth: 160 });
    text(ctx, activeStore.heroTitle, 48, 196, { size: 30, weight: 800, color: '#FFFFFF', maxWidth: sw * 0.39 });
    text(ctx, activeStore.heroSub, 48, 238, { size: 17, weight: 500, color: '#CBD5E1', maxWidth: sw * 0.39 });
    fillRR(ctx, 48, 272, 188, 50, 25, activeStore.accent);
    text(ctx, 'কালেকশন দেখুন →', 142, 304, { size: 17, weight: 700, color: '#FFFFFF', align: 'center' });

    // Bottom miniature desktop product strip
    for (let c = 0; c < 3; c++) {
      const item = CATALOG_ITEMS[(storeIdx + c) % CATALOG_ITEMS.length];
      const cw = (sw - 80) / 3;
      const cx = 24 + c * (cw + 16);
      const cy = 392;
      fillRR(ctx, cx, cy, cw, 174, 18, '#FFFFFF');
      strokeRR(ctx, cx, cy, cw, 174, 18, '#E2E8F0', 1.2);
      drawCoverImage(ctx, item.img, cx + 10, cy + 10, 118, 154, { radius: 12 });
      text(ctx, item.catBn, cx + 142, cy + 44, { size: 14, weight: 700, color: PAL.electric });
      text(ctx, item.nameBn, cx + 142, cy + 78, { size: 16, weight: 700, color: '#0F172A', maxWidth: cw - 154 });
      text(ctx, item.priceBn, cx + 142, cy + 114, { size: 20, weight: 800, color: '#1D4ED8' });
      fillRR(ctx, cx + 142, cy + 128, cw - 156, 32, 10, '#0F172A');
      text(ctx, 'অর্ডার করুন', cx + 142 + (cw - 156) / 2, cy + 149, {
        size: 13, weight: 700, color: '#FFFFFF', align: 'center',
      });
    }
  }, { url: activeStore.url, radius: 28 });

  // Lower Stage: Synchronized Mobile Responsive View + 5 Industry Pills Selector
  const mobX = 64;
  const mobY = 1034;
  const mobW = 430;
  const mobH = 650;

  phoneFrame(ctx, mobX, mobY, mobW, mobH, (sw, sh) => {
    drawStorefrontMobile(ctx, sw, sh, {
      store: activeStore,
      scrollY: 36 + 44 * Math.sin(t * 0.7),
      activeCat: (storeIdx + 1) % 5,
      cartCount: 2,
    });
  }, { radius: 40, bezel: 10 });

  // Right-side 5 Industry Switcher Cards ("মোবাইল ও কম্পিউটারে ১০০% রেসপন্সিভ")
  const rx = 524;
  const rw = 492;
  glassCard(ctx, rx, mobY, rw, mobH, { radius: 30, fill: 'rgba(11, 20, 42, 0.88)' });
  text(ctx, 'সব ধরনের ব্যবসার জন্য প্রস্তুত', rx + 30, mobY + 52, {
    size: 25, weight: 800, color: PAL.white, maxWidth: rw - 60,
  });
  text(ctx, 'কম্পিউটার ও মোবাইলে ১০০% রেসপন্সিভ', rx + 30, mobY + 88, {
    size: 19, weight: 600, color: PAL.cyan, maxWidth: rw - 60,
  });

  DEMO_STORES.forEach((ds, i) => {
    const iy = mobY + 116 + i * 102;
    const isAct = i === storeIdx;
    fillRR(ctx, rx + 22, iy, rw - 44, 88, 20, isAct ? 'rgba(41, 121, 255, 0.24)' : 'rgba(255,255,255,0.05)');
    strokeRR(ctx, rx + 22, iy, rw - 44, 88, 20, isAct ? PAL.cyan : 'rgba(255,255,255,0.09)', isAct ? 2 : 1);
    drawCoverImage(ctx, ds.img, rx + 34, iy + 10, 68, 68, { radius: 14 });
    text(ctx, ds.catBn, rx + 120, iy + 40, {
      size: 22, weight: 700, color: isAct ? '#FFFFFF' : '#CBD5E1', maxWidth: 250,
    });
    text(ctx, ds.url, rx + 120, iy + 68, {
      size: 16, weight: 500, color: isAct ? PAL.cyan : PAL.muted, maxWidth: 270,
    });
    if (isAct) {
      fillRR(ctx, rx + rw - 116, iy + 27, 74, 34, 17, PAL.emerald);
      text(ctx, 'LIVE', rx + rw - 79, iy + 50, { size: 15, weight: 800, color: '#FFFFFF', align: 'center' });
    }
  });

  drawBottomBar(ctx, t, '৪১+ লাইভ ডেমো ওয়েবসাইট — আপনার ব্র্যান্ডের নামে নতুন করে সাজানো', {
    accent: PAL.cyan,
  });
}

/* ============================================================================
 * SCENE 03 — PRODUCT BROWSING, SEARCH & CATEGORIES (23.83s – 35.64s)
 * ========================================================================== */
function scene03Browsing(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'store');
  drawSceneHeader(ctx, t, { tagBn: 'সহজ প্রোডাক্ট ব্রাউজিং', sceneNum: '০৩', totalNum: '১১', accent: PAL.cyan });
  drawHeroTitle(ctx, t, 'ক্যাটাগরি, সার্চ ও ফিল্টারে', 'এক নজরেই পছন্দের পণ্য', {
    y: 204, size: 58, accent: PAL.cyan,
  });

  const tSearch = dur * 0.22;
  const tDetail = dur * 0.62;
  const typedLen = t > tSearch ? Math.min(7, Math.floor((t - tSearch) * 7)) : 0;
  const query = 'পাঞ্জাবি'.slice(0, typedLen);
  const activeCat = t < dur * 0.35 ? 0 : t < dur * 0.7 ? 1 : 2;
  const hiCard = t > tDetail ? 0 : 1;

  // Centerpiece Interactive Storefront Phone + Clean 3-Card Feature Row Underneath
  const px = 124;
  const py = 382;
  const pw = 832;
  const ph = 990;

  phoneFrame(ctx, px, py, pw, ph, (sw, sh) => {
    drawStorefrontMobile(ctx, sw, sh, {
      store: DEMO_STORES[activeCat === 2 ? 1 : 0],
      scrollY: lerp(0, 260, easeInOut(clamp(t / (dur * 0.88)))),
      activeCat,
      searchQuery: query,
      cartCount: 2,
      highlightCard: hiCard,
    });
  }, { radius: 46, bezel: 12 });

  // Clean 3-Column Feature Callout Strip Below Phone (zero overlap with product cards!)
  const callouts = [
    ['search', 'স্মার্ট সার্চ ও ফিল্টার', 'দাম ও ক্যাটাগরি অনুযায়ী খুঁজুন', PAL.cyan],
    ['sparkle', 'স্টুডিও ছবি ও সঠিক দাম', 'আসল রঙ, সাইজ ও স্টক তথ্য', PAL.gold],
    ['checkCircle', 'বিস্তারিত বিবরণ ও রিভিউ', 'দ্রুত ও সহজ কেনাকাটার সিদ্ধান্ত', PAL.emerald],
  ];
  callouts.forEach(([ic, label, sub, acc], i) => {
    const p = stag(t, i, dur * 0.16, 0.22, 0.5);
    const cw2 = 304;
    const cx2 = 64 + i * (cw2 + 20);
    const cy2 = 1406 + (1 - p) * 26;
    ctx.save();
    ctx.globalAlpha = p;
    glassCard(ctx, cx2, cy2, cw2, 268, {
      radius: 26,
      fill: 'rgba(10, 20, 44, 0.92)',
      border: alpha(acc, 0.55),
    });
    fillRR(ctx, cx2 + 24, cy2 + 24, 56, 56, 16, alpha(acc, 0.16));
    icon(ctx, ic, cx2 + 36, cy2 + 36, 32, acc, 2.2);
    text(ctx, label, cx2 + 24, cy2 + 132, { size: 22, weight: 800, color: '#FFFFFF', maxWidth: cw2 - 48 });
    text(ctx, sub, cx2 + 24, cy2 + 174, { size: 17, weight: 600, color: PAL.slate, maxWidth: cw2 - 48 });
    text(ctx, '✓ প্যাকেজে অন্তর্ভুক্ত', cx2 + 24, cy2 + 230, { size: 18, weight: 700, color: acc });
    ctx.restore();
  });

  drawBottomBar(ctx, t, 'সার্চ, ক্যাটাগরি ফিল্টার, উইশলিস্ট ও বিস্তারিত প্রোডাক্ট পেজ অন্তর্ভুক্ত');
}

/* ============================================================================
 * SCENE 04 — VARIANT SELECTION, CART & SMART CHECKOUT (35.64s – 46.99s)
 * Beat A (0 .. 0.46*dur): Product Detail -> Size "L" & Color select -> Add to Cart
 * Beat B (0.46*dur .. dur): Smart Checkout (COD / bKash / Nagad / Card + OTP) -> Confirmed!
 * ========================================================================== */
function scene04Shopping(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'store');
  drawSceneHeader(ctx, t, { tagBn: 'স্মার্ট অর্ডার অভিজ্ঞতা', sceneNum: '০৪', totalNum: '১১', accent: PAL.emerald });

  const tSelect = dur * 0.185;
  const tCart = dur * 0.326;
  const tCheckout = dur * 0.462;
  const tConfirm = dur * 0.797;

  const slide = easeInOut(clamp((t - tCheckout) / 0.58));

  drawHeroTitle(
    ctx,
    t,
    slide < 0.5 ? 'সাইজ ও কালার বেছে কার্টে যোগ' : 'ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট',
    slide < 0.5 ? 'ইনবক্সে অপেক্ষার দিন শেষ' : 'কয়েক সেকেন্ডেই অর্ডার সম্পন্ন',
    { y: 204, size: 56, accent: slide < 0.5 ? PAL.cyan : PAL.emerald },
  );

  const cardX = 84;
  const cardY = 392;
  const cardW = W - 168; // 912
  const cardH = 1280;

  // Stage 1: Product Detail + Variant Picker
  if (slide < 0.99) {
    ctx.save();
    ctx.globalAlpha = 1 - slide;
    ctx.translate(-slide * 140, 0);

    glassCard(ctx, cardX, cardY, cardW, cardH, {
      radius: 36, fill: '#FFFFFF', border: 'rgba(226,232,240,0.9)',
    });

    drawCoverImage(ctx, 'panjabi', cardX + 28, cardY + 28, cardW - 56, 560, { radius: 26, zoom: 1.05 });
    fillRR(ctx, cardX + 54, cardY + 54, 174, 42, 21, 'rgba(15, 23, 42, 0.82)');
    text(ctx, 'স্টকে আছে · COD', cardX + 141, cardY + 82, { size: 18, weight: 700, color: '#4ADE80', align: 'center' });

    text(ctx, 'NOIRÉ SIGNATURE COLLECTION', cardX + 40, cardY + 642, { size: 19, weight: 700, color: PAL.electric, letterSpacing: 1.5 });
    text(ctx, 'সিগনেচার লিনেন পাঞ্জাবি', cardX + 40, cardY + 698, { size: 42, weight: 800, color: '#0F172A' });
    text(ctx, '৳ ২,৪৫০', cardX + cardW - 40, cardY + 698, { size: 44, weight: 800, color: '#1D4ED8', align: 'right' });

    // Size Selector
    text(ctx, 'সাইজ নির্বাচন করুন:', cardX + 40, cardY + 776, { size: 24, weight: 700, color: '#334155' });
    const sizes = ['S', 'M', 'L', 'XL'];
    const selectedIdx = t >= tSelect ? 2 : 1; // switches M -> L at tSelect
    sizes.forEach((sz, i) => {
      const sx = cardX + 40 + i * 124;
      const sy = cardY + 802;
      const act = i === selectedIdx;
      fillRR(ctx, sx, sy, 104, 68, 18, act ? '#0F172A' : '#F1F5F9');
      strokeRR(ctx, sx, sy, 104, 68, 18, act ? PAL.electric : '#CBD5E1', act ? 3 : 1.5);
      text(ctx, sz, sx + 52, sy + 44, { size: 26, weight: 800, color: act ? '#FFFFFF' : '#334155', align: 'center' });
    });

    // Color Swatches on right
    text(ctx, 'কালার:', cardX + 590, cardY + 776, { size: 24, weight: 700, color: '#334155' });
    const cols = ['#E9DFCF', '#1E293B', '#8C6239'];
    cols.forEach((col, i) => {
      const cx = cardX + 618 + i * 78;
      const cy = cardY + 836;
      if (i === 0) strokeRR(ctx, cx - 28, cy - 28, 56, 56, 28, PAL.electric, 3.5);
      circle(ctx, cx, cy, 20, col);
    });

    // Quantity & Add-to-Cart Button
    const cartPressed = t >= tCart;
    const btnY = cardY + 936;
    fillRR(ctx, cardX + 40, btnY, cardW - 80, 96, 26, cartPressed ? '#16A34A' : PAL.electric);
    text(
      ctx,
      cartPressed ? '✓ কার্টে যোগ হয়েছে — চেকআউটে যাচ্ছেন…' : 'কার্টে যোগ করুন · ৳ ২,৪৫০',
      cardX + cardW / 2,
      btnY + 60,
      { size: 30, weight: 800, color: '#FFFFFF', align: 'center', maxWidth: cardW - 120 },
    );

    // Trust icons strip inside product page
    fillRR(ctx, cardX + 40, cardY + 1072, cardW - 80, 152, 22, '#F8FAFC');
    strokeRR(ctx, cardX + 40, cardY + 1072, cardW - 80, 152, 22, '#E2E8F0', 1.2);
    text(ctx, '✓ সারা বাংলাদেশে হোম ডেলিভারি    ✓ সহজ রিটার্ন পলিসি', cardX + cardW / 2, cardY + 1134, {
      size: 22, weight: 700, color: '#1E293B', align: 'center', maxWidth: cardW - 110,
    });
    text(ctx, '✓ ক্যাশ অন ডেলিভারি · bKash · Nagad · Card পেমেন্ট সুবিধা', cardX + cardW / 2, cardY + 1186, {
      size: 21, weight: 600, color: '#2563EB', align: 'center', maxWidth: cardW - 110,
    });

    // Touch cursor choreography: taps "L", then taps "Add to Cart"
    const cursorX = t < tCart - 0.35
      ? lerp(cardX + 190, cardX + 340, easeOut(clamp((t - (tSelect - 0.4)) / 0.45)))
      : lerp(cardX + 340, cardX + cardW / 2, easeInOut(clamp((t - (tCart - 0.35)) / 0.35)));
    const cursorY = t < tCart - 0.35
      ? cardY + 838
      : lerp(cardY + 838, btnY + 52, easeInOut(clamp((t - (tCart - 0.35)) / 0.35)));
    const clickP = t >= tSelect && t < tSelect + 0.45
      ? (t - tSelect) / 0.45
      : t >= tCart && t < tCart + 0.5
        ? (t - tCart) / 0.5
        : 0;
    drawTouchCursor(ctx, cursorX, cursorY, clickP);
    ctx.restore();
  }

  // Stage 2: Smart Checkout & Payment Methods + Confirmed Toast
  if (slide > 0.01) {
    ctx.save();
    ctx.globalAlpha = slide;
    ctx.translate((1 - slide) * 140, 0);

    glassCard(ctx, cardX, cardY, cardW, cardH, {
      radius: 36, fill: '#FFFFFF', border: 'rgba(226,232,240,0.95)',
    });

    text(ctx, 'স্মার্ট চেকআউট (Smart Checkout)', cardX + 44, cardY + 68, {
      size: 34, weight: 800, color: '#0F172A',
    });
    fillRR(ctx, cardX + cardW - 250, cardY + 32, 206, 46, 23, '#ECFDF5');
    text(ctx, 'OTP ভেরিফাইড', cardX + cardW - 147, cardY + 62, {
      size: 19, weight: 700, color: '#059669', align: 'center',
    });

    // Customer summary fields
    const fields = [
      ['কাস্টমারের নাম', 'সাদিয়া রহমান'],
      ['মোবাইল নম্বর', '017XXXXXXXX  (OTP নিশ্চিত)'],
      ['ডেলিভারি ঠিকানা', 'ধানমন্ডি ২৭, ঢাকা — ইনসাইড ঢাকা ডেলিভারি'],
    ];
    fields.forEach(([lbl, val], i) => {
      const fy = cardY + 108 + i * 114;
      fillRR(ctx, cardX + 44, fy, cardW - 88, 96, 20, '#F8FAFC');
      strokeRR(ctx, cardX + 44, fy, cardW - 88, 96, 20, '#E2E8F0', 1.4);
      text(ctx, lbl, cardX + 68, fy + 36, { size: 17, weight: 600, color: '#64748B' });
      text(ctx, val, cardX + 68, fy + 74, { size: 24, weight: 700, color: '#0F172A', maxWidth: cardW - 140 });
    });

    // Payment method grid: COD + bKash + Nagad + Card
    text(ctx, 'পেমেন্ট মাধ্যম বেছে নিন:', cardX + 44, cardY + 494, { size: 24, weight: 800, color: '#0F172A' });
    const pays = [
      { title: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য হাতে পেয়ে পেমেন্ট', color: '#16A34A', active: true },
      { title: 'bKash পেমেন্ট', sub: 'দ্রুত মোবাইল পেমেন্ট', color: '#E11D48', active: false },
      { title: 'Nagad পেমেন্ট', sub: 'তাৎক্ষণিক ডিজিটাল পে', color: '#EA580C', active: false },
      { title: 'ডেবিট / ক্রেডিট কার্ড', sub: 'নিরাপদ অনলাইন গেটওয়ে', color: '#2563EB', active: false },
    ];
    const pw2 = (cardW - 108) / 2;
    pays.forEach((pm, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const px2 = cardX + 44 + col * (pw2 + 20);
      const py2 = cardY + 520 + row * 124;
      fillRR(ctx, px2, py2, pw2, 108, 20, pm.active ? alpha(pm.color, 0.10) : '#F8FAFC');
      strokeRR(ctx, px2, py2, pw2, 108, 20, pm.active ? pm.color : '#CBD5E1', pm.active ? 2.6 : 1.3);
      circle(ctx, px2 + 34, py2 + 54, 14, pm.color);
      if (pm.active) icon(ctx, 'check', px2 + 23, py2 + 43, 22, '#FFFFFF', 2.6);
      text(ctx, pm.title, px2 + 62, py2 + 48, { size: 22, weight: 800, color: '#0F172A', maxWidth: pw2 - 80 });
      text(ctx, pm.sub, px2 + 62, py2 + 80, { size: 17, weight: 600, color: '#475569', maxWidth: pw2 - 80 });
    });

    // Order total summary
    fillRR(ctx, cardX + 44, cardY + 790, cardW - 88, 126, 22, '#0F172A');
    text(ctx, 'সিগনেচার লিনেন পাঞ্জাবি (সাইজ L) + ডেলিভারি', cardX + 72, cardY + 840, {
      size: 21, weight: 600, color: '#CBD5E1', maxWidth: 560,
    });
    text(ctx, 'সর্বমোট বিল', cardX + 72, cardY + 886, { size: 26, weight: 700, color: '#FFFFFF' });
    text(ctx, '৳ ২,৫২০', cardX + cardW - 72, cardY + 884, { size: 42, weight: 800, color: PAL.gold, align: 'right' });

    const confirmed = t >= tConfirm;
    const confP = beat(t, tConfirm - 0.08, 0.5, easeOutBack);
    if (!confirmed) {
      fillRR(ctx, cardX + 44, cardY + 952, cardW - 88, 96, 26, PAL.electric);
      text(ctx, 'অর্ডার কনফার্ম করুন →', cardX + cardW / 2, cardY + 1012, {
        size: 32, weight: 800, color: '#FFFFFF', align: 'center',
      });
    } else {
      ctx.save();
      ctx.globalAlpha *= clamp(confP);
      fillRR(ctx, cardX + 44, cardY + 948, cardW - 88, 276, 28, '#ECFDF5');
      strokeRR(ctx, cardX + 44, cardY + 948, cardW - 88, 276, 28, '#10B981', 3);
      circle(ctx, cardX + cardW / 2, cardY + 1022, 42, '#10B981');
      icon(ctx, 'check', cardX + cardW / 2 - 22, cardY + 1000, 44, '#FFFFFF', 3);
      text(ctx, 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!', cardX + cardW / 2, cardY + 1118, {
        size: 34, weight: 800, color: '#065F46', align: 'center',
      });
      text(ctx, 'অর্ডার আইডি #IMS-10483 · অ্যাডমিন প্যানেলে যুক্ত হয়েছে', cardX + cardW / 2, cardY + 1172, {
        size: 22, weight: 600, color: '#047857', align: 'center', maxWidth: cardW - 130,
      });
      ctx.restore();
    }
    ctx.restore();
  }

  drawBottomBar(ctx, t, 'COD, bKash, Nagad, Card ও OTP অর্ডার ভেরিফিকেশন সুবিধা', {
    accent: PAL.emerald,
  });
}

/* ============================================================================
 * SCENE 05 — ADMIN PANEL REVEAL: CODEPIXEL COMMERCE OS (46.99s – 59.79s)
 * ========================================================================== */
function scene05Admin(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'admin');
  drawSceneHeader(ctx, t, { tagBn: 'অ্যাডমিন কন্ট্রোল প্যানেল', sceneNum: '০৫', totalNum: '১১', accent: PAL.cyan });
  drawHeroTitle(ctx, t, 'দোকান চালানোর পুরো নিয়ন্ত্রণ', 'শক্তিশালী অ্যাডমিন প্যানেলে', {
    y: 204, size: 58, accent: PAL.cyan,
  });

  const p = beat(t, 0.08, 0.7, easeOutQuint);
  const ax = 56;
  const ay = 388 + (1 - p) * 48;
  const aw = W - 112; // 968
  const ah = 980;

  browserFrame(ctx, ax, ay, aw, ah, (sw, sh) => {
    drawAdminDashboard(ctx, sw, sh, t, {
      chartProgress: easeOut(clamp((t - 0.55) / 2.2)),
    });
  }, { url: 'demoadmin-jet.vercel.app · CodePixel Commerce OS', radius: 28 });

  // Bottom 3 Highlight Pills for Business Control
  const pills = [
    ['chart', 'লাইভ বিক্রি ও আয়ের হিসাব', 'প্রতিদিনের রিপোর্ট এক পর্দায়'],
    ['box', 'প্রোডাক্ট, ক্যাটাগরি ও স্টক', 'কোডিং ছাড়াই সহজ নিয়ন্ত্রণ'],
    ['truck', 'অর্ডার, ইনভয়েস ও কুরিয়ার', 'মোবাইল ও পিসি থেকে পরিচালনা'],
  ];
  pills.forEach(([ic, title, sub], i) => {
    const pp = stag(t, i, 0.85, 0.22, 0.5);
    const pw = 304;
    const px = 64 + i * (pw + 20);
    const py = 1408 + (1 - pp) * 26;
    ctx.save();
    ctx.globalAlpha = pp;
    glassCard(ctx, px, py, pw, 258, { radius: 26, fill: 'rgba(11, 21, 46, 0.90)' });
    fillRR(ctx, px + 24, py + 24, 56, 56, 16, alpha(PAL.cyan, 0.16));
    icon(ctx, ic, px + 36, py + 36, 32, PAL.cyan, 2.2);
    text(ctx, title, px + 24, py + 132, { size: 22, weight: 800, color: PAL.white, maxWidth: pw - 48 });
    text(ctx, sub, px + 24, py + 172, { size: 17, weight: 600, color: PAL.slate, maxWidth: pw - 48 });
    text(ctx, '✓ অন্তর্ভুক্ত', px + 24, py + 224, { size: 18, weight: 700, color: PAL.emerald });
    ctx.restore();
  });

  drawBottomBar(ctx, t, 'লাইভ অ্যাডমিন ডেমো: demoadmin-jet.vercel.app — নিজে চালিয়ে দেখুন');
}

/* ============================================================================
 * SCENE 06 — PRODUCT, CATEGORY, STOCK & VARIANT MANAGEMENT (59.79s – 69.44s)
 * Purposeful UI Workflow: Fill new product form -> Save -> Appears in Product List!
 * ========================================================================== */
function scene06Products(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'admin');
  drawSceneHeader(ctx, t, { tagBn: 'প্রোডাক্ট ও স্টক ম্যানেজমেন্ট', sceneNum: '০৬', totalNum: '১১', accent: PAL.gold });
  drawHeroTitle(ctx, t, 'সহজেই নতুন পণ্য, দাম,', 'সাইজ, কালার ও স্টক আপডেট', {
    y: 204, size: 56, accent: PAL.gold,
  });

  const tPhoto = dur * 0.24;
  const tPrice = dur * 0.48;
  const tSave = dur * 0.77;
  const saved = t >= tSave;

  // Upper Card: Add/Edit Product Interactive Form inside Admin Panel
  const fx = 64;
  const fy = 386;
  const fw = W - 128; // 952
  const fh = 690;

  glassCard(ctx, fx, fy, fw, fh, { radius: 32, fill: '#FFFFFF', border: '#CBD5E1' });
  fillRR(ctx, fx, fy, fw, 74, 32, '#0F172A');
  fillRR(ctx, fx, fy + 40, fw, 34, 0, '#0F172A');
  icon(ctx, 'plus', fx + 30, fy + 21, 30, PAL.cyan, 2.5);
  text(ctx, 'নতুন পণ্য যোগ / সম্পাদনা করুন (Products & Variants)', fx + 74, fy + 46, {
    size: 23, weight: 800, color: '#FFFFFF', maxWidth: fw - 120,
  });

  // Left: Studio Photo Upload Slot
  const imgUploaded = t >= tPhoto * 0.6;
  fillRR(ctx, fx + 32, fy + 104, 310, 340, 24, '#F1F5F9');
  strokeRR(ctx, fx + 32, fy + 104, 310, 340, 24, imgUploaded ? PAL.electric : '#94A3B8', 2);
  if (imgUploaded) {
    const ip = beat(t, tPhoto * 0.6, 0.45, easeOutQuint);
    ctx.save();
    ctx.globalAlpha = ip;
    drawCoverImage(ctx, 'panjabi', fx + 44, fy + 116, 286, 268, { radius: 18, zoom: 1.05 });
    fillRR(ctx, fx + 64, fy + 394, 246, 36, 18, '#ECFDF5');
    text(ctx, '✓ পণ্যের ছবি যুক্ত হয়েছে', fx + 187, fy + 418, {
      size: 16, weight: 700, color: '#059669', align: 'center',
    });
    ctx.restore();
  }

  // Right: Product Title, Category, Price, Stock, Variants
  const rx = fx + 372;
  const rw = fw - 404;

  const formRows = [
    ['পণ্যের নাম', 'সিগনেচার লিনেন পাঞ্জাবি — Ivory Edition'],
    ['ক্যাটাগরি', 'পোশাক ও ফ্যাশন  ›  পাঞ্জাবি কালেকশন'],
  ];
  formRows.forEach(([lbl, val], i) => {
    const ry = fy + 104 + i * 108;
    fillRR(ctx, rx, ry, rw, 92, 18, '#F8FAFC');
    strokeRR(ctx, rx, ry, rw, 92, 18, '#E2E8F0', 1.4);
    text(ctx, lbl, rx + 22, ry + 32, { size: 16, weight: 600, color: '#64748B' });
    text(ctx, val, rx + 22, ry + 68, { size: 22, weight: 700, color: '#0F172A', maxWidth: rw - 44 });
  });

  // Price + Stock side-by-side
  const halfW = (rw - 20) / 2;
  const py2 = fy + 322;
  const priceActive = t >= tPrice;
  fillRR(ctx, rx, py2, halfW, 120, 18, priceActive ? '#EFF6FF' : '#F8FAFC');
  strokeRR(ctx, rx, py2, halfW, 120, 18, priceActive ? PAL.electric : '#E2E8F0', priceActive ? 2.4 : 1.4);
  text(ctx, 'বিক্রয় মূল্য (BDT)', rx + 22, py2 + 36, { size: 16, weight: 600, color: '#64748B' });
  text(ctx, '৳ ২,৪৫০', rx + 22, py2 + 88, { size: 34, weight: 800, color: '#1D4ED8' });

  fillRR(ctx, rx + halfW + 20, py2, halfW, 120, 18, priceActive ? '#ECFDF5' : '#F8FAFC');
  strokeRR(ctx, rx + halfW + 20, py2, halfW, 120, 18, priceActive ? '#10B981' : '#E2E8F0', priceActive ? 2.4 : 1.4);
  text(ctx, 'স্টক সংখ্যা (Inventory)', rx + halfW + 42, py2 + 36, { size: 16, weight: 600, color: '#64748B' });
  text(ctx, '৪৫ পিস স্টকে', rx + halfW + 42, py2 + 88, { size: 30, weight: 800, color: '#059669' });

  // Variants Bar + Save Button at Bottom of Form
  fillRR(ctx, fx + 32, fy + 468, 540, 88, 18, '#F8FAFC');
  strokeRR(ctx, fx + 32, fy + 468, 540, 88, 18, '#E2E8F0', 1.4);
  text(ctx, 'ভ্যারিয়েন্ট (সাইজ ও কালার):', fx + 54, fy + 502, { size: 16, weight: 700, color: '#475569' });
  ['S', 'M', 'L', 'XL', 'Ivory', 'Navy'].forEach((v, i) => {
    const vx = fx + 54 + i * 82;
    fillRR(ctx, vx, fy + 514, 72, 32, 10, i < 4 ? '#0F172A' : '#2563EB');
    text(ctx, v, vx + 36, fy + 536, { size: 15, weight: 700, color: '#FFFFFF', align: 'center' });
  });

  // Save Button
  fillRR(ctx, fx + 594, fy + 468, fw - 626, 88, 22, saved ? '#16A34A' : PAL.electric);
  text(ctx, saved ? '✓ পণ্য সংরক্ষিত!' : 'পণ্য সংরক্ষণ করুন', fx + 594 + (fw - 626) / 2, fy + 522, {
    size: 25, weight: 800, color: '#FFFFFF', align: 'center', maxWidth: fw - 650,
  });

  // Helper status banner inside form bottom
  fillRR(ctx, fx + 32, fy + 580, fw - 64, 82, 18, saved ? '#ECFDF5' : '#EFF6FF');
  text(
    ctx,
    saved
      ? '✓ নতুন পণ্যটি সাথে সাথে আপনার ওয়েবসাইট ও ইনভেন্টরি তালিকায় যুক্ত হয়েছে!'
      : 'ছবি, দাম, ক্যাটাগরি, স্টক ও ভ্যারিয়েন্ট যেকোনো সময় নিজেই পরিবর্তন করতে পারবেন।',
    fx + fw / 2,
    fy + 630,
    { size: 21, weight: 700, color: saved ? '#065F46' : '#1E40AF', align: 'center', maxWidth: fw - 104 },
  );

  // Lower Card: Live Product Inventory Table where the newly saved product appears at Row 0!
  const lx = 64;
  const ly = 1106;
  const lw = W - 128;
  const lh = 576;
  glassCard(ctx, lx, ly, lw, lh, { radius: 30, fill: 'rgba(11, 20, 44, 0.90)' });
  text(ctx, 'স্টোরের লাইভ প্রোডাক্ট তালিকা', lx + 34, ly + 52, { size: 25, weight: 800, color: PAL.white });
  text(ctx, saved ? 'মোট ৩৭টি পণ্য সক্রিয়' : 'মোট ৩৬টি পণ্য সক্রিয়', lx + lw - 34, ly + 52, {
    size: 20, weight: 700, color: PAL.emerald, align: 'right',
  });

  const rows = [
    ...(saved ? [{ img: 'panjabi', name: 'সিগনেচার লিনেন পাঞ্জাবি (এইমাত্র যুক্ত)', cat: 'পোশাক', price: '৳ ২,৪৫০', stock: '৪৫ পিস', fresh: true }] : []),
    { img: 'watch', name: 'এক্সিকিউটিভ স্টিল ক্রোনোগ্রাফ', cat: 'ঘড়ি', price: '৳ ৫,৪৯০', stock: '২৮ পিস', fresh: false },
    { img: 'serum', name: 'ভিটামিন সি ব্রাইটেনিং সিরাম', cat: 'স্কিনকেয়ার', price: '৳ ১,৪৯০', stock: '৬২ পিস', fresh: false },
    { img: 'boot', name: 'প্রিমিয়াম চেলসি বুট চকলেট', cat: 'জুতা', price: '৳ ১,৮৯০', stock: '৩৪ পিস', fresh: false },
    { img: 'blazer', name: 'মডার্ন কো-অর্ড ব্লেজার সেট', cat: 'ফ্যাশন', price: '৳ ২,৯৫০', stock: '১৯ পিস', fresh: false },
  ].slice(0, 4);

  rows.forEach((r, i) => {
    const ry = ly + 82 + i * 116;
    fillRR(ctx, lx + 26, ry, lw - 52, 100, 20, r.fresh ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255,255,255,0.06)');
    strokeRR(ctx, lx + 26, ry, lw - 52, 100, 20, r.fresh ? PAL.emerald : 'rgba(255,255,255,0.10)', r.fresh ? 2.2 : 1);
    drawCoverImage(ctx, r.img, lx + 42, ry + 12, 76, 76, { radius: 14 });
    text(ctx, r.name, lx + 138, ry + 45, { size: 22, weight: 700, color: '#FFFFFF', maxWidth: 460 });
    text(ctx, `${r.cat}  ·  স্টক: ${r.stock}`, lx + 138, ry + 78, { size: 17, weight: 600, color: PAL.cyan });
    text(ctx, r.price, lx + lw - 56, ry + 60, { size: 26, weight: 800, color: PAL.gold, align: 'right' });
  });

  // Animated touch click on Save button
  if (t > tSave - 0.5 && t < tSave + 0.55) {
    drawTouchCursor(ctx, fx + 594 + (fw - 626) / 2, fy + 512, clamp((t - tSave + 0.05) / 0.45));
  }

  drawBottomBar(ctx, t, 'আনলিমিটেড প্রোডাক্ট, ক্যাটাগরি, ভ্যারিয়েন্ট ও লো-স্টক অ্যালার্ট সিস্টেম', {
    accent: PAL.gold,
  });
}

/* ============================================================================
 * SCENE 07 — ORDER MANAGEMENT, STATUS & COURIER AUTOMATION (69.44s – 80.04s)
 * ========================================================================== */
function scene07Orders(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'admin');
  drawSceneHeader(ctx, t, { tagBn: 'অর্ডার ও কুরিয়ার ম্যানেজমেন্ট', sceneNum: '০৭', totalNum: '১১', accent: PAL.emerald });
  drawHeroTitle(ctx, t, 'এক ক্লিকে অর্ডার যাচাই,', 'স্ট্যাটাস আপডেট ও কুরিয়ার বুকিং', {
    y: 204, size: 55, accent: PAL.emerald,
  });

  const tStatus = dur * 0.48;
  const tCourier = dur * 0.74;
  const statusStage = t < tStatus ? 0 : t < tCourier ? 1 : 2;
  const statusLabels = ['নতুন অর্ডার', 'প্রস্তুত হচ্ছে', 'কুরিয়ারে পাঠানো হয়েছে'];
  const statusColors = ['#2563EB', '#D97706', '#16A34A'];

  // Top Card: Live Orders List Table
  const ox = 64;
  const oy = 388;
  const ow = W - 128;
  const oh = 560;
  glassCard(ctx, ox, oy, ow, oh, { radius: 30, fill: '#FFFFFF', border: '#CBD5E1' });
  text(ctx, 'সাম্প্রতিক অর্ডার তালিকা (Orders)', ox + 36, oy + 54, { size: 26, weight: 800, color: '#0F172A' });
  fillRR(ctx, ox + ow - 224, oy + 20, 190, 44, 22, '#EFF6FF');
  text(ctx, 'আজকের অর্ডার: ২৪টি', ox + ow - 129, oy + 49, { size: 17, weight: 700, color: '#1D4ED8', align: 'center' });

  const orderRows = [
    { id: '#IMS-10482', name: 'সাদিয়া রহমান · ধানমন্ডি, ঢাকা', items: '৩টি পণ্য', total: '৳ ২,৪৫০', st: statusLabels[statusStage], col: statusColors[statusStage], active: true },
    { id: '#IMS-10481', name: 'তানভীর হাসান · উত্তরা, ঢাকা', items: '২টি পণ্য', total: '৳ ১,৮৫০', st: 'প্রস্তুত হচ্ছে', col: '#D97706', active: false },
    { id: '#IMS-10480', name: 'মেহেদী ইসলাম · চট্টগ্রাম সদর', items: '১টি পণ্য', total: '৳ ৩,২০০', st: 'ডেলিভারড', col: '#16A34A', active: false },
    { id: '#IMS-10478', name: 'ফারহানা আক্তার · সিলেট', items: '২টি পণ্য', total: '৳ ২,৯৪০', st: 'ডেলিভারড', col: '#16A34A', active: false },
  ];

  orderRows.forEach((r, i) => {
    const ry = oy + 86 + i * 112;
    fillRR(ctx, ox + 26, ry, ow - 52, 96, 20, r.active ? '#EFF6FF' : '#F8FAFC');
    strokeRR(ctx, ox + 26, ry, ow - 52, 96, 20, r.active ? PAL.electric : '#E2E8F0', r.active ? 2.6 : 1.2);
    text(ctx, r.id, ox + 48, ry + 40, { size: 20, weight: 800, color: '#1E40AF' });
    text(ctx, r.name, ox + 190, ry + 40, { size: 20, weight: 700, color: '#0F172A', maxWidth: 420 });
    text(ctx, `${r.items}  ·  মোট: ${r.total}`, ox + 48, ry + 75, { size: 18, weight: 700, color: '#475569' });
    fillRR(ctx, ox + ow - 266, ry + 26, 214, 44, 22, alpha(r.col, 0.15));
    text(ctx, r.st, ox + ow - 159, ry + 55, { size: 17, weight: 800, color: r.col, align: 'center', maxWidth: 194 });
  });

  // Bottom Card: Selected Order Detail Drawer + One-Click Status & Courier Dispatch
  const dx = 64;
  const dy = 978;
  const dw = W - 128;
  const dh = 704;
  glassCard(ctx, dx, dy, dw, dh, { radius: 32, fill: 'rgba(11, 21, 46, 0.94)', border: alpha(PAL.cyan, 0.4) });

  text(ctx, 'অর্ডার বিস্তারিত ও অ্যাকশন  ·  #IMS-10482', dx + 38, dy + 58, {
    size: 27, weight: 800, color: PAL.white,
  });
  fillRR(ctx, dx + dw - 246, dy + 24, 208, 48, 24, 'rgba(255,255,255,0.10)');
  text(ctx, 'ইনভয়েস প্রিন্ট রেডি', dx + dw - 142, dy + 55, { size: 18, weight: 700, color: PAL.cyan, align: 'center' });

  // Customer & Item Details Box
  fillRR(ctx, dx + 34, dy + 92, dw - 68, 178, 22, 'rgba(255,255,255,0.06)');
  drawCoverImage(ctx, 'panjabi', dx + 54, dy + 114, 134, 134, { radius: 18 });
  text(ctx, 'কাস্টমার: সাদিয়া রহমান  ·  ধানমন্ডি ২৭, ঢাকা', dx + 214, dy + 148, {
    size: 23, weight: 700, color: '#FFFFFF', maxWidth: dw - 260,
  });
  text(ctx, 'পণ্য: সিগনেচার লিনেন পাঞ্জাবি × ২, ভিটামিন সি সিরাম × ১', dx + 214, dy + 190, {
    size: 20, weight: 600, color: PAL.slate, maxWidth: dw - 260,
  });
  text(ctx, 'ক্যাশ অন ডেলিভারি (COD)  ·  সংগ্রহযোগ্য: ৳ ২,৪৫০', dx + 214, dy + 234, {
    size: 21, weight: 700, color: PAL.gold, maxWidth: dw - 260,
  });

  // 3-Step Visual Status Pipeline
  text(ctx, 'অর্ডার স্ট্যাটাস প্রগ্রেস:', dx + 38, dy + 324, { size: 21, weight: 700, color: PAL.cyan });
  const steps = ['১. নতুন অর্ডার', '২. প্যাকিং প্রস্তুত', '৩. কুরিয়ারে বুকিং সম্পন্ন'];
  steps.forEach((st, i) => {
    const sw2 = (dw - 108) / 3;
    const sx = dx + 34 + i * (sw2 + 20);
    const sy = dy + 350;
    const done = i <= statusStage;
    fillRR(ctx, sx, sy, sw2, 92, 20, done ? 'rgba(16, 185, 129, 0.24)' : 'rgba(255,255,255,0.06)');
    strokeRR(ctx, sx, sy, sw2, 92, 20, done ? PAL.emerald : 'rgba(255,255,255,0.14)', done ? 2.4 : 1);
    text(ctx, st, sx + sw2 / 2, sy + 55, {
      size: 20, weight: 800, color: done ? '#FFFFFF' : PAL.muted, align: 'center', maxWidth: sw2 - 24,
    });
  });

  // Courier Dispatch CTA / Confirmation Box
  const sent = statusStage === 2;
  fillRR(ctx, dx + 34, dy + 478, dw - 68, 184, 26, sent ? 'rgba(16, 185, 129, 0.22)' : 'rgba(41, 121, 255, 0.24)');
  strokeRR(ctx, dx + 34, dy + 478, dw - 68, 184, 26, sent ? PAL.emerald : PAL.cyan, 2.4);
  icon(ctx, 'truck', dx + 68, dy + 538, 56, sent ? PAL.emerald : PAL.cyan, 2.2);
  text(
    ctx,
    sent ? '✓ কুরিয়ারে অর্ডার অটো পাঠানো হয়েছে!' : 'এক ক্লিকে কুরিয়ারে অর্ডার পাঠান',
    dx + 152,
    dy + 554,
    { size: 30, weight: 800, color: '#FFFFFF', maxWidth: dw - 200 },
  );
  text(
    ctx,
    sent
      ? 'ট্র্যাকিং আইডি: #BD-884920  ·  কাস্টমারকে স্ট্যাটাস নোটিফিকেশন পাঠানো হয়েছে'
      : 'Steadfast / Pathao / RedX কুরিয়ার অটোমেশন ও লাইভ ডেলিভারি ট্র্যাকিং সুবিধা',
    dx + 152,
    dy + 606,
    { size: 20, weight: 600, color: sent ? '#6EE7B7' : PAL.slate, maxWidth: dw - 200 },
  );

  drawBottomBar(ctx, t, 'অর্ডার লিস্ট, ইনভয়েস প্রিন্ট, নোটিফিকেশন ও কুরিয়ার অটোমেশন এক জায়গায়', {
    accent: PAL.emerald,
  });
}

/* ============================================================================
 * SCENE 08 — CUSTOMIZATION: NOT A COPY-PASTE TEMPLATE (80.04s – 93.15s)
 * ========================================================================== */
function scene08Custom(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'store');
  drawSceneHeader(ctx, t, { tagBn: '১০০% কাস্টম ডিজাইন', sceneNum: '০৮', totalNum: '১১', accent: PAL.cyan });
  drawHeroTitle(ctx, t, 'কপি-পেস্ট টেমপ্লেট নয় —', 'আপনার ব্র্যান্ড অনুযায়ী কাস্টম তৈরি', {
    y: 204, size: 55, accent: PAL.gold,
  });

  const themes = [
    { name: 'ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড', brand: 'ARANYA CRAFT', primary: '#C69B63', bg: '#161210', img: 'panjabi', tag: 'লোগো ও প্রিমিয়াম গোল্ড থিম' },
    { name: 'কসমেটিকস ও বিউটি স্টোর', brand: 'GLOW AURA', primary: '#EC4899', bg: '#1E1022', img: 'serum', tag: 'কাস্টম কালার ও ক্যাটাগরি' },
    { name: 'টেক ও গ্যাজেট শপ', brand: 'BYTE GEAR BD', primary: '#2563EB', bg: '#0B162C', img: 'laptop', tag: 'ক্যাম্পেইন ল্যান্ডিং পেজ' },
  ];
  const themeIdx = t < dur * 0.34 ? 0 : t < dur * 0.68 ? 1 : 2;
  const th = themes[themeIdx];

  // Live Customizing Brand Canvas Card
  const cx = 64;
  const cy = 388;
  const cw = W - 128;
  const ch = 640;
  glassCard(ctx, cx, cy, cw, ch, { radius: 34, fill: th.bg, border: alpha(th.primary, 0.72), glow: alpha(th.primary, 0.25) });

  // Theme Swatch Bar at Top
  text(ctx, 'লাইভ ব্র্যান্ড কাস্টমাইজেশন প্রিভিউ:', cx + 38, cy + 56, { size: 21, weight: 700, color: '#CBD5E1' });
  themes.forEach((tm, i) => {
    const sx = cx + cw - 246 + i * 72;
    if (i === themeIdx) strokeRR(ctx, sx - 28, cy + 16, 56, 56, 28, '#FFFFFF', 3);
    circle(ctx, sx, cy + 44, 20, tm.primary);
  });

  // Branded Storefront Preview Inside Customizer
  drawCoverImage(ctx, th.img, cx + 496, cy + 96, 420, 496, { radius: 26, zoom: 1.06 });
  fillRR(ctx, cx + 38, cy + 104, 72, 72, 20, th.primary);
  text(ctx, th.brand[0], cx + 74, cy + 153, { size: 36, weight: 800, color: '#FFFFFF', align: 'center' });
  text(ctx, th.brand, cx + 128, cy + 148, { size: 32, weight: 800, color: '#FFFFFF', letterSpacing: 1.5, maxWidth: 340 });
  text(ctx, th.name, cx + 128, cy + 180, { size: 19, weight: 600, color: th.primary, maxWidth: 340 });

  fillRR(ctx, cx + 38, cy + 224, 340, 44, 22, alpha(th.primary, 0.22));
  text(ctx, th.tag, cx + 208, cy + 253, { size: 18, weight: 700, color: '#FFFFFF', align: 'center', maxWidth: 316 });

  text(ctx, 'আপনার নিজস্ব লোগো, রঙ,', cx + 38, cy + 334, { size: 34, weight: 800, color: '#FFFFFF', maxWidth: 430 });
  text(ctx, 'মেনু ও প্রোডাক্ট লেআউট', cx + 38, cy + 382, { size: 34, weight: 800, color: th.primary, maxWidth: 430 });

  paragraph(ctx, 'ডেমো শুধু ধারণা দেওয়ার জন্য — আপনার ওয়েবসাইট সাজানো হয় সম্পূর্ণ নতুনভাবে।', cx + 38, cy + 432, {
    maxWidth: 425, size: 21, weight: 600, lineHeight: 1.48, color: '#CBD5E1',
  });

  fillRR(ctx, cx + 38, cy + 524, 290, 66, 33, th.primary);
  text(ctx, 'এখনই শপ করুন →', cx + 183, cy + 566, { size: 22, weight: 800, color: '#FFFFFF', align: 'center' });

  // 4 Verified Custom Package Capabilities Grid Below
  const feats = [
    ['sparkle', 'লোগো, রঙ ও ব্র্যান্ডিং', 'আপনার ব্যবসার নিজস্ব পরিচয় ও মেনু স্ট্রাকচার'],
    ['globe', 'আনলিমিটেড ল্যান্ডিং পেজ', 'স্পেশাল অফার ও বিজ্ঞাপনের জন্য যত খুশি পেজ'],
    ['chart', 'Facebook Pixel + CAPI', 'অ্যাড ট্র্যাকিং ও রিটার্গেটিং সেটআপ সুবিধা'],
    ['tag', 'কুপন ও ফ্ল্যাশ সেল সিস্টেম', 'ডিসকাউন্ট কোড ও ক্যাম্পেইন অফার পরিচালনা'],
  ];
  const gw = (cw - 24) / 2;
  feats.forEach(([ic, title, sub], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const gx = 64 + col * (gw + 24);
    const gy = 1062 + row * 304;
    const gp = stag(t, i, 0.35, 0.22, 0.5);
    ctx.save();
    ctx.globalAlpha = gp;
    glassCard(ctx, gx, gy + (1 - gp) * 28, gw, 280, { radius: 28, fill: 'rgba(11, 21, 46, 0.90)' });
    fillRR(ctx, gx + 28, gy + 28, 60, 60, 18, alpha(PAL.cyan, 0.16));
    icon(ctx, ic, gx + 42, gy + 42, 32, PAL.cyan, 2.2);
    text(ctx, title, gx + 28, gy + 140, { size: 26, weight: 800, color: '#FFFFFF', maxWidth: gw - 56 });
    text(ctx, sub, gx + 28, gy + 184, { size: 19, weight: 600, color: PAL.slate, maxWidth: gw - 56 });
    text(ctx, '✓ ৩০০০ টাকার প্যাকেজে অন্তর্ভুক্ত', gx + 28, gy + 242, {
      size: 18, weight: 700, color: PAL.emerald, maxWidth: gw - 56,
    });
    ctx.restore();
  });

  drawBottomBar(ctx, t, '১০০% মোবাইল রেসপন্সিভ · দ্রুত, নিরাপদ ও SEO-ফ্রেন্ডলি আর্কিটেকচার', {
    accent: PAL.gold,
  });
}

/* ============================================================================
 * SCENE 09 — MONUMENT OFFER REVEAL (93.15s – 106.94s)
 * Exact measured vocal beats in `09-offer.mp3` (`dur = 13.79s`):
 *   Beat 1 (`0.297 * dur` = 4.095s): HERO PRICE "মাত্র ৩০০০ টাকা"
 *   Beat 2 (`0.431 * dur` = 5.940s): "কোনো অগ্রিম পেমেন্ট নেই"
 *   Beat 3 (`0.544 * dur` = 7.505s): "ডেলিভারির পর পেমেন্ট"
 *   Beat 4 (`0.789 * dur` = 10.88s): "৩০ দিনের ফ্রি সাপোর্ট"
 * ========================================================================== */
function scene09Offer(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'offer');
  drawSceneHeader(ctx, t, { tagBn: 'ফিক্সড প্যাকেজ অফার', sceneNum: '০৯', totalNum: '১১', accent: PAL.gold });
  drawHeroTitle(ctx, t, 'পূর্ণাঙ্গ কাস্টম ওয়েবসাইট', 'ও শক্তিশালী অ্যাডমিন প্যানেল', {
    y: 204, size: 58, accent: PAL.gold,
  });

  const bPrice = dur * 0.297;
  const bNoAdv = dur * 0.431;
  const bAfter = dur * 0.544;
  const bSupp  = dur * 0.789;

  // Centerpiece Hero Monument Card (anticipatory frame from 0.25s, giant price slams in at bPrice!)
  const frameP = beat(t, 0.15, 0.65, easeOutQuint);
  const priceP = beat(t, bPrice - 0.14, 0.56, easeOutBack);

  const hx = 64;
  const hy = 392 + (1 - frameP) * 40;
  const hw = W - 128;
  const hh = 430;

  ctx.save();
  ctx.globalAlpha = frameP;
  glassCard(ctx, hx, hy, hw, hh, {
    radius: 40,
    fill: lin(ctx, hx, hy, hx + hw, hy + hh, [
      [0, 'rgba(20, 38, 84, 0.96)'],
      [0.5, 'rgba(13, 24, 56, 0.97)'],
      [1, 'rgba(46, 33, 74, 0.96)'],
    ]),
    border: alpha(PAL.gold, 0.80),
    glow: 'rgba(245, 186, 98, 0.30)',
    blur: 68,
  });

  fillRR(ctx, W / 2 - 210, hy + 34, 420, 50, 25, alpha(PAL.gold, 0.16));
  strokeRR(ctx, W / 2 - 210, hy + 34, 420, 50, 25, alpha(PAL.gold, 0.5), 1.5);
  text(ctx, 'একটি ফিক্সড প্রাইস · লুকানো খরচ নেই', W / 2, hy + 67, {
    size: 21, weight: 700, color: PAL.gold, align: 'center',
  });

  if (priceP < 0.02) {
    // Subtle anticipatory pulse before exact vocal price drop
    text(ctx, 'প্যাকেজ মূল্য প্রকাশিত হচ্ছে…', W / 2, hy + 240, {
      size: 40, weight: 700, color: PAL.cyan, align: 'center', opacity: 0.75 + 0.25 * Math.sin(t * 5),
    });
  } else {
    ctx.save();
    const sc = 0.84 + 0.16 * priceP;
    ctx.translate(W / 2, hy + 232);
    ctx.scale(sc, sc);
    ctx.globalAlpha *= clamp(priceP);
    text(ctx, 'মাত্র ৩০০০ টাকা', 0, 18, {
      size: 112, weight: 800, color: '#FFFFFF', align: 'center', maxWidth: hw - 80,
    });
    ctx.restore();

    text(ctx, 'কাস্টম ই-কমার্স ওয়েবসাইট + পূর্ণাঙ্গ অ্যাডমিন প্যানেল', W / 2, hy + 356, {
      size: 27, weight: 700, color: PAL.cyan, align: 'center', maxWidth: hw - 90, opacity: clamp(priceP),
    });
  }

  lightSweep(ctx, hx, hy, hw, hh, clamp((t - bPrice) / 1.3), 'rgba(255, 224, 150, 0.32)', 220);
  ctx.restore();

  // Sequential Beat-Synced Value Cards (Revealed One by One with Voiceover!)
  const promises = [
    {
      t0: bNoAdv - 0.10,
      icon: 'shield',
      accent: PAL.emerald,
      title: 'কোনো অগ্রিম পেমেন্ট নেই',
      sub: 'কাজ শুরু করতে ১ টাকাও এডভান্স দিতে হবে না',
    },
    {
      t0: bAfter - 0.10,
      icon: 'checkCircle',
      accent: PAL.cyan,
      title: 'ডেলিভারির পর পেমেন্ট',
      sub: 'সম্পূর্ণ ওয়েবসাইট তৈরি শেষে নিজে দেখে-বুঝে পেমেন্ট',
    },
    {
      t0: bSupp - 0.10,
      icon: 'sparkle',
      accent: PAL.gold,
      title: '৩০ দিনের ফ্রি সাপোর্ট',
      sub: 'ডেলিভারির পর পূর্ণ ৩০ দিন বিনামূল্যে পরিবর্তন ও সহায়তা',
    },
  ];

  promises.forEach((pr, i) => {
    const pp = beat(t, pr.t0, 0.54, easeOutBack);
    if (pp <= 0.01) return;
    const py = 860 + i * 272 + (1 - clamp(pp)) * 34;
    ctx.save();
    ctx.globalAlpha = clamp(pp);
    glassCard(ctx, 64, py, W - 128, 240, {
      radius: 32,
      fill: 'rgba(11, 21, 46, 0.94)',
      border: alpha(pr.accent, 0.65),
      glow: alpha(pr.accent, 0.22),
    });
    fillRR(ctx, 100, py + 58, 124, 124, 30, alpha(pr.accent, 0.16));
    strokeRR(ctx, 100, py + 58, 124, 124, 30, alpha(pr.accent, 0.45), 1.8);
    icon(ctx, pr.icon, 134, py + 92, 56, pr.accent, 2.4);

    text(ctx, pr.title, 260, py + 112, {
      size: 40, weight: 800, color: '#FFFFFF', maxWidth: 710,
    });
    text(ctx, pr.sub, 260, py + 168, {
      size: 23, weight: 600, color: PAL.slate, maxWidth: 710,
    });
    lightSweep(ctx, 64, py, W - 128, 240, clamp((t - pr.t0) / 1.0), 'rgba(255,255,255,0.16)', 160);
    ctx.restore();
  });

  drawBottomBar(ctx, t, 'সাধারণ ডেমো-ভিত্তিক প্রজেক্ট ডেলিভারি: মাত্র ৩–৫ কর্মদিবসে', {
    accent: PAL.gold,
  });
}

/* ============================================================================
 * SCENE 10 — TRUST, LIVE DEMOS & COMPLETE TRANSPARENCY (106.94s – 122.87s)
 * ========================================================================== */
function scene10Trust(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'store');
  drawSceneHeader(ctx, t, { tagBn: 'বিশ্বাস ও স্বচ্ছতা', sceneNum: '১০', totalNum: '১১', accent: PAL.cyan });

  const tScope = dur * 0.408; // ~6.5s into Scene 10 ("ডোমেইন, হোস্টিং এবং...")

  drawHeroTitle(
    ctx,
    t,
    t < tScope ? 'আগে লাইভ ডেমো ঘুরে দেখুন,' : 'প্যাকেজের ভেতরে ও বাইরে —',
    t < tScope ? 'তারপর নিশ্চিন্তে সিদ্ধান্ত নিন' : 'শুরুতেই ১০০% স্বচ্ছ হিসাব',
    { y: 204, size: 55, accent: PAL.cyan },
  );

  // Top Proof Strip: 41+ Live Demos & 6 Delivered Client Websites
  const px = 64;
  const py = 386;
  const pw = W - 128;
  glassCard(ctx, px, py, pw, 310, { radius: 30, fill: 'rgba(11, 21, 46, 0.92)' });

  const stats = [
    ['৪১+', 'লাইভ ওয়েবসাইট ডেমো'],
    ['৬টি', 'ডেলিভার করা লাইভ সাইট'],
    ['৩–৫ দিন', 'সাধারণ ডেলিভারি সময়'],
    ['৳০', 'অগ্রিম পেমেন্ট'],
  ];
  stats.forEach(([num, lbl], i) => {
    const sw2 = (pw - 84) / 4;
    const sx = px + 24 + i * (sw2 + 12);
    fillRR(ctx, sx, py + 24, sw2, 148, 22, 'rgba(255,255,255,0.05)');
    text(ctx, num, sx + sw2 / 2, py + 92, { size: 42, weight: 800, color: i === 3 ? PAL.emerald : PAL.gold, align: 'center' });
    text(ctx, lbl, sx + sw2 / 2, py + 138, { size: 17, weight: 600, color: '#E2E8F0', align: 'center', maxWidth: sw2 - 16 });
  });

  // Verified Delivered Projects Strip
  text(ctx, 'ডেলিভার করা বাস্তব সাইটসমূহ:', px + 30, py + 224, { size: 20, weight: 700, color: PAL.cyan });
  const delivered = ['ShebaJotno', 'Fruity', 'IMS Market', 'Soukhin', 'Regen BD', 'Tanisha Organic'];
  delivered.forEach((d, i) => {
    const dx2 = px + 30 + i * 150;
    fillRR(ctx, dx2, py + 242, 140, 44, 22, 'rgba(41, 121, 255, 0.18)');
    strokeRR(ctx, dx2, py + 242, 140, 44, 22, 'rgba(120, 175, 255, 0.35)', 1);
    text(ctx, d, dx2 + 70, py + 270, { size: 15, weight: 700, color: '#FFFFFF', align: 'center', maxWidth: 126 });
  });

  // Card 1: Included inside 3000 Taka Fixed Package
  const inP = beat(t, 0.35, 0.55, easeOutQuint);
  ctx.save();
  ctx.globalAlpha = inP;
  const iy = 724 + (1 - inP) * 26;
  glassCard(ctx, 64, iy, pw, 470, {
    radius: 30, fill: 'rgba(10, 28, 36, 0.92)', border: alpha(PAL.emerald, 0.6),
  });
  fillRR(ctx, 96, iy + 28, 390, 48, 24, alpha(PAL.emerald, 0.2));
  text(ctx, '✓ ৩০০০ টাকার প্যাকেজে যা অন্তর্ভুক্ত', 291, iy + 60, {
    size: 21, weight: 800, color: PAL.emerald, align: 'center',
  });

  const included = [
    'কাস্টম ই-কমার্স ওয়েবসাইট + শক্তিশালী Admin Panel',
    'প্রোডাক্ট, ক্যাটাগরি, স্টক, ভ্যারিয়েন্ট ও অর্ডার ম্যানেজমেন্ট',
    'স্মার্ট চেকআউট, কুপন, ফ্ল্যাশ সেল ও আনলিমিটেড ল্যান্ডিং পেজ',
    'COD, bKash, Nagad, Card, কুরিয়ার অটোমেশন ও Facebook Pixel সেটআপ',
    '১০০% মোবাইল রেসপন্সিভ ডিজাইন ও ৩০ দিনের ফ্রি সাপোর্ট',
  ];
  included.forEach((lineStr, i) => {
    const ly = iy + 118 + i * 68;
    icon(ctx, 'checkCircle', 98, ly - 24, 28, PAL.emerald, 2.3);
    text(ctx, lineStr, 142, ly, { size: 23, weight: 700, color: '#FFFFFF', maxWidth: pw - 180 });
  });
  ctx.restore();

  // Card 2: Honest Separate / External Costs Card (Highlighted cleanly at `tScope`!)
  const outP = beat(t, Math.min(2.2, tScope - 0.2), 0.55, easeOutQuint);
  const emph = t >= tScope - 0.15 ? 1 : 0.72;
  ctx.save();
  ctx.globalAlpha = outP * emph;
  const ey = 1222 + (1 - outP) * 26;
  glassCard(ctx, 64, ey, pw, 456, {
    radius: 30,
    fill: 'rgba(18, 24, 48, 0.94)',
    border: t >= tScope - 0.15 ? alpha(PAL.gold, 0.85) : 'rgba(148,163,184,0.35)',
    glow: t >= tScope - 0.15 ? 'rgba(245, 186, 98, 0.22)' : null,
  });
  fillRR(ctx, 96, ey + 28, 490, 48, 24, alpha(PAL.gold, 0.18));
  text(ctx, 'স্বচ্ছতার জন্য আগেই জানানো — প্যাকেজের বাইরের খরচ', 341, ey + 60, {
    size: 20, weight: 800, color: PAL.gold, align: 'center', maxWidth: 468,
  });

  const external = [
    ['ডোমেইন ও হোস্টিং', 'বার্ষিক খরচ (প্রোভাইডার ও সাইটের সাইজ অনুযায়ী — সেটআপে পূর্ণ সহায়তা)'],
    ['SMS / পেমেন্ট গেটওয়ে চার্জ', 'প্রযোজ্য ক্ষেত্রে সংশ্লিষ্ট সার্ভিস প্রোভাইডারের নির্ধারিত চার্জ'],
    ['বড় কাস্টম প্রজেক্ট', 'মার্কেটপ্লেস বা কাস্টম বিজনেস সিস্টেম সরাসরি আলোচনা সাপেক্ষে'],
  ];
  external.forEach(([head, desc], i) => {
    const ly = ey + 122 + i * 108;
    circle(ctx, 110, ly - 8, 9, PAL.gold);
    text(ctx, head, 138, ly, { size: 24, weight: 800, color: '#FFFFFF' });
    text(ctx, desc, 138, ly + 38, { size: 19, weight: 600, color: PAL.slate, maxWidth: pw - 176 });
  });
  ctx.restore();

  drawBottomBar(ctx, t, 'কোনো লুকানো শর্ত বা গোপন চার্জ নেই — সব হিসাব কাজ শুরুর আগেই পরিষ্কার');
}

/* ============================================================================
 * SCENE 11 — FINAL WHATSAPP CTA (122.87s – 133.87s)
 * Holds rock-solid with living studio glow right through final frame!
 * ========================================================================== */
function scene11Cta(ctx, t, dur) {
  drawGradedBackdrop(ctx, t, 'cta');

  // Top Brand Emblem Lockup
  const bp = beat(t, 0.04, 0.6, easeOutQuint);
  ctx.save();
  ctx.globalAlpha = bp;
  brandMark(ctx, W / 2 - 210, 96, 78, { withWordmark: true });
  ctx.restore();

  drawHeroTitle(ctx, t, 'আপনার ব্যবসার ওয়েবসাইট গড়তে', 'এখনই WhatsApp-এ মেসেজ দিন', {
    y: 256, size: 58, accent: PAL.whatsapp,
  });

  // Showcase Trio of Storefront + Admin Panel Preview Cards
  const previewP = beat(t, 0.16, 0.65, easeOutQuint);
  ctx.save();
  ctx.globalAlpha = previewP;
  const cards = [
    { img: 'panjabi', label: 'কাস্টম ই-কমার্স শপ', sub: 'মোবাইল ও পিসি রেসপন্সিভ' },
    { img: 'watch', label: '৪১+ লাইভ ডেমো', sub: 'পছন্দের ডিজাইন বেছে নিন' },
    { img: 'laptop', label: 'Commerce OS অ্যাডমিন', sub: 'প্রোডাক্ট, স্টক ও অর্ডার' },
  ];
  const cw = 298;
  cards.forEach((c, i) => {
    const cx = 64 + i * (cw + 29);
    const cy = 424 + (1 - previewP) * 36 + Math.sin(t * 1.4 + i) * 5;
    glassCard(ctx, cx, cy, cw, 356, { radius: 26, fill: 'rgba(11, 21, 46, 0.90)' });
    drawCoverImage(ctx, c.img, cx + 14, cy + 14, cw - 28, 216, { radius: 18, zoom: 1.06 });
    text(ctx, c.label, cx + cw / 2, cy + 274, { size: 22, weight: 800, color: '#FFFFFF', align: 'center', maxWidth: cw - 32 });
    text(ctx, c.sub, cx + cw / 2, cy + 314, { size: 17, weight: 600, color: PAL.cyan, align: 'center', maxWidth: cw - 32 });
  });
  ctx.restore();

  // Core Value Recap Ribbon
  const recapP = beat(t, 0.32, 0.55, easeOutQuint);
  ctx.save();
  ctx.globalAlpha = recapP;
  glassCard(ctx, 64, 818, W - 128, 198, {
    radius: 30,
    fill: 'rgba(14, 26, 56, 0.94)',
    border: alpha(PAL.gold, 0.6),
  });
  text(ctx, 'মাত্র ৩০০০ টাকা  ·  কোনো অগ্রিম পেমেন্ট নেই', W / 2, 898, {
    size: 40, weight: 800, color: PAL.gold, align: 'center', maxWidth: W - 180,
  });
  text(ctx, 'ডেলিভারির পর পেমেন্ট  ·  ৩০ দিনের ফ্রি সাপোর্ট', W / 2, 962, {
    size: 28, weight: 700, color: '#FFFFFF', align: 'center', maxWidth: W - 180,
  });
  ctx.restore();

  // Giant High-Converting Mobile-Safe WhatsApp CTA Card
  const ctaP = beat(t, 0.44, 0.62, easeOutBack);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.4);
  ctx.save();
  ctx.globalAlpha = clamp(ctaP);
  const wx = 64;
  const wy = 1054 + (1 - clamp(ctaP)) * 40;
  const ww = W - 128;
  const wh = 430;

  // Breathing emerald halo behind CTA button
  glowOrb(ctx, W / 2, wy + wh / 2, 460, PAL.whatsapp, 0.16 + 0.10 * pulse);

  glassCard(ctx, wx, wy, ww, wh, {
    radius: 40,
    fill: lin(ctx, wx, wy, wx + ww, wy + wh, [
      [0, 'rgba(10, 46, 36, 0.96)'],
      [1, 'rgba(9, 28, 44, 0.97)'],
    ]),
    border: alpha(PAL.whatsapp, 0.85),
    glow: 'rgba(37, 211, 102, 0.34)',
    blur: 64,
  });

  // Big Pill Button Inside Card
  const btnX = wx + 56;
  const btnY = wy + 44;
  const btnW = ww - 112;
  const btnH = 136;
  fillRR(ctx, btnX, btnY, btnW, btnH, 68, lin(ctx, btnX, btnY, btnX + btnW, btnY, [
    [0, '#1FAF5B'],
    [0.5, '#25D366'],
    [1, '#18A957'],
  ]));
  whatsappGlyph(ctx, btnX + 68, btnY + 38, 60, '#FFFFFF');
  text(ctx, 'WhatsApp করুন: 01876892958', btnX + 148, btnY + 86, {
    size: 42, weight: 800, color: '#FFFFFF', maxWidth: btnW - 180,
  });
  lightSweep(ctx, btnX, btnY, btnW, btnH, (t * 0.45) % 1.4, 'rgba(255,255,255,0.28)', 150, 68);

  // Direct clickable-style URLs clearly readable on any phone screen
  text(ctx, 'সরাসরি লিংক:  https://wa.me/8801876892958', W / 2, wy + 258, {
    size: 31, weight: 800, color: '#86EFAC', align: 'center', maxWidth: ww - 80,
  });
  text(ctx, 'ডেমো ও বিস্তারিত:  https://codepixelweb.vercel.app', W / 2, wy + 322, {
    size: 27, weight: 700, color: PAL.cyan, align: 'center', maxWidth: ww - 80,
  });
  text(ctx, 'পছন্দের ডেমোর নাম ও আপনার ব্যবসার প্রয়োজন সরাসরি লিখে পাঠান', W / 2, wy + 384, {
    size: 22, weight: 600, color: '#E2E8F0', align: 'center', maxWidth: ww - 80,
  });
  ctx.restore();

  // Clean Closing Brand Signature Bar (held steady until final millisecond — zero black fade)
  drawBottomBar(ctx, t, 'CodePixel Web — বাংলাদেশি উদ্যোক্তাদের বিশ্বস্ত ওয়েবসাইট পার্টনার', {
    pill: 'codepixelweb.vercel.app  ·  wa.me/8801876892958  ·  মাত্র ৩০০০ টাকা',
    accent: PAL.whatsapp,
  });
}

export const AD_SCENES = {
  'scene-01-hook': scene01Hook,
  'scene-02-website': scene02Website,
  'scene-03-browsing': scene03Browsing,
  'scene-04-shopping': scene04Shopping,
  'scene-05-admin': scene05Admin,
  'scene-06-products': scene06Products,
  'scene-07-orders': scene07Orders,
  'scene-08-custom': scene08Custom,
  'scene-09-offer': scene09Offer,
  'scene-10-trust': scene010Shim,
  'scene-11-cta': scene11Cta,
};

function scene010Shim(ctx, t, dur) {
  return scene10Trust(ctx, t, dur);
}
