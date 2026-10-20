/**
 * Admin panel UI library — fictional "AURUM" store admin, Bengali interface.
 * Presented as a real business dashboard: overview metrics, products,
 * categories, orders, courier, payments, reporting, integrations.
 * All numbers are illustrative demo data.
 */
import { C, alpha, lin, text, fillRR, strokeRR, rr, circle, shadow, noShadow, icon, fontStr, clamp, lerp, easeOut, beat, drawWatch, statusChip } from '../render/kit.mjs';
import { PRODUCTS, T, demoBadge } from './storefront.mjs';

export const AD = {
  bg: '#F3F6FB',
  sidebar: '#0C1424',
  sidebar2: '#101B31',
  card: '#FFFFFF',
  ink: '#111827',
  ink2: '#465064',
  muted: '#7C8798',
  line: '#E6EBF3',
  blue: '#2F6FED',
  blueSoft: '#EAF1FF',
  green: '#18A97A',
  amber: '#D98A24',
  red: '#DE5A62',
  violet: '#7A5AF8',
  cyan: '#12AFCB',
};

const NAV = [
  ['grid', 'ড্যাশবোর্ড'],
  ['box', 'প্রোডাক্ট'],
  ['tag', 'ক্যাটাগরি'],
  ['list', 'অর্ডার'],
  ['users', 'কাস্টমার'],
  ['truck', 'কুরিয়ার'],
  ['card', 'পেমেন্ট'],
  ['chart', 'রিপোর্ট'],
  ['shield', 'নিরাপত্তা'],
  ['globe', 'ইন্টিগ্রেশন'],
];

/** Admin app shell. children(ctx, cw, ch) draws inside content area. */
export function adShell(ctx, w, h, { active = 0, title = 'ড্যাশবোর্ড', sub = '', p = 1, children, compact = false, badge = 3 } = {}) {
  ctx.save();
  ctx.fillStyle = AD.bg;
  ctx.fillRect(0, 0, w, h);
  const sbw = compact ? 0 : Math.min(196, w * 0.22);
  // sidebar
  if (sbw) {
    const g = lin(ctx, 0, 0, 0, h, [[0, AD.sidebar], [1, AD.sidebar2]]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sbw, h);
    // logo
    const lx = 20, ly = 24;
    fillRR(ctx, lx, ly, 34, 34, 10, lin(ctx, lx, ly, lx + 34, ly + 34, [[0, '#3C7CFF'], [1, '#36D7FF']]));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lx + 12, ly + 12); ctx.lineTo(lx + 8, ly + 17); ctx.lineTo(lx + 12, ly + 22);
    ctx.moveTo(lx + 22, ly + 12); ctx.lineTo(lx + 26, ly + 17); ctx.lineTo(lx + 22, ly + 22);
    ctx.stroke();
    text(ctx, 'AURUM', lx + 44, ly + 17, { size: 17, weight: 800, color: '#fff', letterSpacing: 1 });
    text(ctx, 'অ্যাডমিন প্যানেল', lx + 44, ly + 33, { size: 12, weight: 500, color: 'rgba(255,255,255,0.5)' });
    lineY(ctx, 16, 76, sbw - 16, 'rgba(255,255,255,0.08)');
    const navGap = h < 720 ? 38 : 46;
    NAV.forEach(([ic, label], i) => {
      const y = 96 + i * navGap;
      const act = i === active;
      if (act) {
        fillRR(ctx, 12, y - 14, sbw - 24, 40, 10, 'rgba(64,124,255,0.2)');
        fillRR(ctx, 12, y - 8, 3, 28, 2, '#36D7FF');
      }
      icon(ctx, ic, 28, y - 8, 20, act ? '#8FC0FF' : 'rgba(255,255,255,0.5)', 1.8);
      text(ctx, label, 60, y + 6, { size: 14, weight: act ? 600 : 500, color: act ? '#FFFFFF' : 'rgba(255,255,255,0.55)' });
      if (i === 3) {
        circle(ctx, sbw - 28, y - 1, 9, '#E45A62');
        text(ctx, String(badge), sbw - 28, y + 3, { size: 11, weight: 700, color: '#fff', align: 'center' });
      }
    });
    // bottom card (only when there is room)
    const by = h - 128;
    if (h >= 760) {
    fillRR(ctx, 14, by, sbw - 28, 96, 14, 'rgba(255,255,255,0.06)');
    strokeRR(ctx, 14, by, sbw - 28, 96, 14, 'rgba(255,255,255,0.09)', 1);
    icon(ctx, 'sparkle', 30, by + 16, 20, '#D9BE8F');
    text(ctx, 'কোড পিক্সেল ওয়েব', 30, by + 58, { size: 13, weight: 600, color: '#fff' });
    text(ctx, 'ডেমো অ্যাডমিন', 30, by + 76, { size: 12, weight: 500, color: 'rgba(255,255,255,0.45)' });
    }
  }
  const cx = sbw;
  // top bar
  const tbh = compact ? 0 : 74;
  if (tbh) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(cx, 0, w - cx, tbh);
    lineY(ctx, cx, tbh, w, AD.line);
    text(ctx, title, cx + 24, 34, { size: 22, weight: 700, color: AD.ink });
    if (sub) text(ctx, sub, cx + 24, 58, { size: 13, weight: 500, color: AD.muted });
    // search
    const sw = Math.min(210, (w - cx) * 0.28);
    fillRR(ctx, w - sw - 190, 20, sw, 36, 9, '#F1F4FA');
    icon(ctx, 'search', w - sw - 176, 28, 18, AD.muted, 2);
    text(ctx, 'সার্চ করুন…', w - sw - 148, 44, { size: 13, weight: 500, color: '#9AA5B6' });
    // bell
    icon(ctx, 'bell', w - 160, 26, 22, AD.ink2, 1.9);
    circle(ctx, w - 146, 24, 6, '#E45A62');
    avatarAD(ctx, w - 108, 18, 18, 'আ');
    text(ctx, 'আদিব হাসান', w - 82, 34, { size: 13, weight: 600, color: AD.ink });
    text(ctx, 'সুপার অ্যাডমিন', w - 82, 50, { size: 11, weight: 500, color: AD.muted });
  }
  // content
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx + 16, tbh + 14, w - cx - 32, h - tbh - 30);
  ctx.clip();
  children(ctx, w - cx - 32, h - tbh - 30, cx + 16, tbh + 14);
  ctx.restore();
  demoBadge(ctx, w - 108, h - 38, 14);
  ctx.restore();
}

export function avatarAD(ctx, x, y, r, label = 'আ') {
  const g = lin(ctx, x - r, y - r, x + r, y + r, [[0, '#6F9BFF'], [1, '#315ED0']]);
  circle(ctx, x, y, r, g);
  text(ctx, label, x, y + r * 0.34, { size: r * 0.95, weight: 700, color: '#fff', align: 'center' });
}

function lineY(ctx, x0, y, x1, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
}

export function card(ctx, x, y, w, h, { r = 14, fill = AD.card, stroke = AD.line, glow = null } = {}) {
  ctx.save();
  shadow(ctx, 'rgba(17,24,39,0.06)', 18, 6);
  fillRR(ctx, x, y, w, h, r, fill);
  noShadow(ctx);
  if (stroke) strokeRR(ctx, x, y, w, h, r, stroke, 1);
  if (glow) strokeRR(ctx, x, y, w, h, r, glow, 2);
  ctx.restore();
}

