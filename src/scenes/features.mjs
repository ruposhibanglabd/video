/**
 * Scenes 14–26 — the shop floor and the admin panel.
 * This is the section where the viewer should feel they are using the site.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, lin, text, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, drawWatch,
} from '../render/kit.mjs';
import {
  P, LAY, SEED, headlineBlock, kickerLine, stdTitle, glassCard, lightCard, phone, screenCrop,
  browser, pill, callout, cursor, notifyCard, kpiTile, chain, chapterCard, priceHero, seal,
  featureTile, ghostNumeral, dashLine, screenSwitch, stepper,
} from './premium.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

function titleOf(ctx, t, s, tone, opts = {}) {
  if (s.title === false) return kickerLine(ctx, s.kicker, t, { tone, ...opts });
  return stdTitle(ctx, t, s, { tone, ...opts });
}

function halo(ctx, cx, cy, r, tone, a = 0.5) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  if (tone === 'light') {
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.6, `rgba(246,232,206,${a * 0.5})`);
    g.addColorStop(1, 'rgba(246,232,206,0)');
  } else {
    g.addColorStop(0, `rgba(90,160,255,${a * 0.45})`);
    g.addColorStop(1, 'rgba(90,160,255,0)');
  }
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/** Step badge on the left of a feature row. */
function stepBadge(ctx, x, y, n, tone, p = 1, accent = null) {
  const ac = accent || (tone === 'light' ? P.light.goldDeep : P.dark.cyan);
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  circle(ctx, x, y, 26, alpha(ac, 0.14));
  text(ctx, String(n), x, y + 9, { size: 24, weight: 800, color: ac, align: 'center' });
  ctx.restore();
}

