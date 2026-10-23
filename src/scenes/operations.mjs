/**
 * Scenes 38–56 — retargeting, courier automation, order security, payments and
 * notification integrations. Optional capabilities stay clearly qualified.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, lin, text, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, drawWatch,
} from '../render/kit.mjs';
import {
  P, LAY, headlineBlock, kickerLine, stdTitle, glassCard, lightCard, phone, screenCrop,
  browser, pill, callout, cursor, notifyCard, kpiTile, chain, chapterCard, priceHero, seal,
  featureTile, ghostNumeral, dashLine, screenSwitch, stepper,
} from './premium.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';

function titleOf(ctx, t, s, tone, opts = {}) {
  if (s.title === false) return kickerLine(ctx, s.kicker, t, { tone, ...opts });
  return stdTitle(ctx, t, s, { tone, ...opts });
}

/** Qualified "integration dependent" note — never claims guaranteed features. */
function qualified(ctx, t, str, tone = 'light', y = 1712) {
  const p = beat(t, 1.4, 0.6, easeOut);
  if (p <= 0) return;
  const d = tone === 'light' ? P.light : P.dark;
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.font = fontStr(19, 500, str);
  const tw = ctx.measureText(str).width;
  const w = tw + 68;
  const x = (W - w) / 2;
  fillRR(ctx, x, y - 24, w, 48, 24, tone === 'light' ? 'rgba(20,23,29,0.045)' : 'rgba(255,255,255,0.06)');
  icon(ctx, 'shield', x + 18, y - 11, 22, d.muted, 1.7);
  text(ctx, str, x + 48, y + 7, { size: 19, weight: 500, color: d.muted, maxWidth: tw + 10 });
  ctx.restore();
}