export function kpiCard(ctx, x, y, w, h, { label, value, delta, tone = AD.blue, ic = 'chart', p = 1 }) {
  card(ctx, x, y, w, h);
  fillRR(ctx, x + 14, y + 14, 40, 40, 11, alpha(tone, 0.12));
  icon(ctx, ic, x + 24, y + 24, 21, tone, 2);
  text(ctx, label, x + 14, y + 78, { size: 13, weight: 500, color: AD.muted, maxWidth: w - 28 });
  text(ctx, value, x + 14, y + 112, { size: 26, weight: 700, color: AD.ink, opacity: clamp(p * 1.4), maxWidth: w - 28 });
  if (delta) {
    const up = !delta.startsWith('-');
    text(ctx, delta, x + 14, y + 136, { size: 12, weight: 600, color: up ? AD.green : AD.red });
  }
}

export function chartCard(ctx, x, y, w, h, { p = 1, title = 'বিক্রির ধারা', tab = 'সাপ্তাহিক' } = {}) {
  card(ctx, x, y, w, h);
  text(ctx, title, x + 18, y + 32, { size: 16, weight: 700, color: AD.ink });
  text(ctx, 'ডেমো ডেটা', x + 18 + 96, y + 32, { size: 11, weight: 500, color: AD.muted });
  ['দৈনিক', 'সাপ্তাহিক', 'মাসিক'].forEach((t, i) => {
    const tw = 54;
    const tx = x + w - 18 - (3 - i) * (tw + 6);
    fillRR(ctx, tx, y + 14, tw, 24, 7, t === tab ? AD.blueSoft : 'transparent');
    text(ctx, t, tx + tw / 2, y + 31, { size: 11, weight: 600, color: t === tab ? AD.blue : AD.muted, align: 'center' });
  });
  const cx0 = x + 46, cy0 = y + h - 34, cw = w - 66, ch = h - 92;
  // grid
  for (let i = 0; i <= 4; i++) {
    const gy = cy0 - (ch * i) / 4;
    lineY(ctx, cx0, gy, x + w - 18, 'rgba(17,24,39,0.06)');
    text(ctx, `${i * 25}k`, cx0 - 10, gy + 4, { size: 10, weight: 500, color: AD.muted, align: 'right' });
  }
  const pts = [0.32, 0.46, 0.38, 0.6, 0.52, 0.72, 0.66, 0.86, 0.78, 0.94];
  const n = pts.length;
  const px = (i) => cx0 + (cw * i) / (n - 1);
  const py = (v) => cy0 - ch * v;
  const shown = clamp(p) * (n - 1);
  // area
  ctx.beginPath();
  ctx.moveTo(px(0), cy0);
  for (let i = 0; i < n; i++) {
    if (i > shown + 0.001) break;
    ctx.lineTo(px(i), py(pts[i]));
  }
  ctx.lineTo(px(Math.min(n - 1, shown)), cy0);
  ctx.closePath();
  const ag = ctx.createLinearGradient(0, y + 60, 0, cy0);
  ag.addColorStop(0, alpha(AD.blue, 0.26));
  ag.addColorStop(1, alpha(AD.blue, 0));
  ctx.fillStyle = ag;
  ctx.fill();
  // line
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    if (i > shown + 0.001) break;
    const X = px(i), Y = py(pts[i]);
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.strokeStyle = AD.blue;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // dot
  const di = Math.min(n - 1, Math.round(shown));
  if (p > 0.05) {
    circle(ctx, px(di), py(pts[di]), 9, alpha(AD.blue, 0.18));
    circle(ctx, px(di), py(pts[di]), 4.5, AD.blue);
  }
  const days = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি', 'রবি', 'সোম'];
  for (let i = 0; i < n; i += 2) text(ctx, days[i], px(i), y + h - 14, { size: 10, weight: 500, color: AD.muted, align: 'center' });
}

export function tableRows(ctx, x, y, w, rows, cols, { rowH = 48, header = true, highlight = -1, p = 1, statusCol = -1 } = {}) {
  if (header) {
    fillRR(ctx, x, y, w, 34, 8, '#F7F9FD');
    cols.forEach((c, i) => {
      text(ctx, c.label, x + c.x, y + 22, { size: 11, weight: 600, color: AD.muted });
    });
    y += 40;
  }
  rows.forEach((row, ri) => {
    const a = clamp((p - ri * 0.06) / 0.3);
    ctx.save();
    ctx.globalAlpha *= a;
    if (ri === highlight) {
      fillRR(ctx, x - 6, y - 4, w + 12, rowH - 4, 8, '#EAF1FF');
    } else if (ri % 2 === 1) {
      fillRR(ctx, x - 6, y - 4, w + 12, rowH - 4, 8, 'rgba(17,24,39,0.016)');
    }
    cols.forEach((c, ci) => {
      const v = row[ci];
      if (ci === statusCol) {
        statusChip(ctx, v, x + c.x, y + rowH / 2 - 22, toneFor(v), { size: 11, h: 22 });
      } else {
        text(ctx, String(v), x + c.x, y + rowH / 2 + 5, { size: c.size || 12, weight: c.weight || 500, color: c.color || AD.ink2, maxWidth: (c.w || 140) });
      }
    });
    lineY(ctx, x - 6, y + rowH - 4, x + w + 6, AD.line);
    ctx.restore();
    y += rowH;
  });
  return y;
}

export function toneFor(status = '') {
  if (/নতুন/.test(status)) return 'blue';
  if (/ডেলিভার|সম্পন্ন|Paid|সফল|সক্রিয়|চালু|Delivered/i.test(status)) return 'green';
  if (/পেন্ডিং|অপেক্ষ|Pending|রিভিউ|Review/i.test(status)) return 'amber';
  if (/প্রসেসিং|শিপড|Shipped|Processing|পথে/i.test(status)) return 'blue';
  if (/বাতিল|ফেরত|CANCEL|cancel|Returned|রিটার্ন|ব্লক/i.test(status)) return 'red';
  return 'grey';
}

