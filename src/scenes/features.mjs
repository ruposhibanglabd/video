/**
 * Scenes 14–26 — storefront detail, checkout, admin panel, product/category
 * management, content editing and campaign landing pages.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, easeOutBack, beat,
  lin, text, eyebrow, rr, fillRR, strokeRR, circle, shadow, noShadow, icon, fontStr,
  glowOrb, lightSweep, chip, line, mix, drawWatch, statusChip, brandMark, paragraph,
} from '../render/kit.mjs';
import { L, headline, kicker, accentRule, glassPanel, phoneStage, brandWatermark, seq, chapterCard } from './stage.mjs';
import { adminStage } from './uiStage.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

function stepRail(ctx, t, steps, { active = 0, y = 1560, x0 = 120, w = 840 } = {}) {
  const n = steps.length;
  const gap = w / (n - 1);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * gap;
    const done = i < active;
    const cur = i === active;
    const p = beat(t, 0.1 + i * 0.12, 0.4);
    ctx.globalAlpha *= clamp(p);
    circle(ctx, cx, y, cur ? 11 : 8, cur ? C.cyan : done ? alpha(C.cyan, 0.9) : 'rgba(150,175,215,0.35)');
    if (i < n - 1) line(ctx, cx + 14, y, cx + gap - 14, y, i < active ? alpha(C.cyan, 0.6) : 'rgba(150,175,215,0.25)', 2);
    text(ctx, steps[i], cx, y + 34, { size: 19, weight: cur ? 700 : 500, color: cur ? C.white : 'rgba(180,198,226,0.6)', align: 'center' });
  }
  ctx.restore();
}

export const featureScenes = {
  storefrontWalk(ctx, t, d) {
    const S = seq(t, [
      { at: 0, fn: (c, w, h, o) => SF.sfHome(c, w, h, { scroll: 0.03 + 0.3 * clamp(t / 5), cart: 0, activeCat: 1, tapCat: 1, tapCatP: clamp((t - 2.4) / 0.5) }) },
      { at: 4.6, fn: (c, w, h) => SF.sfCategories(c, w, h, { p: 1 }) },
      { at: 6.2, fn: (c, w, h) => SF.sfSearch(c, w, h, { p: clamp((t - 6.3) / 1.4) }) },
      { at: 9.0, fn: (c, w, h) => SF.sfProduct(c, w, h, { zoom: clamp((t - 9.0) / 3), feat: clamp((t - 9.3) / 1.5), thumb: t > 10.4 ? 1 : 0 }) },
    ]);
    const z = 1 + 0.04 * clamp(t / d);
    ctx.save();
    ctx.translate(W / 2, 980);
    ctx.scale(z, z);
    ctx.translate(-W / 2, -980);
    phoneStage(ctx, t, { x: 200, y: 556, scale: 1.16, enter: 1, draw: (w, h) => S.draw(ctx, w, h) });
    ctx.restore();
    // callouts
    const calls = [
      ['ক্যাটাগরি ব্রাউজ', 'grid', 0.3], ['সার্চ', 'search', 6.2], ['ছবি, দাম ও তথ্য', 'tag', 9.0],
    ];
    calls.forEach(([label, ic, at], i) => {
      const p = beat(t, at, 0.5, easeOutBack);
      if (p <= 0) return;
      const y = 700 + i * 96;
      ctx.save(); ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 34, 0);
      glassPanel(ctx, 712, y, 306, 62, { r: 31, fill: 'rgba(9,15,30,0.9)' });
      icon(ctx, ic, 730, y + 17, 26, C.cyan, 2);
      text(ctx, label, 770, y + 40, { size: 23, weight: 600, color: C.white, maxWidth: 236 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.0);
  },

  checkoutFlow(ctx, t, d) {
    const S = seq(t, [
      { at: 0, fn: (c, w, h) => SF.sfProduct(c, w, h, { addToCart: clamp(t / 0.8), feat: 1, disc: '১৮% ছাড়' }) },
      { at: 1.5, fn: (c, w, h) => SF.sfCart(c, w, h, { enter: clamp((t - 1.5) / 0.8), checkout: clamp((t - 3.4) / 0.6) }) },
      { at: 3.9, fn: (c, w, h) => SF.sfCheckout(c, w, h, { fill: clamp((t - 4.0) / 2.4), confirm: clamp((t - 7.1) / 0.6), paySel: 0 }) },
      { at: 7.5, fn: (c, w, h) => SF.sfConfirm(c, w, h, { p: clamp((t - 7.5) / 1.2) }) },
    ]);
    phoneStage(ctx, t, { x: 206, y: 548, scale: 1.17, enter: 1, draw: (w, h) => S.draw(ctx, w, h) });
    // flow pills
    const labels = [['কার্টে যোগ', 'cart'], ['চেকআউট', 'edit'], ['অর্ডার সম্পন্ন', 'checkCircle']];
    labels.forEach(([label, ic], i) => {
      const active = (i === 0 && t < 1.6) || (i === 1 && t >= 1.6 && t < 7.4) || (i === 2 && t >= 7.4);
      const p = beat(t, 0.2 + i * 0.2, 0.5);
      const y = 1150 + i * 100;
      ctx.save();
      ctx.globalAlpha *= p;
      fillRR(ctx, 716, y, 300, 62, 31, active ? 'rgba(40,123,255,0.22)' : 'rgba(12,20,38,0.78)');
      strokeRR(ctx, 716, y, 300, 62, 31, active ? alpha(C.cyan, 0.7) : 'rgba(130,170,255,0.18)', active ? 2 : 1.2);
      circle(ctx, 748, y + 31, 17, active ? C.cyan : 'rgba(120,150,210,0.2)');
      icon(ctx, ic, 736, y + 20, 24, active ? '#04101F' : 'rgba(200,218,245,0.7)', 2.2);
      text(ctx, label, 780, y + 40, { size: 22, weight: active ? 700 : 500, color: active ? C.white : 'rgba(200,218,245,0.7)' });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.0);
  },

  adminBridge(ctx, t, d) {
    const p = easeInOut(clamp((t - 0.3) / 1.4));
    phoneStage(ctx, t, {
      x: 56, y: 884, scale: 0.76, enter: 1, float: false,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.22, cart: 1, activeCat: 1 }),
    });
    adminStage(ctx, t, {
      box: { x: 424, y: 832, w: 600, h: 472 }, vw: 780, vh: 560, enter: clamp((t - 0.8) / 1.0),
      active: 0, title: 'ড্যাশবোর্ড', draw: (c, w, h) => AD.adDashboard(c, w, h, { p: clamp((t - 1.4) / 1.8) }),
      showChrome: true, scale: 1.0,
    });
    const cp = beat(t, 1.4, 0.8);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= cp;
      line(ctx, 380, 1156, 424, 1156, alpha(C.cyan, 0.5), 3, [10, 8]);
      circle(ctx, 398, 1156, 20, alpha(C.blue, 0.32));
      icon(ctx, 'arrow', 388, 1146, 20, C.cyan, 2.2);
      ctx.restore();
    }
    brandWatermark(ctx, t, 0.3);
  },

  modulesIntro(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 660 }, vw: 780, vh: 860, panY: clamp((t - 4.4) / 3) * 0.5,
      enter: clamp(t / 0.9), active: 0, title: 'ড্যাশবোর্ড',
      draw: (c, w, h) => AD.adDashboard(c, w, h, { p: clamp((t - 0.6) / 2.4) }),
    });
    const mods = [['প্রোডাক্ট', 'box'], ['অর্ডার', 'list'], ['স্টক', 'chart'], ['কাস্টমার', 'users'], ['বিক্রি', 'cash']];
    mods.forEach(([label, ic], i) => {
      const p = beat(t, 1.6 + i * 0.16, 0.5, easeOutBack);
      if (p <= 0) return;
      const x = 92 + i * 180, y = 1392;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 20);
      fillRR(ctx, x, y, 164, 58, 29, 'rgba(12,20,38,0.9)');
      strokeRR(ctx, x, y, 164, 58, 29, alpha(C.blue, 0.4), 1.2);
      icon(ctx, ic, x + 16, y + 16, 24, C.cyan, 1.9);
      text(ctx, label, x + 52, y + 38, { size: 23, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  onePlace(ctx, t, d) {
    adminStage(ctx, t, {
      box: { x: 56, y: 620, w: 968, h: 720 }, vw: 780, vh: 900, enter: 1, panY: 0.35,
      active: 0, title: 'ড্যাশবোর্ড', draw: (c, w, h) => AD.adDashboard(c, w, h, { p: 1 }),
    });
    const p = beat(t, 0.2, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= p;
    chip(ctx, 'এক জায়গা থেকে পরিচালনা', W / 2, 1380, { align: 'center', color: C.green, size: 26 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  productMgmt(ctx, t, d) {
    const modal = t > 2.0 && t < 8.6;
    const saved = t > 7.6 && t < 8.6;
    adminStage(ctx, t, {
      box: { x: 56, y: 700, w: 968, h: 620 }, vw: 760, vh: 820, enter: 1,
      active: 1, title: 'প্রোডাক্ট', sub: 'প্রোডাক্ট ও ক্যাটাগরি ব্যবস্থাপনা',
      panY: 0,
      draw: (c, w, h) => {
        if (t < 8.8) {
          AD.adProducts(c, w, h, {
            p: clamp((t - 0.2) / 1.2), addGlow: t > 1.2 && t < 2.2,
            modal: modal ? clamp((t - 2.0) / 0.5) : 0,
            typing: clamp((t - 2.8) / 2.0), saved: saved, savedP: clamp((t - 7.6) / 0.4),
            highlight: t > 7.4 ? 0 : -1,
          });
        } else {
          AD.adCategories(c, w, h, {
            p: clamp((t - 8.8) / 1.0), editIndex: t > 10.4 ? 0 : -1,
            deleteIndex: t > 12.4 ? 2 : -1, deleteP: clamp((t - 12.4) / 0.8),
            newCatP: t > 11.4 ? clamp((t - 11.4) / 1.2) : 0,
          });
        }
      },
    });
    // annotation chips
    const notes = [
      [1.4, 'নতুন প্রোডাক্ট যোগ'],
      [3.2, 'ছবি ও দাম পরিবর্তন'],
      [9.2, 'ক্যাটাগরি তৈরি'],
      [12.4, 'এডিট বা ডিলিট'],
    ];
    notes.forEach(([at, label], i) => {
      const p = beat(t, at, 0.45, easeOutBack);
      if (p <= 0 || t > at + 2.4) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * clamp((at + 2.4 - t) / 0.4);
      fillRR(ctx, 90, 1372, 400, 58, 29, 'rgba(10,17,33,0.9)');
      strokeRR(ctx, 90, 1372, 400, 58, 29, alpha(C.cyan, 0.4), 1.2);
      icon(ctx, 'check', 110, 1386, 26, C.cyan, 2.6);
      text(ctx, label, 150, 1410, { size: 24, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  contentMgmt(ctx, t, d) {
    const tap = t < 2.2 ? 0 : t < 4.6 ? 1 : t < 6.8 ? 2 : 3;
    adminStage(ctx, t, {
      box: { x: 56, y: 690, w: 968, h: 660 }, vw: 760, vh: 840, enter: 1,
      active: 0, title: 'কনটেন্ট', sub: 'লোগো • ব্যানার • প্রোডাক্ট • কনটেন্ট',
      draw: (c, w, h) => AD.adContent(c, w, h, {
        tap, saved: t > 7.4 ? clamp((t - 7.4) / 0.5) : 0,
        bannerHue: clamp((t - 4.0) / 2.5), bannerLight: clamp((t - 6.0) / 2),
      }),
    });
    const chipStates = [['লোগো বদলান', 'logo'], ['ব্যানার আপডেট', 'banner'], ['নতুন প্রোডাক্ট', 'plus'], ['কনটেন্ট সম্পাদনা', 'edit']];
    const activeTap = t < 2.2 ? 0 : t < 4.6 ? 1 : t < 6.8 ? 2 : 3;
    const cw2 = 218;
    chipStates.forEach(([label, ic], i) => {
      const x = 76 + i * (cw2 + 12);
      const act = i === activeTap;
      ctx.save();
      ctx.globalAlpha *= act ? 1 : 0.6;
      fillRR(ctx, x, 1400, cw2, 56, 28, act ? 'rgba(40,123,255,0.26)' : 'rgba(12,20,38,0.9)');
      strokeRR(ctx, x, 1400, cw2, 56, 28, act ? alpha(C.cyan, 0.7) : 'rgba(130,170,255,0.2)', act ? 2 : 1.2);
      icon(ctx, ic, x + 16, 1416, 24, act ? C.cyan : 'rgba(200,218,245,0.8)', 1.9);
      text(ctx, label, x + 50, 1436, { size: 20, weight: 600, color: C.white, maxWidth: cw2 - 60 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  editPreviewSave(ctx, t, d) {
    const step = t < 1.3 ? 0 : t < 2.6 ? 1 : 2;
    const steps = [['এডিট', 'edit'], ['প্রিভিউ', 'grid'], ['সেভ', 'check']];
    steps.forEach(([label, ic], i) => {
      const act = i === step;
      const p = beat(t, 0.1 + i * 0.15, 0.5, easeOutBack);
      const x = 90 + i * 310;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      fillRR(ctx, x, 760, 270, 120, 26, act ? 'rgba(40,123,255,0.22)' : 'rgba(12,20,38,0.85)');
      strokeRR(ctx, x, 760, 270, 120, 26, act ? C.cyan : 'rgba(130,170,255,0.22)', act ? 2.2 : 1.2);
      circle(ctx, x + 60, 820, 30, act ? C.cyan : 'rgba(120,150,210,0.18)');
      icon(ctx, ic, x + 45, 805, 30, act ? '#04101F' : 'rgba(200,218,245,0.75)', 2.2);
      text(ctx, label, x + 104, 834, { size: 32, weight: 700, color: act ? C.white : 'rgba(200,218,245,0.72)' });
      ctx.restore();
      if (i < 2) {
        const q = beat(t, 0.3 + i * 0.15, 0.4);
        ctx.save(); ctx.globalAlpha *= q * 0.8;
        line(ctx, x + 282, 820, x + 296, 820, alpha(C.cyan, 0.6), 2.4, [6, 6]);
        ctx.restore();
      }
    });
    phoneStage(ctx, t, {
      x: 250, y: 940, scale: 1.02, enter: 1,
      draw: (w, h) => SF.sfHome(ctx, w, h, {
        scroll: 0.02, cart: 1, activeCat: 2,
        tapCat: step === 1 ? 2 : -1, tapCatP: clamp((t - 1.4) / 0.6),
      }),
    });
    if (step === 2) {
      const p = beat(t, 2.6, 0.5, easeOutBack);
      ctx.save(); ctx.globalAlpha *= p;
      fillRR(ctx, 690, 1290, 300, 66, 33, 'rgba(24,184,135,0.2)');
      strokeRR(ctx, 690, 1290, 300, 66, 33, alpha(C.green, 0.6), 1.6);
      icon(ctx, 'checkCircle', 710, 1304, 30, C.green, 2);
      text(ctx, 'সেভ হয়েছে', 756, 1332, { size: 26, weight: 700, color: C.white });
      ctx.restore();
    }
    brandWatermark(ctx, t, 0.3);
  },

  landingIntro(ctx, t, d) {
    // ad creative -> landing page
    const p = easeInOut(clamp((t - 0.9) / 1.5));
    // left: ad card
    ctx.save();
    ctx.globalAlpha *= 1 - p * 0.25;
    glassPanel(ctx, 56, 800, 420, 470, { r: 24, fill: 'rgba(15,24,45,0.96)', glow: C.blue });
    text(ctx, 'বিজ্ঞাপন ক্রিয়েটিভ', 86, 848, { size: 21, weight: 600, color: alpha(C.cyan, 0.9), letterSpacing: 1.2 });
    fillRR(ctx, 82, 872, 368, 250, 16, '#241E17');
    drawWatch(ctx, 266, 986, 74, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
    fillRR(ctx, 82, 1140, 240, 14, 7, 'rgba(255,255,255,0.3)');
    fillRR(ctx, 82, 1166, 170, 12, 6, 'rgba(255,255,255,0.18)');
    fillRR(ctx, 82, 1198, 132, 42, 21, 'rgba(217,190,143,0.92)');
    ctx.restore();
    // arrow
    const ap = beat(t, 1.2, 0.6);
    ctx.save(); ctx.globalAlpha *= ap;
    icon(ctx, 'arrow', 520, 990, 40, C.cyan, 2);
    text(ctx, 'ল্যান্ডিং পেজ', 500, 1072, { size: 21, weight: 600, color: alpha(C.cyan, 0.9), align: 'center' });
    ctx.restore();
    phoneStage(ctx, t, {
      x: 600, y: 720, scale: 0.98, enter: clamp((t - 1.0) / 1.2),
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: clamp((t - 1.6) / 1.6) }),
    });
    brandWatermark(ctx, t, 0.3);
  },

  landingUnlimited(ctx, t, d) {
    const variants = [2, 0, 1];
    variants.forEach((variant, i) => {
      const p = beat(t, 0.1 + i * 0.16, 0.7, easeOutBack);
      if (p <= 0) return;
      const x = 84 + i * 108, y = 790 + i * 40;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * (i === 2 ? 1 : 0.8);
      ctx.translate(0, (1 - p) * 40);
      shadow(ctx, 'rgba(0,0,0,0.55)', 50, 20);
      fillRR(ctx, x, y, 470, 600, 24, 'rgba(15,24,45,0.97)');
      noShadow(ctx);
      strokeRR(ctx, x, y, 470, 600, 24, i === 2 ? alpha(C.cyan, 0.6) : 'rgba(140,180,255,0.28)', i === 2 ? 2 : 1.2);
      ctx.save();
      rr(ctx, x, y, 470, 600, 24); ctx.clip();
      ctx.translate(x, y);
      const sc = 470 / 390;
      ctx.scale(sc, sc);
      SF.sfLanding(ctx, 390, 600 / sc, variant);
      ctx.restore();
      ctx.restore();
    });
    const p2 = beat(t, 0.8, 0.7, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= p2;
    ctx.translate(0, (1 - p2) * 20);
    glassPanel(ctx, 96, 1432, 640, 72, { r: 36, fill: 'rgba(10,17,33,0.94)' });
    icon(ctx, 'sparkle', 118, 1450, 32, C.cyan);
    text(ctx, 'প্রতিটি ক্যাম্পেইনের জন্য আলাদা পেজ', 162, 1477, { size: 24, weight: 600, color: C.white, maxWidth: 560 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  landingThree(ctx, t, d) {
    const items = [
      ['নতুন প্রোডাক্ট', 1, 'পণ্য লঞ্চ'],
      ['বিশেষ অফার', 0, 'অফার'],
      ['বিজ্ঞাপন ক্যাম্পেইন', 2, 'ক্যাম্পেইন'],
    ];
    items.forEach(([label, variant, tag], i) => {
      const p = beat(t, 0.2 + i * 0.5, 0.7, easeOutBack);
      if (p <= 0) return;
      const x = 62 + i * 320, y = 780 + i * 34;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 50);
      fillRR(ctx, x, y, 300, 470, 22, 'rgba(12,20,38,0.95)');
      strokeRR(ctx, x, y, 300, 470, 22, alpha(C.cyan, 0.35), 1.4);
      ctx.save();
      rr(ctx, x, y, 300, 470, 22); ctx.clip();
      ctx.translate(x, y);
      const s = 300 / 390;
      ctx.scale(s, s);
      SF.sfLanding(ctx, 390, 470 / s, variant);
      ctx.restore();
      chip(ctx, tag, x + 14, y + 430, { color: C.cyan, size: 17, h: 32 });
      ctx.restore();
    });
    const p = beat(t, 2.0, 0.6, easeOutBack);
    ctx.save(); ctx.globalAlpha *= p;
    chip(ctx, 'প্রতিটি ক্যাম্পেইনের জন্য আলাদা পেজ', W / 2, 1430, { align: 'center', color: C.cyan, size: 24 });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  landingDetail(ctx, t, d) {
    phoneStage(ctx, t, {
      x: 110, y: 700, scale: 1.04, enter: 1,
      draw: (w, h) => SF.sfLanding(ctx, w, h, 0, { p: clamp(t / 2) }),
    });
    const notes = [
      ['আকর্ষণীয় ব্যানার', 'globe', 0.4, 780],
      ['প্রোডাক্টের বিবরণ', 'box', 2.4, 950],
      ['বিশেষ অফার', 'tag', 4.4, 1120],
      ['সরাসরি অর্ডার', 'cart', 6.2, 1290],
    ];
    notes.forEach(([label, ic, at, y], i) => {
      const p = beat(t, at, 0.5, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 40, 0);
      glassPanel(ctx, 610, y, 380, 66, { r: 33, fill: 'rgba(9,15,30,0.92)' });
      circle(ctx, 646, y + 33, 20, alpha(C.cyan, 0.18));
      icon(ctx, ic, 633, y + 20, 26, C.cyan, 2);
      text(ctx, label, 682, y + 43, { size: 23, weight: 600, color: C.white, maxWidth: 290 });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= clamp(p) * 0.6;
      line(ctx, 604, y + 33, 596, y + 33, alpha(C.cyan, 0.8), 2);
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.0);
  },

  marketingStrategy(ctx, t, d) {
    // strategy board mapping ads -> landing pages, no invented results
    glassPanel(ctx, 90, 740, 900, 600, { r: 28, fill: 'rgba(12,20,38,0.88)' });
    text(ctx, 'ক্যাম্পেইন কাঠামো', 122, 792, { size: 28, weight: 700, color: C.white });
    const cols = [['বিজ্ঞাপন', C.violet], ['ল্যান্ডিং পেজ', C.blue], ['ব্যবসার লক্ষ্য', C.green]];
    cols.forEach(([label, color], i) => {
      const x = 150 + i * 280;
      text(ctx, label, x, 850, { size: 21, weight: 600, color: alpha(color, 0.95) });
      line(ctx, x - 10, 866, x + 210, 866, alpha(color, 0.4), 1.4);
    });
    const rows = [
      ['নতুন পণ্য', 'প্রোডাক্ট পেজ', 'অর্ডার নেওয়া'],
      ['অফার', 'অফার পেজ', 'আগ্রহ তৈরি'],
      ['ক্যাম্পেইন', 'কাস্টম পেজ', 'যোগাযোগ'],
    ];
    rows.forEach((row, i) => {
      const p = beat(t, 0.7 + i * 0.5, 0.6, easeOutBack);
      if (p <= 0) return;
      const y = 910 + i * 120;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      fillRR(ctx, 120, y, 840, 92, 18, 'rgba(20,32,56,0.8)');
      row.forEach((cell, k) => {
        const x = 150 + k * 280;
        fillRR(ctx, x - 8, y + 22, 210, 48, 12, alpha(cols[k][1], 0.26));
        strokeRR(ctx, x - 8, y + 22, 210, 48, 12, alpha(cols[k][1], 0.5), 1);
        text(ctx, cell, x + 6, y + 54, { size: 20, weight: 600, color: '#FFFFFF', maxWidth: 190 });
        if (k < 2) {
          icon(ctx, 'arrow', x + 220, y + 36, 20, alpha(cols[k][1], 0.9), 2);
        }
      });
      ctx.restore();
    });
    const p = beat(t, 2.6, 0.6);
    ctx.save(); ctx.globalAlpha *= p;
    text(ctx, 'কোনো নির্দিষ্ট ফলাফলের প্রতিশ্রুতি নয় — পরিকল্পনা ও সেটআপ', 90, 1400, { size: 20, weight: 500, color: 'rgba(170,190,220,0.62)' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },
};
