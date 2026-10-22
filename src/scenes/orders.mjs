/**
 * Scenes 27–43 — order management, notifications, incomplete checkout and
 * retargeting (presented as a possible integration, never a guaranteed result).
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, easeOutBack, beat,
  lin, text, paragraph, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, chip, line, mix, drawWatch, statusChip,
} from '../render/kit.mjs';
import { L, headline, kicker, accentRule, glassPanel, phoneStage, brandWatermark, seq, chapterCard } from './stage.mjs';
import { adminStage } from './uiStage.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

export const orderScenes = {
  sectionOrders(ctx, t, d) {
    chapterCard(ctx, t, {
      index: 3, title: 'অর্ডার ম্যানেজমেন্ট', sub: 'নতুন অর্ডার থেকে ডেলিভারি পর্যন্ত',
      items: ['অর্ডারের বিস্তারিত তথ্য', 'স্ট্যাটাস অনুযায়ী পরিচালনা', 'রিপোর্ট, পেমেন্ট ও স্টক'],
      accent: C.violet, p: clamp(t / 0.6),
    });
    brandWatermark(ctx, t, 0.25);
  },

  orderIncoming(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 680, w: 968, h: 700 }, vw: 780, vh: 880, enter: 1, panY: 0.12,
      active: 3, title: 'অর্ডার', sub: 'সব অর্ডার এক জায়গায়',
      draw: (c, w, h) => AD.adOrders(c, w, h, { p: clamp((t - 0.4) / 2.0), highlight: t > 2.0 ? 0 : -1 }),
    });
    // incoming notification on phone (foreground)
    const np = beat(t, 1.2, 0.7, easeOutBack);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= np;
      ctx.translate((1 - np) * 200, 0);
      SF.floatingToast(ctx, 500, 1320, 500, 'নতুন অর্ডার এসেছে', '#AUR-1048 • ৳4,960', { iconName: 'bell', tone: C.cyan, dark: true, p: 1 });
      ctx.restore();
    }
    const pp = beat(t, 0.3, 0.6);
    ctx.save(); ctx.globalAlpha *= pp;
    chip(ctx, 'অর্ডারের বিস্তারিত তথ্য', 96, 1400, { color: C.cyan, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  orderDetail(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 640 }, vw: 780, vh: 840, enter: 1,
      active: 3, title: 'অর্ডার #AUR-1048',
      draw: (c, w, h) => AD.adOrderDetail(c, w, h, { p: clamp((t - 0.3) / 1.6), step: t > 5.5 ? 2 : 1, pulse: t }),
    });
    const notes = [
      ['নাম ও ফোন', 'users', 0.8], ['ঠিকানা', 'pin', 2.0], ['পণ্য ও পরিমাণ', 'box', 3.2],
      ['দাম, ডেলিভারি ও মোট', 'cash', 4.6],
    ];
    notes.forEach(([label, ic, at], i) => {
      const p = beat(t, at, 0.45, easeOutBack);
      if (p <= 0) return;
      const y = 780 + i * 108;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 30, 0);
      glassPanel(ctx, 660, y, 356, 66, { r: 33, fill: 'rgba(9,15,30,0.92)' });
      icon(ctx, ic, 680, y + 20, 26, C.cyan, 2);
      text(ctx, label, 720, y + 43, { size: 23, weight: 600, color: C.white, maxWidth: 276 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  orderStatus(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 620 }, vw: 780, vh: 820, enter: 1,
      active: 3, title: 'অর্ডার স্ট্যাটাস',
      draw: (c, w, h) => AD.adOrders(c, w, h, { p: 1, tab: 0, highlight: Math.min(6, Math.floor(clamp((t - 0.6) / 1.2))) }),
    });
    const states = [['পেন্ডিং', 'amber'], ['কনফার্ম', 'blue'], ['প্রসেসিং', 'blue'], ['শিপড', 'blue'], ['ডেলিভারড', 'green'], ['বাতিল', 'red']];
    states.forEach(([label, tone], i) => {
      const p = beat(t, 0.3 + i * 0.3, 0.4, easeOutBack);
      if (p <= 0) return;
      const x = 80 + (i % 3) * 320, y = 1370 + Math.floor(i / 3) * 70;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 18);
      statusChip(ctx, label, x, y, tone, { size: 22, h: 44 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  orderFilter(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 720, w: 968, h: 600 }, vw: 780, vh: 820, enter: 1,
      active: 3, title: 'স্ট্যাটাস অনুযায়ী ফিল্টার',
      draw: (c, w, h) => AD.adOrders(c, w, h, { p: 1, tab: 2, highlight: 1 }),
    });
    const p = beat(t, 0.4, 0.5, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    chip(ctx, 'অর্ডারের অবস্থা অনুযায়ী পরিচালনা', W / 2, 1370, { align: 'center', color: C.green, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  reports(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 690, w: 968, h: 680 }, vw: 780, vh: 860, enter: 1,
      active: 7, title: 'রিপোর্ট', sub: 'বিক্রি • অর্ডার হিস্ট্রি • পেমেন্ট • স্টক',
      draw: (c, w, h) => AD.adReports(c, w, h, { p: clamp((t - 0.3) / 2.2), tab: t > 3.4 ? 1 : 0 }),
    });
    const tabs = [['বিক্রির রিপোর্ট', 'chart'], ['অর্ডার হিস্ট্রি', 'list'], ['পেমেন্ট স্ট্যাটাস', 'card'], ['স্টকের তথ্য', 'box']];
    tabs.forEach(([label, ic], i) => {
      const p = beat(t, 0.4 + i * 0.25, 0.45, easeOutBack);
      if (p <= 0) return;
      const y = 1380 + Math.floor(i / 2) * 62, x = 80 + (i % 2) * 460;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      fillRR(ctx, x, y, 420, 50, 25, 'rgba(10,17,33,0.9)');
      strokeRR(ctx, x, y, 420, 50, 25, alpha(C.blue, 0.35), 1.2);
      icon(ctx, ic, x + 18, y + 12, 24, C.cyan, 2);
      text(ctx, label, x + 56, y + 32, { size: 22, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  orderNotify(ctx, t, d) {
    // phone with toast + admin bell
    phoneStage(ctx, t, {
      x: 92, y: 780, scale: 0.98, enter: 1,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.08, cart: 1, activeCat: 1 }),
    });
    const p1 = beat(t, 0.4, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p1;
    SF.floatingToast(ctx, 460, 830, 520, 'নতুন অর্ডার', '#AUR-1049 • ৳6,520', { iconName: 'bell', tone: C.cyan, dark: true });
    ctx.restore();
    const p2 = beat(t, 2.0, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p2;
    SF.floatingToast(ctx, 500, 1010, 480, 'হোয়াটসঅ্যাপ/ইমেইল', 'অর্ডার আপডেট পাঠানো হয়েছে', { iconName: 'mail', tone: C.green, dark: true });
    ctx.restore();
    const p3 = beat(t, 3.4, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p3;
    glassPanel(ctx, 500, 1200, 480, 92, { r: 22, fill: 'rgba(10,17,33,0.92)' });
    icon(ctx, 'bell', 520, 1224, 40, C.cyan, 2);
    text(ctx, 'গুরুত্বপূর্ণ অর্ডারের খবর', 576, 1240, { size: 24, weight: 600, color: C.white });
    text(ctx, 'দ্রুত জানতে পারবেন', 576, 1270, { size: 20, weight: 500, color: 'rgba(180,200,230,0.75)' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  abandonIntro(ctx, t, d) {
    const p = beat(t, 0.1, 0.8);
    // fading cart with question
    ctx.save();
    ctx.globalAlpha *= 0.9;
    circle(ctx, W / 2, 1040, 170, alpha(C.violet, 0.14));
    circle(ctx, W / 2, 1040, 128, alpha(C.violet, 0.16));
    icon(ctx, 'cart', W / 2 - 62, 978, 124, C.cyan, 1.5);
    ctx.restore();
    const q = beat(t, 1.4, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= q;
    text(ctx, '?', W / 2 + 120, 930, { size: 110, weight: 800, color: alpha(C.amber, 0.9), align: 'center' });
    ctx.restore();
    const p2 = beat(t, 2.2, 0.7);
    ctx.save(); ctx.globalAlpha *= p2;
    text(ctx, 'সম্ভাব্য বিক্রি বাড়ানোর সুযোগ', W / 2, 1320, { size: 42, weight: 600, color: 'rgba(220,233,255,0.9)', align: 'center' });
    text(ctx, '— নিশ্চয়তা নয়', W / 2, 1370, { size: 22, weight: 500, color: 'rgba(170,190,220,0.6)', align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  abandonJourney(ctx, t, d) {
    const fill = clamp((t - 0.9) / 3.4);
    const stop = clamp((t - 5.2) / 0.8);
    phoneStage(ctx, t, {
      x: 300, y: 620, scale: 1.0, enter: 1,
      draw: (w, h) => SF.sfCheckout(ctx, w, h, { fill: fill * 0.92, paySel: 0, confirm: 0 }),
    });
    // journey path with a stop marker
    const y0 = 1430;
    const steps = [['ওয়েবসাইটে এলেন', 0.4], ['প্রোডাক্ট পছন্দ', 1.6], ['নাম, ফোন, ঠিকানা', 3.2], ['অর্ডার সম্পন্ন নয়', 5.2]];
    const x0 = 96, x1 = 984;
    line(ctx, x0, y0, x1, y0, 'rgba(150,175,215,0.25)', 4, [10, 10]);
    steps.forEach(([label, at], i) => {
      const p = beat(t, at, 0.45, easeOutBack);
      if (p <= 0) return;
      const x = x0 + (x1 - x0) * (i / (steps.length - 1));
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      const fail = i === steps.length - 1;
      circle(ctx, x, y0, 22, fail ? alpha(C.red, 0.18) : C.blue);
      if (fail) {
        strokeRR(ctx, x - 13, y0 - 13, 26, 26, 6, C.red, 2.6);
        icon(ctx, i === 3 ? 'minus' : 'check', x - 10, y0 - 10, 20, C.red, 3);
      } else {
        icon(ctx, 'check', x - 10, y0 - 10, 20, '#fff', 2.8);
      }
      text(ctx, label, x, y0 + 56, { size: 19, weight: 600, color: fail ? alpha(C.red, 0.95) : C.white, align: 'center', maxWidth: 200 });
      ctx.restore();
    });
    if (stop > 0) {
      ctx.save(); ctx.globalAlpha *= stop;
      chip(ctx, 'চেকআউট অসম্পূর্ণ', 90, 1430, { color: C.red, size: 24 });
      ctx.restore();
    }
    brandWatermark(ctx, t, 0.3);
  },

  abandonAdmin(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 660, w: 968, h: 660 }, vw: 780, vh: 850, enter: 1,
      active: 3, title: 'অসম্পূর্ণ চেকআউট', sub: 'চেকআউট তথ্য সংরক্ষণ (কনফিগারেশন সাপেক্ষে)',
      draw: (c, w, h) => AD.adIncomplete(c, w, h, { p: clamp((t - 0.3) / 1.8), highlight: t > 3 ? 0 : -1, ring: t > 6.9 }),
    });
    const notes = [
      ['নাম, ফোন ও ঠিকানা', 'users', 0.8], ['কোন ধাপে থেমেছেন', 'clock', 2.2], ['তথ্য এডমিনে দেখা যায়', 'list', 4.0],
    ];
    notes.forEach(([label, ic, at], i) => {
      const p = beat(t, at, 0.45, easeOutBack);
      if (p <= 0) return;
      const y = 1344 + i * 66;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      glassPanel(ctx, 476, y, 420, 58, { r: 29, fill: 'rgba(9,15,30,0.9)' });
      icon(ctx, ic, 496, y + 16, 26, C.cyan, 2);
      text(ctx, label, 534, y + 37, { size: 22, weight: 600, color: C.white, maxWidth: 340 });
      ctx.restore();
    });
    text(ctx, 'প্রাইভেসি ও সম্মতি অনুসরণ করে', 96, 1306, { size: 19, weight: 500, color: 'rgba(170,190,220,0.6)' });
    brandWatermark(ctx, t, 0.3);
  },

  abandonContact(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 660, w: 968, h: 620 }, vw: 780, vh: 850, enter: 1,
      active: 3, title: 'কাস্টমারের সঙ্গে যোগাযোগ', draw: (c, w, h) => AD.adIncomplete(c, w, h, { p: 1, ring: t > 0.4 }),
    });
    const p = beat(t, 0.8, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    glassPanel(ctx, 500, 1330, 510, 90, { r: 24, fill: 'rgba(10,17,33,0.94)' });
    circle(ctx, 546, 1375, 24, alpha(C.green, 0.18));
    icon(ctx, 'chat', 530, 1357, 32, C.green, 2);
    text(ctx, 'মেসেজ পাঠিয়ে অর্ডার সম্পন্ন করুন', 586, 1370, { size: 23, weight: 600, color: C.white });
    text(ctx, 'স্বয়ংক্রিয় নয় — প্রয়োজনে ম্যানুয়াল যোগাযোগ', 586, 1398, { size: 18, weight: 500, color: 'rgba(180,200,230,0.7)' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  notEnd(ctx, t, d) {
    const p = beat(t, 0.05, 0.6);
    ctx.save();
    ctx.globalAlpha *= p;
    glowOrb(ctx, W / 2, 900, 520, C.violet, 0.3);
    text(ctx, 'আর এখানেই শেষ নয়', W / 2, 900, { size: 82, weight: 700, color: C.white, align: 'center', maxWidth: 900 });
    const q = beat(t, 0.5, 0.7);
    fillRR(ctx, W / 2 - 120 * q, 950, 240 * q, 4, 2, C.cyan);
    ctx.restore();
    brandWatermark(ctx, t, 0.25);
  },

  retargetTitle(ctx, t, d) {
    const p = beat(t, 0.02, 0.5, easeOutQuint);
    ctx.save();
    glowOrb(ctx, W / 2, 940, 560, C.violet, 0.34);
    const scale = 0.9 + 0.1 * p;
    ctx.translate(W / 2, 940);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -940);
    ctx.globalAlpha *= p;
    text(ctx, 'রিটার্গেটিং', W / 2, 880, { size: 96, weight: 800, color: C.white, align: 'center', maxWidth: 940 });
    text(ctx, 'মার্কেটিং', W / 2, 990, { size: 96, weight: 800, color: C.cyan, align: 'center', maxWidth: 940 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  retargetFlow(ctx, t, d) {
    // storefront events -> tracking layer -> campaign planner
    phoneStage(ctx, t, {
      x: 92, y: 860, scale: 0.88, enter: 1,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.1, cart: 2, activeCat: 1 }),
    });
    const events = [['ভিজিট', 'globe'], ['প্রোডাক্ট ভিউ', 'box'], ['কার্টে যোগ', 'cart']];
    events.forEach(([label, ic], i) => {
      const p = beat(t, 0.6 + i * 0.7, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 900 + i * 110;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 20);
      fillRR(ctx, 420, y, 300, 70, 20, 'rgba(12,20,38,0.92)');
      strokeRR(ctx, 420, y, 300, 70, 20, alpha(C.cyan, 0.35), 1.2);
      icon(ctx, ic, 438, y + 20, 28, C.cyan, 2);
      text(ctx, label, 480, y + 44, { size: 23, weight: 600, color: C.white });
      // animated packet along the line
      const t0 = 0.6 + i * 0.7;
      const q = clamp((t - t0) / 1.2);
      line(ctx, 320, y + 35, 420, y + 35, 'rgba(150,175,215,0.3)', 2, [6, 6]);
      if (q > 0) circle(ctx, 320 + 100 * q, y + 35, 6, C.cyan);
      ctx.restore();
    });
    // tracking panel
    const p = beat(t, 2.4, 0.8, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    glassPanel(ctx, 744, 880, 280, 340, { r: 24, fill: 'rgba(15,24,45,0.94)' });
    text(ctx, 'ট্র্যাকিং লেয়ার', 766, 924, { size: 21, weight: 700, color: C.white });
    [['মেটা পিক্সেল', true], ['কনভার্শন ইভেন্ট', true], ['কাস্টম ইভেন্ট', false]].forEach(([label, on], i) => {
      const y = 950 + i * 66;
      icon(ctx, on ? 'checkCircle' : 'plus', 766, y, 22, on ? C.green : 'rgba(160,180,210,0.6)', 2);
      text(ctx, label, 798, y + 18, { size: 19, weight: 500, color: 'rgba(215,228,248,0.9)', maxWidth: 210 });
    });
    text(ctx, 'ইন্টিগ্রেশন সাপেক্ষে', 766, 1180, { size: 17, weight: 500, color: 'rgba(170,190,220,0.6)' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  retargetAudience(ctx, t, d) {
    const cards = [
      ['প্রোডাক্ট দেখেছেন', 'box', C.cyan],
      ['কার্টে যোগ করেছেন', 'cart', C.blue],
      ['কেনাকাটার আগ্রহ', 'sparkle', C.violet],
    ];
    cards.forEach(([label, ic, color], i) => {
      const p = beat(t, 0.2 + i * 0.45, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 800 + i * 190;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 60, 0);
      glassPanel(ctx, 110, y, 860, 150, { r: 28, fill: 'rgba(13,22,42,0.92)' });
      circle(ctx, 190, y + 75, 40, alpha(color, 0.16));
      icon(ctx, ic, 166, y + 51, 48, color, 1.9);
      text(ctx, label, 258, y + 68, { size: 36, weight: 700, color: C.white });
      text(ctx, 'অডিয়েন্স সেগমেন্ট', 258, y + 104, { size: 22, weight: 500, color: 'rgba(180,200,230,0.7)' });
      // audience bars
      for (let k = 0; k < 3; k++) {
        fillRR(ctx, 660 + k * 90, y + 104 - k * 8, 74, 8 + k * 8, 4, alpha(color, 0.25 + k * 0.18));
      }
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  retargetCampaign(ctx, t, d) {
    // an ad card → previously viewed product → storefront
    const p = beat(t, 0.1, 0.7, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= p;
    glassPanel(ctx, 90, 740, 900, 290, { r: 30, fill: 'rgba(14,22,42,0.94)' });
    chip(ctx, 'স্পনসর্ড • রিটার্গেটিং', 118, 762, { color: C.violet, size: 18, h: 36 });
    fillRR(ctx, 118, 812, 246, 190, 18, '#241E17');
    drawWatch(ctx, 241, 907, 60, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
    text(ctx, 'Heritage Chrono', 392, 868, { size: 32, weight: 700, color: C.white });
    text(ctx, 'আপনি এটি দেখেছিলেন', 392, 906, { size: 22, weight: 500, color: 'rgba(180,200,230,0.8)' });
    text(ctx, '৳4,890', 392, 966, { size: 40, weight: 800, color: C.cyan });
    fillRR(ctx, 690, 930, 260, 60, 30, C.cyan);
    text(ctx, 'আবার দেখুন', 820, 969, { size: 24, weight: 700, color: '#04101F', align: 'center' });
    ctx.restore();
    // path to storefront
    phoneStage(ctx, t, {
      x: 300, y: 1060, scale: 0.72, enter: clamp((t - 1.2) / 1.2),
      draw: (w, h) => SF.sfProduct(ctx, w, h, { feat: 1, disc: '১৮% ছাড়' }),
    });
    const q = beat(t, 2.0, 0.6);
    ctx.save(); ctx.globalAlpha *= q;
    chip(ctx, 'ক্যাম্পেইন চালানো যায়', W / 2, 1480, { align: 'center', color: C.violet, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  retargetLoop(ctx, t, d) {
    // circular journey: visit → leave → ad → return
    const cx = W / 2, cy = 1040, r = 250;
    ctx.save();
    ctx.strokeStyle = alpha(C.blue, 0.3);
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const nodes = [
      ['ভিজিট', 'globe', -Math.PI / 2],
      ['চলে যান', 'arrow', 0],
      ['অ্যাড দেখুন', 'sparkle', Math.PI / 2],
      ['ফিরে আসা', 'cart', Math.PI],
    ];
    nodes.forEach(([label, ic, ang], i) => {
      const p = beat(t, 0.3 + i * 0.5, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      circle(ctx, x, y, 62, 'rgba(12,20,38,0.96)');
      circle(ctx, x, y, 62 * p, 'none');
      ctx.strokeStyle = alpha(i === 3 ? C.green : C.cyan, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 62, 0, Math.PI * 2); ctx.stroke();
      icon(ctx, ic, x - 22, y - 22, 44, i === 3 ? C.green : C.cyan, 1.9);
      text(ctx, label, x, y + 92, { size: 24, weight: 600, color: C.white, align: 'center' });
      ctx.restore();
    });
    // moving dot along the loop
    const ang = -Math.PI / 2 + (t * 0.55) % (Math.PI * 2);
    ctx.save();
    circle(ctx, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 10, alpha(C.cyan, 0.9));
    circle(ctx, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 22, alpha(C.cyan, 0.15));
    ctx.restore();
    text(ctx, 'ফিরিয়ে আনার সুযোগ', cx, cy + 10, { size: 34, weight: 700, color: 'rgba(220,233,255,0.92)', align: 'center' });
    text(ctx, 'নিশ্চিত ফলাফল নয় — সম্ভাবনা', W / 2, 1420, { size: 20, weight: 500, color: 'rgba(170,190,220,0.6)', align: 'center' });
    brandWatermark(ctx, t, 0.3);
  },
};