/* ---------------------------------------------------------------- screens */
export function adDashboard(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  const gap = 14;
  const kw = (w - gap * 3) / 4;
  const kpis = [
    ['আজকের অর্ডার', '২৪', '+১২%', AD.blue, 'list'],
    ['মোট বিক্রি (ডেমো)', '৳৮৪,২০০', '+৮%', AD.green, 'cash'],
    ['প্রোডাক্ট', '৩৬', null, AD.violet, 'box'],
    ['স্টক কম', '৫', null, AD.amber, 'chart'],
  ];
  kpis.forEach(([label, value, delta, tone, ic], i) => {
    kpiCard(ctx, i * (kw + gap), 0, kw, 158, { label, value, delta, tone, ic, p: clamp(p * 2 - i * 0.2) });
  });
  const cy = 158 + 16;
  chartCard(ctx, 0, cy, w * 0.58, 230, { p, title: 'বিক্রির ধারা' });
  // donut / category split
  const dx = w * 0.58 + 14, dw = w * 0.42 - 14;
  card(ctx, dx, cy, dw, 230);
  text(ctx, 'ক্যাটাগরি অনুযায়ী', dx + 16, cy + 30, { size: 15, weight: 700, color: AD.ink });
  const segs = [['ঘড়ি', 0.52, AD.blue], ['ব্যাগ', 0.24, AD.violet], ['জুতা', 0.14, AD.cyan], ['অন্যান্য', 0.1, '#C9D3E4']];
  let ang = -Math.PI / 2;
  const cxx = dx + dw / 2, cyy = cy + 122, rad = 58;
  segs.forEach(([label, v, col], i) => {
    const a = v * Math.PI * 2 * clamp(p * 1.6 - i * 0.1);
    ctx.beginPath();
    ctx.arc(cxx, cyy, rad, ang, ang + a);
    ctx.strokeStyle = col;
    ctx.lineWidth = 20;
    ctx.stroke();
    ang += a;
  });
  text(ctx, '৩৬', cxx, cyy + 6, { size: 22, weight: 700, color: AD.ink, align: 'center' });
  text(ctx, 'পণ্য', cxx, cyy + 24, { size: 10, weight: 500, color: AD.muted, align: 'center' });
  segs.forEach(([label, v, col], i) => {
    const ly = cy + 58 + i * 30;
    circle(ctx, dx + 16, ly, 4, col);
    text(ctx, label, dx + 26, ly + 4, { size: 11, weight: 500, color: AD.ink2 });
  });
  // recent orders
  const oy = cy + 246;
  card(ctx, 0, oy, w, 250);
  text(ctx, 'সাম্প্রতিক অর্ডার', 16, oy + 30, { size: 15, weight: 700, color: AD.ink });
  text(ctx, 'সব দেখুন', w - 16, oy + 30, { size: 11, weight: 600, color: AD.blue, align: 'right' });
  const cols = [
    { label: 'অর্ডার', x: 16, w: 80, weight: 600, color: AD.ink },
    { label: 'কাস্টমার', x: 112, w: 110 },
    { label: 'পণ্য', x: 236, w: 130 },
    { label: 'মোট', x: 380, w: 70, weight: 600, color: AD.ink },
    { label: 'স্ট্যাটাস', x: w - 118, w: 100 },
  ];
  tableRows(ctx, 16, oy + 44, w - 32, [
    ['#AUR-1048', 'রাফিদ হাসান', 'হেরিটেজ ক্রোনো', '৳4,960', 'নতুন'],
    ['#AUR-1047', 'সাদিয়া আক্তার', 'Noir Automatic', '৳6,520', 'কনফার্ম'],
    ['#AUR-1046', 'তানভীর আহমেদ', 'রোজ পেটিট', '৳4,220', 'প্রসেসিং'],
    ['#AUR-1045', 'মেহজাবীন রহমান', 'ক্লাসিক মেশ', '৳4,060', 'শিপড'],
  ], cols, { p, statusCol: 4, rowH: 42 });
  const sy = oy + 262;
  card(ctx, 0, sy, w * 0.5 - 7, h * 0.94 - sy);
  card(ctx, w * 0.5 + 7, sy, w * 0.5 - 7, h * 0.94 - sy);
  text(ctx, 'কুরিয়ার আপডেট', 16, sy + 28, { size: 14, weight: 700, color: AD.ink });
  const cr = [['#AUR-1045', 'ডেলিভারির পথে'], ['#AUR-1044', 'ডেলিভারড'], ['#AUR-1042', 'রিটার্নড']];
  cr.forEach(([id, st], i) => {
    const y = sy + 44 + i * 34;
    icon(ctx, 'truck', 16, y + 2, 16, AD.muted, 1.8);
    text(ctx, id, 40, y + 14, { size: 11, weight: 600, color: AD.ink });
    text(ctx, st, w * 0.5 - 22, y + 14, { size: 10, weight: 500, color: AD.muted, align: 'right' });
  });
  text(ctx, 'স্টক সতর্কতা', w * 0.5 + 23, sy + 28, { size: 14, weight: 700, color: AD.ink });
  [['Aurum Leather', '২টি'], ['Sport Steel', '০টি']].forEach(([n, c], i) => {
    const y = sy + 44 + i * 34;
    circle(ctx, w * 0.5 + 30, y + 7, 4, i ? AD.red : AD.amber);
    text(ctx, n, w * 0.5 + 42, y + 12, { size: 11, weight: 600, color: AD.ink });
    text(ctx, c, w - 16, y + 12, { size: 10, weight: 600, color: i ? AD.red : AD.amber, align: 'right' });
  });
}

export function adProducts(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  const cols = [
    { label: 'প্রোডাক্ট', x: 12 },
    { label: 'ক্যাটাগরি', x: w * 0.38 },
    { label: 'দাম', x: w * 0.55 },
    { label: 'স্টক', x: w * 0.68 },
    { label: 'স্ট্যাটাস', x: w * 0.83 },
  ];
  card(ctx, 0, 0, w, h * 0.94);
  // toolbar
  fillRR(ctx, 12, 14, 210, 38, 9, '#F3F6FB');
  icon(ctx, 'search', 24, 24, 18, AD.muted, 2);
  text(ctx, 'প্রোডাক্ট খুঁজুন…', 50, 38, { size: 12, weight: 500, color: '#9AA5B6' });
  fillRR(ctx, 232, 14, 96, 38, 9, '#F3F6FB');
  icon(ctx, 'filter', 244, 24, 17, AD.ink2, 1.9);
  text(ctx, 'ফিল্টার', 268, 38, { size: 12, weight: 600, color: AD.ink2 });
  const addX = w - 148;
  const addGlow = o.addGlow ? 'rgba(47,111,237,0.5)' : null;
  fillRR(ctx, addX, 14, 136, 38, 9, AD.blue);
  icon(ctx, 'plus', addX + 16, 25, 17, '#fff', 2.4);
  text(ctx, 'নতুন প্রোডাক্ট', addX + 40, 38, { size: 12, weight: 600, color: '#fff' });
  if (addGlow) strokeRR(ctx, addX - 3, 11, 142, 44, 11, addGlow, 2);
  // table
  const rows = [
    ['Heritage Chrono', 'ঘড়ি', '৳4,890', '১৮', 'সক্রিয়'],
    ['Noir Automatic', 'ঘড়ি', '৳6,450', '৯', 'সক্রিয়'],
    ['Aurum Leather', 'ঘড়ি', '৳3,290', '২', 'স্টক কম'],
    ['Rose Petite', 'ঘড়ি', '৳4,150', '১২', 'সক্রিয়'],
    ['Sport Steel', 'ঘড়ি', '৳5,290', '০', 'স্টক শেষ'],
    ['Classic Mesh', 'ঘড়ি', '৳3,990', '৭', 'সক্রিয়'],
  ];
  let y = 62;
  tableRows(ctx, 12, y, w - 24, rows, cols, { p: clamp(p * 1.3), rowH: 44, highlight: o.highlight ?? -1, statusCol: 4 });
  // add product modal
  if (o.modal > 0) modalProduct(ctx, w, h, o);
}

