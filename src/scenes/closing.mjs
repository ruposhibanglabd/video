/**
 * Scenes 57–77 — integrated system, hosting & cost transparency, business
 * planning, the final offer, delivery/scope, and the CodePixel Web end card.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, easeOutBack, beat, stag,
  lin, text, paragraph, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, chip, line, mix, drawWatch, drawBag, drawShoe, drawBottle, drawHeadphone,
  brandMark, whatsappGlyph, statusChip, vignette,
} from '../render/kit.mjs';
import { L, headline, kicker, accentRule, glassPanel, phoneStage, brandWatermark, chapterCard } from './stage.mjs';
import { adminStage } from './uiStage.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

const GOLD = '#D9BE8F';

function offerCard(ctx, t, { y = 760, w = 900, x = (W - 900) / 2, p = 1, showAdvance = true } = {}) {
  const e = easeOutQuint(clamp(p));
  ctx.save();
  ctx.globalAlpha *= e;
  ctx.translate(0, (1 - e) * 40);
  shadow(ctx, 'rgba(30,90,255,0.35)', 80, 30);
  fillRR(ctx, x, y, w, 380, 40, 'rgba(10,17,34,0.94)');
  noShadow(ctx);
  const g = lin(ctx, x, y, x + w, y + 380, [[0, alpha(C.cyan, 0.8)], [0.5, alpha(C.blue, 0.25)], [1, alpha(C.violet, 0.7)]]);
  strokeRR(ctx, x, y, w, 380, 40, g, 2.4);
  text(ctx, 'মাত্র', x + 56, y + 78, { size: 36, weight: 600, color: 'rgba(214,229,255,0.82)' });
  text(ctx, '৳৩,০০০', x + 56, y + 206, { size: 128, weight: 800, color: '#FFFFFF' });
  text(ctx, 'টাকায় ওয়েবসাইট!', x + 56, y + 280, { size: 54, weight: 700, color: C.cyan, maxWidth: w - 112 });
  if (showAdvance) {
    const ap = beat(t, 0.5, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= ap;
    const bw = 348;
    const bx = x + w - bw - 44, by = y + 40;
    fillRR(ctx, bx, by, bw, 68, 34, alpha(C.green, 0.16));
    strokeRR(ctx, bx, by, bw, 68, 34, alpha(C.green, 0.6), 1.6);
    circle(ctx, bx + 36, by + 34, 18, C.green);
    icon(ctx, 'check', bx + 27, by + 25, 18, '#04140E', 3);
    text(ctx, 'কোনো এডভান্স নেই!', bx + 62, by + 44, { size: 24, weight: 700, color: '#B8F3DD' });
    ctx.restore();
  }
  ctx.restore();
}

export const closingScenes = {
  systemDiagram(ctx, t, d) {
    const cx = W / 2, cy = 1030;
    const mods = [
      ['স্টোরফ্রন্ট', 'globe'], ['অ্যাডমিন', 'grid'], ['অর্ডার', 'list'],
      ['কুরিয়ার', 'truck'], ['পেমেন্ট', 'card'], ['নোটিফিকেশন', 'bell'],
    ];
    // hub
    const hp = beat(t, 0.1, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= hp;
    glowOrb(ctx, cx, cy, 330, C.blue, 0.25);
    circle(ctx, cx, cy, 118, 'rgba(11,18,36,0.96)');
    circle(ctx, cx, cy, 118, alpha(C.cyan, 0.12));
    strokeRR(ctx, cx - 118, cy - 118, 236, 236, 118, alpha(C.cyan, 0.5), 2);
    brandMark(ctx, cx - 34, cy - 54, 68, { withWordmark: false });
    text(ctx, 'CODEPIXEL', cx, cy + 62, { size: 22, weight: 700, color: C.white, align: 'center', letterSpacing: 2 });
    text(ctx, 'একটি সিস্টেম', cx, cy + 90, { size: 17, weight: 500, color: 'rgba(180,200,230,0.75)', align: 'center' });
    ctx.restore();
    mods.forEach(([label, ic], i) => {
      const ang = -Math.PI / 2 + (i / mods.length) * Math.PI * 2;
      const r = 330;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * 0.92;
      const p = beat(t, 0.5 + i * 0.18, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      // connector
      line(ctx, cx + Math.cos(ang) * 120, cy + Math.sin(ang) * 120, x - Math.cos(ang) * 54, y - Math.sin(ang) * 54, alpha(C.blue, 0.45), 2, [6, 8]);
      circle(ctx, x, y, 54, 'rgba(13,22,42,0.95)');
      strokeRR(ctx, x - 54, y - 54, 108, 108, 54, alpha(C.cyan, 0.35), 1.4);
      icon(ctx, ic, x - 18, y - 18, 36, C.cyan, 1.9);
      text(ctx, label, x, y + 82, { size: 19, weight: 600, color: 'rgba(220,233,255,0.9)', align: 'center' });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.25);
  },

  hosting(ctx, t, d) {
    // cloud + deploy interface
    const p = beat(t, 0.1, 0.7, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= p;
    glowOrb(ctx, W / 2, 940, 400, C.cyan, 0.2);
    ctx.beginPath();
    ctx.arc(W / 2 - 90, 900, 80, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(W / 2, 840, 110, Math.PI * 1.1, Math.PI * 1.95);
    ctx.arc(W / 2 + 110, 900, 72, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fillStyle = 'rgba(16,28,52,0.96)';
    ctx.fill();
    ctx.strokeStyle = alpha(C.cyan, 0.55);
    ctx.lineWidth = 2;
    ctx.stroke();
    icon(ctx, 'globe', W / 2 - 26, 874, 52, C.cyan, 1.8);
    ctx.restore();
    glassPanel(ctx, 90, 1060, 900, 300, { r: 26, fill: 'rgba(11,18,34,0.94)' });
    text(ctx, 'ডিপ্লয়মেন্ট', 122, 1110, { size: 26, weight: 700, color: C.white });
    ['বিল্ড সম্পন্ন', 'ফ্রি হোস্টিং প্ল্যাটফর্মে প্রকাশ', 'ডোমেইন সংযুক্ত' ].forEach((label, i) => {
      const q = beat(t, 0.8 + i * 0.6, 0.5);
      const y = 1150 + i * 54;
      circle(ctx, 134, y, 12, q > 0 ? alpha(C.green, 0.9) : 'rgba(120,150,210,0.25)');
      if (q > 0) icon(ctx, 'check', 126, y - 8, 16, '#04140E', 3);
      text(ctx, label, 160, y + 8, { size: 23, weight: 500, color: q > 0.5 ? C.white : 'rgba(190,208,235,0.55)' });
    });
    brandWatermark(ctx, t, 0.3);
  },

  hostingNote(ctx, t, d) {
    const p = beat(t, 0.05, 0.6);
    ctx.save();
    ctx.globalAlpha *= p;
    glassPanel(ctx, 90, 820, 900, 330, { r: 32, fill: 'rgba(10,18,34,0.92)', glow: C.cyan });
    icon(ctx, 'globe', 130, 872, 56, C.cyan, 1.8);
    text(ctx, 'উপযুক্ত ফ্রি হোস্টিং হলে', 130, 986, { size: 40, weight: 700, color: C.white, maxWidth: 820 });
    text(ctx, 'মাসিক হোস্টিং ফি ছাড়াই', 130, 1046, { size: 40, weight: 700, color: C.cyan, maxWidth: 820 });
    text(ctx, 'ওয়েবসাইট চালানোর সুযোগ থাকতে পারে', 130, 1106, { size: 34, weight: 500, color: 'rgba(210,226,248,0.85)', maxWidth: 820 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  costNote(ctx, t, d) {
    const rows = [
      ['ডোমেইন', 'আলাদা খরচ হতে পারে'],
      ['পেইড থার্ড-পার্টি সার্ভিস', 'প্রয়োজন অনুযায়ী'],
      ['৳৩,০০০ প্যাকেজ', 'সম্ভাব্য সব ফিচার অন্তর্ভুক্ত নয়'],
    ];
    glassPanel(ctx, 90, 800, 900, 420, { r: 30, fill: 'rgba(11,19,36,0.92)' });
    text(ctx, 'খরচের স্বচ্ছতা', 124, 858, { size: 30, weight: 700, color: C.white });
    rows.forEach(([k, v], i) => {
      const p = beat(t, 0.3 + i * 0.35, 0.55, easeOutBack);
      if (p <= 0) return;
      const y = 900 + i * 96;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      icon(ctx, i === 2 ? 'sparkle' : 'tag', 128, y + 16, 28, i === 2 ? GOLD : C.cyan, 1.9);
      text(ctx, k, 174, y + 40, { size: 27, weight: 600, color: C.white });
      text(ctx, v, 980, y + 40, { size: 22, weight: 500, color: 'rgba(180,200,230,0.75)', align: 'right' });
      line(ctx, 124, y + 66, 980, y + 66, 'rgba(130,170,255,0.14)', 1);
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  planning(ctx, t, d) {
    glassPanel(ctx, 90, 780, 900, 560, { r: 30, fill: 'rgba(12,20,38,0.9)' });
    text(ctx, 'প্রজেক্ট প্ল্যানিং', 124, 838, { size: 28, weight: 700, color: C.white });
    const items = [
      ['ব্যবসার লক্ষ্য', 'chart'], ['ডিজাইন পছন্দ', 'sparkle'],
      ['প্রয়োজনীয় ফিচার', 'grid'], ['কাজের স্কোপ', 'box'],
    ];
    items.forEach(([label, ic], i) => {
      const p = beat(t, 0.25 + i * 0.28, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = 124 + (i % 2) * 430, y = 880 + Math.floor(i / 2) * 200;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 24);
      fillRR(ctx, x, y, 398, 160, 22, 'rgba(24,36,62,0.8)');
      strokeRR(ctx, x, y, 398, 160, 22, alpha(C.blue, 0.3), 1.2);
      circle(ctx, x + 56, y + 56, 26, alpha(C.cyan, 0.16));
      icon(ctx, ic, x + 40, y + 40, 32, C.cyan, 1.9);
      text(ctx, label, x + 24, y + 128, { size: 26, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  notSame(ctx, t, d) {
    const p = beat(t, 0.1, 0.6);
    ctx.save();
    ctx.globalAlpha *= p;
    glowOrb(ctx, W / 2, 900, 520, C.violet, 0.22);
    text(ctx, 'প্রতিটি ব্যবসার', W / 2, 745, { size: 60, weight: 700, color: C.white, align: 'center', maxWidth: 900 });
    text(ctx, 'প্রয়োজন এক নয়', W / 2, 820, { size: 60, weight: 700, color: C.cyan, align: 'center', maxWidth: 900 });
    ctx.restore();
    const layouts = [
      [0, 92, 1010, 292, GOLD], [1, 396, 1060, 292, C.blue], [2, 700, 1010, 292, C.violet],
    ];
    layouts.forEach(([variant, x, y, cw, color], i) => {
      const q = beat(t, 0.7 + i * 0.35, 0.6, easeOutBack);
      if (q <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(q) * 0.95;
      ctx.translate(0, (1 - q) * 40);
      fillRR(ctx, x, y, cw, 380, 20, 'rgba(13,22,42,0.96)');
      strokeRR(ctx, x, y, cw, 380, 20, alpha(color, 0.4), 1.4);
      ctx.save();
      rr(ctx, x, y, cw, 380, 20); ctx.clip();
      ctx.translate(x, y);
      const s = cw / 390;
      ctx.scale(s, s);
      SF.sfLanding(ctx, 390, 380 / s, variant);
      ctx.restore();
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  solShop(ctx, t, d) {
    phoneStage(ctx, t, {
      x: 300, y: 760, scale: 1.02, enter: 1,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.1, cart: 1, activeCat: 1 }),
    });
    const p = beat(t, 0.6, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    chip(ctx, 'সুন্দর অনলাইন শপ', W / 2, 1380, { align: 'center', color: GOLD, size: 26 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  solLanding(ctx, t, d) {
    phoneStage(ctx, t, {
      x: 300, y: 760, scale: 1.02, enter: 1,
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: 1 }),
    });
    const p = beat(t, 0.3, 0.5, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    chip(ctx, 'প্রোডাক্ট ল্যান্ডিং পেজ', W / 2, 1380, { align: 'center', color: C.cyan, size: 26 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  solSystem(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 760, w: 968, h: 620 }, vw: 780, vh: 860, enter: 1,
      active: 3, title: 'অর্ডার • কুরিয়ার • পেমেন্ট • স্টক',
      draw: (c, w, h) => AD.adOrders(c, w, h, { p: clamp(t / 1.4), highlight: t > 1.8 ? 0 : -1 }),
    });
    const p = beat(t, 0.5, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    chip(ctx, 'পূর্ণাঙ্গ ব্যবসা পরিচালনা সিস্টেম', W / 2, 1410, { align: 'center', color: C.violet, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  solutions(ctx, t, d) {
    const items = [
      ['অনলাইন শপ', 'globe', 0], ['ল্যান্ডিং পেজ', 'sparkle', 1], ['বিজনেস সিস্টেম', 'grid', 2],
    ];
    items.forEach(([label, ic, variant], i) => {
      const p = beat(t, 0.15 + i * 0.3, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 800 + i * 168;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 50, 0);
      glassPanel(ctx, 110, y, 860, 140, { r: 28, fill: 'rgba(13,22,42,0.92)' });
      circle(ctx, 190, y + 70, 42, alpha([GOLD, C.cyan, C.violet][i], 0.16));
      icon(ctx, ic, 164, y + 44, 52, [GOLD, C.cyan, C.violet][i], 1.9);
      text(ctx, label, 258, y + 68, { size: 36, weight: 700, color: C.white });
      text(ctx, 'আপনার প্রয়োজন অনুযায়ী', 258, y + 106, { size: 22, weight: 500, color: 'rgba(180,200,230,0.72)' });
      icon(ctx, 'arrowUpRight', 890, y + 54, 32, alpha(C.cyan, 0.8), 2);
      ctx.restore();
    });
    const q = beat(t, 1.4, 0.7, easeOutBack);
    ctx.save(); ctx.globalAlpha *= q;
    brandMark(ctx, W / 2 - 130, 1330, 46, { withWordmark: true });
    ctx.restore();
    brandWatermark(ctx, t, 0.2);
  },

  priceAnticipation(ctx, t, d) {
    const p = beat(t, 0.1, 0.7);
    // dim price panel coming into focus
    ctx.save();
    ctx.globalAlpha *= 0.45 + 0.35 * p;
    glassPanel(ctx, 140, 820, 800, 360, { r: 40, fill: 'rgba(10,17,34,0.9)', glow: C.violet });
    text(ctx, '?', W / 2, 1030, { size: 220, weight: 800, color: alpha(C.cyan, 0.22), align: 'center' });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= p;
    text(ctx, 'শুরুটা কত টাকা দিয়ে?', W / 2, 1300, { size: 44, weight: 600, color: 'rgba(214,229,255,0.9)', align: 'center' });
    ctx.restore();
    // focus brackets
    const q = beat(t, 0.6, 0.8);
    if (q > 0) {
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.strokeStyle = alpha(C.cyan, 0.8);
      ctx.lineWidth = 3;
      const bx = 140 - 16, by = 820 - 16, bw = 800 + 32, bh = 360 + 32, len = 46;
      [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x + sx * len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * len);
        ctx.stroke();
      });
      ctx.restore();
    }
    brandWatermark(ctx, t, 0.3);
  },

  priceFinal(ctx, t, d) {
    // strongest, simplest composition
    lightSweep(ctx, 0, 700, W, 620, clamp((t - 0.4) / 1.2), 'rgba(150,210,255,0.12)', 180);
    offerCard(ctx, t, { y: 800, p: clamp(t / 0.55) });
    const p = beat(t, 1.2, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    text(ctx, 'কাস্টম ডিজাইন', W / 2, 1250, { size: 34, weight: 600, color: 'rgba(214,229,255,0.85)', align: 'center' });
    text(ctx, 'রেডিমেড টেমপ্লেট নয়', W / 2, 1310, { size: 30, weight: 500, color: 'rgba(170,190,220,0.75)', align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.25);
  },

  delivery(ctx, t, d) {
    text(ctx, 'ডেলিভারির লক্ষ্য', 110, 810, { size: 28, weight: 600, color: alpha(C.cyan, 0.9) });
    const days = [['দিন ১', 'পরিকল্পনা ও ডিজাইন'], ['দিন ২', 'ডেভেলপমেন্ট'], ['দিন ৩', 'রিভিউ ও ডেলিভারি']];
    days.forEach(([day, label], i) => {
      const p = beat(t, 0.2 + i * 0.4, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 860 + i * 150;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 36, 0);
      fillRR(ctx, 110, y, 860, 120, 26, 'rgba(13,22,42,0.92)');
      strokeRR(ctx, 110, y, 860, 120, 26, alpha(C.blue, 0.3), 1.2);
      circle(ctx, 190, y + 60, 40, alpha(C.blue, 0.2));
      text(ctx, String(i + 1), 190, y + 76, { size: 40, weight: 800, color: C.white, align: 'center' });
      text(ctx, day, 258, y + 50, { size: 24, weight: 600, color: alpha(C.cyan, 0.95) });
      text(ctx, label, 258, y + 88, { size: 30, weight: 700, color: C.white });
      ctx.restore();
    });
    glassPanel(ctx, 110, 1330, 860, 96, { r: 24, fill: 'rgba(10,17,33,0.94)' });
    icon(ctx, 'clock', 136, 1352, 34, GOLD, 1.8);
    text(ctx, 'কাজের পরিধি ও প্রয়োজনীয় উপকরণ পাওয়ার ওপর নির্ভরশীল', 186, 1384, { size: 22, weight: 500, color: 'rgba(214,229,255,0.85)', maxWidth: 750 });
    brandWatermark(ctx, t, 0.3);
  },

  scope(ctx, t, d) {
    glassPanel(ctx, 100, 800, 880, 500, { r: 30, fill: 'rgba(12,20,38,0.92)' });
    text(ctx, 'কাজ শুরুর আগেই', 136, 858, { size: 30, weight: 700, color: C.white });
    const items = ['কোন ফিচার প্যাকেজে থাকবে', 'ডিজাইন ও কনটেন্ট', 'ইন্টিগ্রেশন ও অনুমতি', 'ডেলিভারি সময়'];
    items.forEach((label, i) => {
      const p = beat(t, 0.3 + i * 0.32, 0.55, easeOutBack);
      if (p <= 0) return;
      const y = 920 + i * 82;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      circle(ctx, 160, y, 18, alpha(C.green, 0.85));
      icon(ctx, 'check', 150, y - 10, 20, '#04140E', 3);
      text(ctx, label, 200, y + 10, { size: 28, weight: 600, color: 'rgba(232,240,255,0.94)' });
      ctx.restore();
    });
    const q = beat(t, 1.0, 0.6);
    ctx.save(); ctx.globalAlpha *= q;
    chip(ctx, 'স্কোপ আলোচনা করে নির্ধারিত', W / 2, 1340, { align: 'center', color: GOLD, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  whyDelay(ctx, t, d) {
    const p = easeInOut(clamp((t - 0.4) / 1.6));
    // local shop → polished mobile website
    glassPanel(ctx, 90, 800, 400, 440, { r: 26, fill: 'rgba(16,24,42,0.9)' });
    text(ctx, 'লোকাল ব্যবসা', 122, 850, { size: 24, weight: 600, color: 'rgba(214,229,255,0.85)' });
    // simple local-shop illustration
    const sx = 160, sy2 = 900, sw2 = 260, sh2 = 170;
    fillRR(ctx, sx, sy2 + 54, sw2, sh2 - 54, 8, 'rgba(217,190,143,0.18)');
    strokeRR(ctx, sx, sy2 + 54, sw2, sh2 - 54, 8, 'rgba(217,190,143,0.55)', 2);
    for (let k = 0; k < 5; k++) {
      const aw = sw2 / 5;
      fillRR(ctx, sx + k * aw, sy2 + 24, aw - 1, 30, 3, k % 2 === 0 ? 'rgba(217,190,143,0.9)' : 'rgba(247,243,235,0.8)');
      ctx.fillStyle = k % 2 === 0 ? 'rgba(217,190,143,0.9)' : 'rgba(247,243,235,0.8)';
      ctx.beginPath();
      ctx.arc(sx + k * aw + aw / 2, sy2 + 54, aw / 2 - 0.5, 0, Math.PI);
      ctx.fill();
    }
    icon(ctx, 'bag', sx + sw2 / 2 - 22, sy2 + 100, 44, '#D9BE8F', 1.8);
    fillRR(ctx, sx + 30, sy2 + 160, 200, 10, 5, 'rgba(255,255,255,0.2)');
    fillRR(ctx, sx + 30, sy2 + 184, 140, 9, 5, 'rgba(255,255,255,0.12)');
    text(ctx, 'শুধু দোকান', sx + sw2 / 2, sy2 + 300, { size: 22, weight: 500, color: 'rgba(190,208,235,0.75)', align: 'center' });
    icon(ctx, 'arrow', 510, 1010, 44, C.cyan, 2);
    phoneStage(ctx, t, {
      x: 560, y: 780, scale: 0.86, enter: clamp((t - 0.6) / 1.2),
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.05 + p * 0.2, cart: 1, activeCat: 1 }),
    });
    const q = beat(t, 1.6, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= q;
    chip(ctx, 'অনলাইনে আরও সুন্দরভাবে উপস্থাপন', W / 2, 1530, { align: 'center', color: C.cyan, size: 23 });
    ctx.restore();
    brandWatermark(ctx, t, 0.25);
  },

  yourDesign(ctx, t, d) {
    const p = beat(t, 0.1, 0.6);
    ctx.save();
    ctx.globalAlpha *= p;
    glowOrb(ctx, W / 2, 900, 560, GOLD, 0.18);
    text(ctx, 'আপনার পছন্দের ডিজাইন', W / 2, 830, { size: 58, weight: 700, color: C.white, align: 'center', maxWidth: 940 });
    text(ctx, 'আপনার ব্র্যান্ডের পরিচয়', W / 2, 910, { size: 58, weight: 700, color: GOLD, align: 'center', maxWidth: 940 });
    ctx.restore();
    phoneStage(ctx, t, {
      x: 320, y: 990, scale: 0.82, enter: clamp((t - 0.5) / 1.2),
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.1, cart: 1, activeCat: 1 }),
    });
    const pal = [['#C9A46A', 'গোল্ড'], ['#F3EDE1', 'আইভরি'], ['#2A2118', 'চারকোল']];
    glassPanel(ctx, 96, 1120, 190, 300, { r: 24, fill: 'rgba(11,19,36,0.9)' });
    text(ctx, 'ব্র্যান্ড কালার', 116, 1160, { size: 19, weight: 600, color: 'rgba(214,229,255,0.8)' });
    pal.forEach(([c, label], i) => {
      const q = beat(t, 1.1 + i * 0.18, 0.5, easeOutBack);
      if (q <= 0) return;
      ctx.save(); ctx.globalAlpha *= q;
      ctx.translate((1 - q) * 20, 0);
      ctx.fillStyle = c;
      rr(ctx, 116, 1180 + i * 74, 40, 40, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      text(ctx, label, 168, 1207 + i * 74, { size: 20, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.25);
  },

  contactNow(ctx, t, d) {
    const p = beat(t, 0.05, 0.7, easeOutBack);
    ctx.save();
    glowOrb(ctx, W / 2, 980, 520, C.blue, 0.3);
    ctx.globalAlpha *= p;
    brandMark(ctx, W / 2 - 200, 840, 76, { withWordmark: true });
    ctx.restore();
    const q = beat(t, 0.5, 0.6);
    ctx.save(); ctx.globalAlpha *= q;
    text(ctx, 'আজই যোগাযোগ করুন', W / 2, 1080, { size: 54, weight: 700, color: C.white, align: 'center', maxWidth: 900 });
    text(ctx, 'CodePixel Web-এর সঙ্গে', W / 2, 1150, { size: 40, weight: 600, color: C.cyan, align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.2);
  },

  websiteCta(ctx, t, d) {
    const p = beat(t, 0.1, 0.7, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= p;
    text(ctx, 'আমাদের ওয়েবসাইট', W / 2, 800, { size: 32, weight: 600, color: 'rgba(214,229,255,0.85)', align: 'center' });
    ctx.restore();
    // url pill
    const q = beat(t, 0.3, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= q;
    const bw = 840, bx = (W - bw) / 2, by = 830;
    shadow(ctx, 'rgba(40,123,255,0.35)', 50, 16);
    fillRR(ctx, bx, by, bw, 96, 48, 'rgba(13,22,42,0.96)');
    noShadow(ctx);
    strokeRR(ctx, bx, by, bw, 96, 48, alpha(C.cyan, 0.55), 1.8);
    icon(ctx, 'globe', bx + 34, by + 30, 34, C.cyan, 1.8);
    text(ctx, 'codepixelweb.vercel.app', bx + 86, by + 62, { size: 40, weight: 700, color: C.white, maxWidth: bw - 120 });
    ctx.restore();
    // demo preview device
    phoneStage(ctx, t, {
      x: 336, y: 960, scale: 0.8, enter: clamp((t - 0.5) / 1.2),
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.04 + 0.18 * clamp((t - 1) / 2), cart: 1, activeCat: 1 }),
    });
    const r = beat(t, 3.2, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= r;
    chip(ctx, 'ডেমো দেখুন • প্রয়োজন জানান', W / 2, 1520, { align: 'center', color: C.cyan, size: 23 });
    ctx.restore();
    brandWatermark(ctx, t, 0.2);
  },

  whatsappCta(ctx, t, d) {
    const p = beat(t, 0.05, 0.65, easeOutBack);
    ctx.save();
    glowOrb(ctx, W / 2, 940, 520, '#25D366', 0.2);
    ctx.globalAlpha *= p;
    circle(ctx, W / 2, 830, 92, '#25D366');
    whatsappGlyph(ctx, W / 2 - 50, 778, 100, '#FFFFFF');
    ctx.restore();
    const q = beat(t, 0.35, 0.6);
    ctx.save(); ctx.globalAlpha *= q;
    text(ctx, 'হোয়াটসঅ্যাপে মেসেজ করুন', W / 2, 1000, { size: 48, weight: 700, color: C.white, align: 'center', maxWidth: 950 });
    ctx.restore();
    const r = beat(t, 0.7, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= r;
    const bw = 760, bx = (W - bw) / 2, by = 1050;
    fillRR(ctx, bx, by, bw, 140, 36, 'rgba(37,211,102,0.14)');
    strokeRR(ctx, bx, by, bw, 140, 36, alpha('#25D366', 0.65), 2);
    text(ctx, '01876892958', W / 2, by + 92, { size: 88, weight: 800, color: '#EAFFF3', align: 'center', letterSpacing: 1 });
    ctx.restore();
    const s = beat(t, 1.3, 0.6);
    ctx.save(); ctx.globalAlpha *= s;
    text(ctx, 'সরাসরি কথা বলুন — কোনো এডভান্স নেই', W / 2, 1270, { size: 26, weight: 500, color: 'rgba(200,232,214,0.85)', align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.2);
  },

  offerRepeat(ctx, t, d) {
    lightSweep(ctx, 0, 700, W, 640, clamp((t - 0.2) / 1.1), 'rgba(150,210,255,0.12)', 170);
    offerCard(ctx, t, { y: 800, p: clamp(t / 0.45) });
    const p = beat(t, 0.8, 0.5);
    ctx.save(); ctx.globalAlpha *= p;
    text(ctx, 'কাস্টমাইজড ওয়েবসাইট', W / 2, 1256, { size: 34, weight: 600, color: 'rgba(214,229,255,0.9)', align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.25);
  },

  endCard(ctx, t, d, S) {
    // held through the final syllable — no fade to black
    const p = beat(t, 0.02, 0.7, easeOutQuint);
    ctx.save();
    glowOrb(ctx, W / 2, 900, 640, C.blue, 0.26);
    ctx.globalAlpha *= p;
    brandMark(ctx, W / 2 - 210, 700, 84, { withWordmark: true });
    ctx.restore();
    const q = beat(t, 0.35, 0.7);
    ctx.save();
    ctx.globalAlpha *= q;
    text(ctx, 'আপনার ব্যবসা', W / 2, 940, { size: 62, weight: 700, color: C.white, align: 'center', maxWidth: 940 });
    text(ctx, 'আপনার ডিজাইন', W / 2, 1020, { size: 62, weight: 700, color: C.cyan, align: 'center', maxWidth: 940 });
    text(ctx, 'আপনার অনলাইন পরিচয়', W / 2, 1100, { size: 62, weight: 700, color: GOLD, align: 'center', maxWidth: 940 });
    ctx.restore();
    const r = beat(t, 0.7, 0.6);
    ctx.save();
    ctx.globalAlpha *= r;
    fillRR(ctx, W / 2 - 300, 1180, 600, 2, 1, alpha(C.cyan, 0.4));
    text(ctx, 'মাত্র ৩,০০০ টাকায় ওয়েবসাইট!', W / 2, 1268, { size: 40, weight: 700, color: C.white, align: 'center' });
    chip(ctx, 'কোনো এডভান্স নেই!', W / 2, 1306, { align: 'center', color: C.green, size: 24, h: 52 });
    ctx.restore();
    const s = beat(t, 0.9, 0.6);
    ctx.save();
    ctx.globalAlpha *= s;
    const by = 1400;
    glassPanel(ctx, 90, by, 900, 110, { r: 28, fill: 'rgba(11,19,36,0.92)' });
    icon(ctx, 'globe', 124, by + 30, 34, C.cyan, 1.8);
    text(ctx, 'codepixelweb.vercel.app', 176, by + 52, { size: 32, weight: 700, color: C.white, maxWidth: 470 });
    line(ctx, 660, by + 20, 660, by + 90, 'rgba(130,170,255,0.25)', 1.4);
    whatsappGlyph(ctx, 692, by + 26, 40, '#25D366');
    text(ctx, '01876892958', 748, by + 62, { size: 30, weight: 700, color: '#EAFFF3' });
    ctx.restore();
    brandWatermark(ctx, t, 0.0);
  },
};
