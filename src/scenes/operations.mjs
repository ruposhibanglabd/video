/**
 * Scenes 44–56 — courier automation & history, security controls, payments and
 * notification integrations. Every optional capability is shown as qualified.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, easeOutBack, beat,
  lin, text, paragraph, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, chip, line, mix, drawWatch, statusChip,
} from '../render/kit.mjs';
import { L, headline, kicker, accentRule, glassPanel, phoneStage, brandWatermark, chapterCard } from './stage.mjs';
import { adminStage } from './uiStage.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

function qualifiedNote(ctx, str, t, y = 1420) {
  const p = beat(t, 1.2, 0.6);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= p * 0.9;
  icon(ctx, 'shield', 96, y - 22, 24, 'rgba(170,190,220,0.75)', 1.6);
  text(ctx, str, 132, y, { size: 21, weight: 500, color: 'rgba(170,190,220,0.78)', maxWidth: 850 });
  ctx.restore();
}

export const operationsScenes = {
  sectionCourier(ctx, t, d) {
    chapterCard(ctx, t, {
      index: 5, title: 'কুরিয়ার অটোমেশন', sub: 'পার্সেল পাঠানো, ট্র্যাকিং ও ডেলিভারি আপডেট',
      items: ['কনসাইনমেন্ট ও ট্র্যাকিং নম্বর', 'ডেলিভারি ও রিটার্নের হিস্টরি', 'সিদ্ধান্তে সহায়ক পরিসংখ্যান'],
      accent: '#4FD1C5', p: clamp(t / 0.55),
    });
    brandWatermark(ctx, t, 0.25);
  },

  courierJourney(ctx, t, d) {
    const steps = [['অর্ডার প্রস্তুত', 'box'], ['কুরিয়ারে পাঠানো', 'truck'], ['ট্র্যাকিং', 'pin'], ['ডেলিভারি আপডেট', 'checkCircle']];
    // vertical timeline
    steps.forEach(([label, ic], i) => {
      const p = beat(t, 0.3 + i * 0.85, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 840 + i * 150;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 30, 0);
      glassPanel(ctx, 150, y, 780, 112, { r: 26, fill: 'rgba(13,22,42,0.9)' });
      circle(ctx, 210, y + 56, 34, alpha(i === 3 ? C.green : C.cyan, 0.16));
      icon(ctx, ic, 188, y + 34, 44, i === 3 ? C.green : C.cyan, 1.9);
      text(ctx, label, 264, y + 68, { size: 32, weight: 700, color: C.white });
      text(ctx, ['তৈরি হয়েছে', 'কনসাইনমেন্ট', 'লাইভ স্ট্যাটাস', 'ডেলিভারড'][i], 760, y + 68, { size: 21, weight: 500, color: 'rgba(180,200,230,0.7)', align: 'right' });
      if (i < 3) {
        const q = clamp((t - (0.3 + i * 0.85) - 0.3) / 0.5);
        if (q > 0) line(ctx, 210, y + 96, 210, y + 142, alpha(C.cyan, 0.5 * q), 3);
      }
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  courierAdmin(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 640 }, vw: 780, vh: 880, enter: 1,
      active: 5, title: 'কুরিয়ার', sub: 'সমর্থিত কুরিয়ার ইন্টিগ্রেশন সাপেক্ষে',
      draw: (c, w, h) => AD.adCourier(c, w, h, {
        p: clamp((t - 0.3) / 1.6), created: clamp((t - 2.6) / 1.2),
        step: t > 6.4 ? 3 : t > 4.4 ? 2 : 1, package: clamp((t - 1.0) / 0.8),
      }),
    });
    qualifiedNote(ctx, 'কুরিয়ার ইন্টিগ্রেশন ও অনুমতি সাপেক্ষে', t, 1400);
    brandWatermark(ctx, t, 0.3);
  },

  courierHistory(ctx, t, d) {
    // customer courier history table
    glassPanel(ctx, 70, 760, 940, 560, { r: 26, fill: 'rgba(13,22,42,0.94)' });
    text(ctx, 'কাস্টমারের কুরিয়ার হিস্টরি', 100, 812, { size: 30, weight: 700, color: C.white });
    chip(ctx, 'ইন্টিগ্রেশন সাপেক্ষে', 860, 786, { color: C.muted, size: 17, h: 34 });
    const cols = [['তারিখ', 100], ['পার্সেল', 250], ['স্ট্যাটাস', 560], ['রেকর্ড', 760]];
    cols.forEach(([label, x]) => {
      text(ctx, label, x, 880, { size: 20, weight: 600, color: 'rgba(170,190,220,0.7)' });
      line(ctx, 100, 896, 980, 896, 'rgba(130,170,255,0.18)', 1.2);
    });
    const rows = [
      ['১৮ অক্টো', 'AUR-TRK-88214', 'ডেলিভারড', 'green'],
      ['১২ অক্টো', 'AUR-TRK-87102', 'ডেলিভারড', 'green'],
      ['০৫ অক্টো', 'AUR-TRK-86045', 'রিটার্নড', 'red'],
    ];
    rows.forEach(([date, trk, st, tone], i) => {
      const p = beat(t, 0.4 + i * 0.45, 0.55, easeOutBack);
      if (p <= 0) return;
      const y = 940 + i * 108;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 20);
      text(ctx, date, 100, y + 40, { size: 24, weight: 600, color: C.white });
      text(ctx, trk, 250, y + 40, { size: 22, weight: 500, color: 'rgba(200,218,245,0.85)' });
      statusChip(ctx, st, 560, y + 16, tone, { size: 20, h: 44 });
      icon(ctx, 'box', 760, y + 20, 28, 'rgba(170,190,220,0.7)', 1.8);
      line(ctx, 100, y + 76, 980, y + 76, 'rgba(130,170,255,0.12)', 1);
      ctx.restore();
    });
    qualifiedNote(ctx, 'কুরিয়ার হিস্টরি ইন্টিগ্রেশন সমর্থিত হলে', t, 1370);
    brandWatermark(ctx, t, 0.3);
  },

  courierStats(ctx, t, d) {
    const cards = [
      ['ডেলিভারড', 'পার্সেল', C.green, 'checkCircle'],
      ['রিটার্নড', 'পার্সেল', C.red, 'arrow'],
      ['পেন্ডিং', 'পার্সেল', C.amber, 'clock'],
    ];
    cards.forEach(([label, sub, color, ic], i) => {
      const p = beat(t, 0.2 + i * 0.35, 0.6, easeOutBack);
      if (p <= 0) return;
      const x = 70 + i * 320, y = 780;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      glassPanel(ctx, x, y, 300, 260, { r: 24, fill: 'rgba(13,22,42,0.92)' });
      circle(ctx, x + 56, y + 60, 30, alpha(color, 0.16));
      icon(ctx, ic, x + 38, y + 42, 36, color, 2);
      text(ctx, label, x + 24, y + 146, { size: 28, weight: 700, color: C.white });
      text(ctx, sub, x + 24, y + 180, { size: 20, weight: 500, color: 'rgba(180,200,230,0.7)' });
      // neutral illustrative bars
      for (let k = 0; k < 4; k++) fillRR(ctx, x + 24 + k * 62, y + 224 - k * 8, 48, 8 + k * 8, 4, alpha(color, 0.22 + k * 0.14));
      ctx.restore();
    });
    // neutral chart
    glassPanel(ctx, 70, 1080, 940, 250, { r: 26, fill: 'rgba(13,22,42,0.9)' });
    text(ctx, 'ডেলিভারি ও রিটার্ন — নমুনা উপস্থাপনা', 100, 1128, { size: 22, weight: 600, color: 'rgba(200,218,245,0.85)' });
    const base = 1290;
    for (let i = 0; i < 12; i++) {
      const p = beat(t, 0.8 + i * 0.05, 0.5);
      const h = (60 + ((i * 37) % 110)) * p;
      fillRR(ctx, 110 + i * 72, base - h, 44, h, 8, alpha(i % 4 === 3 ? C.red : C.blue, 0.55));
    }
    text(ctx, 'ডেমো ডেটা — প্রকৃত ফলাফল নয়', 100, 1310, { size: 18, weight: 500, color: 'rgba(170,190,220,0.6)' });
    brandWatermark(ctx, t, 0.3);
  },

  securityIntro(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 740, w: 968, h: 580 }, vw: 780, vh: 820, enter: 1,
      active: 8, title: 'নিরাপত্তা', sub: 'সন্দেহজনক কার্যক্রম পর্যালোচনা',
      draw: (c, w, h) => AD.adSecurity(c, w, h, { p: clamp((t - 0.3) / 1.6) }),
    });
    const q = beat(t, 2.4, 0.6);
    ctx.save(); ctx.globalAlpha *= q;
    chip(ctx, 'ভুয়া অর্ডার নিয়ন্ত্রণ — প্রয়োজন অনুযায়ী', W / 2, 1370, { align: 'center', color: C.amber, size: 23 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  securityRules(ctx, t, d) {
    const rules = [
      ['আইপি ভিত্তিক রেট লিমিটিং', 'shield'],
      ['সন্দেহজনক অর্ডার শনাক্তকরণ', 'search'],
      ['ডুপ্লিকেট অর্ডার নিয়ন্ত্রণ', 'list'],
    ];
    rules.forEach(([label, ic], i) => {
      const p = beat(t, 0.2 + i * 0.5, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 820 + i * 160;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 40, 0);
      glassPanel(ctx, 110, y, 860, 124, { r: 26, fill: 'rgba(13,22,42,0.92)' });
      circle(ctx, 186, y + 62, 34, alpha(C.amber, 0.16));
      icon(ctx, ic, 164, y + 40, 44, C.amber, 1.8);
      text(ctx, label, 240, y + 58, { size: 30, weight: 700, color: C.white, maxWidth: 620 });
      text(ctx, 'ঐচ্ছিক ফিচার', 240, y + 92, { size: 20, weight: 500, color: 'rgba(180,200,230,0.68)' });
      ctx.restore();
    });
    qualifiedNote(ctx, 'প্রয়োজন ও স্কোপ অনুযায়ী যুক্ত করা যেতে পারে', t, 1380);
    brandWatermark(ctx, t, 0.3);
  },

  securityQueue(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 620 }, vw: 780, vh: 800, enter: 1,
      active: 8, title: 'রিভিউ কিউ', draw: (c, w, h) => AD.adSecurity(c, w, h, { p: 1 }),
    });
    const states = [['অনুমোদন', C.green], ['রিভিউ', C.amber], ['ব্লক', C.red]];
    states.forEach(([label, color], i) => {
      const p = beat(t, 0.4 + i * 0.35, 0.5, easeOutBack);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      const x = 110 + i * 300;
      fillRR(ctx, x, 1380, 260, 66, 33, alpha(color, 0.16));
      strokeRR(ctx, x, 1380, 260, 66, 33, alpha(color, 0.55), 1.4);
      text(ctx, label, x + 130, 1423, { size: 26, weight: 700, color: C.white, align: 'center' });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  sectionPayments(ctx, t, d) {
    chapterCard(ctx, t, {
      index: 7, title: 'পেমেন্ট ম্যানেজমেন্ট', sub: 'COD • অ্যাডভান্স • পেমেন্ট গেটওয়ে',
      items: ['ক্যাশ অন ডেলিভারি ও অ্যাডভান্স', 'সমর্থিত গেটওয়ে ইন্টিগ্রেশন', 'পেমেন্ট স্ট্যাটাস ও হিসাব'],
      accent: C.green, p: clamp(t / 0.5),
    });
    brandWatermark(ctx, t, 0.25);
  },

  paymentMethods(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 720, w: 968, h: 600 }, vw: 780, vh: 840, enter: 1,
      active: 6, title: 'পেমেন্ট', sub: 'পদ্ধতি ও স্ট্যাটাস',
      draw: (c, w, h) => AD.adPayments(c, w, h, { p: clamp((t - 0.3) / 1.6) }),
    });
    const items = [['ক্যাশ অন ডেলিভারি', 'cash'], ['অ্যাডভান্স পেমেন্ট', 'wallet'], ['সমর্থিত গেটওয়ে', 'card']];
    items.forEach(([label, ic], i) => {
      const p = beat(t, 0.4 + i * 0.35, 0.5, easeOutBack);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      const x = 90 + i * 318;
      glassPanel(ctx, x, 1360, 300, 76, { r: 38, fill: 'rgba(10,17,33,0.94)' });
      icon(ctx, ic, x + 20, 1378, 30, C.green, 1.9);
      text(ctx, label, x + 62, 1408, { size: 21, weight: 600, color: C.white, maxWidth: 226 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  paymentReconcile(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 640 }, vw: 780, vh: 850, enter: 1,
      active: 6, title: 'পেমেন্ট রিকনসিলিয়েশন', draw: (c, w, h) => AD.adPayments(c, w, h, { p: clamp((t - 0.3) / 1.8) }),
    });
    qualifiedNote(ctx, 'ইন্টিগ্রেশন ও অনুমতি থাকলে', t, 1400);
    brandWatermark(ctx, t, 0.3);
  },

  telegramEmail(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 730, w: 968, h: 560 }, vw: 780, vh: 800, enter: 1,
      active: 9, title: 'ইন্টিগ্রেশন', sub: 'প্রয়োজন অনুযায়ী যুক্ত করা যেতে পারে',
      draw: (c, w, h) => AD.adIntegrations(c, w, h, { p: clamp((t - 0.3) / 1.6), toast: clamp((t - 3.4) / 0.6) }),
    });
    // telegram-style message card
    const p = beat(t, 1.4, 0.7, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    ctx.translate((1 - p) * 80, 0);
    glassPanel(ctx, 120, 1330, 520, 106, { r: 22, fill: 'rgba(13,30,48,0.96)' });
    circle(ctx, 164, 1382, 24, alpha(C.cyan, 0.2));
    icon(ctx, 'chat', 150, 1368, 28, C.cyan, 2);
    text(ctx, 'Telegram Bot', 200, 1372, { size: 22, weight: 700, color: C.white });
    text(ctx, 'নতুন অর্ডার #AUR-1052 • ৳4,960', 200, 1402, { size: 19, weight: 500, color: 'rgba(190,215,240,0.85)' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  notifyFast(ctx, t, d) {
    phoneStage(ctx, t, {
      x: 300, y: 860, scale: 1.0, enter: 1,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.06, cart: 1, activeCat: 1 }),
    });
    const p = beat(t, 0.4, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    SF.floatingToast(ctx, 540, 900, 490, 'নতুন অর্ডার', '#AUR-1053 • ৳4,220', { iconName: 'bell', tone: C.cyan, dark: true });
    ctx.restore();
    const q = beat(t, 1.6, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= q;
    SF.floatingToast(ctx, 120, 1330, 520, 'ইমেইল নোটিফিকেশন', 'অর্ডার আপডেট পাঠানো হয়েছে', { iconName: 'mail', tone: C.green, dark: true });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },
};