function modalProduct(ctx, w, h, o) {
  const m = clamp(o.modal || 0);
  const e = easeOut(m);
  ctx.save();
  ctx.globalAlpha = 0.55 * e;
  ctx.fillStyle = '#0B1220';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  const mw = Math.min(w * 0.78, 520), mh = 430;
  const mx = (w - mw) / 2, my = (h - mh) / 2 + (1 - e) * 30;
  ctx.save();
  shadow(ctx, 'rgba(0,0,0,0.4)', 50, 20);
  fillRR(ctx, mx, my, mw, mh, 18, '#FFFFFF');
  noShadow(ctx);
  text(ctx, 'নতুন প্রোডাক্ট যোগ করুন', mx + 22, my + 38, { size: 18, weight: 700, color: AD.ink });
  icon(ctx, 'plus', mx + mw - 42, my + 20, 18, AD.muted, 2);
  ctx.save(); ctx.translate(mx + mw - 24, my + 24); ctx.rotate(Math.PI / 4); ctx.restore();
  // image picker
  fillRR(ctx, mx + 22, my + 60, 120, 120, 12, '#F2EADB');
  strokeRR(ctx, mx + 22, my + 60, 120, 120, 12, '#D9CDB6', 1.2);
  drawWatch(ctx, mx + 82, my + 120, 36, PRODUCTS[0].tone);
  fillRR(ctx, mx + 152, my + 120, 88, 30, 8, '#EAF1FF');
  text(ctx, 'ছবি বদলান', mx + 196, my + 140, { size: 11, weight: 600, color: AD.blue, align: 'center' });
  // fields
  const fields = [['প্রোডাক্টের নাম', 'Heritage Chrono'], ['দাম', '৳ 4,890'], ['ক্যাটাগরি', 'ঘড়ি'], ['স্টক', '১৮']];
  fields.forEach(([label, val], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = mx + 22 + col * ((mw - 44) / 2 + 12);
    const fy = my + 200 + row * 64;
    const fw = (mw - 44) / 2 - 6;
    text(ctx, label, fx, fy, { size: 11, weight: 500, color: AD.muted });
    fillRR(ctx, fx, fy + 8, fw, 38, 8, '#FAFBFE');
    strokeRR(ctx, fx, fy + 8, fw, 38, 8, AD.line, 1.1);
    const typed = clamp((o.typing || 0) * 4 - (i + 1) * 0.4);
    text(ctx, val.slice(0, Math.round(val.length * typed)), fx + 10, fy + 34, { size: 13, weight: 500, color: AD.ink });
    if (typed > 0 && typed < 0.98) {
      const cw = ctx.measureText(val.slice(0, Math.round(val.length * typed))).width;
      fillRR(ctx, fx + 11 + cw, fy + 18, 1.6, 20, 1, AD.blue);
    }
  });
  fillRR(ctx, mx + mw - 122, my + mh - 56, 100, 36, 9, o.saved ? AD.green : AD.blue);
  text(ctx, o.saved ? 'সেভ হয়েছে ✓' : 'সেভ করুন', mx + mw - 72, my + mh - 32, { size: 13, weight: 600, color: '#fff', align: 'center' });
  fillRR(ctx, mx + mw - 232, my + mh - 56, 100, 36, 9, '#F1F4FA');
  text(ctx, 'বাতিল', mx + mw - 182, my + mh - 32, { size: 13, weight: 600, color: AD.ink2, align: 'center' });
  ctx.restore();
  if (o.saved) {
    ctx.save();
    ctx.globalAlpha = clamp(o.savedP || 0);
    fillRR(ctx, mx + 22, my - 54, 230, 42, 12, '#E8F8F2');
    circle(ctx, mx + 42, my - 33, 12, AD.green);
    icon(ctx, 'check', mx + 34, my - 41, 16, '#fff', 2.6);
    text(ctx, 'প্রোডাক্ট যোগ হয়েছে', mx + 62, my - 26, { size: 14, weight: 600, color: '#0E7A58' });
    ctx.restore();
  }
}

export function adCategories(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w * 0.52, h * 0.92);
  text(ctx, 'ক্যাটাগরি', 16, 32, { size: 16, weight: 700, color: AD.ink });
  fillRR(ctx, w * 0.52 - 128, 14, 112, 32, 8, AD.blue);
  icon(ctx, 'plus', w * 0.52 - 116, 22, 15, '#fff', 2.4);
  text(ctx, 'নতুন ক্যাটাগরি', w * 0.52 - 96, 34, { size: 11, weight: 600, color: '#fff' });
  const cats = [['ঘড়ি', '৩৬'], ['ব্যাগ', '১৮'], ['জুতা', '২৪'], ['অ্যাকসেসরিজ', '৩১'], ['কাপল সেট', '১২']];
  cats.forEach(([n, c], i) => {
    const y = 60 + i * 46;
    const editable = o.editIndex === i;
    const del = o.deleteIndex === i && o.deleteP > 0.4;
    ctx.save();
    if (del) ctx.globalAlpha *= 0.35;
    if (editable) fillRR(ctx, 8, y - 4, w * 0.52 - 16, 40, 8, '#EAF1FF');
    text(ctx, n, 16, y + 22, { size: 13, weight: 600, color: AD.ink });
    text(ctx, `${c}টি`, w * 0.52 - 120, y + 22, { size: 11, weight: 500, color: AD.muted, align: 'right' });
    icon(ctx, 'edit', w * 0.52 - 96, y + 8, 15, editable ? AD.blue : AD.muted, 1.9);
    icon(ctx, 'trash', w * 0.52 - 66, y + 8, 15, del ? AD.red : AD.muted, 1.9);
    ctx.restore();
    lineY(ctx, 12, y + 38, w * 0.52 - 12, AD.line);
  });
  // right: storefront preview reacting
  const rx = w * 0.54, rw = w * 0.46;
  card(ctx, rx, 0, rw, h * 0.92);
  text(ctx, 'স্টোর প্রিভিউ', rx + 14, 30, { size: 14, weight: 700, color: AD.ink });
  const pw = rw - 40, ph = h * 0.92 - 54;
  ctx.save();
  rr(ctx, rx + 20, 42, pw, ph, 12);
  ctx.clip();
  ctx.fillStyle = '#F7F3EB'; ctx.fillRect(rx + 20, 42, pw, ph);
  text(ctx, 'ক্যাটাগরি', rx + 34, 80, { size: 15, weight: 700, color: T.ink });
  cats.forEach(([n], i) => {
    const del = o.deleteIndex === i && o.deleteP > 0.4;
    if (del) return;
    if (o.newCatP > 0 && i === 4) {
      const a = clamp(o.newCatP);
      ctx.save(); ctx.globalAlpha *= a;
    }
    const cw2 = 84;
    fillRR(ctx, rx + 34 + i * 88, 96, cw2, 30, 15, i === (o.editIndex ?? -1) ? T.ink : '#fff');
    strokeRR(ctx, rx + 34 + i * 88, 96, cw2, 30, 15, T.line, 1);
    text(ctx, n, rx + 34 + i * 88 + cw2 / 2, 116, { size: 11, weight: 600, color: i === (o.editIndex ?? -1) ? '#fff' : T.ink2, align: 'center' });
    if (o.newCatP > 0 && i === 4) ctx.restore();
  });
  const cardW2 = (pw - 20) / 2;
  PRODUCTS.slice(0, 4).forEach((pr, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    ctx.save();
    if ((o.deleteIndex === 3 || o.deleteIndex === 4) && o.deleteP > 0.4) {
      // one product row disappears with the deleted category
    }
    fillRR(ctx, rx + 34 + col * (cardW2 + 10), 140 + row * 150, cardW2, 138, 10, '#fff');
    drawWatch(ctx, rx + 34 + col * (cardW2 + 10) + cardW2 / 2, 196 + row * 150, 30, pr.tone);
    text(ctx, pr.bn, rx + 40 + col * (cardW2 + 10), 254 + row * 150, { size: 10, weight: 600, color: T.ink, maxWidth: cardW2 - 12 });
    text(ctx, `৳${pr.price}`, rx + 40 + col * (cardW2 + 10), 270 + row * 150, { size: 10, weight: 700, color: T.ink });
    ctx.restore();
  });
  ctx.restore();
}