export const operationsScenes = {
  /* 38 — "and that's not all" */
  notEnd(ctx, t, d, s) {
    const tone = 'dark';
    // expanding rings
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.34 + i * 0.25) % 1);
      ctx.strokeStyle = `rgba(79,216,255,${0.16 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.46, 100 + p * 420, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    ghostNumeral(ctx, '03', W / 2, 900, 420, P.dark.cyan, 0.05);
    kickerLine(ctx, s.kicker, t, { tone, y: 780, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'আর এখানেই\nশেষ নয়', t, {
      tone, x: W / 2 - LAY.w / 2, y: 880, size: 122, align: 'center', maxWidth: LAY.w, delay: 0.15,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });
    const arrow = beat(t, 1.0, 0.7, easeOutBack);
    if (arrow > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(arrow);
      ctx.strokeStyle = P.dark.gold;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(W / 2, 1200);
      ctx.lineTo(W / 2, 1300);
      ctx.moveTo(W / 2 - 14, 1284);
      ctx.lineTo(W / 2, 1302);
      ctx.lineTo(W / 2 + 14, 1284);
      ctx.stroke();
      ctx.restore();
    }
  },

  /* 39 — retargeting title */
  retargetTitle(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 760, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'রিটার্গেটিং\nমার্কেটিং', t, {
      tone, x: W / 2 - LAY.w / 2, y: 880, size: 118, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#FFFFFF', '#8B7BFF'],
    });
    // orbit glyph
    const op = beat(t, 0.6, 0.9, easeOut);
    if (op > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(op);
      ctx.translate(W / 2, 1360);
      circle(ctx, 0, 0, 70, 'rgba(16,26,46,0.8)');
      ctx.strokeStyle = alpha(P.dark.violet, 0.5);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, 'refresh', -24, -24, 48, P.dark.cyan, 1.8);
      for (let i = 0; i < 2; i++) {
        const a = t * 0.9 + i * Math.PI;
        circle(ctx, Math.cos(a) * 116, Math.sin(a) * 46, 9, alpha(P.dark.gold, 0.9));
      }
      ctx.restore();
    }
  },

  /* 40 — pixel + conversion tracking */
  retargetFlow(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    // flow: pixels → events → audience
    const nodes = [
      { label: 'মেটা পিক্সেল', ic: 'globe', sub: 'ভিজিটর ট্র্যাক' },
      { label: 'কনভার্শন', ic: 'chart', sub: 'Add to cart / Purchase' },
      { label: 'অডিয়েন্স', ic: 'users', sub: 'রিমার্কেটিং লিস্ট' },
    ];
    nodes.forEach((n, i) => {
      const p = beat(t, 0.25 + i * 0.35, 0.7, easeOutBack);
      if (p <= 0) return;
      const x = 78 + i * 316;
      const y = 780;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 40);
      glassCard(ctx, x, y, 276, 268, { r: 28, fill: 'rgba(16,26,46,0.76)', glow: i === 1 ? P.dark.cyan : null });
      fillRR(ctx, x + 24, y + 24, 64, 64, 20, 'rgba(79,216,255,0.14)');
      icon(ctx, n.ic, x + 40, y + 40, 32, P.dark.cyan, 1.9);
      text(ctx, n.label, x + 24, y + 148, { size: 27, weight: 700, color: P.dark.ink, maxWidth: 228 });
      text(ctx, n.sub, x + 24, y + 184, { size: 19, weight: 500, color: P.dark.muted, maxWidth: 228 });
      // status bar
      fillRR(ctx, x + 24, y + 210, 228, 8, 4, 'rgba(255,255,255,0.1)');
      fillRR(ctx, x + 24, y + 210, 228 * clamp(p * 1.1), 8, 4, alpha(P.dark.gold, 0.85));
      ctx.restore();
      // connector
      if (i < nodes.length - 1) {
        const cp2 = beat(t, 0.6 + i * 0.35, 0.5, easeOut);
        dashLine(ctx, x + 282, y + 134, x + 312, y + 134, alpha(P.dark.cyan, 0.6), 2.2, [4, 6], cp2);
      }
    });

    // events log card
    const lp = beat(t, 1.5, 0.7, easeOutQuint);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(lp);
      glassCard(ctx, 78, 1110, 924, 300, { r: 28, fill: 'rgba(13,22,40,0.72)' });
      text(ctx, 'কনভার্শন ইভেন্ট (ডেমো)', 110, 1160, { size: 22, weight: 600, color: P.dark.muted });
      [['ViewContent', 'পণ্য দেখেছেন', 'globe'], ['AddToCart', 'কার্টে যোগ করেছেন', 'cart'], ['Purchase', 'অর্ডার সম্পন্ন', 'cash']].forEach(([ev, bn, ic], i) => {
        const p2 = beat(t, 1.8 + i * 0.18, 0.5, easeOutQuint);
        const y = 1188 + i * 68;
        ctx.save();
        ctx.globalAlpha *= clamp(p2);
        fillRR(ctx, 110, y, 60, 44, 12, 'rgba(79,216,255,0.1)');
        icon(ctx, ic, 124, y + 10, 24, P.dark.cyan, 2);
        text(ctx, ev, 190, y + 20, { size: 21, weight: 700, color: P.dark.ink });
        text(ctx, bn, 190, y + 42, { size: 17, weight: 500, color: P.dark.muted });
        seal(ctx, 960, y + 22, 13, 'yes', p2, { tone });
        ctx.restore();
      });
      ctx.restore();
    }
    qualified(ctx, t, 'পিক্সেল সেটআপ — ইন্টিগ্রেশন ও অনুমতি সাপেক্ষে', tone, 1500);
  },

  /* 41 — audience segments */
  retargetAudience(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    const segs = [
      ['প্রোডাক্ট দেখেছেন', 'globe', 0.42],
      ['কার্টে যোগ করেছেন', 'cart', 0.3],
      ['কেনাকাটার আগ্রহ', 'star', 0.28],
    ];
    segs.forEach(([label, ic, ratio], i) => {
      const p = beat(t, 0.3 + i * 0.25, 0.7, easeOutQuint);
      if (p <= 0) return;
      const y = 760 + i * 236;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      glassCard(ctx, 78, y, 924, 196, { r: 28, fill: 'rgba(16,26,46,0.72)' });
      fillRR(ctx, 106, y + 44, 64, 64, 20, 'rgba(79,216,255,0.13)');
      icon(ctx, ic, 122, y + 60, 32, P.dark.cyan, 1.9);
      text(ctx, label, 194, y + 76, { size: 27, weight: 700, color: P.dark.ink });
      text(ctx, 'অডিয়েন্স সেগমেন্ট', 194, y + 110, { size: 19, weight: 500, color: P.dark.muted });
      // audience bar
      fillRR(ctx, 194, y + 134, 560, 12, 6, 'rgba(255,255,255,0.09)');
      fillRR(ctx, 194, y + 134, 560 * ratio * 2 * clamp(p * 1.2), 12, 6, lin(ctx, 194, 0, 754, 0, [[0, P.dark.cyan], [1, P.dark.gold]]));
      text(ctx, 'ডেমো', 962, y + 108, { size: 17, weight: 500, color: P.dark.muted, align: 'right' });
      ctx.restore();
    });
    pill(ctx, W / 2, 1500, 'সেগমেন্ট অনুযায়ী আলাদা অ্যাড', { tone, align: 'center', iconName: 'users', p: beat(t, 1.6, 0.6, easeOutBack), size: 22 });
  },

  /* 42 — retargeting campaign */
  retargetCampaign(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    // ad card
    const ap = beat(t, 0.3, 0.8, easeOutQuint);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      glassCard(ctx, 78, 720, 440, 400, { r: 28, fill: 'rgba(16,26,46,0.82)' });
      text(ctx, 'রিটার্গেটিং অ্যাড', 108, 768, { size: 21, weight: 600, color: P.dark.muted });
      fillRR(ctx, 108, 792, 380, 200, 18, 'rgba(255,255,255,0.06)');
      drawWatch(ctx, 298, 892, 66, SF.PRODUCTS[0].tone);
      text(ctx, 'Heritage Chrono', 108, 1030, { size: 26, weight: 700, color: P.dark.ink });
      text(ctx, '৳4,890 — সীমিত স্টক', 108, 1062, { size: 20, weight: 500, color: P.dark.muted });
      fillRR(ctx, 108, 1078, 190, 44, 22, P.dark.gold);
      text(ctx, 'এখনই কিনুন', 203, 1107, { size: 19, weight: 700, color: '#15181E', align: 'center' });
      ctx.restore();
    }
    // phone with the product page
    phone(ctx, t, {
      x: 596, y: 700, w: 380, enter: beat(t, 0.8, 0.9, easeOutQuint), tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfProduct(ctx, w, h, { feat: 1, addToCart: 0 }),
    });
    // return arrow from ad to phone
    const rp = beat(t, 1.5, 0.7, easeOut);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(rp);
      dashLine(ctx, 522, 900, 592, 900, alpha(P.dark.gold, 0.6), 2.2, [5, 7], rp);
      circle(ctx, 558, 900, 16, alpha(P.dark.gold, 0.18));
      icon(ctx, 'arrow', 550, 893, 16, P.dark.gold, 2.4);
      ctx.restore();
    }
    pill(ctx, 300, 1250, 'ভিজিটর আবার ফিরে আসে', { tone, align: 'center', iconName: 'refresh', p: beat(t, 2.0, 0.6, easeOutBack), size: 21 });
  },

  /* 43 — the loop */
  retargetLoop(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 84 });

    const cx = W / 2, cy = 1120, R = 250;
    ctx.save();
    ctx.strokeStyle = 'rgba(140,185,255,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.72, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    const nodes = [
      ['ভিজিট', 'globe'],
      ['অ্যাড', 'tag'],
      ['ফিরে আসা', 'refresh'],
      ['অর্ডার', 'cart'],
    ];
    nodes.forEach(([label, ic], i) => {
      const a = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R * 0.72;
      const p = beat(t, 0.55 + i * 0.2, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      circle(ctx, x, y, 56, 'rgba(14,24,42,0.92)');
      ctx.strokeStyle = alpha(P.dark.cyan, 0.42);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(x, y, 56, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, ic, x - 18, y - 18, 36, P.dark.cyan, 1.9);
      text(ctx, label, x, y + 88, { size: 22, weight: 600, color: P.dark.ink2, align: 'center' });
      ctx.restore();
    });

    // travelling dot along the ellipse
    const dotA = -Math.PI / 2 + t * 0.9;
    circle(ctx, cx + Math.cos(dotA) * R, cy + Math.sin(dotA) * R * 0.72, 11, P.dark.gold);
    glowOrb(ctx, cx + Math.cos(dotA) * R, cy + Math.sin(dotA) * R * 0.72, 70, P.dark.gold, 0.35);

    // centre chip
    const cp = beat(t, 1.4, 0.7, easeOutBack);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      ctx.translate(cx, cy);
      ctx.scale(0.9 + 0.1 * cp, 0.9 + 0.1 * cp);
      circle(ctx, 0, 0, 96, 'rgba(11,20,36,0.9)');
      ctx.strokeStyle = alpha(P.dark.gold, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 96, 0, Math.PI * 2); ctx.stroke();
      text(ctx, 'একই ভিজিটর', 0, -6, { size: 22, weight: 600, color: P.dark.ink2, align: 'center' });
      text(ctx, 'দ্বিগুণ সুযোগ', 0, 30, { size: 22, weight: 700, color: P.dark.ink, align: 'center' });
      ctx.restore();
    }
    qualified(ctx, t, 'রিটার্গেটিং ক্যাম্পেইন — অ্যাড অ্যাকাউন্ট ও বাজেট সাপেক্ষে', tone, 1700);
  },

  /* 44 — chapter: courier */
  sectionCourier(ctx, t, d, s) {
    chapterCard(ctx, t, { n: 4, title: 'কুরিয়ার\nঅটোমেশন', sub: 'অর্ডার থেকে ডেলিভারি পর্যন্ত', tone: 'dark', accent: P.dark.violet, p: beat(t, 0, 0.6) });
  },

  /* 45 — parcel journey */
  courierJourney(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const steps = [
      ['অর্ডার প্রস্তুত', 'box', 'প্যাকিং সম্পন্ন'],
      ['কুরিয়ারে পাঠানো', 'truck', 'কনসাইনমেন্ট তৈরি'],
      ['ট্র্যাকিং', 'pin', 'লাইভ স্ট্যাটাস'],
      ['ডেলিভারি আপডেট', 'checkCircle', 'ডেলিভারড'],
    ];
    const y0 = 740;
    steps.forEach(([label, ic, sub], i) => {
      const p = beat(t, 0.3 + i * 0.45, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = y0 + i * 196;
      const done = i < 3;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 34, 0);
      lightCard(ctx, 96, y, 888, 156, { r: 28, lift: done ? 0.9 : 0.6 });
      // step number
      fillRR(ctx, 124, y + 40, 76, 76, 22, done ? 'rgba(30,158,116,0.12)' : 'rgba(176,138,87,0.14)');
      icon(ctx, ic, 146, y + 62, 32, done ? '#1E9E74' : P.light.goldDeep, 1.9);
      text(ctx, label, 224, y + 68, { size: 28, weight: 700, color: P.light.ink });
      text(ctx, sub, 224, y + 104, { size: 20, weight: 500, color: P.light.muted });
      const badge = i === 3 ? 'ডেমো আপডেট' : 'সম্পন্ন';
      fillRR(ctx, 760, y + 56, 196, 44, 22, done ? 'rgba(30,158,116,0.10)' : 'rgba(20,23,29,0.05)');
      text(ctx, badge, 858, y + 85, { size: 18, weight: 600, color: done ? '#1E9E74' : P.light.muted, align: 'center' });
      // connector
      if (i < steps.length - 1) {
        const q = beat(t, 0.55 + i * 0.45, 0.4, easeOut);
        fillRR(ctx, 160, y + 132, 3.4, 66 * q, 2, 'rgba(176,138,87,0.45)');
      }
      ctx.restore();
    });
    qualified(ctx, t, 'কুরিয়ার ইন্টিগ্রেশন সমর্থিত হলে এই ধাপগুলো স্বয়ংক্রিয় হয়', tone, 1690);
  },

  /* 46 — sending to courier from the admin */
  courierAdmin(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80 });

    const br = browser(ctx, t, {
      y: 620, w: 968, vw: 1000, vh: 700, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/courier',
      draw: (w, h) => AD.adCourier(ctx, w, h, { p: clamp((t - 0.2) / 1.8) }),
    });

    // generated consignment card
    const cp = beat(t, 1.8, 0.7, easeOutQuint);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      ctx.translate(0, (1 - cp) * 30);
      lightCard(ctx, 560, 1380, 434, 268, { r: 26, lift: 1.1 });
      text(ctx, 'কনসাইনমেন্ট তৈরি', 588, 1424, { size: 21, weight: 600, color: P.light.muted });
      text(ctx, 'TRK-88214', 588, 1476, { size: 34, weight: 800, color: P.light.ink, letterSpacing: 1 });
      dashLine(ctx, 588, 1500, 966, 1500, 'rgba(20,23,29,0.1)', 1.4, [5, 6], cp);
      [['ট্র্যাকিং নম্বর সংরক্ষিত', 'checkCircle'], ['স্ট্যাটাস আপডেট চালু', 'refresh']].forEach(([label, ic], i) => {
        icon(ctx, ic, 588, 1524 + i * 44, 22, '#1E9E74', 2);
        text(ctx, label, 620, 1542 + i * 44, { size: 19, weight: 500, color: P.light.ink2 });
      });
      seal(ctx, 946, 1424, 20, 'yes', beat(t, 2.4, 0.5), { tone });
      ctx.restore();
    }
    qualified(ctx, t, 'সমর্থিত কুরিয়ার সার্ভিসের ইন্টিগ্রেশন সাপেক্ষে', tone, 1700);
  },

  /* 47 — courier history */
  courierHistory(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 640, w: 940, vw: 1020, vh: 620, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/customers/history',
      draw: (w, h) => AD.adCourier(ctx, w, h, { p: clamp((t - 0.2) / 1.6), history: true }),
    });

    const rows = [
      [460, 'TRK-88214', 'ডেলিভারড', 'yes'],
      [640, 'TRK-87102', 'ডেলিভারড', 'yes'],
      [820, 'TRK-80415', 'রিটার্নড', 'no'],
    ];
    rows.forEach(([y, id, state, kind], i) => {
      const p = beat(t, 1.3 + i * 0.25, 0.65, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * -40, 0);
      lightCard(ctx, 78, y, 924, 138, { r: 26, lift: 0.95 });
      text(ctx, id, 112, y + 60, { size: 28, weight: 700, color: P.light.ink, letterSpacing: 0.5 });
      text(ctx, 'কাস্টমার: সাদিয়া আক্তার', 112, y + 96, { size: 19, weight: 500, color: P.light.muted });
      fillRR(ctx, 620, y + 44, 200, 50, 25, kind === 'yes' ? 'rgba(30,158,116,0.10)' : 'rgba(200,80,63,0.10)');
      text(ctx, state, 720, y + 76, { size: 20, weight: 700, color: kind === 'yes' ? '#1E9E74' : '#C8503F', align: 'center' });
      seal(ctx, 900, y + 69, 20, kind, p, { tone });
      ctx.restore();
    });
    qualified(ctx, t, 'কুরিয়ার হিস্ট্রি ইন্টিগ্রেশন সমর্থিত হলে', tone, 1000);
  },

  /* 48 — delivery vs return stats */
  courierStats(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    // rings
    const stats = [
      { label: 'সফল ডেলিভারি', ic: 'checkCircle', color: '#1E9E74', v: 0.82, x: 96 },
      { label: 'রিটার্ন', ic: 'refresh', color: '#C8503F', v: 0.18, x: 392 },
      { label: 'পেন্ডিং', ic: 'clock', color: '#D98A24', v: 0.24, x: 688 },
    ];
    stats.forEach((st, i) => {
      const p = beat(t, 0.3 + i * 0.2, 0.9, easeOutQuint);
      if (p <= 0) return;
      const cx = st.x + 148, cy = 880, r = 92;
      ctx.save();
      lightCard(ctx, st.x, 720, 296, 340, { r: 28, lift: 0.9 });
      ctx.strokeStyle = 'rgba(20,23,29,0.08)';
      ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * st.v * p); ctx.stroke();
      icon(ctx, st.ic, cx - 18, cy - 18, 36, st.color, 2);
      text(ctx, `${Math.round(st.v * 100 * p)}%`, cx, cy + 74, { size: 30, weight: 800, color: P.light.ink, align: 'center' });
      text(ctx, st.label, cx, 1012, { size: 21, weight: 600, color: P.light.ink2, align: 'center' });
      ctx.restore();
    });

    // weekly bars
    const bp = beat(t, 1.2, 0.8, easeOutQuint);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      lightCard(ctx, 96, 1100, 888, 400, { r: 30, lift: 1 });
      text(ctx, 'সাপ্তাহিক পার্সেল (ডেমো)', 128, 1156, { size: 22, weight: 600, color: P.light.muted });
      const vals = [0.55, 0.72, 0.48, 0.86, 0.66, 0.94, 0.78];
      const bw = 74, gap = 40;
      vals.forEach((v, i) => {
        const p2 = beat(t, 1.5 + i * 0.09, 0.6, easeOutQuint);
        const x = 148 + i * (bw + gap);
        const hh = 240 * v * p2;
        fillRR(ctx, x, 1444 - hh, bw, hh, 12, i === 5 ? P.light.gold : '#E4EBF4');
        text(ctx, ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'][i], x + bw / 2, 1476, { size: 17, weight: 500, color: P.light.muted, align: 'center' });
      });
      ctx.restore();
    }
    qualified(ctx, t, 'ডেটা ডেমো — নিজের হিসাব নিজের অ্যাডমিনে', tone, 1680);
  },

  /* 49 — security intro */
  securityIntro(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    const sp = beat(t, 0.3, 0.9, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(sp);
    glowOrb(ctx, W / 2, 1080, 420, P.dark.cyan, 0.28);
    circle(ctx, W / 2, 1060, 130, 'rgba(14,24,42,0.9)');
    ctx.strokeStyle = alpha(P.dark.cyan, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, 1060, 130, 0, Math.PI * 2); ctx.stroke();
    icon(ctx, 'shield', W / 2 - 52, 1008, 104, P.dark.cyan, 1.7);
    ctx.restore();

    // blocked cards falling away
    [[-1, 0.6], [1, 1.0], [-0.55, 1.4]].forEach(([side, delay], i) => {
      const p = beat(t, delay, 0.8, easeOutQuint);
      if (p <= 0) return;
      const x = W / 2 + side * 300;
      const y = 1220 + (1 - p) * 60;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * 0.9;
      glassCard(ctx, x - 120, y, 240, 120, { r: 20, fill: 'rgba(120,30,45,0.22)', stroke: 'rgba(255,120,140,0.35)' });
      icon(ctx, 'list', x - 96, y + 24, 26, '#FF9AAB', 2);
      text(ctx, 'সন্দেহজনক', x - 60, y + 44, { size: 21, weight: 700, color: '#FFD3DA' });
      text(ctx, 'অর্ডার #1042', x - 96, y + 82, { size: 18, weight: 500, color: 'rgba(255,190,200,0.7)' });
      ctx.restore();
    });
    qualified(ctx, t, 'নিরাপত্তা ফিচার — প্রয়োজন ও স্কোপ অনুযায়ী যোগ করা যায়', tone, 1640);
  },

  /* 50 — security rules */
  securityRules(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80 });

    const rules = [
      ['আইপি ভিত্তিক রেট লিমিট', 'globe', 'একই আইপি থেকে বারবার অর্ডার সীমিত'],
      ['ডুপ্লিকেট অর্ডার শনাক্ত', 'list', 'একই ফোনে একই পণ্য — পতাকা'],
      ['সন্দেহজনক অর্ডার', 'shield', 'অস্বাভাবিক প্যাটার্নে রিভিউ কিউ'],
    ];
    rules.forEach(([label, ic, sub], i) => {
      const p = beat(t, 0.25 + i * 0.28, 0.65, easeOutQuint);
      if (p <= 0) return;
      const y = 720 + i * 236;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 32);
      lightCard(ctx, 78, y, 924, 196, { r: 30, lift: 0.95 });
      fillRR(ctx, 108, y + 42, 78, 78, 24, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, 130, y + 64, 34, P.light.goldDeep, 1.9);
      text(ctx, label, 210, y + 74, { size: 28, weight: 700, color: P.light.ink, maxWidth: 600 });
      text(ctx, sub, 210, y + 112, { size: 20, weight: 500, color: P.light.muted, maxWidth: 680 });
      // toggle
      const on = i < 2;
      fillRR(ctx, 880, y + 72, 88, 48, 24, on ? '#1E9E74' : 'rgba(20,23,29,0.12)');
      circle(ctx, on ? 944 : 904, y + 96, 18, '#FFFFFF');
      ctx.restore();
    });
    qualified(ctx, t, 'নিয়ম আপনার ব্যবসার ধরন অনুযায়ী কনফিগার করা হয়', tone, 1660);
  },

  /* 51 — review queue */
  securityQueue(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const cp = beat(t, 0.3, 0.8, easeOutQuint);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      lightCard(ctx, 78, 700, 924, 640, { r: 32, lift: 1.05 });
      text(ctx, 'রিভিউ কিউ', 112, 762, { size: 26, weight: 700, color: P.light.ink });
      text(ctx, 'ডেমো', 958, 760, { size: 18, weight: 500, color: P.light.muted, align: 'right' });
      const rows = [
        ['#1042', 'শাকিব হোসেন', 'একই দিনে ৫টি অর্ডার', 'amber'],
        ['#1039', 'নাম নেই', 'ফোন নম্বর যাচাই হয়নি', 'red'],
        ['#1036', 'রুমা আক্তার', 'নতুন কাস্টমার • বড় অর্ডার', 'blue'],
      ];
      rows.forEach(([id, name, note, tone2], i) => {
        const p = beat(t, 0.7 + i * 0.2, 0.6, easeOutQuint);
        if (p <= 0) return;
        const y = 810 + i * 168;
        ctx.save();
        ctx.globalAlpha *= clamp(p);
        ctx.translate((1 - p) * 30, 0);
        fillRR(ctx, 112, y, 856, 140, 22, '#FBF8F2');
        const col = tone2 === 'amber' ? '#D98A24' : tone2 === 'red' ? '#C8503F' : '#2F6FED';
        fillRR(ctx, 134, y + 34, 64, 64, 20, alpha(col, 0.14));
        icon(ctx, 'list', 152, y + 52, 28, col, 2);
        text(ctx, id, 218, y + 56, { size: 24, weight: 700, color: P.light.ink });
        text(ctx, name, 218, y + 88, { size: 20, weight: 500, color: P.light.ink2 });
        text(ctx, note, 218, y + 118, { size: 18, weight: 500, color: P.light.muted, maxWidth: 420 });
        // actions
        fillRR(ctx, 700, y + 48, 116, 48, 24, '#1E9E74');
        text(ctx, 'অনুমোদন', 758, y + 79, { size: 18, weight: 700, color: '#fff', align: 'center' });
        fillRR(ctx, 828, y + 48, 116, 48, 24, 'rgba(20,23,29,0.06)');
        text(ctx, 'ব্লক', 886, y + 79, { size: 18, weight: 700, color: P.light.ink2, align: 'center' });
        ctx.restore();
      });
      ctx.restore();
    }
    pill(ctx, W / 2, 1440, 'মানুষের সিদ্ধান্ত — অটোমেটিক ব্লক নয়', { tone, align: 'center', iconName: 'shield', p: beat(t, 1.8, 0.6, easeOutBack), size: 21 });
  },

  /* 52 — chapter: payments */
  sectionPayments(ctx, t, d, s) {
    chapterCard(ctx, t, { n: 5, title: 'পেমেন্ট\nম্যানেজমেন্ট', sub: 'COD, অ্যাডভান্স ও গেটওয়ে', tone: 'dark', accent: P.dark.gold, p: beat(t, 0, 0.6) });
  },

  /* 53 — payment methods */
  paymentMethods(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const methods = [
      ['ক্যাশ অন ডেলিভারি', 'cash', 'সবচেয়ে বেশি ব্যবহৃত'],
      ['অ্যাডভান্স পেমেন্ট', 'card', 'bKash / ব্যাংক ট্রান্সফার'],
      ['পেমেন্ট গেটওয়ে', 'shield', 'সমর্থিত গেটওয়ে ইন্টিগ্রেশন'],
    ];
    methods.forEach(([label, ic, sub], i) => {
      const p = beat(t, 0.25 + i * 0.26, 0.65, easeOutQuint);
      if (p <= 0) return;
      const y = 700 + i * 236;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 32);
      lightCard(ctx, 78, y, 924, 196, { r: 30, lift: 0.95 });
      fillRR(ctx, 108, y + 40, 80, 80, 24, 'rgba(176,138,87,0.13)');
      icon(ctx, ic, 130, y + 62, 36, P.light.goldDeep, 1.9);
      text(ctx, label, 212, y + 76, { size: 28, weight: 700, color: P.light.ink });
      text(ctx, sub, 212, y + 114, { size: 20, weight: 500, color: P.light.muted });
      seal(ctx, 936, y + 80, 19, 'yes', beat(t, 0.5 + i * 0.26, 0.5), { tone });
      ctx.restore();
    });
    qualified(ctx, t, 'গেটওয়ে ও অনলাইন পেমেন্ট — ইন্টিগ্রেশন ও অনুমতি সাপেক্ষে', tone, 1660);
  },

  /* 54 — reconciliation */
  paymentReconcile(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 80 });

    const br = browser(ctx, t, {
      y: 620, w: 968, vw: 1000, vh: 660, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/payments',
      draw: (w, h) => AD.adPayments(ctx, w, h, { p: clamp((t - 0.2) / 1.8) }),
    });

    // reconciliation stamp
    const rp = beat(t, 1.7, 0.7, easeOutQuint);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(rp);
      ctx.translate(0, (1 - rp) * 30);
      lightCard(ctx, 78, 1400, 924, 250, { r: 30, lift: 1.1 });
      text(ctx, 'অর্ডার ও পেমেন্ট মিলিয়ে নিন', 112, 1456, { size: 26, weight: 700, color: P.light.ink });
      [['মোট অর্ডার', '২৪', 'list'], ['পেমেন্ট পাওয়া', '২১', 'cash'], ['বাকি', '৩', 'clock']].forEach(([label, val, ic], i) => {
        const x = 112 + i * 292;
        fillRR(ctx, x, 1520, 264, 96, 20, '#FBF8F2');
        icon(ctx, ic, x + 20, 1552, 26, P.light.goldDeep, 1.9);
        text(ctx, label, x + 58, 1544, { size: 18, weight: 500, color: P.light.muted });
        text(ctx, val, x + 58, 1590, { size: 40, weight: 800, color: P.light.ink });
      });
      seal(ctx, 936, 1470, 24, 'yes', beat(t, 2.4, 0.5), { tone });
      ctx.restore();
    }
    qualified(ctx, t, 'ডেমো ডেটা — পেমেন্ট স্ট্যাটাস ইন্টিগ্রেশন সাপেক্ষে', tone, 1700);
  },

  /* 55 — telegram + email */
  telegramEmail(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    // two channel cards with live message previews
    const cards = [
      { x: 78, label: 'টেলিগ্রাম বট', ic: 'telegram', color: '#2AABEE' },
      { x: 512, label: 'ইমেইল', ic: 'mail', color: '#B08A57' },
    ];
    cards.forEach((c, i) => {
      const p = beat(t, 0.25 + i * 0.3, 0.7, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 40);
      lightCard(ctx, c.x, 700, 444, 560, { r: 30, lift: 1 });
      fillRR(ctx, c.x + 28, 728, 72, 72, 22, alpha(c.color, 0.13));
      icon(ctx, c.ic, c.x + 44, 744, 40, c.color, 1.9);
      text(ctx, c.label, c.x + 118, 776, { size: 27, weight: 700, color: P.light.ink });
      text(ctx, i ? 'ইমেইলে অর্ডার খবর' : 'বট থেকে সাথে সাথে', c.x + 118, 810, { size: 19, weight: 500, color: P.light.muted });
      // preview bubble
      const bp = beat(t, 0.7 + i * 0.3, 0.6, easeOutQuint);
      if (bp > 0) {
        ctx.save();
        ctx.globalAlpha *= clamp(bp);
        fillRR(ctx, c.x + 28, 840, 388, 300, 22, '#FBF8F2');
        text(ctx, i ? 'বিষয়: নতুন অর্ডার #AUR-1048' : 'AURUM অর্ডার বট', c.x + 52, 884, { size: 18, weight: 700, color: P.light.ink2 });
        dashLine(ctx, c.x + 48, 900, c.x + 396, 900, 'rgba(20,23,29,0.1)', 1.2, [4, 5], bp);
        [['কাস্টমার', 'রাফিদ হাসান'], ['পণ্য', 'হেরিটেজ ক্রোনো'], ['মোট', '৳4,960']].forEach(([k, v], k2) => {
          text(ctx, k, c.x + 52, 940 + k2 * 56, { size: 18, weight: 500, color: P.light.muted });
          text(ctx, v, c.x + 396, 940 + k2 * 56, { size: 19, weight: 700, color: P.light.ink, align: 'right' });
        });
        fillRR(ctx, c.x + 52, 1092, 140, 40, 20, alpha(c.color, 0.14));
        text(ctx, 'অর্ডার দেখুন', c.x + 122, 1118, { size: 17, weight: 700, color: c.color, align: 'center' });
        ctx.restore();
      }
      // toggle on
      fillRR(ctx, c.x + 336, 738, 80, 44, 22, '#1E9E74');
      circle(ctx, c.x + 396, 760, 17, '#FFFFFF');
      ctx.restore();
    });
    qualified(ctx, t, 'টেলিগ্রাম ও ইমেইল — ঐচ্ছিক ইন্টিগ্রেশন', tone, 1330);
  },

  /* 56 — fast notifications */
  notifyFast(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    // stacked notification cards fanning out
    const items = [
      { at: 0.4, title: 'নতুন অর্ডার', body: '#AUR-1048 • ৳4,960', ic: 'bag', dx: -40, dy: 0 },
      { at: 0.9, title: 'টেলিগ্রাম', body: 'অর্ডার #AUR-1048 কনফার্ম হয়েছে', ic: 'telegram', dx: 30, dy: 40 },
      { at: 1.4, title: 'ইমেইল', body: 'ডেইলি সামারি পাঠানো হয়েছে', ic: 'mail', dx: -20, dy: 80 },
    ];
    items.forEach((it, i) => {
      const p = beat(t, it.at, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * (1 - i * 0.12);
      ctx.translate(it.dx * (1 - p) * 2, (1 - p) * -50 + i * 140);
      notifyCard(ctx, 130, 840 + i * 8, 820, t, { ...it, iconName: it.ic, tone: 'dark', delay: 0 });
      ctx.restore();
    });

    const bp = beat(t, 2.2, 0.8, easeOutBack);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      glowOrb(ctx, W / 2, 1480, 300, P.dark.cyan, 0.22);
      circle(ctx, W / 2, 1470, 76, 'rgba(14,24,42,0.92)');
      ctx.strokeStyle = alpha(P.dark.cyan, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, 1470, 76, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, 'bell', W / 2 - 30, 1440, 60, P.dark.cyan, 1.8);
      for (let i = 0; i < 3; i++) {
        const ph = ((t - 2.2) * 0.55 + i * 0.33) % 1;
        if (ph < 0) continue;
        ctx.strokeStyle = `rgba(79,216,255,${0.3 * (1 - ph)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(W / 2, 1470, 76 + ph * 110, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
  },
};
