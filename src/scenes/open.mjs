/**
 * Scenes 01–13 — opening: website vision, storefront, admin, the offer,
 * and the custom-design message.
 */
import {
  C, W, H, alpha, clamp, lerp, easeOut, easeIn, easeInOut, easeOutQuint, easeOutBack,
  beat, stag, lin, text, paragraph, eyebrow, rr, fillRR, strokeRR, circle, shadow, noShadow,
  icon, fontStr, cinematicBG, glowOrb, lightSweep, brandMark, chip, line, mix, drawWatch,
  drawBag, drawShoe, drawBottle, drawHeadphone, drawPlate, statusChip, grain, vignette,
} from '../render/kit.mjs';
import { L, headline, kicker, accentRule, glassPanel, phoneStage, browserStage, brandWatermark, chapterCard } from './stage.mjs';
import { adminStage } from './uiStage.mjs';
import * as SF from '../ui/storefront.mjs';
import * as AD from '../ui/admin.mjs';
import { BRAND } from './timeline.mjs';

/* ---------------------------------------------------------------- helpers */
function priceLockup(ctx, cx, y, t, { size = 150, opacity = 1, align = 'center' } = {}) {
  // ৳3,000 — measured and centred as one lockup
  const p = easeOutQuint(clamp(opacity));
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.font = `${700} ${Math.round(size * 0.52)}px 'BN', Inter`;
  const sw = ctx.measureText('৳').width;
  ctx.font = `${800} ${Math.round(size)}px 'BN', Inter`;
  const dw = ctx.measureText('৩,০০০').width;
  const gap = size * 0.06;
  const total = sw + gap + dw;
  const x0 = cx - total / 2;
  const g = lin(ctx, x0, y - size, x0 + total, y, [[0, '#FFFFFF'], [0.55, '#EDF6FF'], [1, C.cyan]]);
  text(ctx, '৳', x0, y, { size: size * 0.52, weight: 700, color: C.cyan });
  text(ctx, '৩,০০০', x0 + sw + gap, y, { size, weight: 800, color: g });
  ctx.restore();
  return total;
}

function lightBeam(ctx, t, { x = W / 2, color = C.cyan, w = 760 } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, 380, 0, x, 380, w);
  g.addColorStop(0, alpha(color, 0.25));
  g.addColorStop(1, alpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 900);
  ctx.restore();
}

