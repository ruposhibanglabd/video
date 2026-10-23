/**
 * Scenes 01–13 — the hook, the offer, and the custom-design promise.
 *
 * Art direction: cinematic dark for the claims, clean light for the product
 * moments so the viewer feels they are browsing a real premium shop.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, lin, text, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, brandMark, drawWatch,
} from '../render/kit.mjs';
import {
  P, LAY, AURUM, SEED, backdrop, groundShadow, headlineBlock, kickerLine, stdTitle,
  glassCard, lightCard, phone, screenCrop, browser, pill, callout, cursor, notifyCard,
  kpiTile, chain, chapterCard, demoRibbon, priceHero, seal, featureTile, ghostNumeral, dashLine,
} from './premium.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

/* ---------------------------------------------------------------- helpers */
function titleOf(ctx, t, s, tone, opts = {}) {
  if (s.title === false) {
    return kickerLine(ctx, s.kicker, t, { tone, ...opts });
  }
  return stdTitle(ctx, t, s, { tone, ...opts });
}

/** Warm halo behind a device on light stages. */
function deviceHalo(ctx, cx, cy, r, tone = 'light', a = 0.5) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  if (tone === 'light') {
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.55, `rgba(246,232,206,${a * 0.55})`);
    g.addColorStop(1, 'rgba(246,232,206,0)');
  } else {
    g.addColorStop(0, `rgba(90,160,255,${a * 0.5})`);
    g.addColorStop(1, 'rgba(90,160,255,0)');
  }
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/* ---------------------------------------------------------------- scenes */
export const openScenes = {
  /* 01 — hook: the website you could own */
  hook(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 88 });

    // ambient arcs behind the device
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = 'rgba(227,184,124,0.15)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(W / 2, 1320, 300 + i * 74, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.restore();

    // capability pills above the device
    const p1 = beat(t, 1.05, 0.6, easeOutBack);
    const p2 = beat(t, 1.25, 0.6, easeOutBack);
    if (p1 > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(p1);
      ctx.translate(0, (1 - p1) * 16);
      pill(ctx, W / 2 - 122, 596, 'কাস্টমার ওয়েবসাইট', { tone, iconName: 'globe', p: 1, size: 22, align: 'center' });
      ctx.restore();
    }
    if (p2 > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(p2);
      ctx.translate(0, (1 - p2) * 16);
      pill(ctx, W / 2 + 128, 596, 'অ্যাডমিন প্যানেল', { tone, iconName: 'grid', p: 1, size: 22, align: 'center' });
      ctx.restore();
    }

    const enter = beat(t, 0.12, 1.05, easeOutQuint);
    const scroll = 0.02 + 0.24 * easeInOut(clamp((t - 1.6) / Math.max(1.4, d - 2.4)));
    const ph = phone(ctx, t, {
      y: 1010 - 320 * enter, w: 566, enter, tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll, cart: 0, activeCat: 1 }),
    });
    lightSweep(ctx, ph.x - 6, ph.y - 6, ph.w + 12, 980, clamp((t - 2.6) / 1.8), 'rgba(160,205,255,0.10)', 120);
  },

  /* 02 — browsing and ordering like a customer */
  browse(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 86 });

    const enter = beat(t, 0.1, 0.9, easeOutQuint);
    // back phone (home) behind, dimmed
    phone(ctx, t, {
      x: 54, y: 1080, w: 330, rotate: -0.09, enter: beat(t, 0.05, 0.9, easeOutQuint), tone,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.3, cart: 0, activeCat: 2 }),
      dim: 0.45, float: true, shadowA: 0.3,
    });

    const tapAdd = clamp((t - 3.05) / 0.55);
    const ph = phone(ctx, t, {
      x: 452, y: 720, w: 512, enter, tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfProduct(ctx, w, h, {
        addToCart: tapAdd, feat: 1, color: 0, size: 0, swapPage: 0, thumb: 0,
        zoom: 0.4 * easeInOut(clamp(t / 4)),
      }),
    });

    // live cursor reaching the buy button, then tapping
    const cp = beat(t, 1.5, 1.1, easeInOut);
    if (cp > 0) {
      const tx = ph.x + ph.w * 0.7;
      const ty = ph.y + ph.h * 0.94;
      const x = lerp(ph.x + ph.w * 0.9, tx, cp);
      const y = lerp(ph.y + ph.h * 0.66, ty, cp);
      cursor(ctx, x, y, clamp(cp * 3), { tapP: clamp((t - 2.78) / 0.6), tone: 'dark', scale: 1.1 });
    }
    if (tapAdd > 0.5) {
      const tp = beat(t, 3.25, 0.5, easeOutQuint);
      ctx.save();
      ctx.globalAlpha *= tp;
      ctx.translate(0, (1 - tp) * 24);
      notifyCard(ctx, 232, 1560, 616, t, {
        title: 'কার্টে যোগ হয়েছে', body: 'Heritage Chrono • ৳4,890', iconName: 'bag', tone: 'dark', delay: 0,
      });
      ctx.restore();
    }
    callout(ctx, ph.x + 4, ph.y + ph.h * 0.36, 'ছবি, দাম ও বিস্তারিত', t, {
      dx: -150, dy: -60, tone: 'dark', delay: 1.0, size: 21, align: 'left',
    });
  },

  /* 03 — one dashboard runs the shop */
  adminIntro(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 84 });

    const enter = beat(t, 0.1, 0.95, easeOutQuint);
    const br = browser(ctx, t, {
      y: 600, w: 968, vw: 1000, vh: 620, enter, tone, dark: true, url: 'admin.aurum.shop',
      draw: (w, h) => AD.adDashboard(ctx, w, h, { p: 0.55 + 0.45 * clamp(t / 2.2) }),
    });
    phone(ctx, t, {
      x: 664, y: 1200, w: 300, enter: beat(t, 1.0, 0.8, easeOutBack), tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.06, cart: 0, activeCat: 1 }),
    });
    lightSweep(ctx, br.x, br.y, br.w, br.h, clamp((t - 2.6) / 1.8), 'rgba(150,200,255,0.10)', 120);

    const cp = beat(t, 1.9, 1.2, easeInOut);
    if (cp > 0) {
      cursor(ctx, lerp(br.x + br.w * 0.72, br.x + br.w * 0.34, cp), lerp(br.y + br.h * 0.82, br.y + br.h * 0.3, cp),
        clamp(cp * 2.4), { tapP: clamp((t - 3.2) / 0.6), tone: 'dark', scale: 1.15 });
    }
    callout(ctx, br.x + br.w * 0.3, br.y + br.h * 0.22, 'লাইভ অর্ডার ও বিক্রি', t, {
      dx: -230, dy: -30, tone: 'dark', delay: 1.6, size: 21, align: 'left',
    });
  },

  /* 04 — the price tease */
  priceTease(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 430, align: 'center', x: W / 2, size: 26 });

    // ghost device, barely there
    ctx.save();
    ctx.globalAlpha = 0.16;
    phone(ctx, t, {
      y: 830, w: 520, enter: beat(t, 0, 1, easeOutQuint), tone, float: false,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.05, cart: 0, activeCat: 0 }),
      dim: 1, shadowA: 0.2,
    });
    ctx.restore();

    // radial burst
    const bp = beat(t, 0.15, 1.3, easeOut);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(W / 2, 1020);
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + t * 0.04;
      const len = 260 + 240 * bp;
      const g = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
      g.addColorStop(0, 'rgba(227,184,124,0.20)');
      g.addColorStop(1, 'rgba(227,184,124,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 140, Math.sin(a) * 140);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();

    priceHero(ctx, t, {
      cx: W / 2, y: 1030, size: 268, tone, delay: 0.2, p: beat(t, 0.12, 0.95, easeOutBack),
      label: 'শুরু করুন', sub: 'সম্পূর্ণ কাস্টম ওয়েবসাইট',
    });
    pill(ctx, W / 2, 1310, 'কোনো এডভান্স নেই', { tone, align: 'center', iconName: 'check', p: beat(t, 1.2, 0.6, easeOutBack), size: 24 });
  },

  /* 05 — the price confirmed */
  priceConfirm(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    const ph = phone(ctx, t, {
      x: 74, y: 640, w: 384, enter: beat(t, 0.1, 0.9, easeOutQuint), tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.16, cart: 0, activeCat: 1 }),
    });

    const items = [
      ['globe', 'কাস্টমার ওয়েবসাইট'],
      ['grid', 'অ্যাডমিন প্যানেল'],
      ['rocket', 'মোবাইল ফ্রেন্ডলি'],
      ['tag', 'ল্যান্ডিং পেজ'],
    ];
    items.forEach(([ic, label], i) => {
      const p = beat(t, 0.85 + i * 0.16, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 690 + i * 104;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 46, 0);
      glassCard(ctx, 508, y, 480, 88, { r: 22, fill: 'rgba(16,26,46,0.72)' });
      fillRR(ctx, 528, y + 24, 40, 40, 12, 'rgba(79,216,255,0.14)');
      icon(ctx, ic, 537, y + 33, 22, P.dark.cyan, 1.9);
      text(ctx, label, 584, y + 55, { size: 25, weight: 600, color: P.dark.ink, maxWidth: 320 });
      seal(ctx, 952, y + 44, 16, 'yes', beat(t, 1.05 + i * 0.16, 0.45), { tone });
      ctx.restore();
    });

    // price band at the bottom
    const bp = beat(t, 1.5, 0.7, easeOutQuint);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      ctx.translate(0, (1 - bp) * 40);
      glassCard(ctx, 88, 1150, 904, 236, { r: 32, fill: 'rgba(14,24,42,0.82)', glow: '#4FD8FF' });
      text(ctx, 'মাত্র', 140, 1240, { size: 30, weight: 500, color: P.dark.muted });
      priceHero(ctx, t, { cx: 470, y: 1310, size: 132, tone, delay: 1.6, p: bp });
      fillRR(ctx, 660, 1200, 2, 136, 1, 'rgba(255,255,255,0.12)');
      text(ctx, 'কাস্টমাইজড', 786, 1258, { size: 28, weight: 600, color: P.dark.ink2, align: 'center' });
      text(ctx, 'ওয়েবসাইট', 786, 1300, { size: 28, weight: 600, color: P.dark.ink2, align: 'center' });
      pill(ctx, 786, 1352, 'কোনো এডভান্স নেই', { tone, align: 'center', iconName: 'check', p: bp, size: 19, h: 46 });
      ctx.restore();
    }
  },

  /* 06 — no advance */
  noAdvance(ctx, t, d, s) {
    const tone = 'dark';
    // giant ghost zero
    ctx.save();
    ctx.globalAlpha = 0.5;
    text(ctx, '০', W / 2, 1010, { size: 620, weight: 800, color: 'rgba(79,216,255,0.055)', align: 'center' });
    ctx.restore();

    kickerLine(ctx, s.kicker, t, { tone, y: 560, align: 'center', x: W / 2 });
    headlineBlock(ctx, s.headline, t, {
      tone, x: W / 2 - LAY.w / 2, y: 700, size: 118, maxWidth: LAY.w, align: 'center', delay: 0.18,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });

    const p = beat(t, 0.85, 0.8, easeOutQuint);
    if (p > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 40);
      glassCard(ctx, 132, 1010, 816, 250, { r: 32, fill: 'rgba(14,24,42,0.82)', glow: '#4FD8FF' });
      text(ctx, 'অর্ডার শুরুর জন্য', 180, 1082, { size: 26, weight: 500, color: P.dark.muted });
      text(ctx, 'অ্যাডভান্স', 180, 1140, { size: 34, weight: 700, color: P.dark.ink });
      text(ctx, '৳০', 596, 1160, { size: 104, weight: 800, color: '#7BE7B8', align: 'right' });
      seal(ctx, 852, 1104, 40, 'yes', beat(t, 1.4, 0.6), { tone });
      dashLine(ctx, 180, 1192, 900, 1192, 'rgba(255,255,255,0.14)', 1.4, [5, 8], p);
      text(ctx, 'কাজ বুঝে নিন, তারপর সিদ্ধান্ত — শুরুতে কোনো টাকা দিতে হবে না।', 180, 1234, { size: 21, weight: 500, color: P.dark.ink2, maxWidth: 700 });
      ctx.restore();
    }
  },

  /* 07 — "a ready-made template?" */
  templateDoubt(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 84 });

    // three identical template cards — the doubt made visual
    const cards = [
      { x: 74, y: 800, r: -0.08, dim: 0.72 },
      { x: 366, y: 700, r: 0, dim: 0.95 },
      { x: 658, y: 800, r: 0.08, dim: 0.72 },
    ];
    cards.forEach((c, i) => {
      const p = beat(t, 0.3 + i * 0.12, 0.8, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * c.dim;
      ctx.translate(c.x + 167, c.y + 250 + (1 - p) * 50);
      ctx.rotate(c.r);
      glassCard(ctx, -167, -250, 334, 500, { r: 24, fill: 'rgba(20,32,54,0.94)', stroke: 'rgba(160,195,255,0.26)' });
      fillRR(ctx, -141, -212, 282, 156, 12, 'rgba(255,255,255,0.12)');
      fillRR(ctx, -141, -40, 168, 20, 10, 'rgba(255,255,255,0.2)');
      fillRR(ctx, -141, -6, 232, 13, 6.5, 'rgba(255,255,255,0.11)');
      for (let k = 0; k < 2; k++) {
        fillRR(ctx, -141 + k * 148, 30, 132, 128, 10, 'rgba(255,255,255,0.08)');
      }
      fillRR(ctx, -141, 178, 282, 13, 6.5, 'rgba(255,255,255,0.07)');
      fillRR(ctx, -141, 202, 200, 13, 6.5, 'rgba(255,255,255,0.055)');
      ctx.restore();
    });

    // repetition arrows between the cards
    const ap = beat(t, 1.1, 0.7, easeOut);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      ['=', '='].forEach((m, i) => {
        text(ctx, m, 312 + i * 292, 960, { size: 54, weight: 700, color: 'rgba(255,120,140,0.55)', align: 'center' });
      });
      ctx.restore();
    }

    // red stamp
    const sp = beat(t, 1.6, 0.55, easeOutBack);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(sp);
      ctx.translate(W / 2, 1180);
      ctx.rotate(-0.055);
      ctx.scale(0.86 + 0.14 * sp, 0.86 + 0.14 * sp);
      ctx.strokeStyle = 'rgba(255,110,128,0.9)';
      ctx.lineWidth = 4;
      fillRR(ctx, -268, -66, 536, 132, 20, 'rgba(255,110,128,0.12)');
      rr(ctx, -268, -66, 536, 132, 20);
      ctx.stroke();
      text(ctx, 'একই টেমপ্লেট?', 0, 24, { size: 56, weight: 800, color: '#FF8397', align: 'center' });
      ctx.restore();
    }
  },

  /* 08 — custom design, not a template */
  customDesign(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80, maxWidth: 900 });

    // design canvas
    const cp = beat(t, 0.2, 0.9, easeOutQuint);
    const cx = 96, cy = 700, cw = 888, ch = 760;
    ctx.save();
    ctx.globalAlpha *= clamp(cp);
    ctx.translate(0, (1 - cp) * 40);
    lightCard(ctx, cx, cy, cw, ch, { r: 34, lift: 1.2 });
    // canvas chrome
    ctx.save();
    rr(ctx, cx, cy, cw, ch, 34);
    ctx.clip();
    ctx.fillStyle = '#FCFAF6';
    ctx.fillRect(cx, cy, cw, ch);
    // dotted canvas grid
    ctx.strokeStyle = 'rgba(20,23,29,0.05)';
    ctx.lineWidth = 1;
    for (let x = cx + 24; x < cx + cw; x += 32) { ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + ch); ctx.stroke(); }
    for (let y = cy + 24; y < cy + ch; y += 32) { ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + cw, y); ctx.stroke(); }

    // brand kit
    text(ctx, 'ব্র্যান্ড কিট', cx + 40, cy + 62, { size: 24, weight: 700, color: P.light.ink });
    const swatches = ['#15181E', '#C2A167', '#F3E7D2', '#7C9A8B'];
    swatches.forEach((col, i) => {
      const p = beat(t, 0.7 + i * 0.12, 0.5, easeOutBack);
      const x = cx + 40 + i * 78;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(x, cy + 128);
      ctx.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
      circle(ctx, 0, 0, 30, col);
      ctx.strokeStyle = 'rgba(20,23,29,0.12)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
      if (i === 1) { ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.strokeStyle = P.light.gold; ctx.lineWidth = 2.4; ctx.stroke(); }
      ctx.restore();
    });

    // layout blocks assemble
    const blocks = [
      { x: cx + 40, y: cy + 210, w: 430, h: 190, t: 1.1, fill: '#FFFFFF', line: '#E6DFD1', label: 'হিরো ব্যানার' },
      { x: cx + 490, y: cy + 210, w: 356, h: 90, t: 1.25, fill: '#15181E', line: '#15181E', label: 'ক্যাটাগরি' },
      { x: cx + 490, y: cy + 312, w: 170, h: 88, t: 1.35, fill: '#C2A167', line: '#C2A167', label: 'অফার' },
      { x: cx + 676, y: cy + 312, w: 170, h: 88, t: 1.45, fill: '#F3E7D2', line: '#E6DFD1', label: 'প্রোডাক্ট' },
    ];
    blocks.forEach((b, i) => {
      const p = beat(t, b.t, 0.55, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
      ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
      fillRR(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 16, b.fill);
      strokeRR(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 16, b.line, 1.4);
      const dark = b.fill === '#15181E' || b.fill === '#C2A167';
      if (i === 0) drawWatch(ctx, 0, 0, 62, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
      text(ctx, b.label, 0, b.h / 2 - 22, { size: 19, weight: 600, color: dark ? 'rgba(255,255,255,0.85)' : P.light.muted, align: 'center' });
      ctx.restore();
    });

    // product row
    for (let i = 0; i < 4; i++) {
      const p = beat(t, 1.7 + i * 0.1, 0.5, easeOutQuint);
      const bx = cx + 40 + i * 202;
      const by = cy + 448;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      fillRR(ctx, bx, by, 182, 230, 16, '#FFFFFF');
      strokeRR(ctx, bx, by, 182, 230, 16, '#E6DFD1', 1.2);
      fillRR(ctx, bx + 1, by + 1, 180, 150, 15, '#F6F1E7');
      drawWatch(ctx, bx + 91, by + 76, 44, SF.PRODUCTS[i].tone);
      text(ctx, SF.PRODUCTS[i].bn, bx + 14, by + 186, { size: 17, weight: 600, color: P.light.ink, maxWidth: 156 });
      text(ctx, `৳${SF.PRODUCTS[i].price.toLocaleString('en-US')}`, bx + 14, by + 214, { size: 18, weight: 700, color: P.light.ink });
      ctx.restore();
    }

    // drag cursor pulling the gold swatch onto the canvas
    const dp = clamp((t - 0.55) / 1.0);
    if (dp > 0) {
      const sx = cx + 40 + 78, sy = cy + 128;
      const ex = cx + 560, ey = cy + 300;
      const m = easeInOut(dp);
      cursor(ctx, lerp(sx, ex, m) + Math.sin(t * 2) * 2, lerp(sy, ey, m), clamp(dp * 3), { tapP: clamp((t - 1.55) / 0.5), tone: 'light', scale: 1.2 });
    }
    ctx.restore();
    ctx.restore();

    pill(ctx, W / 2, 1540, 'রেডিমেড টেমপ্লেট নয় — আপনার ব্র্যান্ডের নিজস্ব ডিজাইন', {
      tone: 'light', iconName: 'sparkle', align: 'center', p: beat(t, 2.2, 0.6, easeOutBack), size: 22,
    });
  },

  /* 09 — design planning moodboard */
  designBoard(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const tiles = [
      { x: 74, y: 660, w: 430, h: 356, kind: 'palette' },
      { x: 528, y: 660, w: 456, h: 164, kind: 'logo' },
      { x: 528, y: 852, w: 456, h: 258, kind: 'type' },
      { x: 74, y: 1044, w: 430, h: 356, kind: 'product' },
      { x: 528, y: 1138, w: 456, h: 262, kind: 'ui' },
    ];
    tiles.forEach((tl, i) => {
      const p = beat(t, 0.22 + i * 0.12, 0.65, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 34);
      lightCard(ctx, tl.x, tl.y, tl.w, tl.h, { r: 28, lift: 0.9 });
      ctx.save();
      rr(ctx, tl.x, tl.y, tl.w, tl.h, 28);
      ctx.clip();
      if (tl.kind === 'palette') {
        text(ctx, 'কালার প্যালেট', tl.x + 26, tl.y + 46, { size: 22, weight: 600, color: P.light.muted });
        const cols = ['#15181E', '#C2A167', '#EADFC8', '#8FA3B8', '#7C9A8B'];
        const bw = (tl.w - 52 - 4 * 12) / 5;
        cols.forEach((c, k) => {
          const kp = beat(t, 0.65 + k * 0.08, 0.5, easeOutBack);
          ctx.save();
          ctx.globalAlpha *= clamp(kp);
          fillRR(ctx, tl.x + 26 + k * (bw + 12), tl.y + 78, bw, 180 * kp, 14, c);
          ctx.restore();
        });
        text(ctx, 'ব্র্যান্ডের রঙে পুরো ওয়েবসাইট', tl.x + 26, tl.y + tl.h - 34, { size: 20, weight: 500, color: P.light.ink2 });
      } else if (tl.kind === 'logo') {
        text(ctx, 'লোগো', tl.x + 26, tl.y + 42, { size: 21, weight: 600, color: P.light.muted });
        ctx.save();
        const s2 = 0.9 + 0.1 * beat(t, 0.8, 0.6, easeOutBack);
        ctx.translate(tl.x + 74, tl.y + 102);
        ctx.scale(s2, s2);
        ctx.strokeStyle = P.light.ink;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, 26); ctx.stroke();
        ctx.restore();
        text(ctx, 'AURUM', tl.x + 118, tl.y + 114, { size: 40, weight: 700, color: P.light.ink, letterSpacing: 4 });
      } else if (tl.kind === 'type') {
        text(ctx, 'টাইপোগ্রাফি', tl.x + 26, tl.y + 42, { size: 21, weight: 600, color: P.light.muted });
        text(ctx, 'সময়ের নিজস্ব ছন্দ', tl.x + 26, tl.y + 118, { size: 44, weight: 700, color: P.light.ink, maxWidth: tl.w - 52 });
        text(ctx, 'Heritage Chrono · 40mm', tl.x + 26, tl.y + 164, { size: 25, weight: 500, color: P.light.ink2 });
        fillRR(ctx, tl.x + 26, tl.y + 196, 120, 4, 2, P.light.gold);
        text(ctx, 'বাংলা + ইংরেজি যুক্তাক্ষরসহ', tl.x + 26, tl.y + 232, { size: 18, weight: 500, color: P.light.muted });
      } else if (tl.kind === 'ui') {
        text(ctx, 'প্রোডাক্ট কার্ড ডিজাইন', tl.x + 26, tl.y + 42, { size: 21, weight: 600, color: P.light.muted });
        for (let k = 0; k < 3; k++) {
          const kp = beat(t, 1.3 + k * 0.1, 0.5, easeOutQuint);
          const bx = tl.x + 26 + k * 138;
          ctx.save();
          ctx.globalAlpha *= clamp(kp);
          fillRR(ctx, bx, tl.y + 64, 122, 168, 12, '#FCFAF6');
          strokeRR(ctx, bx, tl.y + 64, 122, 168, 12, '#EDE6D8', 1.2);
          fillRR(ctx, bx + 1, tl.y + 65, 120, 104, 11, '#F5EFE3');
          drawWatch(ctx, bx + 61, tl.y + 116, 32, SF.PRODUCTS[k].tone);
          fillRR(ctx, bx + 12, tl.y + 180, 74, 9, 4.5, 'rgba(20,23,29,0.16)');
          fillRR(ctx, bx + 12, tl.y + 198, 48, 12, 6, 'rgba(20,23,29,0.28)');
          ctx.restore();
        }
        text(ctx, 'ছবি • নাম • দাম • অর্ডার বাটন', tl.x + 26, tl.y + 252, { size: 18, weight: 500, color: P.light.muted });
      } else {
        text(ctx, 'প্রোডাক্ট উপস্থাপন', tl.x + 26, tl.y + 46, { size: 22, weight: 600, color: P.light.muted });
        ctx.save();
        rr(ctx, tl.x + 24, tl.y + 70, tl.w - 48, 200, 18);
        ctx.clip();
        const g = ctx.createLinearGradient(0, tl.y + 70, 0, tl.y + 270);
        g.addColorStop(0, '#F7F1E5');
        g.addColorStop(1, '#EADDC6');
        ctx.fillStyle = g;
        ctx.fillRect(tl.x + 24, tl.y + 70, tl.w - 48, 200);
        drawWatch(ctx, tl.x + tl.w / 2, tl.y + 172, 74, SF.PRODUCTS[0].tone);
        ctx.restore();
        text(ctx, 'প্রিমিয়াম প্রেজেন্টেশন • জুমযোগ্য ছবি', tl.x + 26, tl.y + tl.h - 34, { size: 20, weight: 500, color: P.light.ink2 });
      }
      ctx.restore();
      ctx.restore();
    });
  },

  /* 10 — everything in the brand's colours */
  brandCustomize(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    // brand palettes, cycled while the shop keeps its content
    const phase = clamp(t / Math.max(1, d));
    const idx = Math.min(2, Math.floor(phase * 3));
    const themes = [
      { hero: '#3B2A1D', accent: '#C2A167', chip: '#F0E2C9', name: 'গোল্ড', ink: '#231C14' },
      { hero: '#0F2E2A', accent: '#7FB6A2', chip: '#DDEFE7', name: 'মিন্ট', ink: '#0B211E' },
      { hero: '#1B1F3A', accent: '#8E9CF0', chip: '#E4E7FF', name: 'নেভি', ink: '#141833' },
    ];
    const th = themes[idx];

    const ph = phone(ctx, t, {
      x: 56, y: 720, w: 386, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => {
        SF.sfHome(ctx, w, h, { scroll: 0.06, cart: 0, activeCat: 1 });
        // live brand tint over the hero band + CTA
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = alpha(th.hero, 0.85);
        ctx.fillRect(0, 108, w, 340);
        ctx.restore();
        ctx.save();
        rr(ctx, 26, 336, 158, 48, 24);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = th.accent;
        ctx.fillRect(26, 336, 158, 48);
        ctx.restore();
        text(ctx, 'সংগ্রহ দেখুন', 105, 368, { size: 20, weight: 700, color: th.ink, align: 'center' });
      },
    });

    const right = { x: 486, w: 522 };
    // logo tile
    const lp = beat(t, 0.8, 0.7, easeOutQuint);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(lp);
      ctx.translate(0, (1 - lp) * 24);
      lightCard(ctx, right.x, 720, right.w, 158, { r: 26, lift: 0.95 });
      text(ctx, 'লোগো', right.x + 28, 764, { size: 20, weight: 600, color: P.light.muted });
      ctx.strokeStyle = P.light.ink;
      ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.arc(right.x + 66, 818, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(right.x + 66, 796); ctx.lineTo(right.x + 66, 840); ctx.stroke();
      text(ctx, 'AURUM', right.x + 102, 832, { size: 38, weight: 700, color: P.light.ink, letterSpacing: 4 });
      seal(ctx, right.x + right.w - 40, 800, 15, 'yes', beat(t, 1.2, 0.45), { tone });
      ctx.restore();
    }
    // palette tile
    const pp = beat(t, 1.0, 0.7, easeOutQuint);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(pp);
      lightCard(ctx, right.x, 902, right.w, 250, { r: 26, lift: 0.95 });
      text(ctx, 'কালার থিম', right.x + 28, 946, { size: 20, weight: 600, color: P.light.muted });
      const cols = [['#C2A167', 'গোল্ড'], ['#7C9A8B', 'মিন্ট'], ['#5C6BC0', 'নেভি'], ['#C98F89', 'রোজ']];
      cols.forEach(([c, label], i) => {
        const x = right.x + 30 + i * 118;
        circle(ctx, x + 34, 1016, 40, c);
        if (i === idx) {
          ctx.strokeStyle = P.light.ink;
          ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.arc(x + 34, 1016, 50, 0, Math.PI * 2); ctx.stroke();
          seal(ctx, x + 34, 1016, 15, 'yes', beat(t, 1.3, 0.4), { tone });
        }
        text(ctx, label, x + 34, 1094, { size: 19, weight: 600, color: i === idx ? P.light.ink : P.light.muted, align: 'center' });
      });
      text(ctx, 'থিম বদলালেই পুরো ওয়েবসাইটের রঙ বদলে যায়', right.x + 28, 1128, { size: 19, weight: 500, color: P.light.muted, maxWidth: right.w - 56 });
      ctx.restore();
    }
    // banner tile
    const bp = beat(t, 1.2, 0.7, easeOutQuint);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      lightCard(ctx, right.x, 1172, right.w, 190, { r: 26, lift: 0.95 });
      text(ctx, 'ব্যানার', right.x + 28, 1216, { size: 20, weight: 600, color: P.light.muted });
      fillRR(ctx, right.x + 28, 1234, right.w - 56, 104, 16, lin(ctx, right.x + 28, 1234, right.x + right.w - 28, 1338, [[0, th.accent], [1, th.hero]]));
      text(ctx, 'নতুন কালেকশন', right.x + 52, 1282, { size: 26, weight: 700, color: '#FFFFFF' });
      text(ctx, 'সময়ের নিজস্ব ছন্দ', right.x + 52, 1316, { size: 19, weight: 500, color: 'rgba(255,255,255,0.8)' });
      drawWatch(ctx, right.x + right.w - 74, 1286, 34, SF.PRODUCTS[0].tone);
      ctx.restore();
    }
  },

  /* 11 — any business type */
  categoriesMontage(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const cats = [
      ['shirt', 'ফ্যাশন'],
      ['shoe', 'জুতা'],
      ['watch', 'ঘড়ি'],
      ['bottle', 'কসমেটিক্স'],
      ['headphone', 'ইলেকট্রনিক্স'],
      ['bag', 'গ্রোসারি'],
      ['plate', 'রেস্টুরেন্ট'],
      ['tag', 'অন্য যেকোনো'],
    ];
    const cols = 4, tw = 210, th = 268, gapX = 22, gapY = 24;
    const x0 = (W - (cols * tw + (cols - 1) * gapX)) / 2;
    cats.forEach(([ic, label], i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const p = beat(t, 0.22 + (i * 0.085), 0.62, easeOutBack);
      if (p <= 0) return;
      const x = x0 + col * (tw + gapX);
      const y = 664 + row * (th + gapY) + (1 - p) * 40;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(x + tw / 2, y + th / 2);
      ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
      ctx.translate(-tw / 2, -th / 2);
      lightCard(ctx, 0, 0, tw, th, { r: 26, lift: 0.8 });
      const hot = i === 7;
      fillRR(ctx, tw / 2 - 40, 30, 80, 80, 24, hot ? alpha(P.light.gold, 0.18) : 'rgba(20,23,29,0.055)');
      icon(ctx, ic, tw / 2 - 21, 51, 42, hot ? P.light.goldDeep : '#1B1F26', 2);
      text(ctx, label, tw / 2, 176, { size: 27, weight: 700, color: P.light.ink, align: 'center', maxWidth: tw - 24 });
      fillRR(ctx, tw / 2 - 26, 200, 52, 3, 1.5, hot ? P.light.gold : 'rgba(20,23,29,0.16)');
      text(ctx, hot ? 'আপনার ব্যবসা' : 'টেমপ্লেট প্রস্তুত', tw / 2, 238, { size: 18, weight: 500, color: P.light.muted, align: 'center', maxWidth: tw - 24 });
      ctx.restore();
    });

    // business ticker
    const words = ['ফ্যাশন', 'জুতা', 'ঘড়ি', 'কসমেটিক্স', 'ইলেকট্রনিক্স', 'গ্রোসারি', 'রেস্টুরেন্ট', 'কেক শপ', 'বই', 'ফার্নিচার', 'গ্যাজেট', 'ফুল শপ'];
    const ty = 1350;
    const tp = beat(t, 1.0, 0.7, easeOut);
    if (tp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(tp);
      ctx.beginPath();
      ctx.rect(0, ty - 40, W, 80);
      ctx.clip();
      const shift = (t * 46) % 3000;
      let x = -shift;
      let k = 0;
      while (x < W + 400) {
        const wd = words[k % words.length];
        ctx.font = fontStr(24, 600, wd);
        const ww = ctx.measureText(wd).width + 56;
        fillRR(ctx, x, ty - 27, ww, 54, 27, 'rgba(255,255,255,0.72)');
        strokeRR(ctx, x, ty - 27, ww, 54, 27, P.light.cardLine, 1.1);
        text(ctx, wd, x + ww / 2, ty + 8, { size: 24, weight: 600, color: P.light.ink2, align: 'center' });
        circle(ctx, x + ww + 16, ty, 3.4, 'rgba(176,138,87,0.6)');
        x += ww + 40;
        k++;
      }
      ctx.restore();
    }
    pill(ctx, W / 2, 1470, 'আপনার ব্যবসার ধরন অনুযায়ী ডিজাইন', { tone: 'light', align: 'center', iconName: 'sparkle', p: beat(t, 1.4, 0.6, easeOutBack), size: 22 });
  },

  /* 12 — modern, attractive, mobile friendly */
  mobileFriendly(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 78 });

    deviceHalo(ctx, 300, 1160, 520, 'light', 0.55);
    const ph = phone(ctx, t, {
      x: 108, y: 760, w: 372, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.16 + 0.1 * easeInOut(clamp(t / 6)), cart: 1, activeCat: 1 }),
    });

    const rows = [
      ['rocket', 'দ্রুত লোড', 'ধীর ইন্টারনেটেও'],
      ['phone', 'মোবাইল ফ্রেন্ডলি', 'এক হাতেই ব্যবহার'],
      ['grid', 'সব স্ক্রিনে মানানসই', 'ফোন • ট্যাব • ডেস্কটপ'],
    ];
    rows.forEach(([ic, title, sub], i) => {
      const p = beat(t, 1.0 + i * 0.2, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 840 + i * 148;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 44, 0);
      lightCard(ctx, 528, y, 456, 124, { r: 24, lift: 0.95 });
      fillRR(ctx, 552, y + 26, 56, 56, 18, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, 566, y + 40, 28, P.light.goldDeep, 1.9);
      text(ctx, title, 628, y + 56, { size: 27, weight: 700, color: P.light.ink, maxWidth: 330 });
      text(ctx, sub, 628, y + 88, { size: 20, weight: 500, color: P.light.muted, maxWidth: 330 });
      seal(ctx, 952, y + 62, 15, 'yes', beat(t, 1.15 + i * 0.2, 0.45), { tone });
      ctx.restore();
    });

    // responsive rail: mobile → tablet → desktop
    const rail = [['phone', 'মোবাইল'], ['laptop', 'ডেস্কটপ'], ['grid', 'ট্যাবলেট']];
    rail.forEach(([ic, label], i) => {
      const p = beat(t, 2.0 + i * 0.14, 0.5, easeOutBack);
      if (p <= 0) return;
      const x = 528 + i * 156;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      fillRR(ctx, x, 1300, 140, 116, 22, 'rgba(255,255,255,0.7)');
      strokeRR(ctx, x, 1300, 140, 116, 22, P.light.cardLine, 1.2);
      icon(ctx, ic, x + 54, 1326, 32, i === 0 ? P.light.goldDeep : P.light.ink2, 1.8);
      text(ctx, label, x + 70, 1392, { size: 20, weight: 600, color: P.light.ink2, align: 'center' });
      ctx.restore();
    });
  },

  /* 13 — chapter: features */
  featuresIntro(ctx, t, d, s) {
    chapterCard(ctx, t, { n: 1, title: 'ওয়েবসাইটে\nকী কী সুবিধা', sub: 'এক নজরে পুরো সিস্টেম', tone: 'dark', accent: P.dark.cyan, p: beat(t, 0, 0.6) });
  },
};
