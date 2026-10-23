/**
 * Scenes 27–37 — order management, reporting, and recovering incomplete
 * checkouts.
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

export const orderScenes = {
  /* 27 — chapter: orders */
  sectionOrders(ctx, t, d, s) {
    chapterCard(ctx, t, { n: 3, title: 'অর্ডার\nম্যানেজমেন্ট', sub: 'নতুন অর্ডার থেকে ডেলিভারি পর্যন্ত', tone: 'dark', accent: P.dark.cyan, p: beat(t, 0, 0.6) });
  },

  /* 28 — a new order arrives */
  orderIncoming(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 640, w: 968, vw: 1000, vh: 700, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/orders',
      draw: (w, h) => AD.adOrders(ctx, w, h, { p: clamp(t / 1.6), highlight: t > 1.6 ? 0 : -1 }),
    });

    // notification drops in over the table
    const np = beat(t, 1.1, 0.7, easeOutQuint);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(np);
      ctx.translate(0, (1 - np) * -40);
      shadow(ctx, 'rgba(60,44,20,0.22)', 50, 22);
      fillRR(ctx, 520, 700, 440, 124, 24, '#FFFFFF');
      noShadow(ctx);
      strokeRR(ctx, 520, 700, 440, 124, 24, 'rgba(176,138,87,0.4)', 1.6);
      fillRR(ctx, 544, 724, 52, 52, 16, 'rgba(30,158,116,0.14)');
      icon(ctx, 'bell', 556, 736, 28, '#1E9E74', 2);
      text(ctx, 'নতুন অর্ডার', 616, 752, { size: 24, weight: 700, color: P.light.ink });
      text(ctx, '#AUR-1048 • ৳4,960', 616, 784, { size: 20, weight: 500, color: P.light.muted });
      circle(ctx, 922, 732, 8, '#1E9E74');
      // tap ripple
      const tp = clamp((t - 1.9) / 0.6);
      if (tp > 0 && tp < 1) {
        ctx.strokeStyle = `rgba(176,138,87,${0.6 * (1 - tp)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(900, 780, 10 + 26 * tp, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }

    callout(ctx, br.x + br.w * 0.62, br.y + br.h * 0.5, 'সব অর্ডার এক তালিকায়', t, {
      dx: -240, dy: 90, tone, delay: 1.5, size: 21, align: 'left',
    });
  },

  /* 29 — order detail */
  orderDetail(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 590, w: 940, vw: 1020, vh: 700, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/orders/AUR-1048',
      draw: (w, h) => AD.adOrderDetail(ctx, w, h, { p: clamp((t - 0.2) / 1.8) }),
    });

    // data chips surface one by one
    const data = [
      ['users', 'নাম', 'রাফিদ হাসান'],
      ['phone', 'মোবাইল', '01712-345678'],
      ['pin', 'ঠিকানা', 'ধানমন্ডি, ঢাকা'],
      ['box', 'পণ্য', 'হেরিটেজ ক্রোনো × ১'],
    ];
    data.forEach(([ic, label, val], i) => {
      const p = beat(t, 1.5 + i * 0.22, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 1400 + (i % 2) * 92;
      const x = 92 + Math.floor(i / 2) * 456;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 26);
      lightCard(ctx, x, y, 432, 78, { r: 20, lift: 0.85 });
      fillRR(ctx, x + 14, y + 16, 48, 48, 15, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, x + 24, y + 26, 28, P.light.goldDeep, 1.9);
      text(ctx, label, x + 76, y + 32, { size: 17, weight: 500, color: P.light.muted });
      text(ctx, val, x + 76, y + 60, { size: 21, weight: 700, color: P.light.ink, maxWidth: 340 });
      ctx.restore();
    });

    // total stamp
    const tp = beat(t, 2.5, 0.7, easeOutBack);
    if (tp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(tp);
      ctx.translate(0, (1 - tp) * 26);
      lightCard(ctx, 92, 1600, 892, 128, { r: 26, lift: 1.05 });
      text(ctx, 'পণ্য + ডেলিভারি চার্জ', 124, 1656, { size: 22, weight: 500, color: P.light.muted });
      text(ctx, 'মোট', 124, 1698, { size: 26, weight: 700, color: P.light.ink });
      text(ctx, '৳4,960', 956, 1696, { size: 52, weight: 800, color: P.light.ink, align: 'right' });
      ctx.restore();
    }
  },

  /* 30 — status pipeline */
  orderStatus(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 78, maxWidth: 920 });

    // dimmed orders table behind
    ctx.save();
    ctx.globalAlpha = 0.28;
    browser(ctx, t, {
      y: 600, w: 968, vw: 1000, vh: 700, enter: 1, tone, url: 'admin.aurum.shop/orders',
      draw: (w, h) => AD.adOrders(ctx, w, h, { p: 1 }),
    });
    ctx.restore();

    // floating pipeline card
    const stages = ['পেন্ডিং', 'কনফার্ম', 'প্রসেসিং', 'শিপড', 'ডেলিভারড'];
    const active = Math.min(stages.length - 1, Math.floor(clamp((t - 1.0) / 4.2) * stages.length));
    lightCard(ctx, 74, 760, 932, 320, { r: 32, lift: 1.1 });
    text(ctx, '#AUR-1048 · অর্ডার স্ট্যাটাস', 108, 818, { size: 22, weight: 600, color: P.light.muted });
    // rail
    const x0 = 140, x1 = 940, y = 920;
    ctx.strokeStyle = 'rgba(20,23,29,0.10)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    const lit = clamp(active / (stages.length - 1));
    ctx.strokeStyle = P.light.goldDeep;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, lit), y); ctx.stroke();
    stages.forEach((label, i) => {
      const p = beat(t, 0.6 + i * 0.12, 0.5, easeOutQuint);
      if (p <= 0) return;
      const x = lerp(x0, x1, i / (stages.length - 1));
      const on = i <= active;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      circle(ctx, x, y, on ? 18 : 13, on ? P.light.goldDeep : '#FFFFFF');
      ctx.strokeStyle = on ? P.light.goldDeep : 'rgba(20,23,29,0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, on ? 18 : 13, 0, Math.PI * 2); ctx.stroke();
      if (on) {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - 6, y + 1); ctx.lineTo(x - 2, y + 5); ctx.lineTo(x + 7, y - 5); ctx.stroke();
      }
      text(ctx, label, x, y + 52, { size: i === active ? 21 : 19, weight: on ? 700 : 500, color: on ? P.light.ink : P.light.muted, align: 'center', maxWidth: 170 });
      ctx.restore();
    });

    // order card travels along the rail
    const travel = clamp((t - 1.0) / 4.2);
    const cx = lerp(x0, x1, clamp(travel * 1.0));
    ctx.save();
    shadow(ctx, 'rgba(60,44,20,0.25)', 30, 12);
    fillRR(ctx, cx - 66, 828, 132, 58, 16, '#FFFFFF');
    noShadow(ctx);
    strokeRR(ctx, cx - 66, 828, 132, 58, 16, 'rgba(176,138,87,0.5)', 1.4);
    icon(ctx, 'list', cx - 52, 842, 24, P.light.goldDeep, 2);
    text(ctx, '#1048', cx - 20, 864, { size: 21, weight: 700, color: P.light.ink });
    ctx.restore();

    // bottom: swipe chips for filter
    const chips = ['সব', 'পেন্ডিং', 'কনফার্ম', 'শিপড', 'ডেলিভারড'];
    chips.forEach((c, i) => {
      const p = beat(t, 1.4 + i * 0.1, 0.5, easeOutBack);
      if (p <= 0) return;
      const x = 108 + i * 172;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      fillRR(ctx, x, 1180, 156, 56, 28, i === active % chips.length ? P.light.ink : '#FFFFFF');
      strokeRR(ctx, x, 1180, 156, 56, 28, i === active % chips.length ? P.light.ink : P.light.cardLine, 1.2);
      text(ctx, c, x + 78, 1215, { size: 20, weight: 600, color: i === active % chips.length ? '#fff' : P.light.ink2, align: 'center' });
      ctx.restore();
    });
    pill(ctx, W / 2, 1320, 'এক ট্যাপে স্ট্যাটাস বদলান', { tone, align: 'center', iconName: 'checkCircle', p: beat(t, 2.6, 0.6, easeOutBack), size: 21 });
  },

  /* 31 — filtering */
  orderFilter(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const tab = Math.min(3, Math.floor(clamp((t - 0.6) / 1.4)));
    const br = browser(ctx, t, {
      y: 660, w: 968, vw: 1000, vh: 660, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/orders',
      draw: (w, h) => AD.adOrders(ctx, w, h, { p: 1, tab }),
    });
    // cursor clicking the tabs
    const cp = beat(t, 0.8, 0.7, easeInOut);
    if (cp > 0) {
      const x = lerp(br.x + 300, br.x + 180 + tab * 96, clamp((t - 0.6) / 1.4));
      cursor(ctx, Math.min(x, br.x + br.w - 120), br.y + br.h * 0.14, clamp(cp * 2), { tapP: clamp(((t - 0.5) % 1.4) / 0.5), tone: 'light', scale: 1.05 });
    }
    pill(ctx, W / 2, 1520, 'স্ট্যাটাস অনুযায়ী ফিল্টার • হিস্ট্রি সংরক্ষিত', { tone, align: 'center', iconName: 'filter', p: beat(t, 1.4, 0.6, easeOutBack), size: 21 });
  },

  /* 32 — reports */
  reports(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 620, w: 940, vw: 1020, vh: 640, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/reports',
      draw: (w, h) => AD.adReports(ctx, w, h, { p: clamp((t - 0.2) / 2) }),
    });

    const tiles = [
      ['বিক্রি', '৳৮৪,২০০', 'chart'],
      ['পেমেন্ট', 'COD + অনলাইন', 'cash'],
      ['স্টক', '৫টি কম', 'box'],
    ];
    tiles.forEach(([label, val, ic], i) => {
      const p = beat(t, 1.4 + i * 0.18, 0.6, easeOutQuint);
      if (p <= 0) return;
      const x = 92 + i * 308;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      lightCard(ctx, x, 1450, 288, 150, { r: 24, lift: 0.9 });
      fillRR(ctx, x + 20, 1470, 44, 44, 14, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, x + 30, 1480, 24, P.light.goldDeep, 1.9);
      text(ctx, label, x + 20, 1546, { size: 19, weight: 500, color: P.light.muted });
      text(ctx, val, x + 20, 1580, { size: 28, weight: 800, color: P.light.ink, maxWidth: 250 });
      ctx.restore();
    });
    pill(ctx, W / 2, 1660, 'ডেমো ডেটা — নিজের রিপোর্ট নিজে দেখুন', { tone, align: 'center', iconName: 'chart', p: beat(t, 2.2, 0.6, easeOutBack), size: 20 });
  },

  /* 33 — notifications for new orders */
  orderNotify(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const ph = phone(ctx, t, {
      x: 96, y: 700, w: 404, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      draw: (w, h) => screenSwitch(ctx, t, w, h, [
        { at: 0, draw: (c, ww, hh) => SF.sfHome(c, ww, hh, { scroll: 0.1, cart: 0, activeCat: 1 }) },
        { at: 1.2, draw: (c, ww, hh) => AD_ADMIN_PHONE(c, ww, hh, t) },
      ]),
    });

    const notes = [
      { at: 1.5, title: 'নতুন অর্ডার', body: '#AUR-1048 • ৳4,960' },
      { at: 2.5, title: 'নতুন অর্ডার', body: '#AUR-1049 • ৳3,410' },
      { at: 3.5, title: 'পেমেন্ট আপডেট', body: '#AUR-1046 • Paid' },
    ];
    notes.forEach((n, i) => {
      const p = beat(t, n.at, 0.6, easeOutQuint);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      notifyCard(ctx, 552, 760 + i * 132, 432, t, { ...n, iconName: i === 2 ? 'cash' : 'bell', tone: 'light', delay: 0 });
      ctx.restore();
    });

    // bell burst
    const bp = beat(t, 4.2, 0.7, easeOutBack);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp);
      for (let i = 0; i < 3; i++) {
        const ph2 = ((t - 4.2) * 0.6 + i * 0.33) % 1;
        if (ph2 < 0 || ph2 > 1) continue;
        ctx.strokeStyle = `rgba(176,138,87,${0.35 * (1 - ph2)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(568, 1240, 20 + ph2 * 80, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
      }
      pill(ctx, 552, 1320, 'প্রতিটি অর্ডারের খবর সাথে সাথে', { tone, align: 'left', iconName: 'bell', p: bp, size: 20 });
      ctx.restore();
    }
  },

  /* 34 — abandoned checkout intro */
  abandonIntro(ctx, t, d, s) {
    const tone = 'dark';
    titleOf(ctx, t, s, tone, { size: 84 });

    // ghost card with a rising spark line
    const cp = beat(t, 0.2, 0.9, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= clamp(cp);
    glassCard(ctx, W / 2 - 230, 760, 460, 440, { r: 34, fill: 'rgba(16,26,46,0.74)' });
    fillRR(ctx, W / 2 - 100, 830, 200, 200, 62, 'rgba(79,216,255,0.12)');
    icon(ctx, 'cart', W / 2 - 56, 874, 112, P.dark.cyan, 1.6);
    text(ctx, 'অসম্পূর্ণ অর্ডার', W / 2, 1096, { size: 32, weight: 700, color: P.dark.ink, align: 'center' });
    text(ctx, 'নাম • ফোন • ঠিকানা — সব সংরক্ষিত', W / 2, 1140, { size: 21, weight: 500, color: P.dark.muted, align: 'center' });
    ctx.restore();

    const ap = beat(t, 1.0, 0.8, easeOutQuint);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(ap);
      // spark line rising inside the card
      const sx = W / 2 - 170, sy = 1240;
      ctx.strokeStyle = alpha(P.dark.gold, 0.9);
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      const pts = [[0, 0], [70, 6], [140, -20], [210, -12], [280, -56], [340, -74]];
      ctx.beginPath();
      pts.forEach(([dx, dy], i) => {
        const px = sx + dx * clamp(ap * 1.4), py = sy + dy * clamp(ap * 1.4);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      circle(ctx, sx + 340 * clamp(ap * 1.4), sy - 74 * clamp(ap * 1.4), 7, P.dark.gold);
      ctx.restore();
    }
    pill(ctx, 872, 900, 'সম্ভাব্য বিক্রি', { tone, align: 'center', iconName: 'chart', p: beat(t, 1.4, 0.6, easeOutBack), size: 22 });
    pill(ctx, 208, 1440, 'হারানো অর্ডার ফেরান', { tone, align: 'center', iconName: 'refresh', p: beat(t, 1.7, 0.6, easeOutBack), size: 21 });
  },

  /* 35 — the customer journey that stops */
  abandonJourney(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const steps = [
      { label: 'প্রোডাক্ট দেখলেন', ic: 'box' },
      { label: 'কার্টে যোগ', ic: 'cart' },
      { label: 'তথ্য দিলেন', ic: 'users' },
      { label: 'অর্ডার সম্পন্ন নয়', ic: 'clock', fail: true },
    ];
    const y = 780;
    const cw = 200, gap = 40, x0 = (W - (steps.length * cw + (steps.length - 1) * gap)) / 2;
    steps.forEach((st, i) => {
      const p = beat(t, 0.3 + i * 0.35, 0.6, easeOutBack);
      if (p <= 0) return;
      const x = x0 + i * (cw + gap);
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 40);
      lightCard(ctx, x, y, cw, 260, { r: 28, lift: st.fail ? 0.6 : 0.9 });
      const ac = st.fail ? '#C8503F' : P.light.goldDeep;
      fillRR(ctx, x + cw / 2 - 36, y + 30, 72, 72, 22, alpha(st.fail ? '#C8503F' : '#B08A57', 0.12));
      icon(ctx, st.ic, x + cw / 2 - 18, y + 48, 36, ac, 1.9);
      text(ctx, st.label, x + cw / 2, y + 168, { size: 22, weight: 700, color: st.fail ? '#8E3B30' : P.light.ink, align: 'center', maxWidth: cw - 24 });
      text(ctx, st.fail ? 'থেমে গেল' : 'সম্পন্ন', x + cw / 2, y + 204, { size: 18, weight: 500, color: st.fail ? '#C8503F' : P.light.muted, align: 'center' });
      // connector
      if (i < steps.length - 1) {
        const nx = x + cw + gap;
        dashLine(ctx, x + cw + 6, y + 130, nx - 6, y + 130, 'rgba(176,138,87,0.45)', 2.2, [5, 7], p);
        icon(ctx, 'arrow', nx - 20, y + 122, 18, P.light.goldDeep, 2.4);
      }
      ctx.restore();
    });

    // red "lost" note
    const lp = beat(t, 2.0, 0.7, easeOutQuint);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(lp);
      ctx.translate(0, (1 - lp) * 30);
      lightCard(ctx, 132, 1140, 816, 240, { r: 28, lift: 0.9 });
      fillRR(ctx, 164, 1172, 56, 56, 18, 'rgba(200,80,63,0.12)');
      icon(ctx, 'clock', 178, 1186, 28, '#C8503F', 2);
      text(ctx, 'কাস্টমার চলে গেলেন — অর্ডার হলো না', 244, 1208, { size: 26, weight: 700, color: P.light.ink, maxWidth: 660 });
      text(ctx, 'নাম, ফোন ও ঠিকানা দিয়ে গেছেন — কিন্তু কনফার্ম করেননি। এই তথ্যটাই আপনার হারানো সুযোগ।', 164, 1284, { size: 20, weight: 500, color: P.light.muted, maxWidth: 752 });
      ctx.restore();
    }
  },

  /* 36 — the info is saved in the admin */
  abandonAdmin(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const br = browser(ctx, t, {
      y: 630, w: 968, vw: 1000, vh: 680, enter: beat(t, 0.1, 0.9, easeOutQuint), tone,
      url: 'admin.aurum.shop/incomplete',
      draw: (w, h) => AD.adIncomplete(ctx, w, h, { p: clamp((t - 0.2) / 1.8) }),
    });

    // saved-data chips
    const chips = [
      ['users', 'নাম', 'সাদিয়া আক্তার'],
      ['phone', 'ফোন', '01712-345678'],
      ['pin', 'ঠিকানা', 'ধানমন্ডি, ঢাকা'],
    ];
    chips.forEach(([ic, label, val], i) => {
      const p = beat(t, 1.8 + i * 0.2, 0.6, easeOutQuint);
      if (p <= 0) return;
      const y = 1360 + i * 104;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 40, 0);
      lightCard(ctx, 92, y, 620, 88, { r: 22, lift: 0.9 });
      fillRR(ctx, 110, y + 18, 52, 52, 16, 'rgba(176,138,87,0.12)');
      icon(ctx, ic, 124, y + 32, 26, P.light.goldDeep, 1.9);
      text(ctx, label, 180, y + 38, { size: 17, weight: 500, color: P.light.muted });
      text(ctx, val, 180, y + 68, { size: 23, weight: 700, color: P.light.ink });
      ctx.restore();
    });
    pill(ctx, 812, 1660, 'কাস্টমারের সঙ্গে যোগাযোগ', { tone, align: 'center', iconName: 'chat', p: beat(t, 2.6, 0.6, easeOutBack), size: 21 });
  },

  /* 37 — contact and recover */
  abandonContact(ctx, t, d, s) {
    const tone = 'light';
    titleOf(ctx, t, s, tone, { size: 82 });

    const ph = phone(ctx, t, {
      x: 92, y: 700, w: 372, enter: beat(t, 0.1, 0.9, easeOutQuint), tone, float: false,
      draw: (w, h) => SF.sfCart(ctx, w, h, { enter: 1, checkout: 0 }),
    });

    // chat thread
    const msgs = [
      { at: 1.0, side: 'in', text: 'আসসালামু আলাইকুম, আপনার অর্ডারটি অসম্পূর্ণ ছিল — সাহায্য করতে পারি?' },
      { at: 2.2, side: 'out', text: 'হ্যাঁ, অর্ডারটা সম্পন্ন করতে চাই।' },
      { at: 3.4, side: 'in', text: 'ধন্যবাদ! লিংক পাঠালাম — এক ট্যাপে কনফার্ম করে নিন।' },
    ];
    const px = 520, pw = 466;
    msgs.forEach((m, i) => {
      const p = beat(t, m.at, 0.55, easeOutQuint);
      if (p <= 0) return;
      const y = 760 + i * 168;
      const isIn = m.side === 'in';
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * (isIn ? -30 : 30), 0);
      const lines = Math.ceil(m.text.length / 34);
      const bh = 40 + lines * 34;
      const bw = Math.min(pw, 240 + m.text.length * 8);
      const bx = isIn ? px : px + pw - bw;
      const fill = isIn ? '#FFFFFF' : '#1E9E74';
      shadow(ctx, 'rgba(60,44,20,0.14)', 24, 10);
      fillRR(ctx, bx, y, bw, bh, 22, fill);
      noShadow(ctx);
      if (isIn) strokeRR(ctx, bx, y, bw, bh, 22, P.light.cardLine, 1.1);
      text(ctx, isIn ? 'AURUM স্টোর' : 'আপনি', bx + 22, y + 28, { size: 16, weight: 600, color: isIn ? P.light.goldDeep : 'rgba(255,255,255,0.8)' });
      // wrapped body
      const words = m.text.split(' ');
      let line = '', ly = y + 60;
      ctx.font = fontStr(19, 500, m.text);
      for (const wd of words) {
        const test = line ? line + ' ' + wd : wd;
        if (ctx.measureText(test).width > bw - 44 && line) {
          text(ctx, line, bx + 22, ly, { size: 19, weight: 500, color: isIn ? P.light.ink : '#FFFFFF' });
          line = wd; ly += 30;
        } else line = test;
      }
      if (line) text(ctx, line, bx + 22, ly, { size: 19, weight: 500, color: isIn ? P.light.ink : '#FFFFFF' });
      ctx.restore();
    });

    // order recovered
    const rp = beat(t, 4.4, 0.7, easeOutBack);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha *= clamp(rp);
      ctx.translate(0, (1 - rp) * 28);
      lightCard(ctx, 520, 1300, 466, 150, { r: 26, lift: 1.1 });
      fillRR(ctx, 544, 1332, 60, 60, 20, 'rgba(30,158,116,0.14)');
      icon(ctx, 'checkCircle', 556, 1344, 36, '#1E9E74', 2);
      text(ctx, 'অর্ডার সম্পন্ন', 622, 1362, { size: 26, weight: 700, color: P.light.ink });
      text(ctx, '#AUR-1050 • ৳4,960', 622, 1396, { size: 20, weight: 500, color: P.light.muted });
      ctx.restore();
    }
    pill(ctx, 520, 1560, 'মেসেজ • কল • রিমাইন্ডার', { tone, align: 'left', iconName: 'chat', p: beat(t, 3.0, 0.6, easeOutBack), size: 21 });
  },
};