export function adOrders(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  const tabs = ['সব', 'পেন্ডিং', 'কনফার্ম', 'প্রসেসিং', 'শিপড', 'ডেলিভারড', 'বাতিল'];
  card(ctx, 0, 0, w, h * 0.94);
  let tx = 14;
  tabs.forEach((t, i) => {
    ctx.font = fontStr(12, 600, t);
    const tw = ctx.measureText(t).width + 26;
    const act = i === (o.tab ?? 0);
    fillRR(ctx, tx, 14, tw, 32, 8, act ? AD.blue : '#F4F6FB');
    text(ctx, t, tx + tw / 2, 35, { size: 12, weight: 600, color: act ? '#fff' : AD.ink2, align: 'center' });
    tx += tw + 8;
  });
  const cols = [
    { label: 'অর্ডার', x: 12, weight: 600, color: AD.ink },
    { label: 'কাস্টমার', x: w * 0.19 },
    { label: 'তারিখ', x: w * 0.38 },
    { label: 'মোট', x: w * 0.56, weight: 600, color: AD.ink },
    { label: 'পেমেন্ট', x: w * 0.68 },
    { label: 'স্ট্যাটাস', x: w * 0.82 },
  ];
  const rows = [
    ['#AUR-1048', 'রাফিদ হাসান', '২০ অক্টো', '৳4,960', 'COD', 'পেন্ডিং'],
    ['#AUR-1047', 'সাদিয়া আক্তার', '২০ অক্টো', '৳6,520', 'COD', 'কনফার্ম'],
    ['#AUR-1046', 'তানভীর আহমেদ', '১৯ অক্টো', '৳4,220', 'Paid', 'প্রসেসিং'],
    ['#AUR-1045', 'মেহজাবীন রহমান', '১৯ অক্টো', '৳4,060', 'COD', 'শিপড'],
    ['#AUR-1044', 'ইমরান কবির', '১৮ অক্টো', '৳5,340', 'COD', 'ডেলিভারড'],
    ['#AUR-1043', 'নুসরাত জাহান', '১৮ অক্টো', '৳3,360', 'Paid', 'ডেলিভারড'],
    ['#AUR-1042', 'শাকিব হোসেন', '১৭ অক্টো', '৳6,590', 'COD', 'বাতিল'],
  ];
  tableRows(ctx, 12, 62, w - 24, rows, cols, { p: clamp(p * 1.4), rowH: 48, highlight: o.highlight ?? -1, statusCol: 5 });
  text(ctx, '১–৭ / ২৪টি অর্ডার', 14, h * 0.94 - 16, { size: 11, weight: 500, color: AD.muted });
  for (let i = 0; i < 3; i++) {
    fillRR(ctx, w - 108 + i * 30, h * 0.94 - 30, 26, 24, 6, i === 0 ? AD.blue : '#F1F4FA');
    text(ctx, String(i + 1), w - 95 + i * 30, h * 0.94 - 13, { size: 11, weight: 600, color: i === 0 ? '#fff' : AD.ink2, align: 'center' });
  }
}

export function adOrderDetail(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  // left detail
  const lw = w * 0.6;
  card(ctx, 0, 0, lw, h * 0.94);
  text(ctx, 'অর্ডার #AUR-1048', 16, 32, { size: 16, weight: 700, color: AD.ink });
  statusChip(ctx, 'পেন্ডিং', lw - 92, 14, 'amber', { size: 11, h: 24 });
  lineY(ctx, 14, 46, lw - 14, AD.line);
  text(ctx, 'কাস্টমারের তথ্য', 16, 74, { size: 12, weight: 700, color: AD.ink });
  const info = [['নাম', 'রাফিদ হাসান'], ['মোবাইল', '01712-345678'], ['ঠিকানা', 'বাসা ১২, রোড ৫, ধানমন্ডি, ঢাকা'], ['পেমেন্ট', 'ক্যাশ অন ডেলিভারি']];
  info.forEach(([k, v], i) => {
    const y = 94 + i * 30;
    const a = clamp((p - i * 0.1) / 0.3);
    ctx.save(); ctx.globalAlpha *= a;
    text(ctx, k, 16, y, { size: 11, weight: 500, color: AD.muted });
    text(ctx, v, 104, y, { size: 12, weight: 600, color: AD.ink, maxWidth: lw - 120 });
    ctx.restore();
  });
  // items
  const iy = 232;
  text(ctx, 'প্রোডাক্ট', 16, iy, { size: 12, weight: 700, color: AD.ink });
  const items = [PRODUCTS[0], PRODUCTS[2]];
  items.forEach((pr, i) => {
    const y = iy + 14 + i * 62;
    const a = clamp((p - 0.15 - i * 0.1) / 0.3);
    ctx.save(); ctx.globalAlpha *= a;
    fillRR(ctx, 16, y, 46, 46, 8, '#F2EADB');
    drawWatch(ctx, 39, y + 23, 15, pr.tone);
    text(ctx, pr.bn, 74, y + 20, { size: 12, weight: 600, color: AD.ink });
    text(ctx, `৳${pr.price.toLocaleString('en-US')} × ১`, 74, y + 38, { size: 11, weight: 500, color: AD.muted });
    text(ctx, `৳${pr.price.toLocaleString('en-US')}`, lw - 16, y + 28, { size: 12, weight: 600, color: AD.ink, align: 'right' });
    ctx.restore();
  });
  // totals
  const ty = 380;
  lineY(ctx, 14, ty, lw - 14, AD.line);
  [['সাবটোটাল', '৳8,180'], ['ডেলিভারি', '৳70'], ['মোট', '৳8,250']].forEach(([k, v], i) => {
    const y = ty + 28 + i * 28;
    text(ctx, k, 16, y, { size: i === 2 ? 14 : 11, weight: i === 2 ? 700 : 500, color: i === 2 ? AD.ink : AD.muted });
    text(ctx, v, lw - 16, y, { size: i === 2 ? 16 : 12, weight: 700, color: AD.ink, align: 'right' });
  });
  // right: status stepper
  const rx = lw + 12, rw = w - rx;
  card(ctx, rx, 0, rw, h * 0.94);
  text(ctx, 'অর্ডার স্ট্যাটাস', rx + 14, 32, { size: 14, weight: 700, color: AD.ink });
  const steps = ['পেন্ডিং', 'কনফার্ম', 'প্রসেসিং', 'শিপড', 'ডেলিভারড'];
  const activeStep = o.step ?? 1;
  steps.forEach((s, i) => {
    const y = 56 + i * 54;
    const done = i <= activeStep;
    circle(ctx, rx + 26, y + 14, 10, done ? AD.green : '#E8EDF5');
    if (done) icon(ctx, 'check', rx + 20, y + 8, 12, '#fff', 2.6);
    if (i < steps.length - 1) lineY(ctx, rx + 26, y + 24, rx + 26, y + 54, done ? alpha(AD.green, 0.5) : '#E8EDF5');
    text(ctx, s, rx + 46, y + 19, { size: 12, weight: i === activeStep ? 700 : 500, color: done ? AD.ink : AD.muted });
    if (i === activeStep) {
      const pulse = o.pulse ?? 0;
      strokeRR(ctx, rx + 40, y + 2, rw - 54, 28, 7, alpha(AD.blue, 0.4 + 0.3 * Math.sin(pulse * 6)), 1.4);
    }
  });
  // action buttons
  const ay = h * 0.94 - 96;
  fillRR(ctx, rx + 14, ay, rw - 28, 34, 8, AD.blue);
  text(ctx, 'কুরিয়ারে পাঠান', rx + rw / 2, ay + 22, { size: 11, weight: 600, color: '#fff', align: 'center' });
  fillRR(ctx, rx + 14, ay + 42, (rw - 34) / 2, 32, 8, '#F1F4FA');
  text(ctx, 'ইনভয়েস', rx + 14 + (rw - 34) / 4, ay + 63, { size: 11, weight: 600, color: AD.ink2, align: 'center' });
  fillRR(ctx, rx + 22 + (rw - 34) / 2, ay + 42, (rw - 34) / 2, 32, 8, '#FDEEEF');
  text(ctx, 'বাতিল', rx + 22 + (rw - 34) / 2 + (rw - 34) / 4, ay + 63, { size: 11, weight: 600, color: AD.red, align: 'center' });
}