export const featureScenes = {
  /* 14 — the customer website, walked through */
  storefrontWalk(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80 });

    // three-step tour of the real storefront: home → search → product
    const step = t < 4.4 ? 0 : t < 8.0 ? 1 : 2;
    const scroll = 0.03 + 0.16 * easeInOut(clamp(t / Math.max(3, d * 0.8)));
    const ph = phone(ctx, t, {
      x: 92, y: 700, w: 452, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => screenSwitch(ctx, t, w, h, [
        { at: 0, draw: (c, ww, hh) => SF.sfHome(c, ww, hh, { scroll, cart: 0, activeCat: 1 }) },
        { at: 4.4, draw: (c, ww, hh) => SF.sfSearch(c, ww, hh, { p: clamp((t - 4.4) / 1.8) }) },
        { at: 8.0, draw: (c, ww, hh) => SF.sfProduct(c, ww, hh, { feat: 1, zoom: 0.5 * easeInOut(clamp((t - 8) / 2.4)) }) },
      ]),
    });

    // magnifier card on the right, focused on the current step
    const crops = [
      { k: 1.9, cx: 195, cy: 470, label: 'ক্যাটাগরি ও প্রোডাক্ট', ic: 'grid', draw: 'home' },
      { k: 2.0, cx: 195, cy: 250, label: 'সার্চ ও ফিল্টার', ic: 'search', draw: 'search' },
      { k: 1.35, cx: 195, cy: 430, label: 'ছবি, দাম ও বিস্তারিত', ic: 'cash', draw: 'product' },
    ];
    const cr = crops[step];
    const mp = beat(t, step === 0 ? 0.7 : step === 1 ? 4.2 : 7.8, 0.7, easeOutQuint);
    if (mp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(mp);
      screenCrop(ctx, {
        x: 588, y: 700, w: 396, h: 430, k: cr.k, cx: cr.cx, cy: cr.cy, tone, ring: true,
        draw: (w2, h2) => (cr.draw === 'home'
          ? SF.sfHome(ctx, w2, h2, { scroll: 0.05, cart: 0, activeCat: 1 })
          : cr.draw === 'search'
            ? SF.sfSearch(ctx, w2, h2, { p: 1 })
            : SF.sfProduct(ctx, w2, h2, { feat: 1 })),
      });
      lightCard(ctx, 588, 1152, 396, 74, { r: 22, lift: 0.95 });
      icon(ctx, cr.ic, 610, 1174, 28, P.light.goldDeep, 1.9);
      text(ctx, cr.label, 650, 1198, { size: 23, weight: 700, color: P.light.ink, maxWidth: 320 });
      ctx.restore();
    }

    // step rail under the phone
    const steps = [['ক্যাটাগরি', 'grid'], ['সার্চ', 'search'], ['ছবি ও দাম', 'cash']];
    steps.forEach(([label, ic], i) => {
      const p = beat(t, 1.0 + i * 0.16, 0.5, easeOutBack);
      if (p <= 0) return;
      const on = i <= step;
      const y = 1258 + i * 82;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * (on ? 1 : 0.7);
      ctx.translate((1 - p) * 30, 0);
      fillRR(ctx, 588, y, 396, 66, 33, on ? P.light.ink : '#FFFFFF');
      if (!on) strokeRR(ctx, 588, y, 396, 66, 33, P.light.cardLine, 1.2);
      icon(ctx, ic, 614, y + 18, 26, on ? '#7BE7B8' : P.light.muted, 2);
      text(ctx, label, 654, y + 42, { size: 22, weight: 600, color: on ? '#fff' : P.light.ink2 });
      if (on) seal(ctx, 952, y + 33, 14, 'yes', p, { tone });
      ctx.restore();
    });
  },

  /* 15 — cart → checkout → order */
  checkoutFlow(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80 });

    stepper(ctx, 132, 660, 816, ['কার্ট', 'ঠিকানা', 'কনফার্ম', 'অর্ডার'], t, { tone, delay: 0.3, current: null });

    halo(ctx, 540, 1200, 460, 'light', 0.4);
    const ph = phone(ctx, t, {
      x: 348, y: 800, w: 384, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => screenSwitch(ctx, t, w, h, [
        { at: 0, draw: (c, ww, hh) => SF.sfProduct(c, ww, hh, { addToCart: 1, feat: 1 }) },
        { at: 1.5, draw: (c, ww, hh) => SF.sfCart(c, ww, hh, { enter: 1, checkout: clamp((t - 2.6) / 0.5) }) },
        { at: 3.3, draw: (c, ww, hh) => SF.sfCheckout(c, ww, hh, { fill: clamp((t - 3.5) / 2.4), paySel: 0, confirm: clamp((t - 6.0) / 0.6) }) },
        { at: 6.9, draw: (c, ww, hh) => SF.sfConfirm(c, ww, hh, { p: clamp((t - 6.9) / 1.0) }) },
      ]),
    });

    // floating proof chips
    const chips = [
      { at: 1.2, label: 'কার্টে যোগ', ic: 'bag' },
      { at: 3.4, label: 'নাম-ফোন-ঠিকানা', ic: 'users' },
      { at: 7.2, label: 'অর্ডার কনফার্ম', ic: 'checkCircle' },
    ];
    chips.forEach((c, i) => {
      const p = beat(t, c.at, 0.55, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      const y = 900 + i * 132;
      pill(ctx, 66, y, c.label, { tone, iconName: c.ic, p, size: 20 });
      ctx.restore();
    });

    callout(ctx, ph.x + ph.w * 0.82, ph.y + ph.h * 0.62, '২ ধাপেই অর্ডার', t, {
      dx: 120, dy: 40, tone, delay: 4.2, size: 20, align: 'left',
    });
  },

  /* 16 — website + admin panel */
  adminBridge(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const ph = phone(ctx, t, {
      x: 92, y: 760, w: 344, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.1, cart: 0, activeCat: 1 }),
    });
    const br = browser(ctx, t, {
      x: 470, y: 810, w: 500, vw: 900, vh: 660, enter: beat(t, 0.3, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop', draw: (w, h) => AD.adDashboard(ctx, w, h, { p: clamp((t - 0.4) / 2) }),
    });

    // labels
    pill(ctx, 264, 1440, 'কাস্টমার ওয়েবসাইট', { tone, align: 'center', iconName: 'globe', p: beat(t, 1.1, 0.5, easeOutBack), size: 21 });
    pill(ctx, 720, 1490, 'অ্যাডমিন প্যানেল', { tone, align: 'center', iconName: 'grid', p: beat(t, 1.3, 0.5, easeOutBack), size: 21 });

    // connecting plus + sync pulses
    const cp = beat(t, 1.6, 0.6, easeOutBack);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      const cx = 452, cy = 1080;
      circle(ctx, cx, cy, 40, '#FFFFFF');
      strokeRR(ctx, cx - 40, cy - 40, 80, 80, 40, P.light.cardLine, 1.2);
      icon(ctx, 'link', cx - 15, cy - 15, 30, P.light.goldDeep, 2);
      for (let i = 0; i < 3; i++) {
        const ph2 = ((t * 0.55 + i * 0.33) % 1);
        ctx.globalAlpha = cp * (1 - ph2) * 0.5;
        circle(ctx, cx, cy, 40 + ph2 * 60, 'transparent');
        ctx.strokeStyle = P.light.gold;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 40 + ph2 * 60, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha *= 0.8;
    dashLine(ctx, ph.x + ph.w, 1080, 412, 1080, alpha(P.light.goldDeep, 0.5), 2, [5, 7], beat(t, 1.4, 0.6));
    dashLine(ctx, 492, 1080, br.x, 1080, alpha(P.light.goldDeep, 0.5), 2, [5, 7], beat(t, 1.4, 0.6));
    ctx.restore();
  },

  /* 17 — the modules */
  modulesIntro(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 86 });
    ghostNumeral(ctx, '02', W / 2, 1060, 520, P.dark.cyan, 0.05);

    const mods = [
      ['box', 'প্রোডাক্ট'], ['list', 'অর্ডার'], ['chart', 'স্টক'],
      ['users', 'কাস্টমার'], ['cash', 'বিক্রি'],
    ];
    const tw = 172, th = 172, gap = 22;
    const rows = [[0, 1, 2], [3, 4]];
    let idx = 0;
    rows.forEach((row, ri) => {
      const totalW = row.length * tw + (row.length - 1) * gap;
      const x0 = (W - totalW) / 2;
      row.forEach((m, ci) => {
        const [ic, label] = mods[idx];
        const p = beat(t, 0.3 + idx * 0.13, 0.65, easeOutBack);
        if (p > 0) {
          const x = x0 + ci * (tw + gap);
          const y = 790 + ri * (th + gap) - (1 - p) * 30;
          ctx.save();
          ctx.globalAlpha *= clamp(p);
          glassCard(ctx, x, y, tw, th, { r: 28, fill: 'rgba(16,26,46,0.72)', glow: P.dark.cyan });
          fillRR(ctx, x + tw / 2 - 26, y + 26, 52, 52, 16, 'rgba(79,216,255,0.14)');
          icon(ctx, ic, x + tw / 2 - 15, y + 37, 30, P.dark.cyan, 1.9);
          text(ctx, label, x + tw / 2, y + 128, { size: 27, weight: 700, color: P.dark.ink, align: 'center' });
          ctx.restore();
        }
        idx++;
      });
    });
    // connnecting line to the "one place" promise
    const lp = beat(t, 1.5, 0.7, easeOut);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(lp);
      dashLine(ctx, W / 2, 1200, W / 2, 1300, alpha(P.dark.cyan, 0.5), 2, [4, 7], lp);
      pill(ctx, W / 2, 1370, 'সবকিছু এক জায়গা থেকে', { tone, align: 'center', iconName: 'grid', p: lp, size: 24 });
      ctx.restore();
    }
  },

  /* 18 — one place */
  onePlace(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 470, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'এক জায়গা থেকে\nপরিচালনা', t, {
      tone, x: W / 2 - LAY.w / 2, y: 610, size: 104, align: 'center', maxWidth: LAY.w, delay: 0.15,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });

    const cx = W / 2, cy = 1230;
    const nodes = [
      ['box', 'প্রোডাক্ট'], ['list', 'অর্ডার'], ['users', 'কাস্টমার'],
      ['cash', 'বিক্রি'], ['truck', 'কুরিয়ার'], ['shield', 'নিরাপত্তা'],
    ];
    const R = 300;
    // orbit rings
    ctx.save();
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = `rgba(120,185,255,${0.09 - i * 0.03})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R - 40 + i * 90, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    // spokes
    nodes.forEach(([ic, label], i) => {
      const a = (-Math.PI / 2) + (i / nodes.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R * 0.62;
      const p = beat(t, 0.9 + i * 0.1, 0.6, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      dashLine(ctx, cx, cy, x, y, alpha(P.dark.cyan, 0.35), 1.6, [4, 8], p);
      // node
      circle(ctx, x, y, 46, 'rgba(13,22,40,0.9)');
      ctx.strokeStyle = alpha(P.dark.cyan, 0.4);
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, ic, x - 15, y - 16, 30, P.dark.cyan, 1.9);
      text(ctx, label, x, y + 78, { size: 21, weight: 600, color: P.dark.ink2, align: 'center' });
      ctx.restore();
    });

    // centre hub
    const hp = beat(t, 0.3, 0.8, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(hp);
    glowOrb(ctx, cx, cy, 260, P.dark.cyan, 0.3);
    circle(ctx, cx, cy, 92, 'rgba(11,20,36,0.95)');
    ctx.strokeStyle = alpha(P.dark.gold, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 92, 0, Math.PI * 2); ctx.stroke();
    icon(ctx, 'grid', cx - 26, cy - 28, 52, P.dark.gold, 1.8);
    text(ctx, 'অ্যাডমিন', cx, cy + 62, { size: 20, weight: 700, color: P.dark.ink2, align: 'center' });
    ctx.restore();
  },

  /* 19 — product management */
  productMgmt(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 620, w: 968, vw: 1000, vh: 640, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/products',
      draw: (w, h) => AD.adProducts(ctx, w, h, { p: clamp((t - 0.2) / 2.2) }),
    });

    // floating add-product modal
    const mp = beat(t, 2.0, 0.7, easeOutQuint);
    if (mp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(mp);
      ctx.translate(0, (1 - mp) * 40);
      shadow(ctx, 'rgba(60,44,20,0.28)', 60, 26);
      fillRR(ctx, 560, 1060, 388, 400, 26, '#FFFFFF');
      noShadow(ctx);
      strokeRR(ctx, 560, 1060, 388, 400, 26, P.light.cardLine, 1.2);
      text(ctx, 'নতুন প্রোডাক্ট', 588, 1106, { size: 24, weight: 700, color: P.light.ink });
      fillRR(ctx, 588, 1124, 332, 96, 14, '#F7F2E8');
      drawWatch(ctx, 754, 1172, 34, SF.PRODUCTS[2].tone);
      text(ctx, 'ছবি আপলোড করুন', 754, 1240, { size: 17, weight: 500, color: P.light.muted, align: 'center' });
      [['নাম', 'অরাম লেদার'], ['দাম', '৳3,290'], ['স্টক', '১২']].forEach(([k, v], i) => {
        const y = 1286 + i * 58;
        text(ctx, k, 588, y + 18, { size: 17, weight: 500, color: P.light.muted, maxWidth: 80 });
        fillRR(ctx, 660, y, 260, 42, 10, '#FBF8F2');
        strokeRR(ctx, 660, y, 260, 42, 10, P.light.cardLine, 1.1);
        text(ctx, v, 676, y + 27, { size: 18, weight: 600, color: P.light.ink });
      });
      fillRR(ctx, 588, 1380, 332, 52, 14, P.light.ink);
      text(ctx, 'সেভ করুন', 754, 1414, { size: 21, weight: 700, color: '#fff', align: 'center' });
      seal(ctx, 300, 1180, 34, 'yes', beat(t, 3.2, 0.5), { tone });
      ctx.restore();
    }

    // callouts on the table
    callout(ctx, br.x + 150, br.y + br.h * 0.42, 'ছবি ও দাম বদলান', t, { dx: -120, dy: 90, tone, delay: 1.2, size: 20, align: 'left' });
    callout(ctx, br.x + br.w - 150, br.y + br.h * 0.34, 'ক্যাটাগরি তৈরি/এডিট', t, { dx: 60, dy: 100, tone, delay: 1.6, size: 20, align: 'right' });

    pill(ctx, 300, 1520, 'যোগ • বদল • ডিলিট — সবই নিজে', { tone: 'light', align: 'center', iconName: 'edit', p: beat(t, 2.6, 0.6, easeOutBack), size: 21 });
  },

  /* 20 — content: logo, banner, pages */
  contentMgmt(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 620, w: 880, vw: 980, vh: 620, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/content',
      draw: (w, h) => AD.adContent(ctx, w, h, { p: clamp((t - 0.2) / 2) }),
    });

    // update chips float in
    const items = [
      ['logo', 'লোগো'],
      ['banner', 'ব্যানার'],
      ['box', 'প্রোডাক্ট'],
      ['edit', 'কনটেন্ট'],
    ];
    items.forEach(([ic, label], i) => {
      const p = beat(t, 1.6 + i * 0.18, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = 92 + i * 236;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 26);
      lightCard(ctx, x, 1420, 208, 160, { r: 24, lift: 0.9 });
      fillRR(ctx, x + 74, 1446, 60, 60, 18, 'rgba(176,138,87,0.14)');
      icon(ctx, ic === 'logo' ? 'watch' : ic === 'banner' ? 'tag' : ic, x + 88, 1458, 32, P.light.goldDeep, 2);
      text(ctx, label, x + 104, 1552, { size: 23, weight: 700, color: P.light.ink, align: 'center' });
      ctx.restore();
    });
  },

  /* 21 — edit → preview → save */
  editPreviewSave(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 84 });

    // split: editor | live preview
    const lp = beat(t, 0.15, 0.8, easeOutQuint);
    lightCard(ctx, 78, 660, 452, 800, { r: 30, lift: 1 });
    text(ctx, 'এডিট', 108, 712, { size: 22, weight: 600, color: P.light.muted });
    // fields
    [['ব্যানার হেডলাইন', 'সময়ের নিজস্ব ছন্দ'], ['সাব-টেক্সট', 'প্রিমিয়াম ঘড়ির নতুন সংগ্রহ'], ['বাটন', 'সংগ্রহ দেখুন']].forEach(([k, v], i) => {
      const p = beat(t, 0.5 + i * 0.25, 0.5, easeOutQuint);
      if (p <= 0) return;
      const y = 748 + i * 108;
      text(ctx, k, 108, y + 18, { size: 18, weight: 500, color: P.light.muted });
      fillRR(ctx, 108, y + 30, 392, 50, 12, '#FBF8F2');
      strokeRR(ctx, 108, y + 30, 392, 50, 12, i === 0 ? P.light.gold : P.light.cardLine, i === 0 ? 1.8 : 1.1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(108, y + 30, 392 * p, 50);
      ctx.clip();
      text(ctx, v, 124, y + 62, { size: 18, weight: 600, color: P.light.ink, maxWidth: 366 });
      ctx.restore();
      if (i === 0) {
        const cw = Math.min(392 * p, 240);
        fillRR(ctx, 108 + cw, y + 42, 2, 26, 1, P.light.gold);
      }
    });
    // color + image controls
    [['কালার', ['#C2A167', '#7C9A8B', '#5C6BC0']], ['ছবি', []]].forEach(([label, cols], i) => {
      const y = 1080 + i * 90;
      text(ctx, label, 108, y + 18, { size: 18, weight: 500, color: P.light.muted });
      cols.forEach((c, k) => circle(ctx, 176 + k * 44, y + 14, 15, c));
      if (!cols.length) {
        fillRR(ctx, 108, y + 32, 392, 44, 10, '#FBF8F2');
        strokeRR(ctx, 108, y + 32, 392, 44, 10, P.light.cardLine, 1.1);
        icon(ctx, 'upload', 128, y + 42, 22, P.light.goldDeep, 1.9);
        text(ctx, 'banner.jpg আপলোড হয়েছে', 160, y + 61, { size: 17, weight: 500, color: P.light.ink2 });
      }
    });
    fillRR(ctx, 108, 1300, 392, 54, 14, P.light.ink);
    text(ctx, 'সেভ করুন', 304, 1336, { size: 21, weight: 700, color: '#fff', align: 'center' });

    // arrow
    const ap = beat(t, 1.4, 0.6, easeOut);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      circle(ctx, 554, 1060, 30, '#FFFFFF');
      strokeRR(ctx, 524, 1030, 60, 60, 30, P.light.cardLine, 1.1);
      text(ctx, '→', 554, 1072, { size: 34, weight: 700, color: P.light.goldDeep, align: 'center' });
      ctx.restore();
    }

    // live preview phone
    const pp = beat(t, 0.5, 0.9, easeOutQuint);
    if (pp > 0) {
      phone(ctx, t, {
        x: 598, y: 690, w: 356, enter: pp, tone,
        draw: (w, h) => SF.sfHome(ctx, w, h, {
          scroll: 0.02, cart: 0, activeCat: 1,
        }),
      });
      pill(ctx, 776, 1560, 'লাইভ প্রিভিউ', { tone, align: 'center', iconName: 'play', p: beat(t, 1.8, 0.5, easeOutBack), size: 21 });
      // saved toast
      const sp = beat(t, 3.0, 0.6, easeOutQuint);
      if (sp > 0) {
        ctx.save();
        ctx.globalAlpha *= clamp(sp);
        notifyCard(ctx, 560, 1660, 470, t, { title: 'সেভ হয়েছে', body: 'পরিবর্তন লাইভ', iconName: 'checkCircle', tone: 'light', delay: 0 });
        ctx.restore();
      }
    }
  },

  /* 22 — landing pages for ads */
  landingIntro(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 86 });

    const enter = beat(t, 0.15, 0.9, easeOutQuint);
    phone(ctx, t, {
      x: 566, y: 680, w: 386, enter, tone, glow: '#2E5BFF', rotate: 0.02,
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: clamp(t / 2) }),
    });
    // ad mock pointing to the landing page
    const ap = beat(t, 0.8, 0.7, easeOutQuint);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      ctx.translate((1 - ap) * -50, 0);
      glassCard(ctx, 66, 860, 420, 300, { r: 26, fill: 'rgba(16,26,46,0.84)' });
      text(ctx, 'স্পন্সর্ড • বিজ্ঞাপন', 96, 912, { size: 19, weight: 600, color: P.dark.muted });
      fillRR(ctx, 96, 932, 360, 128, 14, 'rgba(255,255,255,0.07)');
      drawWatch(ctx, 276, 996, 46, SF.PRODUCTS[0].tone);
      text(ctx, 'ঈদ কালেকশন', 96, 1094, { size: 26, weight: 700, color: P.dark.ink });
      text(ctx, 'সীমিত সময়ের অফার', 96, 1124, { size: 19, weight: 500, color: P.dark.muted });
      ctx.restore();
    }
    const lp = beat(t, 1.6, 0.7, easeOut);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(lp);
      dashLine(ctx, 486, 1010, 566, 1010, alpha(P.dark.cyan, 0.6), 2, [5, 7], lp);
      circle(ctx, 526, 1010, 17, alpha(P.dark.cyan, 0.18));
      icon(ctx, 'arrow', 518, 1003, 16, P.dark.cyan, 2.4);
      ctx.restore();
    }
    pill(ctx, 276, 1240, 'ক্যাম্পেইনের জন্য আলাদা পেজ', { tone, align: 'center', iconName: 'tag', p: beat(t, 2.2, 0.6, easeOutBack), size: 20 });
    // result rail
    const rp = beat(t, 2.6, 0.6, easeOutQuint);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(rp);
      glassCard(ctx, 66, 1330, 420, 230, { r: 26, fill: 'rgba(16,26,46,0.8)' });
      text(ctx, 'ফলাফল', 96, 1380, { size: 20, weight: 600, color: P.dark.muted });
      [['অর্ডার', 'list'], ['ট্র্যাকিং', 'chart'], ['রিটার্গেট', 'refresh']].forEach(([label, ic], i) => {
        const y = 1410 + i * 48;
        circle(ctx, 108, y + 8, 10, alpha(P.dark.cyan, 0.16));
        icon(ctx, ic, 102, y + 2, 14, P.dark.cyan, 2.2);
        text(ctx, label, 132, y + 16, { size: 21, weight: 600, color: P.dark.ink });
        fillRR(ctx, 300, y + 10, 150 - i * 26, 6, 3, alpha(P.dark.gold, 0.55 - i * 0.12));
      });
      ctx.restore();
    }
  },

  /* 23 — unlimited landing pages */
  landingUnlimited(ctx, t, d, s) {
    const tone = 'light';
    kickerLine(ctx, s.kicker, t, { tone, y: 470, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'কাস্টম ল্যান্ডিং পেজ', t, {
      tone, x: W / 2 - LAY.w / 2, y: 590, size: 96, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#14171D', '#B08A57'],
    });

    // a fanned deck of landing pages, count ticking up
    const n = 5;
    for (let i = 0; i < n; i++) {
      const p = beat(t, 0.35 + i * 0.13, 0.6, easeOutBack);
      if (p <= 0) continue;
      const cxi = W / 2 + (i - (n - 1) / 2) * 150;
      const rot = (i - (n - 1) / 2) * 0.05;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(cxi, 1010 + (1 - p) * 60);
      ctx.rotate(rot);
      shadow(ctx, 'rgba(60,44,20,0.24)', 44, 20);
      fillRR(ctx, -110, -206, 220, 400, 22, '#FFFFFF');
      noShadow(ctx);
      strokeRR(ctx, -110, -206, 220, 400, 22, P.light.cardLine, 1.2);
      fillRR(ctx, -96, -192, 192, 168, 14, i % 2 ? '#F1E7D4' : '#E9EEF7');
      drawWatch(ctx, 0, -110, 46, SF.PRODUCTS[i % SF.PRODUCTS.length].tone);
      fillRR(ctx, -96, -8, 140, 13, 6.5, 'rgba(20,23,29,0.6)');
      fillRR(ctx, -96, 18, 178, 9, 4.5, 'rgba(20,23,29,0.18)');
      fillRR(ctx, -96, 38, 150, 9, 4.5, 'rgba(20,23,29,0.18)');
      fillRR(ctx, -96, 70, 112, 40, 12, P.light.ink);
      fillRR(ctx, -96, 132, 192, 30, 10, 'rgba(20,23,29,0.055)');
      fillRR(ctx, -96, 172, 130, 10, 5, 'rgba(20,23,29,0.12)');
      ctx.restore();
    }

    // counter
    const cp = beat(t, 1.2, 0.7, easeOutQuint);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      lightCard(ctx, 246, 1330, 588, 112, { r: 30, lift: 0.95 });
      fillRR(ctx, 272, 1356, 60, 60, 20, 'rgba(176,138,87,0.16)');
      icon(ctx, 'plus', 288, 1372, 28, P.light.goldDeep, 2.6);
      text(ctx, 'যত ইচ্ছা তত পেজ', 356, 1378, { size: 28, weight: 700, color: P.light.ink });
      text(ctx, 'প্রতিটি প্রোডাক্ট বা অফারের জন্য আলাদা', 356, 1410, { size: 19, weight: 500, color: P.light.muted, maxWidth: 440 });
      seal(ctx, 792, 1386, 18, 'yes', beat(t, 1.9, 0.5), { tone });
      ctx.restore();
    }
  },

  /* 24 — three campaign landing pages */
  landingThree(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const cards = [
      { x: 74, label: 'প্রোডাক্ট লঞ্চ', variant: 1 },
      { x: 372, label: 'স্পেশাল অফার', variant: 0 },
      { x: 670, label: 'ক্যাম্পেইন', variant: 2 },
    ];
    cards.forEach((c, i) => {
      const p = beat(t, 0.25 + i * 0.16, 0.7, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 44);
      phone(ctx, t, {
        x: c.x, y: 700, w: 336, enter: 1, tone, float: false, shadowA: 0.35,
        draw: (w, h) => SF.sfLanding(ctx, w, h, c.variant, { p: clamp((t - i * 0.2) / 1.5) }),
      });
      text(ctx, c.label, c.x + 168, 1480, { size: 24, weight: 700, color: P.light.ink, align: 'center' });
      ctx.restore();
    });
    pill(ctx, W / 2, 1560, 'প্রতিটি ক্যাম্পেইনের জন্য আলাদা পেজ', { tone, align: 'center', iconName: 'link', p: beat(t, 1.5, 0.6, easeOutBack), size: 21 });
  },

  /* 25 — landing page anatomy */
  landingDetail(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const ph = phone(ctx, t, {
      x: 480, y: 660, w: 400, enter: beat(t, 0.1, 0.9, easeOutQuint), tone, float: false,
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: clamp(t / 1.4) }),
    });

    const rows = [
      ['আকর্ষণীয় ব্যানার', 'banner', 0.30],
      ['প্রোডাক্টের বিস্তারিত', 'box', 0.55],
      ['বিশেষ অফার', 'tag', 0.75],
      ['সরাসরি অর্ডার', 'cart', 0.9],
    ];
    rows.forEach(([label, ic, fy], i) => {
      const p = beat(t, 0.7 + i * 0.22, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 800 + i * 118;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * -40, 0);
      lightCard(ctx, 74, y, 356, 92, { r: 22, lift: 0.85 });
      fillRR(ctx, 96, y + 22, 48, 48, 15, 'rgba(176,138,87,0.12)');
      icon(ctx, ic === 'banner' ? 'grid' : ic, 106, y + 32, 28, P.light.goldDeep, 1.9);
      text(ctx, label, 160, y + 55, { size: 23, weight: 600, color: P.light.ink, maxWidth: 250 });
      // connector to the phone at the right height
      dashLine(ctx, 430, y + 46, 480, ph.y + ph.h * fy, alpha(P.light.goldDeep, 0.45), 1.8, [4, 6], p);
      circle(ctx, 480, ph.y + ph.h * fy, 6, P.light.goldDeep);
      ctx.restore();
    });
  },

  /* 26 — marketing strategy board */
  marketingStrategy(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 78, maxWidth: 900 });

    const chan = [
      ['Facebook', 'art'],
      ['Instagram', 'art'],
      ['Messenger', 'chat'],
      ['WhatsApp', 'chat'],
    ];
    // funnel: ads → landing pages → orders
    const stages = [
      { y: 640, label: 'বিজ্ঞাপন', w: 860 },
      { y: 838, label: 'ল্যান্ডিং পেজ', w: 700 },
      { y: 1036, label: 'অর্ডার', w: 540 },
      { y: 1234, label: 'রিপোর্ট', w: 380 },
    ];
    stages.forEach((st, i) => {
      const p = beat(t, 0.3 + i * 0.22, 0.7, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      const x = (W - st.w) / 2;
      lightCard(ctx, x, st.y, st.w, 166, { r: 28, lift: 0.95 });
      fillRR(ctx, x, st.y, st.w, 6, 3, lin(ctx, x, st.y, x + st.w, st.y, [[0, '#C2A167'], [1, '#7C9A8B']]));
      fillRR(ctx, x + 24, st.y + 28, 54, 54, 17, 'rgba(176,138,87,0.13)');
      icon(ctx, ['tag', 'link', 'cart', 'chart'][i], x + 38, st.y + 42, 26, P.light.goldDeep, 2);
      text(ctx, st.label, x + 96, st.y + 66, { size: 32, weight: 700, color: P.light.ink });
      if (i === 0) {
        chan.forEach(([name], k) => {
          fillRR(ctx, x + 24 + k * ((st.w - 48) / 4), st.y + 106, (st.w - 60) / 4, 40, 12, 'rgba(20,23,29,0.05)');
          text(ctx, name, x + 24 + k * ((st.w - 48) / 4) + ((st.w - 60) / 8), st.y + 133, { size: 18, weight: 600, color: P.light.ink2, align: 'center' });
        });
      }
      if (i === 1) text(ctx, 'প্রতিটি অফারের জন্য আলাদা পেজ • A/B তুলনা', x + 96, st.y + 116, { size: 20, weight: 500, color: P.light.muted });
      if (i === 2) text(ctx, 'পিক্সেল ও কনভার্শন দিয়ে মাপা যায়', x + 96, st.y + 116, { size: 20, weight: 500, color: P.light.muted });
      if (i === 3) text(ctx, 'কোন পেজ কত এনেছে — স্পষ্ট', x + 96, st.y + 116, { size: 20, weight: 500, color: P.light.muted });
      // funnel sides
      if (i < stages.length - 1) {
        const nextW = stages[i + 1].w;
        ctx.strokeStyle = 'rgba(176,138,87,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, st.y + 166);
        ctx.lineTo((W - nextW) / 2, stages[i + 1].y);
        ctx.moveTo(x + st.w, st.y + 166);
        ctx.lineTo((W + nextW) / 2, stages[i + 1].y);
        ctx.stroke();
      }
      ctx.restore();
    });

    pill(ctx, W / 2, 1500, 'মার্কেটিং স্ট্রাটেজি অনুযায়ী পেজ সাজান', { tone, align: 'center', iconName: 'chart', p: beat(t, 1.6, 0.6, easeOutBack), size: 22 });
  },
};
