/**
 * Scenes 57–77 — the system view, honest cost transparency, the offer, and the
 * contact call-to-action. Everything here is built for instant legibility.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, lin, text, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, brandMark, whatsappGlyph, drawWatch,
} from '../render/kit.mjs';
import {
  P, LAY, AURUM, headlineBlock, kickerLine, stdTitle, glassCard, lightCard, phone, screenCrop,
  browser, pill, callout, cursor, notifyCard, kpiTile, chain, chapterCard, priceHero, seal,
  featureTile, ghostNumeral, dashLine, screenSwitch, stepper, progressRail, demoRibbon,
} from './premium.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

function titleOf(ctx, t, s, tone, opts = {}) {
  if (s.title === false) return kickerLine(ctx, s.kicker, t, { tone, ...opts });
  return stdTitle(ctx, t, s, { tone, ...opts });
}

const WA = BRAND.whatsapp;
const SITE = BRAND.website;

export const closingScenes = {
  /* 57 — the whole system */
  systemDiagram(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 78, maxWidth: 920 });

    const cx = W / 2, cy = 1140;
    const modules = [
      ['globe', 'ওয়েবসাইট'], ['list', 'অর্ডার'], ['truck', 'কুরিয়ার'],
      ['cash', 'পেমেন্ট'], ['chart', 'রিপোর্ট'], ['users', 'কাস্টমার'],
    ];
    // connecting rings
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(120,185,255,${0.10 - i * 0.025})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 200 + i * 74, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    modules.forEach(([ic, label], i) => {
      const a = -Math.PI / 2 + (i / modules.length) * Math.PI * 2;
      const R = 274;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R * 0.82;
      const p = beat(t, 0.5 + i * 0.12, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      dashLine(ctx, cx, cy, x, y, alpha(P.dark.cyan, 0.22), 1.4, [4, 8], p);
      circle(ctx, x, y, 44, 'rgba(13,22,40,0.92)');
      ctx.strokeStyle = alpha(P.dark.cyan, 0.35);
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 44, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, ic, x - 14, y - 15, 28, P.dark.cyan, 2);
      text(ctx, label, x, y + 72, { size: 20, weight: 600, color: P.dark.ink2, align: 'center' });
      ctx.restore();
    });

    const hp = beat(t, 0.2, 0.8, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(hp);
    glowOrb(ctx, cx, cy, 300, P.dark.cyan, 0.24);
    circle(ctx, cx, cy, 122, 'rgba(11,20,36,0.95)');
    ctx.strokeStyle = alpha(P.dark.gold, 0.55);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 122, 0, Math.PI * 2); ctx.stroke();
    brandMark(ctx, cx - 30, cy - 62, 60, { withWordmark: false, color: P.dark.ink });
    text(ctx, 'CodePixel', cx, cy + 34, { size: 30, weight: 800, color: P.dark.ink, align: 'center' });
    text(ctx, 'ওয়েব + অ্যাডমিন', cx, cy + 68, { size: 20, weight: 500, color: P.dark.muted, align: 'center' });
    ctx.restore();
  },

  /* 58 — hosting */
  hosting(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    // hosting card
    const cp = beat(t, 0.25, 0.8, easeOutQuint);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      glassCard(ctx, 78, 720, 924, 300, { r: 32, fill: 'rgba(16,26,46,0.8)', glow: P.dark.cyan });
      fillRR(ctx, 110, 752, 76, 76, 24, 'rgba(79,216,255,0.14)');
      icon(ctx, 'globe', 132, 774, 32, P.dark.cyan, 1.9);
      text(ctx, 'উপযুক্ত ফ্রি হোস্টিং প্ল্যাটফর্ম', 206, 786, { size: 27, weight: 700, color: P.dark.ink });
      text(ctx, 'যেমন Vercel / Netlify — স্ট্যাটিক সাইটের জন্য', 206, 820, { size: 20, weight: 500, color: P.dark.muted });
      dashLine(ctx, 110, 856, 970, 856, 'rgba(255,255,255,0.12)', 1.4, [5, 7], cp);
      [['মাসিক হোস্টিং ফি', '৳০'], ['ডোমেইন', 'আলাদা'], ['SSL সার্টিফিকেট', 'ফ্রি']].forEach(([k, v], i) => {
        const x = 110 + i * 292;
        text(ctx, k, x, 906, { size: 19, weight: 500, color: P.dark.muted });
        text(ctx, v, x, 962, { size: 40, weight: 800, color: i === 0 ? '#7BE7B8' : P.dark.ink });
      });
      ctx.restore();
    }

    // cloud + uptime visual
    const vp = beat(t, 1.2, 0.8, easeOutQuint);
    if (vp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(vp);
      ctx.translate(W / 2, 1290);
      glowOrb(ctx, 0, 0, 300, P.dark.cyan, 0.2);
      icon(ctx, 'globe', -60, -60, 120, P.dark.cyan, 1.2);
      for (let i = 0; i < 3; i++) {
        const ph = ((t - 1.2) * 0.5 + i * 0.33) % 1;
        if (ph < 0) continue;
        ctx.strokeStyle = `rgba(79,216,255,${0.3 * (1 - ph)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 80 + ph * 170, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    // qualified note (dishonest claims avoided)
    const np = beat(t, 1.8, 0.6, easeOut);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= np;
      const str = 'ফ্রি টিয়ার ও লিমিট প্ল্যাটফর্ম অনুযায়ী ভিন্ন হতে পারে';
      ctx.font = fontStr(19, 500, str);
      const tw = ctx.measureText(str).width;
      const w = tw + 68;
      const x = (W - w) / 2;
      fillRR(ctx, x, 1490, w, 48, 24, 'rgba(255,255,255,0.06)');
      icon(ctx, 'shield', x + 18, 1503, 22, P.dark.muted, 1.7);
      text(ctx, str, x + 48, 1521, { size: 19, weight: 500, color: P.dark.muted });
      ctx.restore();
    }
  },

  /* 59 — no monthly hosting fee */
  hostingNote(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 600, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'মাসিক হোস্টিং ফি\nছাড়াই চালানোর সুযোগ', t, {
      tone, x: W / 2 - LAY.w / 2, y: 700, size: 92, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#FFFFFF', '#7BE7B8'],
    });

    // big ৳০ / মাস
    const pp = beat(t, 0.9, 0.9, easeOutBack);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(pp);
      ctx.translate(W / 2, 1150);
      ctx.scale(0.9 + 0.1 * pp, 0.9 + 0.1 * pp);
      glassCard(ctx, -300, -150, 600, 300, { r: 40, fill: 'rgba(14,24,42,0.84)', glow: '#7BE7B8' });
      text(ctx, 'মাসিক খরচ', 0, -74, { size: 26, weight: 500, color: P.dark.muted, align: 'center' });
      text(ctx, '৳০', -30, 40, { size: 150, weight: 800, color: '#7BE7B8', align: 'center' });
      text(ctx, '/মাস', 96, 30, { size: 34, weight: 600, color: P.dark.muted, align: 'left' });
      text(ctx, 'সুযোগ থাকতে পারে — প্ল্যাটফর্ম অনুযায়ী', 0, 104, { size: 20, weight: 500, color: P.dark.muted, align: 'center' });
      ctx.restore();
    }
    pill(ctx, W / 2, 1420, 'ডোমেইন ও পেইড সার্ভিস আলাদা', { tone, align: 'center', iconName: 'shield', p: beat(t, 1.6, 0.6, easeOutBack), size: 21 });
  },

  /* 60 — cost transparency */
  costNote(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 78, maxWidth: 920 });

    const rows = [
      ['ওয়েবসাইট ডিজাইন ও ডেভেলপমেন্ট', '৳৩,০০০', 'সামনে রাখা মূল্য', true],
      ['হোস্টিং (ফ্রি টিয়ার)', '৳০', 'প্ল্যাটফর্ম অনুযায়ী', false],
      ['ডোমেইন', 'আলাদা', '.com প্রায় ৳১,২০০–১,৬০০/বছর', false],
      ['পেইড থার্ড পার্টি সার্ভিস', 'আলাদা', 'প্রয়োজন অনুযায়ী', false],
    ];
    rows.forEach(([label, value, note, hot], i) => {
      const p = beat(t, 0.25 + i * 0.16, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 720 + i * 172;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 26);
      glassCard(ctx, 78, y, 924, 148, { r: 26, fill: hot ? 'rgba(24,44,76,0.85)' : 'rgba(13,21,38,0.62)', glow: hot ? P.dark.cyan : null });
      text(ctx, label, 112, y + 60, { size: 25, weight: 700, color: P.dark.ink, maxWidth: 560 });
      text(ctx, note, 112, y + 96, { size: 19, weight: 500, color: P.dark.muted, maxWidth: 560 });
      text(ctx, value, 966, y + 86, { size: 32, weight: 800, color: hot ? P.dark.cyan : P.dark.ink2, align: 'right' });
      ctx.restore();
    });
  },

  /* 61 — planning with the client */
  planning(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    const cx0 = 78, cw = 924;
    // chat-like discovery checklist
    const items = [
      ['আপনার ব্যবসা কী?', 'পণ্য, সার্ভিস ও টার্গেট কাস্টমার'],
      ['কোন ফিচার দরকার?', 'স্কোপ ও প্যাকেজ আলোচনা'],
      ['ব্র্যান্ড কেমন?', 'লোগো, রঙ ও ভয়েস'],
    ];
    items.forEach(([q, a], i) => {
      const p = beat(t, 0.3 + i * 0.3, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 720 + i * 208;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 34, 0);
      glassCard(ctx, cx0, y, cw, 176, { r: 28, fill: 'rgba(16,26,46,0.76)' });
      circle(ctx, cx0 + 56, y + 58, 26, alpha(P.dark.cyan, 0.16));
      text(ctx, String(i + 1), cx0 + 56, y + 67, { size: 24, weight: 800, color: P.dark.cyan, align: 'center' });
      text(ctx, q, cx0 + 100, y + 68, { size: 28, weight: 700, color: P.dark.ink });
      text(ctx, a, cx0 + 100, y + 112, { size: 21, weight: 500, color: P.dark.muted });
      seal(ctx, cx0 + cw - 56, y + 58, 18, 'yes', beat(t, 0.6 + i * 0.3, 0.5), { tone });
      ctx.restore();
    });
    pill(ctx, W / 2, 1420, 'কাজ শুরুর আগেই সব স্পষ্ট', { tone, align: 'center', iconName: 'chat', p: beat(t, 1.4, 0.6, easeOutBack), size: 22 });
  },

  /* 62 — every business is different */
  notSame(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 620, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'প্রতিটি ব্যবসার\nপ্রয়োজন এক নয়', t, {
      tone, x: W / 2 - LAY.w / 2, y: 720, size: 108, align: 'center', maxWidth: LAY.w, delay: 0.12,
      accentTo: ['#FFFFFF', '#E3B87C'],
    });

    const kinds = [
      ['শপ', 'box', 'অনলাইন স্টোর'],
      ['ল্যান্ডিং', 'tag', 'ক্যাম্পেইন'],
      ['সিস্টেম', 'grid', 'অর্ডার + কুরিয়ার'],
    ];
    kinds.forEach(([label, ic, sub], i) => {
      const p = beat(t, 0.9 + i * 0.18, 0.7, easeOutBack);
      if (p <= 0) return;
      const x = 78 + i * 316;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 40);
      glassCard(ctx, x, 1080, 288, 250, { r: 30, fill: 'rgba(16,26,46,0.72)' });
      fillRR(ctx, x + 24, 1104, 64, 64, 20, 'rgba(79,216,255,0.13)');
      icon(ctx, ic, x + 40, 1120, 32, P.dark.cyan, 1.9);
      text(ctx, label, x + 24, 1216, { size: 30, weight: 700, color: P.dark.ink });
      text(ctx, sub, x + 24, 1256, { size: 20, weight: 500, color: P.dark.muted, maxWidth: 244 });
      ctx.restore();
    });
  },

  /* 63 — a beautiful online shop */
  solShop(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });
    phone(ctx, t, {
      x: 96, y: 700, w: 388, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.1 + 0.06 * Math.sin(t * 0.4), cart: 1, activeCat: 1 }),
    });
    const rows = [
      ['সব পণ্য, ক্যাটাগরি ও সার্চ', 'grid'],
      ['কার্ট ও সহজ চেকআউট', 'cart'],
      ['মোবাইলে দ্রুত ও পরিষ্কার', 'phone'],
    ];
    rows.forEach(([label, ic], i) => {
      const p = beat(t, 0.8 + i * 0.2, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 860 + i * 148;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 40, 0);
      lightCard(ctx, 540, y, 444, 120, { r: 24, lift: 0.9 });
      fillRR(ctx, 562, y + 30, 60, 60, 18, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, 576, y + 44, 32, P.light.goldDeep, 1.9);
      text(ctx, label, 640, y + 66, { size: 23, weight: 600, color: P.light.ink, maxWidth: 320 });
      seal(ctx, 952, y + 60, 15, 'yes', beat(t, 1.0 + i * 0.2, 0.45), { tone });
      ctx.restore();
    });
    pill(ctx, 540, 1420, 'আপনার নিজের ব্র্যান্ডে', { tone, align: 'left', iconName: 'sparkle', p: beat(t, 1.6, 0.6, easeOutBack), size: 21 });
  },

  /* 64 — product landing page */
  solLanding(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });
    phone(ctx, t, {
      x: 600, y: 700, w: 388, enter: beat(t, 0.25, 0.9, easeOutQuint), tone,
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: clamp(t / 1.6) }),
    });
    const rows = [
      ['একটি অফার, একটি পেজ', 'tag'],
      ['সরাসরি অর্ডার বাটন', 'cart'],
      ['বিজ্ঞাপনের জন্য প্রস্তুত', 'rocket'],
    ];
    rows.forEach(([label, ic], i) => {
      const p = beat(t, 0.7 + i * 0.2, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 860 + i * 148;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * -40, 0);
      lightCard(ctx, 96, y, 444, 120, { r: 24, lift: 0.9 });
      fillRR(ctx, 118, y + 30, 60, 60, 18, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, 132, y + 44, 32, P.light.goldDeep, 1.9);
      text(ctx, label, 196, y + 66, { size: 23, weight: 600, color: P.light.ink, maxWidth: 320 });
      ctx.restore();
    });
    pill(ctx, 96, 1420, 'ক্যাম্পেইন চালানোর জন্য', { tone, align: 'left', iconName: 'chart', p: beat(t, 1.5, 0.6, easeOutBack), size: 21 });
  },

  /* 65 — full business system */
  solSystem(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 78, maxWidth: 920 });

    const br = browser(ctx, t, {
      y: 660, w: 900, vw: 1000, vh: 640, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop', draw: (w, h) => AD.adDashboard(ctx, w, h, { p: clamp((t - 0.2) / 1.8) }),
    });
    phone(ctx, t, {
      x: 700, y: 1090, w: 292, enter: beat(t, 1.0, 0.8, easeOutBack), tone,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.08, cart: 0, activeCat: 1 }),
    });

    const tags = [['list', 'অর্ডার'], ['truck', 'কুরিয়ার'], ['cash', 'পেমেন্ট'], ['chart', 'স্টক']];
    tags.forEach(([ic, label], i) => {
      const p = beat(t, 1.5 + i * 0.15, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = 92 + (i % 2) * 236;
      const y = 1360 + Math.floor(i / 2) * 118;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      lightCard(ctx, x, y, 216, 96, { r: 22, lift: 0.9 });
      icon(ctx, ic, x + 22, y + 34, 28, P.light.goldDeep, 1.9);
      text(ctx, label, x + 62, y + 60, { size: 22, weight: 700, color: P.light.ink });
      ctx.restore();
    });
  },

  /* 66 — pick the right solution */
  solutions(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    const sols = [
      ['শপ', 'অনলাইন স্টোর', 'globe', 'স্টোরফ্রন্ট + অ্যাডমিন'],
      ['ল্যান্ডিং', 'অফার / ক্যাম্পেইন', 'tag', 'ফাস্ট অর্ডার পেজ'],
      ['সিস্টেম', 'পূর্ণ ব্যবস্থাপনা', 'grid', 'অর্ডার • কুরিয়ার • পেমেন্ট'],
    ];
    sols.forEach(([title, sub, ic, note], i) => {
      const p = beat(t, 0.35 + i * 0.22, 0.7, easeOutBack);
      if (p <= 0) return;
      const x = 78 + i * 316;
      const hot = i === 0;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 46);
      glassCard(ctx, x, 760, 288, 440, { r: 32, fill: hot ? 'rgba(26,46,80,0.86)' : 'rgba(14,24,42,0.72)', glow: hot ? P.dark.cyan : null });
      fillRR(ctx, x + 28, 792, 76, 76, 24, 'rgba(79,216,255,0.14)');
      icon(ctx, ic, x + 50, 814, 32, P.dark.cyan, 1.9);
      text(ctx, title, x + 28, 930, { size: 34, weight: 800, color: P.dark.ink });
      text(ctx, sub, x + 28, 976, { size: 22, weight: 600, color: P.dark.ink2, maxWidth: 236 });
      dashLine(ctx, x + 28, 1010, x + 260, 1010, 'rgba(255,255,255,0.14)', 1.2, [4, 6], p);
      const lines = note.split(' • ');
      lines.forEach((ln, k) => text(ctx, ln, x + 28, 1050 + k * 32, { size: 19, weight: 500, color: P.dark.muted, maxWidth: 236 }));
      ctx.restore();
    });

    const bp = beat(t, 1.2, 0.7, easeOutBack);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      glassCard(ctx, 200, 1280, 680, 116, { r: 58, fill: 'rgba(24,44,76,0.8)', glow: P.dark.gold });
      brandMark(ctx, 244, 1310, 44, { withWordmark: false });
      text(ctx, 'CodePixel Web-এর সঙ্গে বেছে নিন', 716, 1348, { size: 26, weight: 700, color: P.dark.ink, align: 'right' });
      ctx.restore();
    }
  },

  /* 67 — price anticipation */
  priceAnticipation(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 600, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'এত সুযোগের\nশুরুটা…', t, {
      tone, x: W / 2 - LAY.w / 2, y: 700, size: 110, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#FFFFFF', '#E3B87C'],
    });
    // pending dots
    const dp = beat(t, 0.9, 0.8, easeOut);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(dp);
      for (let i = 0; i < 3; i++) {
        const b = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.4 - i * 0.5));
        circle(ctx, W / 2 - 60 + i * 60, 1180, 16, alpha(P.dark.gold, b));
      }
      ctx.restore();
    }
    // price tease bar with blurred numbers
    const bp = beat(t, 1.4, 0.7, easeOutQuint);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      glassCard(ctx, 200, 1320, 680, 180, { r: 34, fill: 'rgba(16,26,46,0.8)' });
      text(ctx, 'শুরু', 340, 1420, { size: 34, weight: 600, color: P.dark.muted, align: 'center' });
      text(ctx, '৳ ?', 540, 1444, { size: 110, weight: 800, color: P.dark.ink, align: 'center' });
      ctx.restore();
    }
  },

  /* 68 — the price */
  priceFinal(ctx, t, d, s) {
    const tone = 'dark';
    // rings
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.28 + i * 0.33) % 1);
      ctx.strokeStyle = `rgba(227,184,124,${0.18 * (1 - ph)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, 900, 180 + ph * 330, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    priceHero(ctx, t, {
      cx: W / 2, y: 950, size: 250, tone, p: beat(t, 0.05, 0.7, easeOutBack),
      label: 'সম্পূর্ণ ওয়েবসাইট', oldPrice: null,
    });
    headlineBlock(ctx, 'মাত্র *৩,০০০* টাকায়\nওয়েবসাইট!', t, {
      tone, x: W / 2 - LAY.w / 2, y: 1140, size: 100, align: 'center', maxWidth: LAY.w, delay: 0.3,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });
    const np = beat(t, 0.9, 0.7, easeOutBack);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(np);
      circle(ctx, W / 2, 1440, 150, alpha('#7BE7B8', 0.08));
      text(ctx, 'কোনো এডভান্স নেই!', W / 2, 1462, { size: 62, weight: 800, color: '#7BE7B8', align: 'center', maxWidth: 940 });
      ctx.restore();
    }
    pill(ctx, W / 2, 1580, 'ডেমো দেখুন • ফিচার আলোচনা করুন', { tone, align: 'center', iconName: 'globe', p: beat(t, 1.4, 0.6, easeOutBack), size: 22 });
  },

  /* 69 — delivery target */
  delivery(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    // big day lockup
    const bp0 = beat(t, 0.2, 0.8, easeOutBack);
    if (bp0 > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp0);
      ctx.translate(W / 2, 760);
      ctx.scale(0.92 + 0.08 * bp0, 0.92 + 0.08 * bp0);
      text(ctx, '২–৩', 0, 0, { size: 190, weight: 800, color: P.dark.ink, align: 'center', letterSpacing: -4 });
      text(ctx, 'দিনে ডেলিভারির লক্ষ্য', 0, 64, { size: 30, weight: 600, color: P.dark.gold, align: 'center' });
      ctx.restore();
    }
    // 2–3 day timeline
    const days = ['দিন ১', 'দিন ২', 'দিন ৩'];
    const y = 1050;
    const x0 = 150, x1 = 930;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    const lp = beat(t, 0.4, 1.6, easeOut);
    ctx.strokeStyle = P.dark.gold;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, lp), y); ctx.stroke();

    days.forEach((day, i) => {
      const p = beat(t, 0.5 + i * 0.45, 0.6, easeOutBack);
      if (p <= 0) return;
      const x = lerp(x0, x1, i / 2);
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      circle(ctx, x, y, 26, 'rgba(14,24,42,0.95)');
      ctx.strokeStyle = P.dark.gold;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.stroke();
      text(ctx, String(i + 1), x, y + 10, { size: 26, weight: 800, color: P.dark.gold, align: 'center' });
      text(ctx, day, x, y + 66, { size: 24, weight: 700, color: P.dark.ink, align: 'center' });
      text(ctx, ['ডিজাইন ফাইনাল', 'ডেভেলপমেন্ট', 'লাইভ ডেলিভারি'][i], x, y + 102, { size: 19, weight: 500, color: P.dark.muted, align: 'center', maxWidth: 240 });
      ctx.restore();
    });

    const np = beat(t, 1.4, 0.7, easeOutQuint);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(np);
      glassCard(ctx, 150, 1260, 780, 176, { r: 30, fill: 'rgba(16,26,46,0.8)' });
      icon(ctx, 'clock', 186, 1292, 40, P.dark.cyan, 1.9);
      text(ctx, 'কাজের পরিধি ও উপকরণ পাওয়ার উপর নির্ভরশীল', 246, 1326, { size: 24, weight: 600, color: P.dark.ink, maxWidth: 640 });
      text(ctx, 'কনটেন্ট আগে পেলে সময় আরও কমতে পারে', 246, 1366, { size: 20, weight: 500, color: P.dark.muted, maxWidth: 640 });
      ctx.restore();
    }
    pill(ctx, W / 2, 1500, 'শুরু থেকে লাইভ — একটানা আপডেট', { tone, align: 'center', iconName: 'rocket', p: beat(t, 2.0, 0.6, easeOutBack), size: 21 });
  },

  /* 70 — scope discussion */
  scope(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 80 });

    const left = ['কোন ফিচার প্যাকেজে থাকবে', 'কোনটা ঐচ্ছিক ইন্টিগ্রেশন', 'কত সময় লাগবে'];
    const right = ['কী কী উপকরণ লাগবে', 'শুরুর আগেই লিখিত স্কোপ', 'পরে কোনো বিভ্রান্তি নয়'];
    const card = (x, y, w, h, heading, items, delay, accent) => {
      const p = beat(t, delay, 0.7, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 34);
      glassCard(ctx, x, y, w, h, { r: 30, fill: 'rgba(16,26,46,0.74)' });
      fillRR(ctx, x + 26, y + 26, 52, 52, 16, alpha(accent, 0.15));
      icon(ctx, 'checkCircle', x + 40, y + 40, 26, accent, 1.9);
      text(ctx, heading, x + 26, y + 118, { size: 26, weight: 700, color: P.dark.ink });
      items.forEach((it, i) => {
        const ip = beat(t, delay + 0.2 + i * 0.14, 0.5, easeOut);
        if (ip <= 0) return;
        ctx.save();
        ctx.globalAlpha *= clamp(ip);
        circle(ctx, x + 36, y + 166 + i * 62, 5, alpha(accent, 0.9));
        text(ctx, it, x + 56, y + 174 + i * 62, { size: 21, weight: 500, color: P.dark.ink2, maxWidth: w - 90 });
        ctx.restore();
      });
      ctx.restore();
    };
    card(78, 720, 444, 400, 'শুরুর আগে', left, 0.3, P.dark.cyan);
    card(542, 720, 444, 400, 'লিখিতভাবে', right, 0.5, P.dark.gold);

    pill(ctx, W / 2, 1240, 'স্কোপ স্পষ্ট = কাজ সুন্দর', { tone, align: 'center', iconName: 'edit', p: beat(t, 1.4, 0.6, easeOutBack), size: 22 });
  },

  /* 71 — why wait */
  whyDelay(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 82 });

    // before / after
    const bp = beat(t, 0.3, 0.7, easeOutQuint);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp) * 0.85;
      ctx.translate(0, (1 - bp) * 30);
      glassCard(ctx, 78, 720, 420, 420, { r: 30, fill: 'rgba(20,26,40,0.7)', stroke: 'rgba(255,120,140,0.2)' });
      text(ctx, 'আগে', 110, 776, { size: 22, weight: 600, color: 'rgba(255,150,165,0.9)' });
      icon(ctx, 'chat', 110, 810, 40, 'rgba(255,150,165,0.55)', 1.6);
      ['শুধু মেসেজে অর্ডার', 'দাম নিয়ে দ্বিধা', 'অর্ডার হারিয়ে যায়'].forEach((line, i) => {
        text(ctx, line, 110, 900 + i * 62, { size: 22, weight: 500, color: 'rgba(200,210,230,0.6)', maxWidth: 340 });
      });
      ctx.restore();
    }
    const ap = beat(t, 0.7, 0.8, easeOutQuint);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      ctx.translate(0, (1 - ap) * 34);
      glassCard(ctx, 542, 720, 444, 420, { r: 30, fill: 'rgba(22,40,70,0.86)', glow: P.dark.cyan });
      text(ctx, 'পরে', 574, 776, { size: 22, weight: 600, color: P.dark.cyan });
      icon(ctx, 'globe', 574, 810, 40, P.dark.cyan, 1.7);
      ['নিজের প্রফেশনাল সাইট', 'কাস্টমার নিজেই অর্ডার করে', 'সব হিসাব এক জায়গায়'].forEach((line, i) => {
        seal(ctx, 590, 908 + i * 62, 12, 'yes', beat(t, 1.0 + i * 0.14, 0.45), { tone });
        text(ctx, line, 618, 916 + i * 62, { size: 22, weight: 600, color: P.dark.ink, maxWidth: 340 });
      });
      ctx.restore();
    }
    pill(ctx, W / 2, 1240, 'আজই শুরু করা যায়', { tone, align: 'center', iconName: 'rocket', p: beat(t, 1.5, 0.6, easeOutBack), size: 22 });
  },

  /* 72 — your design, your brand */
  yourDesign(ctx, t, d, s) {
    const tone = 'dark';
    // three phones cascading with brand variants
    const variants = [
      { x: 64, rot: -0.08, theme: 'gold' },
      { x: 340, rot: 0, theme: 'night' },
      { x: 616, rot: 0.08, theme: 'mint' },
    ];
    variants.forEach((v, i) => {
      const p = beat(t, 0.2 + i * 0.16, 0.8, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * (i === 1 ? 1 : 0.8);
      phone(ctx, t, {
        x: v.x + 34, y: i === 1 ? 610 : 690, w: 300, rotate: v.rot, enter: p, tone, float: false, shadowA: 0.4,
        draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.05, cart: 0, activeCat: 1 }),
      });
      ctx.restore();
    });

    headlineBlock(ctx, 'আপনার পছন্দের ডিজাইন\n*আপনার ব্র্যান্ড*', t, {
      tone, x: W / 2 - LAY.w / 2, y: 1560, size: 68, align: 'center', maxWidth: LAY.w, delay: 0.8,
      accentTo: ['#FFFFFF', '#E3B87C'],
    });
  },

  /* 73 — contact now */
  contactNow(ctx, t, d, s) {
    const tone = 'dark';
    const bp = beat(t, 0.1, 0.9, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(bp);
    glowOrb(ctx, W / 2, 620, 460, P.dark.cyan, 0.28);
    brandMark(ctx, W / 2 - 56, 560, 112, { withWordmark: false });
    ctx.restore();

    kickerLine(ctx, s.kicker, t, { tone, y: 800, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'যোগাযোগ করুন\nCodePixel Web-এর সঙ্গে', t, {
      tone, x: W / 2 - LAY.w / 2, y: 900, size: 84, align: 'center', maxWidth: LAY.w, delay: 0.15,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });

    // contact cards
    const cards = [
      ['chat', 'হোয়াটসঅ্যাপ', BRAND.whatsapp, '#25D366'],
      ['globe', 'ওয়েবসাইট', SITE, P.dark.cyan],
    ];
    cards.forEach(([ic, label, val, col], i) => {
      const p = beat(t, 0.8 + i * 0.2, 0.7, easeOutQuint);
      if (p <= 0) return;
      const x = 78 + i * 476;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      glassCard(ctx, x, 1230, 448, 186, { r: 30, fill: 'rgba(16,26,46,0.84)', glow: col });
      fillRR(ctx, x + 26, 1260, 68, 68, 22, alpha(col, 0.18));
      icon(ctx, ic, x + 43, 1277, 34, col, 1.9);
      text(ctx, label, x + 110, 1296, { size: 21, weight: 500, color: P.dark.muted });
      text(ctx, val, x + 110, 1344, { size: 29, weight: 800, color: P.dark.ink, maxWidth: 320 });
      ctx.restore();
    });
  },

  /* 74 — demo website */
  websiteCta(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 540, align: 'center', x: W / 2 });

    // url pill, huge and clear
    const up = beat(t, 0.15, 0.7, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(up);
    ctx.translate(W / 2, 660);
    ctx.scale(0.94 + 0.06 * up, 0.94 + 0.06 * up);
    glassCard(ctx, -420, -64, 840, 128, { r: 64, fill: 'rgba(16,26,46,0.86)', glow: P.dark.cyan });
    icon(ctx, 'globe', -382, -22, 44, P.dark.cyan, 1.8);
    text(ctx, SITE, 40, 14, { size: 46, weight: 700, color: P.dark.ink, align: 'center' });
    ctx.restore();

    // three deep links from the message (left rail)
    const links = [
      ['#demos', 'লাইভ ডেমো', 'play'],
      ['#pricing', 'মাত্র ৩,০০০ টাকার প্যাকেজ', 'cash'],
      ['#admin', 'অ্যাডমিন প্যানেল', 'grid'],
    ];
    links.forEach(([hash, label, ic], i) => {
      const p = beat(t, 0.8 + i * 0.18, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 860 + i * 176;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * -40, 0);
      glassCard(ctx, 78, y, 456, 146, { r: 26, fill: 'rgba(16,26,46,0.82)' });
      fillRR(ctx, 102, y + 38, 62, 62, 19, 'rgba(79,216,255,0.14)');
      icon(ctx, ic, 116, y + 52, 34, P.dark.cyan, 1.9);
      text(ctx, label, 184, y + 62, { size: 24, weight: 700, color: P.dark.ink, maxWidth: 330 });
      text(ctx, `${SITE}/${hash}`, 184, y + 98, { size: 17, weight: 500, color: P.dark.muted, maxWidth: 330 });
      ctx.restore();
    });

    // demo phone (right)
    phone(ctx, t, {
      x: 596, y: 780, w: 362, enter: beat(t, 0.4, 0.9, easeOutQuint), tone, glow: '#2E5BFF',
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.06 + 0.12 * easeInOut(clamp((t - 1) / 5)), cart: 0, activeCat: 1 }),
    });
    pill(ctx, 742, 1580, 'এক ট্যাপে লাইভ দেখুন', { tone, align: 'center', iconName: 'globe', p: beat(t, 1.5, 0.6, easeOutBack), size: 21 });
  },

  /* 75 — whatsapp */
  whatsappCta(ctx, t, d, s) {
    const tone = 'dark';
    kickerLine(ctx, s.kicker, t, { tone, y: 620, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'হোয়াটসঅ্যাপে\nমেসেজ করুন', t, {
      tone, x: W / 2 - LAY.w / 2, y: 720, size: 96, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#FFFFFF', '#25D366'],
    });

    // big whatsapp badge
    const bp = beat(t, 0.5, 0.9, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(bp);
    glowOrb(ctx, W / 2, 1120, 360, '#25D366', 0.3);
    circle(ctx, W / 2, 1120, 108, '#25D366');
    whatsappGlyph(ctx, W / 2 - 58, 1062, 116, '#FFFFFF');
    ctx.restore();

    // number
    const np = beat(t, 0.9, 0.7, easeOutQuint);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(np);
      ctx.translate(0, (1 - np) * 26);
      glassCard(ctx, 150, 1280, 780, 170, { r: 34, fill: 'rgba(16,26,46,0.86)', glow: '#25D366' });
      text(ctx, 'সরাসরি কথা বলুন', W / 2, 1334, { size: 22, weight: 500, color: P.dark.muted, align: 'center' });
      text(ctx, WA, W / 2, 1410, { size: 70, weight: 800, color: '#FFFFFF', align: 'center', letterSpacing: 2 });
      ctx.restore();
    }
    pill(ctx, W / 2, 1540, 'মেসেজ দিন — প্রয়োজন বুঝে সমাধান জানাবেন', { tone, align: 'center', iconName: 'chat', p: beat(t, 1.4, 0.6, easeOutBack), size: 21 });
  },

  /* 76 — the offer once more */
  offerRepeat(ctx, t, d, s) {
    const tone = 'dark';
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.3 + i * 0.33) % 1);
      ctx.strokeStyle = `rgba(79,216,255,${0.16 * (1 - ph)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, 860, 150 + ph * 340, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    kickerLine(ctx, s.kicker, t, { tone, y: 560, align: 'center', x: W / 2 });
    headlineBlock(ctx, 'মাত্র *৩,০০০* টাকায়\nকাস্টম ওয়েবসাইট!', t, {
      tone, x: W / 2 - LAY.w / 2, y: 660, size: 96, align: 'center', maxWidth: LAY.w, delay: 0.1,
      accentTo: ['#FFFFFF', '#4FD8FF'],
    });
    // benefits, not a second price lockup
    const benefits = [
      ['sparkle', 'কাস্টম ডিজাইন', 'টেমপ্লেট নয়'],
      ['grid', 'অ্যাডমিন প্যানেল', 'নিজেই চালান'],
      ['phone', 'মোবাইল ফ্রেন্ডলি', 'সব স্ক্রিনে'],
    ];
    benefits.forEach(([ic, label, sub], i) => {
      const p = beat(t, 0.45 + i * 0.16, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 930 + i * 118;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 36, 0);
      glassCard(ctx, 78, y, 924, 98, { r: 24, fill: 'rgba(16,26,46,0.76)' });
      fillRR(ctx, 104, y + 22, 54, 54, 17, 'rgba(79,216,255,0.14)');
      icon(ctx, ic, 118, y + 36, 26, P.dark.cyan, 1.9);
      text(ctx, label, 178, y + 46, { size: 25, weight: 700, color: P.dark.ink });
      text(ctx, sub, 178, y + 76, { size: 18, weight: 500, color: P.dark.muted });
      seal(ctx, 952, y + 49, 15, 'yes', p, { tone });
      ctx.restore();
    });

    const np = beat(t, 1.0, 0.7, easeOutBack);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(np);
      ctx.translate(0, (1 - np) * 30);
      glassCard(ctx, 180, 1310, 720, 132, { r: 66, fill: 'rgba(20,44,40,0.82)', glow: '#7BE7B8' });
      seal(ctx, 258, 1376, 26, 'yes', np, { tone });
      text(ctx, 'কোনো এডভান্স নেই', 310, 1390, { size: 42, weight: 800, color: '#7BE7B8' });
      ctx.restore();
    }
    // feature strip
  },

  /* 77 — end card */
  endCard(ctx, t, d, s) {
    const tone = 'dark';
    const bp = beat(t, 0, 0.8, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(bp);
    glowOrb(ctx, W / 2, 700, 620, P.dark.blue, 0.35);
    brandMark(ctx, W / 2 - 54, 560, 108, { withWordmark: false });
    text(ctx, 'CODEPIXEL', W / 2, 730, { size: 44, weight: 800, color: P.dark.ink, align: 'center', letterSpacing: 8 });
    text(ctx, 'W E B', W / 2, 772, { size: 22, weight: 600, color: P.dark.gold, align: 'center', letterSpacing: 10 });
    ctx.restore();

    const lines = [
      ['আপনার ব্যবসা', '#FFFFFF'],
      ['আপনার ডিজাইন', '#E3B87C'],
      ['আপনার অনলাইন পরিচয়', '#4FD8FF'],
    ];
    lines.forEach(([ln, col], i) => {
      const p = beat(t, 0.3 + i * 0.22, 0.7, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      text(ctx, ln, W / 2, 940 + i * 82 + (1 - p) * 20, { size: 62, weight: 700, color: col, align: 'center' });
      ctx.restore();
    });

    dashLine(ctx, 300, 1240, 780, 1240, 'rgba(255,255,255,0.14)', 1.4, [6, 8], beat(t, 1.0, 0.8));

    const pp = beat(t, 1.1, 0.8, easeOutQuint);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(pp);
      text(ctx, 'মাত্র ৩,০০০ টাকায় ওয়েবসাইট', W / 2, 1310, { size: 38, weight: 700, color: P.dark.ink, align: 'center' });
      pill(ctx, W / 2, 1392, 'কোনো এডভান্স নেই', { tone, align: 'center', iconName: 'check', p: pp, size: 21 });
      ctx.restore();
    }

    const cp = beat(t, 1.6, 0.8, easeOutQuint);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(cp);
      glassCard(ctx, 120, 1470, 840, 150, { r: 30, fill: 'rgba(16,26,46,0.86)' });
      icon(ctx, 'globe', 158, 1516, 34, P.dark.cyan, 1.9);
      text(ctx, SITE, 208, 1548, { size: 30, weight: 700, color: P.dark.ink, maxWidth: 420 });
      fillRR(ctx, 640, 1494, 2, 100, 1, 'rgba(255,255,255,0.12)');
      icon(ctx, 'chat', 676, 1516, 34, '#25D366', 1.9);
      text(ctx, WA, 726, 1548, { size: 30, weight: 700, color: P.dark.ink });
      ctx.restore();
    }
  },
};