export function adReports(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  const tabs = ['বিক্রি রিপোর্ট', 'অর্ডার হিস্ট্রি', 'পেমেন্ট', 'স্টক'];
  card(ctx, 0, 0, w, h * 0.94);
  let tx = 14;
  tabs.forEach((t, i) => {
    ctx.font = fontStr(12, 600, t);
    const tw = ctx.measureText(t).width + 26;
    fillRR(ctx, tx, 12, tw, 30, 8, i === (o.tab ?? 0) ? AD.blue : '#F4F6FB');
    text(ctx, t, tx + tw / 2, 32, { size: 12, weight: 600, color: i === (o.tab ?? 0) ? '#fff' : AD.ink2, align: 'center' });
    tx += tw + 8;
  });
  chartCard(ctx, 14, 54, w - 28, h * 0.44, { p, title: 'বিক্রির ধারা', tab: 'মাসিক' });
  // stock table
  text(ctx, 'স্টকের তথ্য', 16, 54 + h * 0.44 + 26, { size: 14, weight: 700, color: AD.ink });
  const cols = [
    { label: 'প্রোডাক্ট', x: 12 },
    { label: 'স্টক', x: w * 0.45 },
    { label: 'স্ট্যাটাস', x: w * 0.62 },
  ];
  tableRows(ctx, 14, 54 + h * 0.44 + 40, w - 28, [
    ['Heritage Chrono', '১৮', 'সক্রিয়'],
    ['Noir Automatic', '৯', 'সক্রিয়'],
    ['Aurum Leather', '২', 'স্টক কম'],
    ['Sport Steel', '০', 'স্টক শেষ'],
  ], cols, { p: clamp(p * 1.3), rowH: 38, statusCol: 2 });
}

export function adIncomplete(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'অসম্পূর্ণ চেকআউট', 16, 32, { size: 16, weight: 700, color: AD.ink });
  fillRR(ctx, 16 + 140, 16, 108, 24, 12, '#FFF4E2');
  text(ctx, '৪টি অর্ডার', 16 + 194, 33, { size: 11, weight: 600, color: '#B7791F', align: 'center' });
  text(ctx, 'কাস্টমার তথ্য সংরক্ষিত', w - 16, 32, { size: 11, weight: 500, color: AD.muted, align: 'right' });
  const cols = [
    { label: 'কাস্টমার', x: 12, weight: 600, color: AD.ink },
    { label: 'মোবাইল', x: w * 0.28 },
    { label: 'প্রোডাক্ট', x: w * 0.46 },
    { label: 'ধাপ', x: w * 0.68 },
    { label: 'স্ট্যাটাস', x: w * 0.84 },
  ];
  tableRows(ctx, 12, 54, w - 24, [
    ['রাফিদ হাসান', '0171•••5678', 'হেরিটেজ ক্রোনো', 'ঠিকানা', 'অসম্পূর্ণ'],
    ['সাদিয়া আক্তার', '0182•••3411', 'Noir Automatic', 'পেমেন্ট', 'অসম্পূর্ণ'],
    ['তানভীর আহমেদ', '0191•••8820', 'রোজ পেটিট', 'কার্ট', 'অসম্পূর্ণ'],
    ['মেহজাবীন রহমান', '0163•••7712', 'ক্লাসিক মেশ', 'ঠিকানা', 'অসম্পূর্ণ'],
  ], cols, { p: clamp(p * 1.4), rowH: 52, highlight: o.highlight ?? -1, statusCol: 4 });
  // contact action row
  const cy = 54 + 4 * 52 + 40;
  fillRR(ctx, 14, cy, w - 28, 76, 12, '#F6F9FF');
  strokeRR(ctx, 14, cy, w - 28, 76, 12, '#DCE7FA', 1);
  circle(ctx, 44, cy + 38, 18, '#E3F7EE');
  icon(ctx, 'chat', 32, cy + 26, 24, AD.green, 1.9);
  text(ctx, 'কাস্টমারের সঙ্গে যোগাযোগ করুন', 74, cy + 34, { size: 13, weight: 700, color: AD.ink });
  text(ctx, 'অর্ডার সম্পন্ন করার সুযোগ — সম্মতি ও প্রয়োজনের ভিত্তিতে', 74, cy + 56, { size: 10.5, weight: 500, color: AD.muted });
  fillRR(ctx, w - 118, cy + 22, 92, 32, 8, AD.green);
  text(ctx, 'মেসেজ', w - 72, cy + 43, { size: 11, weight: 600, color: '#fff', align: 'center' });
  if (o.ring) strokeRR(ctx, 12, cy - 2, w - 24, 80, 12, alpha(AD.green, 0.55), 2);
}

export function adCourier(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'কুরিয়ার অটোমেশন', 16, 32, { size: 16, weight: 700, color: AD.ink });
  text(ctx, 'সমর্থিত কুরিয়ার ইন্টিগ্রেশন', 16, 52, { size: 10.5, weight: 500, color: AD.muted });
  // order row
  fillRR(ctx, 14, 66, w - 28, 54, 10, '#F7F9FD');
  text(ctx, '#AUR-1048', 28, 90, { size: 12, weight: 700, color: AD.ink });
  text(ctx, 'রাফিদ হাসান • ধানমন্ডি, ঢাকা', 28, 108, { size: 10.5, weight: 500, color: AD.muted });
  statusChip(ctx, 'প্রস্তুত', w - 96, 80, 'blue', { size: 11, h: 24 });
  // consignment form
  const fy = 136;
  text(ctx, 'কনসাইনমেন্ট তৈরি', 16, fy, { size: 12, weight: 700, color: AD.ink });
  const fields = [['কুরিয়ার', 'সমর্থিত সার্ভিস'], ['ওজন', '০.৫ কেজি'], ['প্যাকেজ', '১টি']];
  fields.forEach(([l, v], i) => {
    const y = fy + 16 + i * 52;
    text(ctx, l, 16, y + 12, { size: 10.5, weight: 500, color: AD.muted });
    fillRR(ctx, 110, y, w - 126, 34, 8, '#FAFBFE');
    strokeRR(ctx, 110, y, w - 126, 34, 8, AD.line, 1);
    text(ctx, v, 122, y + 22, { size: 11.5, weight: 600, color: AD.ink });
  });
  const created = clamp(o.created || 0);
  fillRR(ctx, 16, fy + 182, 150, 36, 9, created > 0.9 ? AD.green : AD.blue);
  text(ctx, created > 0.9 ? 'তৈরি হয়েছে ✓' : 'কনসাইনমেন্ট তৈরি করুন', 91, fy + 205, { size: 11, weight: 600, color: '#fff', align: 'center' });
  if (created > 0.2) {
    ctx.save(); ctx.globalAlpha *= clamp((created - 0.2) / 0.6);
    fillRR(ctx, 180, fy + 182, w - 196, 36, 9, '#EAF1FF');
    text(ctx, 'ট্র্যাকিং আইডি: AUR-TRK-88214', 194, fy + 205, { size: 11, weight: 600, color: AD.blue });
    ctx.restore();
  }
  // tracking timeline
  const ty = fy + 246;
  text(ctx, 'ডেলিভারি স্ট্যাটাস', 16, ty, { size: 12, weight: 700, color: AD.ink });
  const steps = [['পিকআপ সম্পন্ন', 'আজ ১০:২০'], ['হাবে পৌঁছেছে', 'আজ ১৪:০৫'], ['ডেলিভারির পথে', 'আজ ১৬:৩০'], ['ডেলিভারড', '—']];
  const step = o.step ?? 1;
  steps.forEach(([s, time], i) => {
    const y = ty + 22 + i * 42;
    const done = i <= step;
    circle(ctx, 28, y, 9, done ? AD.green : '#E8EDF5');
    if (done) icon(ctx, 'check', 22, y - 6, 12, '#fff', 2.6);
    if (i < 3) lineY(ctx, 28, y + 9, 28, y + 42, done ? alpha(AD.green, 0.45) : '#E8EDF5');
    text(ctx, s, 48, y + 5, { size: 11.5, weight: i === step ? 700 : 500, color: done ? AD.ink : AD.muted });
    text(ctx, time, w - 16, y + 5, { size: 10, weight: 500, color: AD.muted, align: 'right' });
  });
  if (o.package > 0) {
    const a = clamp(o.package);
    ctx.save(); ctx.globalAlpha *= a;
    fillRR(ctx, w - 96, ty + 8, 76, 76, 12, '#F2EADB');
    icon(ctx, 'box', w - 70, ty + 26, 34, '#8B6B3E', 1.8);
    ctx.restore();
  }
}