/** Miniature admin notifications screen for a phone. */
function AD_ADMIN_PHONE(ctx, w, h, t) {
  ctx.fillStyle = '#F3F6FB';
  ctx.fillRect(0, 0, w, h);
  text(ctx, 'নোটিফিকেশন', 24, 74, { size: 30, weight: 700, color: '#111827' });
  const rows = [
    ['নতুন অর্ডার', '#AUR-1048 • ৳4,960', 'green'],
    ['নতুন অর্ডার', '#AUR-1049 • ৳3,410', 'green'],
    ['পেমেন্ট আপডেট', '#AUR-1046 • Paid', 'blue'],
    ['স্টক কম', 'Aurum Leather • ২টি', 'amber'],
    ['কুরিয়ার আপডেট', '#AUR-1045 • শিপড', 'violet'],
  ];
  rows.forEach(([title, body, tone], i) => {
    const y = 110 + i * 118;
    fillRR(ctx, 20, y, w - 40, 100, 16, '#FFFFFF');
    const col = tone === 'green' ? '#1E9E74' : tone === 'blue' ? '#2F6FED' : tone === 'amber' ? '#D98A24' : '#7A5AF8';
    fillRR(ctx, 34, y + 22, 56, 56, 16, alpha(col, 0.14));
    icon(ctx, i === 2 ? 'cash' : i === 3 ? 'box' : i === 4 ? 'truck' : 'bell', 46, y + 34, 32, col, 2);
    text(ctx, title, 106, y + 44, { size: 22, weight: 700, color: '#111827' });
    text(ctx, body, 106, y + 74, { size: 18, weight: 500, color: '#7C8798' });
    if (i === 0) circle(ctx, w - 42, y + 44, 7, '#1E9E74');
  });
}
