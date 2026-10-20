/** Admin panel stage: a dark bezel window that can pan/zoom a wide dashboard. */
import {
  C, W, alpha, clamp, lerp, easeOut, easeInOut, easeOutQuint, lin, rr, fillRR, strokeRR, shadow,
  noShadow, glowOrb, lightSweep, text, icon,
} from '../render/kit.mjs';
import * as AD from '../ui/admin.mjs';

/**
 * box      : where the panel sits on the 1080-wide frame
 * vw/vh    : virtual dashboard size (design space, bigger = more zoomed out)
 * panY     : 0..1 vertical pan through the virtual dashboard
 * scale    : extra zoom multiplier
 */
export function adminStage(ctx, t, {
  box = { x: 56, y: 600, w: 968, h: 700 },
  vw = 760, vh = 900, scale = 1, panY = 0, active = 0, title = 'ড্যাশবোর্ড', sub = '',
  p = 1, enter = 1, draw, badge = 3, glow = C.blue, showChrome = true,
} = {}) {
  const e = easeOutQuint(clamp(enter));
  ctx.save();
  ctx.globalAlpha *= e;
  ctx.translate(0, (1 - e) * 60);
  // outer bezel
  shadow(ctx, 'rgba(0,0,0,0.62)', 70, 30);
  fillRR(ctx, box.x, box.y, box.w, box.h, 26, '#0A1120');
  noShadow(ctx);
  strokeRR(ctx, box.x, box.y, box.w, box.h, 26, 'rgba(130,175,255,0.32)', 1.6);
  // window chrome
  let top = 0;
  if (showChrome) {
    top = 34;
    ['#FF6B6B', '#FFC466', '#35D3A0'].forEach((c, i) => {
      ctx.beginPath(); ctx.arc(box.x + 22 + i * 20, box.y + 17, 5.5, 0, 7); ctx.fillStyle = alpha(c, 0.85); ctx.fill();
    });
    text(ctx, 'admin.aurum.demo', box.x + box.w / 2, box.y + 22, { size: 14, weight: 500, color: 'rgba(210,225,255,0.5)', align: 'center' });
  }
  const inner = { x: box.x + 8, y: box.y + 8 + top, w: box.w - 16, h: box.h - 16 - top };
  ctx.save();
  rr(ctx, inner.x, inner.y, inner.w, inner.h, 18);
  ctx.clip();
  glowOrb(ctx, inner.x + inner.w * 0.5, inner.y + inner.h * 0.5, inner.w * 0.7, glow, 0.06);
  const s = (inner.w / vw) * scale;
  const contentH = vh * s;
  const maxPan = Math.max(0, contentH - inner.h);
  const oy = -clamp(panY) * maxPan;
  ctx.translate(inner.x, inner.y + oy);
  ctx.scale(s, s);
  AD.adShell(ctx, vw, vh, {
    active, title, sub, p,
    children: (c, cw, ch, ox, oyy) => {
      c.translate(ox, oyy);
      draw(c, cw, ch);
    },
  });
  ctx.restore();
  // top scrim so the headline stays legible over the panel
  const g = lin(ctx, 0, box.y, 0, box.y + 96, [[0, 'rgba(4,7,15,0.32)'], [1, 'rgba(4,7,15,0)']]);
  ctx.fillStyle = g;
  ctx.fillRect(inner.x, inner.y, inner.w, 96);
  lightSweep(ctx, box.x, box.y, box.w, box.h, clamp((t - 3) / 1.8) * 0.9, 'rgba(150,200,255,0.08)', 110);
  ctx.restore();
  return { inner, scale: s, contentH };
}

/** Storefront screen inside a browser-ish panel (for desktop layout demos). */
export { AD };