export function adPayments(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'পেমেন্ট ম্যানেজমেন্ট', 16, 32, { size: 16, weight: 700, color: AD.ink });
  text(ctx, 'ইন্টিগ্রেশন ও অনুমতি সাপেক্ষে', 16, 52, { size: 10.5, weight: 500, color: AD.muted });
  const methods = [
    ['ক্যাশ অন ডেলিভারি', 'সক্রিয়', true, 'cash'],
    ['অ্যাডভান্স পেমেন্ট', 'সক্রিয়', true, 'wallet'],
    ['সমর্থিত পেমেন্ট গেটওয়ে', 'ইন্টিগ্রেশন', false, 'card'],
  ];
  methods.forEach(([name, st, on, ic], i) => {
    const y = 70 + i * 66;
    fillRR(ctx, 14, y, w - 28, 54, 10, '#FAFBFE');
    strokeRR(ctx, 14, y, w - 28, 54, 10, AD.line, 1);
    icon(ctx, ic, 28, y + 15, 24, AD.ink2, 1.8);
    text(ctx, name, 64, y + 24, { size: 12.5, weight: 600, color: AD.ink });
    text(ctx, st, 64, y + 42, { size: 10, weight: 500, color: AD.muted });
    // toggle
    const tx = w - 74;
    fillRR(ctx, tx, y + 15, 44, 24, 12, on ? AD.green : '#DDE3EC');
    circle(ctx, tx + (on ? 32 : 12), y + 27, 9, '#fff');
  });
  // reconciliation
  const ry = 70 + 3 * 66 + 18;
  text(ctx, 'অর্ডার ও পেমেন্ট মিলানো', 16, ry, { size: 12, weight: 700, color: AD.ink });
  const cols = [
    { label: 'অর্ডার', x: 12, weight: 600, color: AD.ink },
    { label: 'পেমেন্ট', x: w * 0.34 },
    { label: 'পরিমাণ', x: w * 0.56 },
    { label: 'স্ট্যাটাস', x: w * 0.74 },
  ];
  tableRows(ctx, 12, ry + 10, w - 24, [
    ['#AUR-1047', 'COD', '৳6,520', 'Paid'],
    ['#AUR-1046', 'গেটওয়ে', '৳4,220', 'Paid'],
    ['#AUR-1045', 'COD', '৳4,060', 'পেন্ডিং'],
    ['#AUR-1044', 'COD', '৳5,340', 'Paid'],
  ], cols, { p: clamp(p * 1.4), rowH: 42, statusCol: 3 });
}

export function adSecurity(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w * 0.52, h * 0.9);
  text(ctx, 'সন্দেহজনক অর্ডার', 14, 30, { size: 15, weight: 700, color: AD.ink });
  const items = [
    ['#AUR-1051', 'ডুপ্লিকেট ফোন', 'রিভিউ'],
    ['#AUR-1049', 'দ্রুত রিপিট অর্ডার', 'রিভিউ'],
    ['#AUR-1037', 'অস্বাভাবিক ঠিকানা', 'ব্লক'],
  ];
  items.forEach(([id, reason, st], i) => {
    const y = 48 + i * 76;
    const a = clamp((p * 2) - i * 0.25);
    ctx.save(); ctx.globalAlpha *= a;
    fillRR(ctx, 12, y, w * 0.52 - 24, 64, 10, '#FFFBF4');
    strokeRR(ctx, 12, y, w * 0.52 - 24, 64, 10, '#F3E3C8', 1);
    icon(ctx, 'shield', 26, y + 20, 22, AD.amber, 1.8);
    text(ctx, id, 58, y + 26, { size: 12, weight: 700, color: AD.ink });
    text(ctx, reason, 58, y + 44, { size: 10, weight: 500, color: AD.muted });
    statusChip(ctx, st, w * 0.52 - 82, y + 20, st === 'ব্লক' ? 'red' : 'amber', { size: 10, h: 22 });
    ctx.restore();
  });
  // rules
  const rx = w * 0.54, rw = w * 0.46;
  card(ctx, rx, 0, rw, h * 0.9);
  text(ctx, 'নিরাপত্তা নিয়ম', rx + 14, 30, { size: 15, weight: 700, color: AD.ink });
  const rules = [['আইপি ভিত্তিক রেট লিমিটিং', true], ['ডুপ্লিকেট অর্ডার শনাক্তকরণ', true], ['সন্দেহজনক কার্যক্রম ফ্ল্যাগ', true], ['স্বয়ংক্রিয় ব্লক', false]];
  rules.forEach(([name, on], i) => {
    const y = 54 + i * 62;
    fillRR(ctx, rx + 12, y, rw - 24, 50, 10, '#FAFBFE');
    strokeRR(ctx, rx + 12, y, rw - 24, 50, 10, AD.line, 1);
    text(ctx, name, rx + 24, y + 22, { size: 11, weight: 600, color: AD.ink, maxWidth: rw - 90 });
    text(ctx, on ? 'চালু' : 'বন্ধ', rx + 24, y + 38, { size: 9.5, weight: 500, color: AD.muted });
    const tx = rx + rw - 70;
    fillRR(ctx, tx, y + 13, 42, 22, 11, on ? AD.blue : '#DDE3EC');
    circle(ctx, tx + (on ? 30 : 11), y + 24, 8.5, '#fff');
    ctx.save(); ctx.restore();
  });
  // states row
  const sy = h * 0.9 - 54;
  ['অনুমোদন', 'রিভিউ', 'ব্লক'].forEach((s, i) => {
    const sw = (w - 20) / 3 - 8;
    fillRR(ctx, rx + 12 + i * (sw + 8), sy, sw, 34, 8, ['#E8F8F2', '#FFF4E2', '#FDEEEF'][i]);
    text(ctx, s, rx + 12 + i * (sw + 8) + sw / 2, sy + 22, { size: 11, weight: 600, color: [AD.green, '#B7791F', AD.red][i], align: 'center' });
  });
}