/* ---------------------------------------------------------------- scenes */
export const openScenes = {
  hook(ctx, t, d) {
    lightBeam(ctx, t);
    // small capability pills under the headline
    const pills = [['globe', 'কাস্টমার ওয়েবসাইট'], ['grid', 'অ্যাডমিন প্যানেল']];
    const widths = pills.map(([, label]) => {
      ctx.save(); ctx.font = `600 22px 'BN', Inter`;
      const w = ctx.measureText(label).width + 92; ctx.restore();
      return w;
    });
    const totalW = widths[0] + widths[1] + 14;
    let cx = (W - totalW) / 2;
    pills.forEach(([ic, label], i) => {
      const p = beat(t, 0.6 + i * 0.14, 0.5, easeOutBack);
      if (p > 0) {
        ctx.save();
        ctx.globalAlpha *= clamp(p);
        ctx.translate(0, (1 - p) * 16);
        const y = 566;
        glassPanel(ctx, cx, y, widths[i], 56, { r: 28, fill: 'rgba(10,17,33,0.86)' });
        icon(ctx, ic, cx + 18, y + 16, 24, i ? C.violet : C.cyan, 1.9);
        text(ctx, label, cx + 50, y + 36, { size: 22, weight: 600, color: C.white });
        ctx.restore();
      }
      cx += widths[i] + 14;
    });
    // phone hero with a slow push-in
    const push = 1 + 0.045 * clamp(t / d);
    ctx.save();
    ctx.translate(W / 2, 1120);
    ctx.scale(push, push);
    ctx.translate(-W / 2, -1120);
    const enter = beat(t, 0.1, 0.9, easeOutQuint);
    phoneStage(ctx, t, {
      x: 312, y: 664, scale: 1.17, enter,
      draw: (w, h) => SF.sfHome(ctx, w, h, {
        scroll: 0.04 + 0.2 * easeOut(clamp((t - 1.4) / Math.max(0.8, d - 2))),
        cart: 0, activeCat: 1,
      }),
    });
    lightSweep(ctx, 312, 664, 456, 990, clamp((t - 1.5) / 1.4), 'rgba(150,200,255,0.13)', 110);
    ctx.restore();
    brandWatermark(ctx, t, 0.4);
  },

  browse(ctx, t, d) {
    const z = 1 + 0.05 * easeInOut(clamp(t / d));
    ctx.save();
    ctx.translate(W / 2, 1060);
    ctx.scale(z, z);
    ctx.translate(-W / 2, -1060);
    const add = clamp((t - (d * 0.56)) / 1.1);
    const swap = clamp((t - 1.0) / 1.0);
    phoneStage(ctx, t, {
      x: 250, y: 640, scale: 1.12, enter: 1, float: true,
      draw: (w, h) => SF.sfProduct(ctx, w, h, {
        zoom: clamp(t / d * 0.6), addToCart: add, feat: clamp((t - 0.4) / 1.2),
        swap: swap * 0.0, thumb: t > 2.2 ? 1 : 0,
      }),
    });
    // tap ripple on the CTA
    if (add > 0 && add < 1) {
      ctx.save();
      ctx.globalAlpha *= 1 - add;
      circle(ctx, 760, 1360, 30 + 80 * add, alpha('#C9A46A', 0.28));
      ctx.restore();
    }
    ctx.restore();
    // three-step rail under the device
    const chips = [['দেখুন', 'search'], ['পছন্দ করুন', 'bag'], ['অর্ডার করুন', 'checkCircle']];
    const cw = 268;
    chips.forEach(([label, ic], i) => {
      const p = beat(t, 0.6 + i * 0.4, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = 760;
      const y = 900 + i * 82;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * 0.96;
      ctx.translate(0, (1 - p) * 18);
      glassPanel(ctx, x, y, cw, 58, { r: 29, fill: 'rgba(10,17,33,0.86)' });
      icon(ctx, ic, x + 18, y + 18, 22, i === 2 ? C.green : C.cyan, 2);
      text(ctx, label, x + 50, y + 37, { size: 21, weight: 600, color: C.white });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.35);
  },

  adminIntro(ctx, t, d) {
    const shift = easeInOut(clamp((t - 1.4) / 2.2));
    phoneStage(ctx, t, {
      x: lerp(300, 640, shift), y: lerp(720, 1300, shift), scale: lerp(1.15, 0.8, shift),
      enter: 1, draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.15, cart: 1 }),
      dim: lerp(1, 0.12, shift), float: false,
    });
    const p = easeOutQuint(clamp((t - 2.0) / 1.6));
    if (p > 0) {
      adminStage(ctx, t, {
        box: { x: 56, y: 640, w: 968, h: 700 },
        vw: 760, vh: 660, enter: p, active: 0, title: 'ড্যাশবোর্ড', sub: 'আজকের সারসংক্ষেপ', badge: 3,
        draw: (c, w, h) => AD.adDashboard(c, w, h, { p: clamp((t - 2.4) / 2.2) }),
      });
    }
    brandWatermark(ctx, t, 0.35);
  },

  priceTease(ctx, t, d) {
    const p = beat(t, 0.15, 0.8);
    ctx.save();
    ctx.globalAlpha *= 0.35;
    phoneStage(ctx, t, {
      x: 300, y: 640, scale: 1.1, enter: 1, float: true, dim: 0.55,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.3, cart: 1 }),
    });
    ctx.restore();
    // spotlight
    ctx.save();
    ctx.fillStyle = 'rgba(5,9,18,0.72)';
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, 1000, 60, W / 2, 1000, 720);
    g.addColorStop(0, 'rgba(16,40,86,0.55)');
    g.addColorStop(1, 'rgba(5,9,18,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    lightBeam(ctx, t);
    const e = easeOutQuint(p);
    ctx.save();
    ctx.translate(0, (1 - e) * 40);
    text(ctx, 'মাত্র', W / 2, 848, { size: 46, weight: 600, color: 'rgba(220,233,255,0.82)', align: 'center', opacity: e });
    priceLockup(ctx, W / 2, 1010, t, { size: 200, opacity: p });
    ctx.restore();
    text(ctx, 'টাকায় ওয়েবসাইট!', W / 2, 1120, { size: 74, weight: 700, color: C.white, align: 'center', opacity: e });
    chip(ctx, 'কাস্টম ডিজাইন • কাজ শুরুর আগে স্কোপ আলোচনা', W / 2, 1178, { align: 'center', color: C.cyan, size: 23 });
    brandWatermark(ctx, t, 0.4);
  },

  priceConfirm(ctx, t, d) {
    // three layouts carousel, price locked
    const slide = easeInOut(clamp((t - 0.6) / (d - 3.4)));
    const layouts = [
      (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.25, cart: 1, activeCat: 1 }),
      (w, h) => SF.sfCategories(ctx, w, h, { p: 1 }),
      (w, h) => SF.sfProduct(ctx, w, h, { feat: 1, disc: '১৮% ছাড়' }),
    ];
    layouts.forEach((draw, i) => {
      const off = (i - 1) * 560 + slide * 20 * (i - 1);
      const enter = beat(t, 0.3 + i * 0.16, 0.7, easeOutQuint);
      ctx.save();
      ctx.globalAlpha *= clamp(enter) * (i === 1 ? 1 : 0.62);
      phoneStage(ctx, t, {
        x: W / 2 - 250 + off, y: 700, scale: 0.68, enter: 1, float: false,
        draw, dim: i === 1 ? 1 : 0.75,
      });
      ctx.restore();
    });
    // price banner
    const bp = beat(t, 0.2, 0.7);
    ctx.save();
    ctx.globalAlpha *= bp;
    ctx.translate(0, (1 - bp) * 40);
    const bx = W / 2 - 430, by = 1300;
    shadow(ctx, 'rgba(0,0,0,0.55)', 60, 24);
    fillRR(ctx, bx, by, 860, 210, 36, 'rgba(9,15,30,0.92)');
    noShadow(ctx);
    strokeRR(ctx, bx, by, 860, 210, 36, alpha(C.cyan, 0.45), 2);
    text(ctx, 'মাত্র', bx + 46, by + 74, { size: 34, weight: 600, color: 'rgba(214,229,255,0.85)' });
    text(ctx, '৳৩,০০০', bx + 46, by + 160, { size: 96, weight: 800, color: '#FFFFFF' });
    line(ctx, bx + 400, by + 40, bx + 400, by + 170, alpha(C.cyan, 0.35), 1.6);
    text(ctx, 'কাস্টমাইজড\nওয়েবসাইট', bx + 440, by + 92, { size: 38, weight: 700, color: C.cyan, lineHeight: 1.2 });
    ctx.restore();
    brandWatermark(ctx, t, 0.35);
  },

  noAdvance(ctx, t, d) {
    const p = beat(t, 0, 0.7, easeOutBack);
    // check ring
    const cx = W / 2, cy = 1010;
    ctx.save();
    circle(ctx, cx, cy, 170 * p, alpha(C.green, 0.1));
    circle(ctx, cx, cy, 132 * p, alpha(C.green, 0.16));
    circle(ctx, cx, cy, 96 * p, C.green);
    const q = clamp((t - 0.25) / 0.6);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 38, cy + 2);
    ctx.lineTo(cx - 10, cy + 30);
    ctx.lineTo(cx + 44, cy - 30);
    ctx.setLineDash([140, 140]);
    ctx.lineDashOffset = 140 * (1 - q);
    ctx.stroke();
    ctx.restore();
    // burst ticks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const q2 = clamp((t - 0.4) / 0.9);
      if (q2 <= 0) continue;
      const r0 = 190 + 40 * q2, r1 = 220 + 80 * q2;
      line(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, alpha(C.green, 0.4 * (1 - q2)), 4);
    }
    const tp = beat(t, 0.35, 0.7);
    ctx.save();
    ctx.globalAlpha *= tp;
    text(ctx, 'মাত্র ৩,০০০ টাকায়', W / 2, 1290, { size: 44, weight: 600, color: 'rgba(214,229,255,0.85)', align: 'center' });
    text(ctx, 'ওয়েবসাইট!', W / 2, 1348, { size: 50, weight: 700, color: C.white, align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.4);
  },

  templateDoubt(ctx, t, d) {
    // identical template cards pushed aside
    const push = easeInOut(clamp((t - 1.2) / (d - 2.2)));
    const cards = 7;
    for (let i = 0; i < cards; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 120 + col * 290 + (row % 2) * 30;
      const y = 800 + row * 250;
      const a = clamp(1 - push * 0.9);
      ctx.save();
      ctx.globalAlpha *= a * 0.85;
      ctx.translate(-push * (140 + i * 24), push * (60 + i * 12));
      ctx.rotate(-0.12 * push);
      glassPanel(ctx, x, y, 250, 210, { r: 16, fill: 'rgba(24,34,58,0.9)' });
      fillRR(ctx, x + 14, y + 14, 222, 74, 10, 'rgba(120,150,210,0.16)');
      fillRR(ctx, x + 14, y + 100, 150, 12, 6, 'rgba(190,210,240,0.35)');
      fillRR(ctx, x + 14, y + 124, 100, 10, 5, 'rgba(190,210,240,0.2)');
      fillRR(ctx, x + 14, y + 150, 80, 24, 6, 'rgba(120,150,210,0.22)');
      ctx.restore();
    }
    // stamp
    const sp = beat(t, 0.8, 0.6, easeOutBack);
    ctx.save();
    ctx.globalAlpha *= sp;
    ctx.translate(W / 2, 1010);
    ctx.rotate(-0.07);
    strokeRR(ctx, -330, -70, 660, 140, 22, alpha(C.red, 0.75), 5);
    text(ctx, 'একই টেমপ্লেট?', 0, 30, { size: 68, weight: 700, color: alpha(C.red, 0.95), align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.3);
  },

  customDesign(ctx, t, d) {
    // strike-through the template idea, reveal custom
    const st = easeInOut(clamp((t - 0.5) / 0.9));
    ctx.save();
    ctx.globalAlpha *= 0.9;
    text(ctx, 'রেডিমেড টেমপ্লেট', W / 2, 730, { size: 62, weight: 700, color: 'rgba(200,212,235,0.55)', align: 'center' });
    if (st > 0) {
      const startX = W / 2 - 240, endX = startX + 480 * st;
      line(ctx, startX, 712, endX, 712, C.red, 7);
    }
    ctx.restore();
    // morphing cards: layout change + palette change
    const m = easeInOut(clamp((t - 1.4) / (d - 3.0)));
    const px = W / 2 - 230, py = 860;
    glassPanel(ctx, px, py, 460, 460, { r: 28, fill: 'rgba(15,23,42,0.9)', glow: mix(C.violet, C.cyan, m) });
    // grid morphs from generic rows to a custom composed layout
    const g1 = [1, 1, 1, 1, 1, 1];
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const bw = lerp(196, i === 0 ? 260 : 118, m);
      const bx = px + 20 + (i === 0 ? 0 : col * 216 * m);
      const by = py + 20 + row * 148;
      if (i > 0 && col === 1 && m > 0.6) continue;
      fillRR(ctx, i === 0 ? px + 20 : px + 20 + (i % 2) * 230, i === 0 ? py + 20 : py + 20 + Math.floor((i + 1) / 2) * 148,
        i === 0 ? lerp(420, 200, m) : 200, 132, 18, mix('#2A3450', '#3C6BFF', m * 0.7));
    }
    // custom headline pill
    if (m > 0.5) {
      ctx.save(); ctx.globalAlpha *= (m - 0.5) * 2;
      fillRR(ctx, px + 240, py + 300, 200, 140, 18, alpha(C.cyan, 0.25));
      icon(ctx, 'sparkle', px + 316, py + 356, 48, C.cyan);
      ctx.restore();
    }
    const rp = beat(t, 2.6, 0.8);
    ctx.save();
    ctx.globalAlpha *= rp;
    text(ctx, 'আপনার পছন্দমতো', W / 2, 1390, { size: 44, weight: 600, color: 'rgba(214,229,255,0.85)', align: 'center' });
    text(ctx, 'কাস্টম ডিজাইন!', W / 2, 1460, { size: 72, weight: 700, color: C.white, align: 'center' });
    ctx.restore();
    brandWatermark(ctx, t, 0.35);
  },

  designBoard(ctx, t, d) {
    // design planning board assembles
    const bx = 90, by = 720, bw = 900;
    glassPanel(ctx, bx, by, bw, 640, { r: 28, fill: 'rgba(12,20,38,0.86)' });
    text(ctx, 'ডিজাইন প্ল্যান', bx + 34, by + 56, { size: 30, weight: 700, color: C.white });
    chip(ctx, 'ব্র্যান্ড অনুযায়ী', bx + bw - 220, by + 30, { color: C.cyan, size: 22 });
    const blocks = [
      { x: bx + 34, y: by + 90, w: 250, h: 190, label: 'কালার প্যালেট' },
      { x: bx + 300, y: by + 90, w: 250, h: 190, label: 'লোগো' },
      { x: bx + 566, y: by + 90, w: 300, h: 190, label: 'রেসপন্সিভ লেআউট' },
      { x: bx + 34, y: by + 300, w: 520, h: 300, label: 'হোমপেজ ওয়্যারফ্রেম' },
      { x: bx + 570, y: by + 300, w: 296, h: 300, label: 'ক্যাটাগরি কাঠামো' },
    ];
    blocks.forEach((b, i) => {
      const p = beat(t, 0.3 + i * 0.28, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 30);
      fillRR(ctx, b.x, b.y, b.w, b.h, 18, 'rgba(30,44,74,0.75)');
      strokeRR(ctx, b.x, b.y, b.w, b.h, 18, 'rgba(130,170,255,0.25)', 1.2);
      text(ctx, b.label, b.x + 16, b.y + 28, { size: 18, weight: 600, color: 'rgba(190,208,235,0.9)' });
      if (i === 0) {
        ['#101319', '#C9A46A', '#F3EDE1', '#7C5C3E'].forEach((c, k) => fillRR(ctx, b.x + 16 + k * 52, b.y + 56, 42, 42, 10, c));
        fillRR(ctx, b.x + 16, b.y + 116, 210, 8, 4, 'rgba(255,255,255,0.16)');
      }
      if (i === 1) {
        circle(ctx, b.x + 125, b.y + 110, 42, 'rgba(255,255,255,0.06)');
        text(ctx, 'AURUM', b.x + 125, b.y + 120, { size: 22, weight: 700, color: C.white, align: 'center', letterSpacing: 2 });
        text(ctx, 'লোগো প্লেসমেন্ট', b.x + 125, b.y + 160, { size: 15, weight: 500, color: 'rgba(190,208,235,0.6)', align: 'center' });
      }
      if (i === 2) {
        fillRR(ctx, b.x + 16, b.y + 46, 170, 100, 8, 'rgba(255,255,255,0.1)');
        fillRR(ctx, b.x + 196, b.y + 46, 70, 100, 8, 'rgba(255,255,255,0.18)');
        fillRR(ctx, b.x + 16, b.y + 154, 250, 10, 5, 'rgba(255,255,255,0.14)');
      }
      if (i === 3) {
        fillRR(ctx, b.x + 16, b.y + 44, 488, 100, 10, 'rgba(120,160,255,0.18)');
        for (let k = 0; k < 4; k++) fillRR(ctx, b.x + 16 + k * 124, b.y + 156, 112, 70, 8, 'rgba(255,255,255,0.1)');
        fillRR(ctx, b.x + 16, b.y + 238, 300, 10, 5, 'rgba(255,255,255,0.12)');
      }
      if (i === 4) {
        for (let k = 0; k < 4; k++) {
          fillRR(ctx, b.x + 16, b.y + 44 + k * 46, 264, 36, 8, k === 1 ? 'rgba(54,215,255,0.25)' : 'rgba(255,255,255,0.1)');
        }
      }
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.35);
  },

  brandCustomize(ctx, t, d) {
    const chosen = Math.min(3, Math.floor(clamp((t - 0.8) / 2.4) * 4));
    const palettes = ['#C9A46A', '#36D7FF', '#7957FF', '#35D3A0'];
    const px = 70, py = 700;
    // phone preview
    phoneStage(ctx, t, {
      x: 520, y: 720, scale: 1.06, enter: 1, float: false,
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.05, cart: 1, activeCat: chosen }),
    });
    // palette + controls at left
    glassPanel(ctx, px, py, 400, 560, { r: 26, fill: 'rgba(12,20,38,0.9)' });
    text(ctx, 'ব্র্যান্ড কালার', px + 24, py + 44, { size: 24, weight: 700, color: C.white });
    palettes.forEach((c, i) => {
      const y = py + 76 + i * 74;
      const sel = i === chosen;
      fillRR(ctx, px + 24, y, 340, 60, 14, sel ? alpha(c, 0.18) : 'rgba(255,255,255,0.04)');
      if (sel) strokeRR(ctx, px + 24, y, 340, 60, 14, alpha(c, 0.8), 2);
      circle(ctx, px + 56, y + 30, 18, c);
      text(ctx, ['গোল্ড', 'সায়ান', 'ভায়োলেট', 'মিন্ট'][i], px + 88, y + 38, { size: 22, weight: 600, color: C.white });
      if (sel) icon(ctx, 'check', px + 322, y + 18, 24, c, 2.6);
      ctx.fillStyle = '';
    });
    [[ 'logo', 'লোগো'], ['banner', 'ব্যানার'], ['grid', 'ক্যাটাগরি'], ['box', 'প্রোডাক্ট']].forEach(([ic, label], i) => {
      const x = px + 24 + (i % 2) * 176, y = py + 386 + Math.floor(i / 2) * 74;
      fillRR(ctx, x, y, 160, 58, 12, 'rgba(255,255,255,0.05)');
      icon(ctx, ic, x + 16, y + 16, 24, C.cyan, 1.9);
      text(ctx, label, x + 50, y + 37, { size: 20, weight: 600, color: C.white });
    });
    brandWatermark(ctx, t, 0.3);
  },

  categoriesMontage(ctx, t, d) {
    const items = [
      ['ফ্যাশন', 'fashion'], ['জুতা', 'shoe'], ['ঘড়ি', 'watch'], ['কসমেটিকস', 'cosmetic'],
      ['ইলেকট্রনিকস', 'tech'], ['গ্রোসারি', 'grocery'], ['রেস্টুরেন্ট', 'food'], ['অন্য পণ্য', 'other'],
    ];
    const cw = 216, ch = 270, gap = 20;
    items.forEach(([label, kind], i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 52 + col * (cw + gap), y = 780 + row * (ch + gap);
      const p = beat(t, 0.15 + i * 0.11, 0.6, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate(0, (1 - p) * 36);
      // card
      fillRR(ctx, x, y, cw, ch, 20, 'rgba(16,26,48,0.9)');
      strokeRR(ctx, x, y, cw, ch, 20, 'rgba(130,170,255,0.2)', 1.2);
      ctx.save();
      rr(ctx, x, y, cw, ch - 62, 20); ctx.clip();
      const grads = {
        fashion: ['#3A2C3F', '#6C4B5A'], shoe: ['#2A3038', '#4A4133'], watch: ['#2A2118', '#5A4630'],
        cosmetic: ['#3A2730', '#7A4655'], tech: ['#152638', '#1E4A66'], grocery: ['#20302A', '#3C5A40'],
        food: ['#33241E', '#5A3428'], other: ['#232A3A', '#39435C'],
      };
      const g = lin(ctx, x, y, x, y + ch, [[0, grads[kind][0]], [1, grads[kind][1]]]);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw, ch);
      const cx = x + cw / 2, cy = y + ch / 2 - 20;
      if (kind === 'watch') drawWatch(ctx, cx, cy, 54, {});
      if (kind === 'shoe') drawShoe(ctx, cx, cy - 6, 56);
      if (kind === 'fashion') drawBag(ctx, cx, cy, 54, { tint: '#EFE6D6', accent: '#B08A57' });
      if (kind === 'cosmetic') drawBottle(ctx, cx, cy, 52);
      if (kind === 'tech') drawHeadphone(ctx, cx, cy, 54);
      if (kind === 'grocery') drawBag(ctx, cx, cy, 52, { tint: '#D8CBA8', accent: '#7C5C3E' });
      if (kind === 'food') drawPlate(ctx, cx, cy, 58);
      if (kind === 'other') icon(ctx, 'grid', cx - 28, cy - 28, 56, 'rgba(255,255,255,0.72)', 2.4);
      ctx.restore();
      text(ctx, label, x + 16, y + ch - 22, { size: 24, weight: 600, color: C.white });
      icon(ctx, 'arrowUpRight', x + cw - 38, y + ch - 42, 20, alpha(C.cyan, 0.85), 2.2);
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  mobileFriendly(ctx, t, d) {
    phoneStage(ctx, t, {
      x: 236, y: 700, scale: 1.06, enter: clamp(t / 0.8),
      draw: (w, h) => SF.sfHome(ctx, w, h, { scroll: 0.06 + 0.16 * clamp(t / d), cart: 1, activeCat: 1 }),
    });
    const feats = [['মোবাইল রেসপন্সিভ', 'phone'], ['দ্রুত লোডিং', 'sparkle'], ['সহজ নেভিগেশন', 'grid']];
    feats.forEach(([label, ic], i) => {
      const p = beat(t, 1.2 + i * 0.3, 0.55, easeOutBack);
      if (p <= 0) return;
      const x = 690, y = 860 + i * 96;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - p) * 30, 0);
      glassPanel(ctx, x, y, 292, 66, { r: 33, fill: 'rgba(10,17,33,0.9)' });
      icon(ctx, ic, x + 20, y + 21, 24, C.cyan, 1.9);
      text(ctx, label, x + 56, y + 43, { size: 21, weight: 600, color: C.white, maxWidth: 220 });
      ctx.restore();
    });
    brandWatermark(ctx, t, 0.3);
  },

  featuresIntro(ctx, t, d) {
    const items = [
      ['কাস্টম স্টোরফ্রন্ট', 'grid'], ['কার্ট ও চেকআউট', 'cart'], ['অ্যাডমিন প্যানেল', 'list'],
      ['ল্যান্ডিং পেজ', 'globe'], ['অর্ডার ম্যানেজমেন্ট', 'box'], ['কুরিয়ার ট্র্যাকিং', 'truck'],
      ['পেমেন্ট', 'card'], ['নোটিফিকেশন', 'bell'], ['রিপোর্ট', 'chart'],
    ];
    const cw = 280, ch = 150, gap = 22;
    items.forEach(([label, ic], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 82 + col * (cw + gap), y = 800 + row * (ch + gap);
      const p = beat(t, 0.4 + i * 0.1, 0.55, easeOutBack);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha *= clamp(p) * 0.95;
      ctx.translate(0, (1 - p) * 26);
      glassPanel(ctx, x, y, cw, ch, { r: 22, fill: 'rgba(15,24,45,0.86)' });
      circle(ctx, x + 52, y + 58, 26, alpha(C.blue, 0.18));
      icon(ctx, ic, x + 38, y + 44, 28, C.cyan, 2);
      text(ctx, label, x + 22, y + 116, { size: 25, weight: 600, color: C.white, maxWidth: cw - 44 });
      ctx.restore();
    });
    if (t > 2.2) chip(ctx, 'সমর্থিত ফিচার — প্যাকেজ অনুযায়ী', W / 2, 1370, { align: 'center', color: C.muted, size: 22 });
    brandWatermark(ctx, t, 0.3);
  },
};
