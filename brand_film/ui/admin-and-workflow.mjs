import { createCanvas } from '@napi-rs/canvas';
import {
  fontSpec,
  fillRoundRect,
  strokeRoundRect,
  drawCoverPhoto,
  drawCheckCircle,
} from '../engine/canvas-core.mjs';

export function buildAdminSurfaces(assets) {
  const { photos } = assets;
  return {
    overview: renderAdminScreen(photos, 'overview'),
    products: renderAdminScreen(photos, 'products'),
    orders: renderAdminScreen(photos, 'orders'),
  };
}

export function renderAdminScreen(photos, activeTab = 'overview', { highlightRow = 0 } = {}) {
  const W = 1240;
  const H = 840;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Clean neutral workspace background
  ctx.fillStyle = '#F4F6FA';
  ctx.fillRect(0, 0, W, H);

  // Left Sidebar (Deep Navy)
  const sideW = 248;
  ctx.fillStyle = '#081426';
  ctx.fillRect(0, 0, sideW, H);

  // Store title in sidebar
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(800, 21);
  ctx.fillText('স্টোর প্যানেল', 28, 48);
  ctx.fillStyle = '#8DEBFF';
  ctx.font = fontSpec(500, 12);
  ctx.fillText('ব্যবসা পরিচালনা ড্যাশবোর্ড', 28, 72);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(24, 98, sideW - 48, 1);

  const navItems = [
    { key: 'overview', label: 'ড্যাশবোর্ড সারসংক্ষেপ' },
    { key: 'products', label: 'পণ্য ও ক্যাটাগরি' },
    { key: 'orders', label: 'অর্ডার ব্যবস্থাপনা' },
    { key: 'stock', label: 'স্টক হালনাগাদ' },
    { key: 'settings', label: 'ওয়েবসাইট সেটিংস' },
  ];

  navItems.forEach((item, idx) => {
    const ny = 124 + idx * 58;
    const isActive = item.key === activeTab;
    if (isActive) {
      fillRoundRect(ctx, 16, ny, sideW - 32, 46, 12, '#397BFF');
    }
    ctx.fillStyle = isActive ? '#FFFFFF' : '#9FB2CC';
    ctx.font = fontSpec(isActive ? 700 : 500, 15);
    ctx.textAlign = 'left';
    ctx.fillText(item.label, 34, ny + 23);
  });

  // Main Header Bar
  const mainX = sideW;
  const mainW = W - sideW;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(mainX, 0, mainW, 78);
  ctx.fillStyle = '#E3E8F2';
  ctx.fillRect(mainX, 77, mainW, 1);

  const headings = {
    overview: 'স্টোর কন্ট্রোল ড্যাশবোর্ড',
    products: 'পণ্য ও ক্যাটাগরি ব্যবস্থাপনা',
    orders: 'অর্ডার তালিকা ও স্ট্যাটাস',
  };
  ctx.fillStyle = '#081426';
  ctx.font = fontSpec(800, 23);
  ctx.textAlign = 'left';
  ctx.fillText(headings[activeTab] || headings.overview, mainX + 36, 40);

  // Transparent Demo Data Badge
  fillRoundRect(ctx, W - 266, 21, 230, 36, 18, '#EEF4FF');
  strokeRoundRect(ctx, W - 266, 21, 230, 36, 18, '#C7DBFF', 1.2);
  ctx.fillStyle = '#1E40AF';
  ctx.font = fontSpec(700, 13);
  ctx.textAlign = 'center';
  ctx.fillText('ডেমো ইন্টারফেস · নমুনা তথ্য', W - 151, 39);

  if (activeTab === 'overview') {
    // 4 Clean Summary Cards (No messy random charts!)
    const cards = [
      { label: 'নতুন অর্ডার', val: '১২টি', note: 'যাচাইয়ের অপেক্ষায়', accent: '#397BFF' },
      { label: 'প্রস্তুত হচ্ছে', val: '০৮টি', note: 'প্যাকেজিং ধাপে', accent: '#0EA5E9' },
      { label: 'সক্রিয় পণ্য', val: '৩৬টি', note: '৪টি ক্যাটাগরিতে', accent: '#10B981' },
      { label: 'কম স্টক অ্যালার্ট', val: '০৩টি', note: 'স্টক হালনাগাদ প্রয়োজন', accent: '#F59E0B' },
    ];
    cards.forEach((cd, i) => {
      const cx = mainX + 36 + i * 234;
      const cy = 106;
      fillRoundRect(ctx, cx, cy, 218, 142, 18, '#FFFFFF');
      strokeRoundRect(ctx, cx, cy, 218, 142, 18, '#E3E8F2', 1.2);
      ctx.fillStyle = cd.accent;
      ctx.fillRect(cx + 22, cy + 22, 34, 5);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#52637A';
      ctx.font = fontSpec(600, 14);
      ctx.fillText(cd.label, cx + 22, cy + 52);
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(800, 32);
      ctx.fillText(cd.val, cx + 22, cy + 90);
      ctx.fillStyle = '#6E7F96';
      ctx.font = fontSpec(500, 13);
      ctx.fillText(cd.note, cx + 22, cy + 122);
    });

    // Recent Orders Clean Table Card
    const tx = mainX + 36;
    const ty = 274;
    const tw = mainW - 72;
    fillRoundRect(ctx, tx, ty, tw, 360, 20, '#FFFFFF');
    strokeRoundRect(ctx, tx, ty, tw, 360, 20, '#E3E8F2', 1.2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#081426';
    ctx.font = fontSpec(800, 19);
    ctx.fillText('সাম্প্রতিক অর্ডার তালিকা', tx + 28, ty + 38);

    // Table header
    fillRoundRect(ctx, tx + 20, ty + 68, tw - 40, 42, 10, '#F4F6FA');
    ctx.fillStyle = '#52637A';
    ctx.font = fontSpec(700, 14);
    ctx.fillText('অর্ডার আইডি', tx + 38, ty + 89);
    ctx.fillText('কাস্টমার', tx + 210, ty + 89);
    ctx.fillText('পণ্য', tx + 430, ty + 89);
    ctx.fillText('মোট মূল্য', tx + 640, ty + 89);
    ctx.fillText('স্ট্যাটাস', tx + 790, ty + 89);

    const rows = [
      { id: '#ORD-1048', cust: 'সাদিয়া রহমান', prod: 'আইভরি লিনেন শার্ট (L)', amt: '৳ ২,৫২০', st: 'নতুন অর্ডার', stBg: '#DBEAFE', stFg: '#1D4ED8' },
      { id: '#ORD-1047', cust: 'তানভীর হাসান', prod: 'সেজ কটন টিউনিক (M)', amt: '৳ ২,২২০', st: 'প্রস্তুত হচ্ছে', stBg: '#FEF3C7', stFg: '#B45309' },
      { id: '#ORD-1046', cust: 'মেহেদী ইসলাম', prod: 'স্যান্ড কো-অর্ড সেট', amt: '৳ ৩,০২০', st: 'প্যাকেজিং সম্পন্ন', stBg: '#E0E7FF', stFg: '#4338CA' },
      { id: '#ORD-1045', cust: 'নুসরাত জাহান', prod: 'লেদার অ্যাকসেসরিজ সেট', amt: '৳ ১,৯২০', st: 'ডেলিভারড', stBg: '#D1FAE5', stFg: '#047857' },
    ];
    rows.forEach((r, idx) => {
      const ry = ty + 124 + idx * 56;
      if (idx > 0) {
        ctx.fillStyle = '#EEF2F7';
        ctx.fillRect(tx + 28, ry - 8, tw - 56, 1);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(700, 15);
      ctx.fillText(r.id, tx + 38, ry + 20);
      ctx.font = fontSpec(600, 15);
      ctx.fillText(r.cust, tx + 210, ry + 20);
      ctx.fillStyle = '#475569';
      ctx.font = fontSpec(500, 14);
      ctx.fillText(r.prod, tx + 430, ry + 20);
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(700, 15);
      ctx.fillText(r.amt, tx + 640, ry + 20);

      fillRoundRect(ctx, tx + 772, ry + 3, 126, 32, 16, r.stBg);
      ctx.fillStyle = r.stFg;
      ctx.font = fontSpec(700, 13);
      ctx.textAlign = 'center';
      ctx.fillText(r.st, tx + 835, ry + 19);
    });

    // Quick Action Strip at bottom
    const qy = 660;
    const actions = ['+ নতুন পণ্য যোগ করুন', 'ক্যাটাগরি সাজান', 'অর্ডার স্ট্যাটাস আপডেট'];
    actions.forEach((ac, idx) => {
      const ax = tx + idx * 312;
      fillRoundRect(ctx, ax, qy, 296, 140, 18, idx === 0 ? '#081426' : '#FFFFFF');
      if (idx > 0) strokeRoundRect(ctx, ax, qy, 296, 140, 18, '#E3E8F2', 1.2);
      ctx.textAlign = 'left';
      ctx.fillStyle = idx === 0 ? '#8DEBFF' : '#397BFF';
      ctx.font = fontSpec(700, 13);
      ctx.fillText(`দ্রুত কাজ ০${idx + 1}`, ax + 24, qy + 42);
      ctx.fillStyle = idx === 0 ? '#FFFFFF' : '#081426';
      ctx.font = fontSpec(700, 19);
      ctx.fillText(ac, ax + 24, qy + 84);
    });
  } else if (activeTab === 'products') {
    // Product Management Interface
    const tx = mainX + 36;
    fillRoundRect(ctx, W - 266, 102, 230, 48, 12, '#397BFF');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'center';
    ctx.fillText('+ নতুন পণ্য যোগ করুন', W - 151, 126);

    const catPills = ['সব পণ্য (৩৬)', 'লিনেন শার্ট (১২)', 'কটন টিউনিক (১০)', 'অ্যাকসেসরিজ (১৪)'];
    catPills.forEach((cp, idx) => {
      const px = tx + idx * 172;
      fillRoundRect(ctx, px, 106, 158, 40, 20, idx === 0 ? '#081426' : '#FFFFFF');
      if (idx > 0) strokeRoundRect(ctx, px, 106, 158, 40, 20, '#DCE3EE', 1);
      ctx.fillStyle = idx === 0 ? '#FFFFFF' : '#334155';
      ctx.font = fontSpec(600, 13);
      ctx.textAlign = 'center';
      ctx.fillText(cp, px + 79, 126);
    });

    const prods = [
      { img: photos.s04_fashion_hero, name: 'আইভরি টেইলরড লিনেন শার্ট', cat: 'লিনেন শার্ট', variants: 'S, M, L, XL', price: '৳ ২,৪৫০', stock: 'স্টকে আছে · ১৮টি' },
      { img: photos.s04_fashion_item2, name: 'সেজ টেক্সচারড কটন টিউনিক', cat: 'কটন কালেকশন', variants: 'M, L, XL', price: '৳ ২,১৫০', stock: 'স্টকে আছে · ১৪টি' },
      { img: photos.s04_watch_hero, name: 'রোজ-গোল্ড ক্রোনোগ্রাফ ঘড়ি', cat: 'অ্যাকসেসরিজ', variants: 'Standard', price: '৳ ৫,৪৯০', stock: 'স্টকে আছে · ০৯টি' },
      { img: photos.s04_shoe_hero, name: 'হ্যান্ডক্রাফটেড লেদার চেলসি বুট', cat: 'ফুটওয়্যার', variants: '40, 41, 42, 43', price: '৳ ১,৮৯০', stock: 'স্টকে আছে · ২২টি' },
    ];

    prods.forEach((p, idx) => {
      const py = 172 + idx * 154;
      const sel = idx === highlightRow;
      fillRoundRect(ctx, tx, py, mainW - 72, 138, 18, '#FFFFFF');
      strokeRoundRect(ctx, tx, py, mainW - 72, 138, 18, sel ? '#397BFF' : '#E3E8F2', sel ? 2 : 1.2);
      drawCoverPhoto(ctx, p.img, tx + 18, py + 16, 106, 106, { radius: 14 });

      ctx.textAlign = 'left';
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(700, 19);
      ctx.fillText(p.name, tx + 144, py + 42);

      ctx.fillStyle = '#64748B';
      ctx.font = fontSpec(500, 14);
      ctx.fillText(`ক্যাটাগরি: ${p.cat}   ·   ভ্যারিয়েন্ট: ${p.variants}`, tx + 144, py + 76);

      fillRoundRect(ctx, tx + 144, py + 94, 152, 28, 14, '#ECFDF5');
      ctx.fillStyle = '#047857';
      ctx.font = fontSpec(700, 12);
      ctx.textAlign = 'center';
      ctx.fillText(p.stock, tx + 220, py + 108);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(800, 22);
      ctx.fillText(p.price, tx + mainW - 230, py + 62);

      fillRoundRect(ctx, tx + mainW - 204, py + 44, 114, 44, 12, '#F1F5F9');
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(700, 14);
      ctx.textAlign = 'center';
      ctx.fillText('সম্পাদনা', tx + mainW - 147, py + 66);
    });
  } else {
    // Order List & Status Management View
    const tx = mainX + 36;
    const statuses = ['সব অর্ডার (২৪)', 'নতুন (১২)', 'প্রস্তুত হচ্ছে (০৮)', 'সম্পন্ন (০৪)'];
    statuses.forEach((st, idx) => {
      const sx = tx + idx * 218;
      fillRoundRect(ctx, sx, 104, 202, 44, 22, idx === 0 ? '#081426' : '#FFFFFF');
      if (idx > 0) strokeRoundRect(ctx, sx, 104, 202, 44, 22, '#DCE3EE', 1);
      ctx.fillStyle = idx === 0 ? '#FFFFFF' : '#334155';
      ctx.font = fontSpec(700, 14);
      ctx.textAlign = 'center';
      ctx.fillText(st, sx + 101, 126);
    });

    // Selected Order Detail + Status Updater Card
    fillRoundRect(ctx, tx, 172, mainW - 72, 284, 20, '#FFFFFF');
    strokeRoundRect(ctx, tx, 172, mainW - 72, 284, 20, '#397BFF', 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#397BFF';
    ctx.font = fontSpec(700, 14);
    ctx.fillText('নির্বাচিত অর্ডার বিস্তারিত', tx + 28, 208);
    ctx.fillStyle = '#081426';
    ctx.font = fontSpec(800, 24);
    ctx.fillText('অর্ডার #ORD-1048  ·  সাদিয়া রহমান', tx + 28, 244);
    ctx.fillStyle = '#475569';
    ctx.font = fontSpec(500, 15);
    ctx.fillText('পণ্য: আইভরি টেইলরড লিনেন শার্ট (সাইজ L)   |   ঠিকানা: উত্তরা, ঢাকা   |   মোট: ৳ ২,৫২০', tx + 28, 282);

    // Status Workflow Pills
    const flow = ['নতুন অর্ডার', 'তথ্য যাচাইকৃত', 'প্যাকেজিং প্রস্তুত', 'কুরিয়ারে প্রেরিত'];
    flow.forEach((fl, idx) => {
      const fx = tx + 28 + idx * 216;
      const fy = 330;
      const done = idx <= 2;
      fillRoundRect(ctx, fx, fy, 198, 52, 14, done ? '#081426' : '#F1F5F9');
      if (done) drawCheckCircle(ctx, fx + 26, fy + 26, 11, '#397BFF', '#FFFFFF');
      ctx.fillStyle = done ? '#FFFFFF' : '#64748B';
      ctx.font = fontSpec(700, 14);
      ctx.textAlign = 'left';
      ctx.fillText(fl, fx + (done ? 46 : 24), fy + 26);
    });

    // Lower order rows
    const others = [
      { id: '#ORD-1047', cust: 'তানভীর হাসান · ধানমন্ডি, ঢাকা', amt: '৳ ২,২২০', st: 'প্রস্তুত হচ্ছে' },
      { id: '#ORD-1046', cust: 'মেহেদী ইসলাম · আগ্রাবাদ, চট্টগ্রাম', amt: '৳ ৩,০২০', st: 'কুরিয়ারে প্রেরিত' },
      { id: '#ORD-1045', cust: 'নুসরাত জাহান · সিলেট সদর', amt: '৳ ১,৯২০', st: 'ডেলিভারড' },
    ];
    others.forEach((ot, i) => {
      const oy = 478 + i * 108;
      fillRoundRect(ctx, tx, oy, mainW - 72, 92, 16, '#FFFFFF');
      strokeRoundRect(ctx, tx, oy, mainW - 72, 92, 16, '#E3E8F2', 1);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(800, 17);
      ctx.fillText(ot.id, tx + 28, oy + 46);
      ctx.fillStyle = '#334155';
      ctx.font = fontSpec(600, 16);
      ctx.fillText(ot.cust, tx + 170, oy + 46);
      ctx.fillStyle = '#081426';
      ctx.font = fontSpec(800, 18);
      ctx.fillText(ot.amt, tx + 620, oy + 46);
      fillRoundRect(ctx, tx + 740, oy + 26, 152, 40, 20, '#EEF4FF');
      ctx.fillStyle = '#1E40AF';
      ctx.font = fontSpec(700, 14);
      ctx.textAlign = 'center';
      ctx.fillText(ot.st, tx + 816, oy + 46);
    });
  }

  return c;
}