export function adContent(ctx, w, h, o = {}) {
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'কনটেন্ট ম্যানেজমেন্ট', 16, 32, { size: 16, weight: 700, color: AD.ink });
  text(ctx, 'সমর্থিত ফিচারগুলো নিজেই পরিবর্তন করুন', 16, 52, { size: 10.5, weight: 500, color: AD.muted });
  const items = [
    ['লোগো', 'logo', '#EAF1FF'],
    ['ব্যানার', 'banner', '#F2EADB'],
    ['প্রোডাক্ট', 'box', '#E8F8F2'],
    ['কনটেন্ট', 'edit', '#F3EEFF'],
  ];
  items.forEach(([label, ic, bg], i) => {
    const x = 14 + i * ((w - 28) / 4);
    const cw = (w - 28) / 4 - 10;
    const act = i === (o.tap ?? -1);
    fillRR(ctx, x, 70, cw, 92, 12, '#FAFBFE');
    strokeRR(ctx, x, 70, cw, 92, 12, act ? AD.blue : AD.line, act ? 2 : 1);
    fillRR(ctx, x + 12, 82, 30, 30, 8, bg);
    icon(ctx, ic, x + 19, 90, 16, AD.ink2, 1.9);
    text(ctx, label, x + 12, 130, { size: 11, weight: 600, color: AD.ink });
    text(ctx, 'পরিবর্তন', x + 12, 148, { size: 9, weight: 500, color: AD.muted });
  });
  // editor + preview
  const ey = 180;
  const ew = w * 0.44;
  card(ctx, 14, ey, ew, h * 0.94 - ey - 14);
  text(ctx, 'এডিটর', 28, ey + 26, { size: 12, weight: 700, color: AD.ink });
  [['লোগো আপলোড', 'logo'], ['হিরো ব্যানার', 'banner'], ['প্রোডাক্ট নাম', 'edit']].forEach(([l, ic], i) => {
    const y = ey + 42 + i * 54;
    fillRR(ctx, 26, y, ew - 24, 42, 8, '#FAFBFE');
    strokeRR(ctx, 26, y, ew - 24, 42, 8, AD.line, 1);
    icon(ctx, ic, 38, y + 12, 18, AD.ink2, 1.8);
    text(ctx, l, 64, y + 26, { size: 11, weight: 600, color: AD.ink2 });
    icon(ctx, 'upload', ew + 8, y + 12, 16, AD.blue, 2);
  });
  // preview phone
  const px = 14 + ew + 20, pw = w - px - 14;
  card(ctx, px, ey, pw, h * 0.94 - ey - 14);
  text(ctx, 'প্রিভিউ', px + 12, ey + 26, { size: 12, weight: 700, color: AD.ink });
  const sw2 = pw - 30, sh2 = h * 0.94 - ey - 60;
  ctx.save();
  rr(ctx, px + 15, ey + 36, sw2, sh2, 12);
  ctx.clip();
  const hue = o.bannerHue ?? 0;
  const bgc = `hsl(${38 + hue * 40}, 32%, ${24 + (o.bannerLight || 0) * 10}%)`;
  ctx.fillStyle = bgc;
  ctx.fillRect(px + 15, ey + 36, sw2, sh2 * 0.46);
  drawWatch(ctx, px + 15 + sw2 * 0.68, ey + 36 + sh2 * 0.2, 42, { face: '#F6EFE0', bezel: '#CBA76C', strap: '#3B2A1D' });
  text(ctx, 'নতুন কালেকশন', px + 30, ey + 80, { size: 10, weight: 600, color: '#D9BE8F' });
  text(ctx, 'সময়ের নিজস্ব ছন্দ', px + 30, ey + 104, { size: 16, weight: 700, color: '#fff' });
  fillRR(ctx, px + 30, ey + 116, 76, 26, 13, '#D9BE8F');
  text(ctx, 'সংগ্রহ দেখুন', px + 68, ey + 134, { size: 9.5, weight: 700, color: '#231C14', align: 'center' });
  // product grid
  PRODUCTS.slice(0, 4).forEach((pr, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cw2 = (sw2 - 30) / 2;
    const gy = ey + 36 + sh2 * 0.48 + row * 104;
    fillRR(ctx, px + 22 + col * (cw2 + 8), gy, cw2, 96, 8, '#F7F3EB');
    drawWatch(ctx, px + 22 + col * (cw2 + 8) + cw2 / 2, gy + 42, 22, pr.tone);
    text(ctx, pr.name, px + 26 + col * (cw2 + 8), gy + 76, { size: 8, weight: 600, color: T.ink });
    text(ctx, `৳${pr.price}`, px + 26 + col * (cw2 + 8), gy + 88, { size: 8, weight: 700, color: T.ink });
  });
  if (o.saved) {
    ctx.save(); ctx.globalAlpha *= clamp(o.saved);
    fillRR(ctx, px + 30, ey + h * 0.94 - ey - 92, pw - 60, 32, 8, '#E8F8F2');
    text(ctx, 'সেভ হয়েছে ✓  স্টোরে আপডেট হয়েছে', px + pw / 2, ey + h * 0.94 - ey - 71, { size: 10, weight: 600, color: '#0E7A58', align: 'center' });
    ctx.restore();
  }
  ctx.restore();
}

export function adIntegrations(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'ইন্টিগ্রেশন ও নোটিফিকেশন', 16, 32, { size: 16, weight: 700, color: AD.ink });
  text(ctx, 'প্রয়োজন অনুযায়ী যুক্ত করা যেতে পারে', 16, 52, { size: 10.5, weight: 500, color: AD.muted });
  const rows = [
    ['মেটা পিক্সেল', 'কনভার্সন ট্র্যাকিং', 'pixel', true],
    ['টেলিগ্রাম বট', 'নতুন অর্ডার নোটিফিকেশন', 'chat', true],
    ['ইমেইল নোটিফিকেশন', 'অর্ডার আপডেট', 'mail', true],
    ['কুরিয়ার সার্ভিস', 'কনসাইনমেন্ট ও ট্র্যাকিং', 'truck', true],
    ['পেমেন্ট গেটওয়ে', 'অনলাইন পেমেন্ট', 'card', false],
  ];
  rows.forEach(([name, sub, ic, on], i) => {
    const y = 70 + i * 60;
    const a = clamp((p * 2) - i * 0.18);
    ctx.save(); ctx.globalAlpha *= a;
    fillRR(ctx, 14, y, w - 28, 50, 10, '#FAFBFE');
    strokeRR(ctx, 14, y, w - 28, 50, 10, AD.line, 1);
    fillRR(ctx, 24, y + 9, 32, 32, 8, '#EAF1FF');
    icon(ctx, ic, 31, y + 16, 18, AD.blue, 1.9);
    text(ctx, name, 66, y + 22, { size: 12, weight: 600, color: AD.ink });
    text(ctx, sub, 66, y + 39, { size: 9.5, weight: 500, color: AD.muted });
    fillRR(ctx, w - 92, y + 14, 64, 22, 11, on ? '#E8F8F2' : '#F1F4FA');
    text(ctx, on ? 'যুক্ত' : 'ঐচ্ছিক', w - 60, y + 29, { size: 9.5, weight: 600, color: on ? AD.green : AD.muted, align: 'center' });
    ctx.restore();
  });
  if (o.toast > 0) {
    ctx.save();
    ctx.globalAlpha *= clamp(o.toast);
    fillRR(ctx, 14, h * 0.94 - 68, w - 28, 48, 10, '#0F1B2E');
    icon(ctx, 'bell', 28, h * 0.94 - 54, 20, '#36D7FF', 2);
    text(ctx, 'নতুন অর্ডার #AUR-1052 — ৳4,960', 58, h * 0.94 - 38, { size: 12, weight: 600, color: '#fff' });
    ctx.restore();
  }
}

export function adNotifications(ctx, w, h, o = {}) {
  const p = clamp(o.p || 0);
  card(ctx, 0, 0, w, h * 0.94);
  text(ctx, 'নোটিফিকেশন', 16, 32, { size: 16, weight: 700, color: AD.ink });
  const notes = [
    ['নতুন অর্ডার এসেছে', '#AUR-1048 • ৳4,960', 'এখনই'],
    ['অর্ডার কনফার্ম হয়েছে', '#AUR-1047 • সাদিয়া আক্তার', '৫ মিনিট আগে'],
    ['স্টক কম', 'Aurum Leather — ২টি বাকি', '২০ মিনিট আগে'],
    ['কুরিয়ার আপডেট', '#AUR-1045 ডেলিভারির পথে', '১ ঘণ্টা আগে'],
  ];
  notes.forEach(([title, body, time], i) => {
    const y = 50 + i * 66;
    const a = clamp((p * 2) - i * 0.2);
    ctx.save(); ctx.globalAlpha *= a;
    fillRR(ctx, 14, y, w - 28, 56, 10, i === 0 ? '#F0F6FF' : '#FAFBFE');
    circle(ctx, 34, y + 28, 13, i === 0 ? AD.blue : '#EAF1FF');
    icon(ctx, i === 0 ? 'list' : 'bell', 27, y + 21, 14, i === 0 ? '#fff' : AD.blue, 2);
    text(ctx, title, 58, y + 25, { size: 12, weight: 600, color: AD.ink });
    text(ctx, body, 58, y + 42, { size: 10, weight: 500, color: AD.muted });
    text(ctx, time, w - 26, y + 25, { size: 9.5, weight: 500, color: '#9AA5B6', align: 'right' });
    ctx.restore();
  });
}
