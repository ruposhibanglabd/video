import { createCanvas } from '@napi-rs/canvas';
import {
  fontSpec,
  fillRoundRect,
  strokeRoundRect,
  drawCoverPhoto,
  drawCheckCircle,
  clamp,
} from '../engine/canvas-core.mjs';

/**
 * Pre-renders bespoke, industry-specific website surfaces using our 16 original studio photos.
 * Zero fake ratings or invented testimonials; every layout has distinct color, grid & UX hierarchy.
 */
export function buildStoreSurfaces(assets) {
  const { photos } = assets;
  return {
    fashionDesktop: renderFashionDesktop(photos),
    fashionTablet: renderFashionTablet(photos),
    fashionMobile: renderFashionMobile(photos),
    watchDesktop: renderWatchDesktop(photos),
    watchMobile: renderWatchMobile(photos),
    shoeDesktop: renderShoeDesktop(photos),
    shoeMobile: renderShoeMobile(photos),
    cosmeticsDesktop: renderCosmeticsDesktop(photos),
    cosmeticsMobile: renderCosmeticsMobile(photos),
    furnitureDesktop: renderFurnitureDesktop(photos),
    furnitureMobile: renderFurnitureMobile(photos),
    restaurantDesktop: renderRestaurantDesktop(photos),
    restaurantMobile: renderRestaurantMobile(photos),
  };
}

// 1. FASHION STORE — NOIRÉ (Warm Travertine #FAF7F2, Editorial Charcoal #191817, Sand Bronze #9A6B4C)
function renderFashionDesktop(photos) {
  const W = 1280;
  const H = 1320;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  // Top bar
  ctx.fillStyle = '#191817';
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = '#EAE3D9';
  ctx.font = fontSpec(600, 13);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('নতুন কালেকশন ২০২৬  ·  সারা বাংলাদেশে হোম ডেলিভারি সুবিধা', W * 0.5, 18);

  // Nav header
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 36, W, 74);
  ctx.fillStyle = '#E6DFD5';
  ctx.fillRect(0, 109, W, 1);

  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 28);
  ctx.textAlign = 'left';
  ctx.fillText('NOIRÉ', 64, 74);

  const navItems = ['হোম', 'নতুন কালেকশন', 'লিনেন শার্ট', 'পাঞ্জাবি', 'কো-অর্ড সেট'];
  ctx.font = fontSpec(600, 16);
  navItems.forEach((item, idx) => {
    ctx.fillStyle = idx === 0 ? '#9A6B4C' : '#3F3A36';
    ctx.fillText(item, 290 + idx * 135, 74);
  });

  fillRoundRect(ctx, W - 210, 54, 146, 38, 19, '#191817');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(600, 14);
  ctx.textAlign = 'center';
  ctx.fillText('কার্ট (২)', W - 137, 73);

  // Editorial Split Hero
  fillRoundRect(ctx, 56, 134, W - 112, 430, 24, '#EFE9DF');
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9A6B4C';
  ctx.font = fontSpec(700, 15);
  ctx.fillText('ESSENTIAL LINEN EDITION', 104, 210);

  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 46);
  ctx.fillText('প্রতিদিনের পোশাকে', 104, 266);
  ctx.fillText('পরিচ্ছন্ন আভিজাত্য', 104, 326);

  ctx.fillStyle = '#57504A';
  ctx.font = fontSpec(400, 18);
  ctx.fillText('আরামদায়ক ফ্যাব্রিক, নিখুঁত কাট এবং আধুনিক রঙের সমন্বয়ে তৈরি পোশাক।', 104, 382);

  fillRoundRect(ctx, 104, 424, 196, 52, 26, '#191817');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 16);
  ctx.textAlign = 'center';
  ctx.fillText('কালেকশন দেখুন →', 202, 450);

  strokeRoundRect(ctx, 318, 424, 168, 52, 26, '#BDB2A4', 1.5);
  ctx.fillStyle = '#191817';
  ctx.fillText('ক্যাটাগরি', 402, 450);

  drawCoverPhoto(ctx, photos.s04_fashion_hero, 690, 154, 510, 390, { radius: 18, zoom: 1.04 });

  // Category Pills Row
  const cats = ['সব পণ্য', 'লিনেন শার্ট', 'কটন টিউনিক', 'ক্যাজুয়াল সেট', 'অ্যাকসেসরিজ'];
  cats.forEach((cat, idx) => {
    const cx = 56 + idx * 176;
    fillRoundRect(ctx, cx, 594, 160, 42, 21, idx === 0 ? '#191817' : '#EFEAE2');
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : '#3E3935';
    ctx.font = fontSpec(600, 15);
    ctx.textAlign = 'center';
    ctx.fillText(cat, cx + 80, 615);
  });

  // Section Heading
  ctx.textAlign = 'left';
  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 28);
  ctx.fillText('নির্বাচিত পোশাক তালিকা', 56, 686);

  // 3-Column Product Grid
  const items = [
    { img: photos.s04_fashion_hero, tag: 'NEW', cat: 'লিনেন শার্ট', name: 'আইভরি টেইলরড লিনেন শার্ট', price: '৳ ২,৪৫০' },
    { img: photos.s04_fashion_item2, tag: 'POPULAR', cat: 'কটন কালেকশন', name: 'সেজ টেক্সচারড কটন টিউনিক', price: '৳ ২,১৫০' },
    { img: photos.s01_boutique_env, tag: 'EDITION', cat: 'কো-অর্ড সেট', name: 'স্যান্ড আর্থ লিনেন কো-অর্ড', price: '৳ ২,৯৫০' },
  ];

  const cardW = 368;
  const gap = 32;
  items.forEach((it, idx) => {
    const x = 56 + idx * (cardW + gap);
    const y = 720;
    fillRoundRect(ctx, x, y, cardW, 530, 20, '#FFFFFF');
    strokeRoundRect(ctx, x, y, cardW, 530, 20, '#EAE3D9', 1.2);
    drawCoverPhoto(ctx, it.img, x + 14, y + 14, cardW - 28, 336, { radius: 14 });

    fillRoundRect(ctx, x + 28, y + 28, 86, 28, 14, 'rgba(25, 24, 23, 0.84)');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 12);
    ctx.textAlign = 'center';
    ctx.fillText(it.tag, x + 71, y + 42);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8C7A6B';
    ctx.font = fontSpec(600, 14);
    ctx.fillText(it.cat, x + 22, y + 378);

    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(700, 20);
    ctx.fillText(it.name, x + 22, y + 408);

    ctx.fillStyle = '#9A6B4C';
    ctx.font = fontSpec(800, 23);
    ctx.fillText(it.price, x + 22, y + 448);

    fillRoundRect(ctx, x + 22, y + 472, 152, 40, 12, '#EFEAE2');
    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(600, 14);
    ctx.textAlign = 'center';
    ctx.fillText('কার্টে যোগ', x + 98, y + 492);

    fillRoundRect(ctx, x + 186, y + 472, 160, 40, 12, '#191817');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 14);
    ctx.fillText('অর্ডার করুন', x + 266, y + 492);
  });

  return c;
}

function renderFashionTablet(photos) {
  const W = 820;
  const H = 1280;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#191817';
  ctx.fillRect(0, 0, W, 32);
  ctx.fillStyle = '#EAE3D9';
  ctx.font = fontSpec(600, 12);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOIRÉ  ·  নতুন লিনেন ও কটন কালেকশন', W * 0.5, 16);

  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 25);
  ctx.textAlign = 'left';
  ctx.fillText('NOIRÉ', 40, 68);

  const tabs = ['নতুন', 'শার্ট', 'পাঞ্জাবি', 'সেট'];
  ctx.font = fontSpec(600, 15);
  tabs.forEach((t, i) => {
    ctx.fillStyle = i === 0 ? '#9A6B4C' : '#4A443F';
    ctx.fillText(t, 230 + i * 98, 68);
  });
  fillRoundRect(ctx, W - 144, 48, 104, 36, 18, '#191817');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(600, 13);
  ctx.textAlign = 'center';
  ctx.fillText('কার্ট (২)', W - 92, 66);

  // Hero card
  fillRoundRect(ctx, 36, 104, W - 72, 340, 22, '#EFE9DF');
  drawCoverPhoto(ctx, photos.s04_fashion_hero, 420, 120, 348, 308, { radius: 16 });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9A6B4C';
  ctx.font = fontSpec(700, 13);
  ctx.fillText('NEW SEASON', 68, 168);
  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 34);
  ctx.fillText('আধুনিক ফ্যাশন', 68, 214);
  ctx.fillText('কালেকশন', 68, 258);
  fillRoundRect(ctx, 68, 316, 168, 46, 23, '#191817');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 14);
  ctx.textAlign = 'center';
  ctx.fillText('সব দেখুন →', 152, 339);

  // 2-Column Tablet Product Grid
  const list = [
    { img: photos.s04_fashion_hero, name: 'আইভরি লিনেন শার্ট', price: '৳ ২,৪৫০' },
    { img: photos.s04_fashion_item2, name: 'সেজ কটন টিউনিক', price: '৳ ২,১৫০' },
    { img: photos.s01_boutique_env, name: 'স্যান্ড কো-অর্ড সেট', price: '৳ ২,৯৫০' },
    { img: photos.s01_hero_craft, name: 'লেদার অ্যাকসেসরিজ সেট', price: '৳ ১,৮৫০' },
  ];
  list.forEach((it, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 36 + col * 384;
    const y = 474 + row * 384;
    fillRoundRect(ctx, x, y, 364, 364, 18, '#FFFFFF');
    strokeRoundRect(ctx, x, y, 364, 364, 18, '#E8E0D5', 1.2);
    drawCoverPhoto(ctx, it.img, x + 12, y + 12, 340, 232, { radius: 12 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(700, 18);
    ctx.fillText(it.name, x + 18, y + 268);
    ctx.fillStyle = '#9A6B4C';
    ctx.font = fontSpec(800, 20);
    ctx.fillText(it.price, x + 18, y + 302);
    fillRoundRect(ctx, x + 210, y + 292, 136, 40, 12, '#191817');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 14);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 278, y + 312);
  });

  return c;
}

function renderFashionMobile(photos) {
  const W = 460;
  const H = 1520;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  // Mobile Header below dynamic island
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, 94);
  ctx.fillStyle = '#E6DFD5';
  ctx.fillRect(0, 93, W, 1);

  // Hamburger lines
  ctx.strokeStyle = '#191817';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(26, 54 + i * 7);
    ctx.lineTo(48, 54 + i * 7);
    ctx.stroke();
  }

  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(800, 24);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOIRÉ', W * 0.5, 62);

  fillRoundRect(ctx, W - 92, 44, 68, 34, 17, '#191817');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 13);
  ctx.fillText('কার্ট ২', W - 58, 61);

  // Hero Card
  drawCoverPhoto(ctx, photos.s04_fashion_hero, 22, 112, W - 44, 340, {
    radius: 22,
    overlay: 'rgba(20, 16, 12, 0.24)',
  });
  fillRoundRect(ctx, 42, 336, 196, 46, 23, '#FFFFFF');
  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(700, 15);
  ctx.textAlign = 'center';
  ctx.fillText('নতুন কালেকশন দেখুন', 140, 359);

  // Category Chips
  const chips = ['সব পণ্য', 'লিনেন শার্ট', 'পাঞ্জাবি', 'কো-অর্ড'];
  chips.forEach((ch, idx) => {
    const x = 22 + idx * 106;
    fillRoundRect(ctx, x, 472, 98, 38, 19, idx === 0 ? '#191817' : '#ECE6DC');
    ctx.fillStyle = idx === 0 ? '#FFFFFF' : '#3E3935';
    ctx.font = fontSpec(600, 13);
    ctx.textAlign = 'center';
    ctx.fillText(ch, x + 49, 491);
  });

  // 2-Column Mobile Product Cards (4 items across 2 rows + wide banner)
  const products = [
    { img: photos.s04_fashion_hero, name: 'আইভরি লিনেন শার্ট', price: '৳ ২,৪৫০' },
    { img: photos.s04_fashion_item2, name: 'সেজ কটন টিউনিক', price: '৳ ২,১৫০' },
    { img: photos.s01_boutique_env, name: 'স্যান্ড কো-অর্ড সেট', price: '৳ ২,৯৫০' },
    { img: photos.s01_hero_craft, name: 'লেদার ট্রাভেল সেট', price: '৳ ১,৮৫০' },
  ];

  products.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cw = 200;
    const x = 22 + col * 216;
    const y = 532 + row * 336;
    fillRoundRect(ctx, x, y, cw, 318, 18, '#FFFFFF');
    strokeRoundRect(ctx, x, y, cw, 318, 18, '#EAE3D9', 1);
    drawCoverPhoto(ctx, p.img, x + 10, y + 10, cw - 20, 186, { radius: 12 });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(700, 15);
    ctx.fillText(p.name, x + 12, y + 216);

    ctx.fillStyle = '#9A6B4C';
    ctx.font = fontSpec(800, 17);
    ctx.fillText(p.price, x + 12, y + 244);

    fillRoundRect(ctx, x + 12, y + 266, cw - 24, 38, 10, '#191817');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 13);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + cw * 0.5, y + 285);
  });

  // Editorial bottom feature card
  fillRoundRect(ctx, 22, 1216, W - 44, 250, 20, '#191817');
  drawCoverPhoto(ctx, photos.s04_fashion_item2, 38, 1232, 170, 218, { radius: 14 });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#D7C4B0';
  ctx.font = fontSpec(600, 13);
  ctx.fillText('CURATED QUALITY', 226, 1276);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 20);
  ctx.fillText('বাছাইকৃত ফ্যাব্রিক', 226, 1310);
  ctx.fillText('ও নিখুঁত সেলাই', 226, 1338);
  fillRoundRect(ctx, 226, 1378, 178, 42, 21, '#9A6B4C');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 14);
  ctx.textAlign = 'center';
  ctx.fillText('বিস্তারিত দেখুন', 315, 1399);

  return c;
}

// 2. WATCH STORE — TIMEORA (Obsidian #0B0E14, Champagne Gold #C9A46A)
function renderWatchDesktop(photos) {
  const W = 1160;
  const H = 760;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0B0E14';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#C9A46A';
  ctx.font = fontSpec(800, 24);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TIMEORA', 52, 46);

  const nav = ['Men', 'Women', 'Chronograph', 'Minimal', 'Collection'];
  ctx.font = fontSpec(600, 15);
  nav.forEach((n, i) => {
    ctx.fillStyle = i === 2 ? '#C9A46A' : '#9AA6B8';
    ctx.fillText(n, 260 + i * 126, 46);
  });
  ctx.fillStyle = 'rgba(201,164,106,0.22)';
  ctx.fillRect(48, 78, W - 96, 1);

  // Dark Museum Pedestal Hero
  drawCoverPhoto(ctx, photos.s04_watch_hero, 540, 104, 572, 360, { radius: 20 });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#C9A46A';
  ctx.font = fontSpec(700, 14);
  ctx.fillText('SIGNATURE CHRONOGRAPH SERIES', 54, 156);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(800, 42);
  ctx.fillText('সময়ের নিখুঁত', 54, 212);
  ctx.fillText('প্রিমিয়াম পরিচয়', 54, 266);

  ctx.fillStyle = '#94A3B8';
  ctx.font = fontSpec(400, 17);
  ctx.fillText('316L স্টেইনলেস স্টিল ও মিনিমাল ডায়ালের আধুনিক কালেকশন।', 54, 320);

  fillRoundRect(ctx, 54, 364, 198, 48, 24, '#C9A46A');
  ctx.fillStyle = '#0B0E14';
  ctx.font = fontSpec(800, 15);
  ctx.textAlign = 'center';
  ctx.fillText('কালেকশন দেখুন', 153, 388);

  // Bottom 3 horology cards
  const cards = [
    { img: photos.s04_watch_hero, title: 'রোজ-গোল্ড ক্রোনোগ্রাফ', spec: '316L Steel · 10 ATM', price: '৳ ৫,৪৯০' },
    { img: photos.s04_watch_item2, title: 'মিডনাইট ব্লু লেদার', spec: 'Sapphire Glass · Slim', price: '৳ ৪,২৯০' },
    { img: photos.s01_hero_craft, title: 'হেরিটেজ সিলভার এডিশন', spec: 'Hand-Stitched Strap', price: '৳ ৩,৮৯০' },
  ];
  cards.forEach((cd, idx) => {
    const x = 48 + idx * 362;
    const y = 492;
    fillRoundRect(ctx, x, y, 340, 236, 18, '#131924');
    strokeRoundRect(ctx, x, y, 340, 236, 18, 'rgba(201,164,106,0.24)', 1);
    drawCoverPhoto(ctx, cd.img, x + 14, y + 14, 142, 208, { radius: 12 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 17);
    ctx.fillText(cd.title, x + 170, y + 54);
    ctx.fillStyle = '#8A99AD';
    ctx.font = fontSpec(500, 13);
    ctx.fillText(cd.spec, x + 170, y + 84);
    ctx.fillStyle = '#C9A46A';
    ctx.font = fontSpec(800, 21);
    ctx.fillText(cd.price, x + 170, y + 132);
    fillRoundRect(ctx, x + 170, y + 168, 150, 40, 10, '#C9A46A');
    ctx.fillStyle = '#0B0E14';
    ctx.font = fontSpec(700, 14);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 245, y + 188);
  });

  return c;
}

function renderWatchMobile(photos) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0B0E14';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#C9A46A';
  ctx.font = fontSpec(800, 22);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TIMEORA', W * 0.5, 58);

  drawCoverPhoto(ctx, photos.s04_watch_hero, 22, 92, W - 44, 300, { radius: 20 });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#C9A46A';
  ctx.font = fontSpec(700, 13);
  ctx.fillText('MINIMAL LUXURY TIMEPIECES', 26, 424);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(800, 28);
  ctx.fillText('সিগনেচার ঘড়ির কালেকশন', 26, 458);

  const items = [
    { img: photos.s04_watch_hero, name: 'রোজ-গোল্ড ক্রোনোগ্রাফ', price: '৳ ৫,৪৯০' },
    { img: photos.s04_watch_item2, name: 'মিডনাইট ব্লু লেদার', price: '৳ ৪,২৯০' },
  ];
  items.forEach((it, i) => {
    const x = 22 + i * 214;
    const y = 498;
    fillRoundRect(ctx, x, y, 202, 310, 18, '#141B27');
    strokeRoundRect(ctx, x, y, 202, 310, 18, 'rgba(201,164,106,0.28)', 1);
    drawCoverPhoto(ctx, it.img, x + 10, y + 10, 182, 168, { radius: 12 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 15);
    ctx.fillText(it.name, x + 12, y + 202);
    ctx.fillStyle = '#C9A46A';
    ctx.font = fontSpec(800, 18);
    ctx.fillText(it.price, x + 12, y + 234);
    fillRoundRect(ctx, x + 12, y + 256, 178, 38, 10, '#C9A46A');
    ctx.fillStyle = '#0B0E14';
    ctx.font = fontSpec(700, 13);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 101, y + 275);
  });

  fillRoundRect(ctx, 22, 832, W - 44, 92, 16, '#141B27');
  ctx.fillStyle = '#CBD5E1';
  ctx.font = fontSpec(600, 14);
  ctx.textAlign = 'center';
  ctx.fillText('316L Steel  ·  10 ATM Water Resistant  ·  COD সারা দেশে', W * 0.5, 878);

  return c;
}

// 3. FOOTWEAR STORE — STRIDE (Concrete Alabaster #F3F5F8, Espresso Leather #4A2C1D)
function renderShoeDesktop(photos) {
  const W = 1160;
  const H = 760;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F3F5F8';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, 74);
  ctx.fillStyle = '#111827';
  ctx.font = fontSpec(800, 26);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('STRIDE', 48, 38);

  const cats = ['সব জুতা', 'চেলসি বুট', 'স্নিকার্স', 'লোফার', 'ফরমাল'];
  cats.forEach((cat, idx) => {
    const x = 230 + idx * 136;
    fillRoundRect(ctx, x, 19, 122, 36, 18, idx === 1 ? '#4A2C1D' : '#EEF1F6');
    ctx.fillStyle = idx === 1 ? '#FFFFFF' : '#374151';
    ctx.font = fontSpec(600, 14);
    ctx.textAlign = 'center';
    ctx.fillText(cat, x + 61, 37);
  });

  // Left featured product focus + Right 2 product cards
  fillRoundRect(ctx, 44, 100, 560, 622, 24, '#FFFFFF');
  drawCoverPhoto(ctx, photos.s04_shoe_hero, 64, 120, 520, 360, { radius: 18 });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#4A2C1D';
  ctx.font = fontSpec(700, 14);
  ctx.fillText('HANDCRAFTED LEATHER SERIES', 68, 512);
  ctx.fillStyle = '#111827';
  ctx.font = fontSpec(800, 30);
  ctx.fillText('এসপ্রেসো চেলসি বুট ও স্নিকার্স', 68, 550);
  ctx.fillStyle = '#4A2C1D';
  ctx.font = fontSpec(800, 26);
  ctx.fillText('৳ ১,৮৯০', 68, 594);

  // EU Size selector pills
  const sizes = ['40', '41', '42', '43', '44'];
  sizes.forEach((sz, idx) => {
    const sx = 68 + idx * 62;
    fillRoundRect(ctx, sx, 628, 50, 44, 10, idx === 2 ? '#111827' : '#F3F5F8');
    ctx.fillStyle = idx === 2 ? '#FFFFFF' : '#111827';
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'center';
    ctx.fillText(sz, sx + 25, 650);
  });
  fillRoundRect(ctx, 396, 624, 186, 52, 14, '#4A2C1D');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 16);
  ctx.fillText('অর্ডার করুন', 489, 650);

  // Right stacked footwear cards
  const rightCards = [
    { img: photos.s04_shoe_item2, l1: 'ট্যান সুয়েড', l2: 'ক্লাসিক লোফার', cat: 'ক্যাজুয়াল লোফার', price: '৳ ২,১৫০' },
    { img: photos.s04_shoe_hero, l1: 'মিনিমাল হোয়াইট', l2: 'লেদার স্নিকার্স', cat: 'প্রিমিয়াম স্নিকার্স', price: '৳ ২,২৯০' },
  ];
  rightCards.forEach((rc, i) => {
    const y = 100 + i * 320;
    fillRoundRect(ctx, 628, y, 488, 302, 22, '#FFFFFF');
    drawCoverPhoto(ctx, rc.img, 646, y + 18, 220, 266, { radius: 16 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = fontSpec(600, 14);
    ctx.fillText(rc.cat, 886, y + 66);
    ctx.fillStyle = '#111827';
    ctx.font = fontSpec(700, 21);
    ctx.fillText(rc.l1, 886, y + 102);
    ctx.fillText(rc.l2, 886, y + 132);
    ctx.fillStyle = '#4A2C1D';
    ctx.font = fontSpec(800, 24);
    ctx.fillText(rc.price, 886, y + 186);
    fillRoundRect(ctx, 886, y + 224, 204, 46, 12, '#111827');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'center';
    ctx.fillText('কার্টে যোগ করুন', 988, y + 247);
  });

  return c;
}

function renderShoeMobile(photos) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F3F5F8';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#111827';
  ctx.font = fontSpec(800, 22);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STRIDE FOOTWEAR', W * 0.5, 58);

  drawCoverPhoto(ctx, photos.s04_shoe_hero, 22, 92, W - 44, 280, { radius: 20 });
  const sizes = ['40', '41', '42', '43'];
  sizes.forEach((s, i) => {
    fillRoundRect(ctx, 22 + i * 70, 392, 58, 38, 10, i === 1 ? '#4A2C1D' : '#FFFFFF');
    ctx.fillStyle = i === 1 ? '#FFFFFF' : '#111827';
    ctx.font = fontSpec(700, 14);
    ctx.textAlign = 'center';
    ctx.fillText(`EU ${s}`, 51 + i * 70, 411);
  });

  const cards = [
    { img: photos.s04_shoe_hero, name: 'এসপ্রেসো চেলসি বুট', price: '৳ ১,৮৯০' },
    { img: photos.s04_shoe_item2, name: 'ট্যান সুয়েড লোফার', price: '৳ ২,১৫০' },
  ];
  cards.forEach((cd, i) => {
    const x = 22 + i * 214;
    const y = 452;
    fillRoundRect(ctx, x, y, 202, 340, 18, '#FFFFFF');
    drawCoverPhoto(ctx, cd.img, x + 10, y + 10, 182, 186, { radius: 12 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#111827';
    ctx.font = fontSpec(700, 15);
    ctx.fillText(cd.name, x + 12, y + 220);
    ctx.fillStyle = '#4A2C1D';
    ctx.font = fontSpec(800, 18);
    ctx.fillText(cd.price, x + 12, y + 252);
    fillRoundRect(ctx, x + 12, y + 280, 178, 42, 10, '#4A2C1D');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 13);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 101, y + 301);
  });
  return c;
}

// 4. COSMETICS STORE — LUMÉRA (Rose Pearl #FDF6F6, Botanical Mauve #8E4A64)
function renderCosmeticsDesktop(photos) {
  const W = 1160;
  const H = 760;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#FDF6F6';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#8E4A64';
  ctx.font = fontSpec(800, 26);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('LUMÉRA', 52, 46);

  const nav = ['Skincare', 'Serum', 'Moisturizer', 'Sunscreen', 'Lip Care'];
  ctx.font = fontSpec(600, 15);
  nav.forEach((n, i) => {
    ctx.fillStyle = i === 0 ? '#8E4A64' : '#6D5A62';
    ctx.fillText(n, 250 + i * 136, 46);
  });

  // Soft-radius Pastel Hero
  fillRoundRect(ctx, 44, 86, W - 88, 336, 30, '#F5E6E8');
  drawCoverPhoto(ctx, photos.s04_cosmetics_hero, 576, 104, 520, 300, { radius: 22 });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8E4A64';
  ctx.font = fontSpec(700, 14);
  ctx.fillText('CLEAN BOTANICAL SKINCARE', 84, 152);
  ctx.fillStyle = '#2B1E23';
  ctx.font = fontSpec(800, 38);
  ctx.fillText('প্রতিদিনের স্কিনকেয়ার', 84, 204);
  ctx.fillText('ও বিউটি কালেকশন', 84, 254);

  fillRoundRect(ctx, 84, 310, 198, 48, 24, '#8E4A64');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = fontSpec(700, 15);
  ctx.textAlign = 'center';
  ctx.fillText('স্কিনকেয়ার দেখুন', 183, 334);

  // 3 Clean Beauty Cards
  const prods = [
    { img: photos.s04_cosmetics_hero, cat: 'SERUM', l1: 'ভিটামিন সি', l2: 'ব্রাইটেনিং সিরাম', price: '৳ ১,৪৯০' },
    { img: photos.s04_cosmetics_item2, cat: 'LIP & OIL', l1: 'বোটানিক্যাল ফেসিয়াল', l2: 'অয়েল ও লিপ টিন্ট', price: '৳ ১,১৯০' },
    { img: photos.s04_cosmetics_hero, cat: 'MOISTURIZER', l1: 'ডেইলি ব্যারিয়ার', l2: 'ময়েশ্চারাইজার', price: '৳ ১,২৫০' },
  ];
  prods.forEach((p, idx) => {
    const x = 44 + idx * 364;
    const y = 448;
    fillRoundRect(ctx, x, y, 344, 282, 24, '#FFFFFF');
    strokeRoundRect(ctx, x, y, 344, 282, 24, '#F0DCE1', 1.2);
    drawCoverPhoto(ctx, p.img, x + 14, y + 14, 138, 254, { radius: 16 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8E4A64';
    ctx.font = fontSpec(700, 12);
    ctx.fillText(p.cat, x + 168, y + 48);
    ctx.fillStyle = '#2B1E23';
    ctx.font = fontSpec(700, 16);
    ctx.fillText(p.l1, x + 168, y + 84);
    ctx.fillText(p.l2, x + 168, y + 110);
    ctx.fillStyle = '#8E4A64';
    ctx.font = fontSpec(800, 21);
    ctx.fillText(p.price, x + 168, y + 166);
    fillRoundRect(ctx, x + 168, y + 208, 156, 42, 21, '#8E4A64');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 14);
    ctx.textAlign = 'center';
    ctx.fillText('কার্টে যোগ', x + 246, y + 229);
  });

  return c;
}

function renderCosmeticsMobile(photos) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FDF6F6';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#8E4A64';
  ctx.font = fontSpec(800, 24);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LUMÉRA BEAUTY', W * 0.5, 58);
  drawCoverPhoto(ctx, photos.s04_cosmetics_hero, 22, 92, W - 44, 290, { radius: 24 });
  const list = [
    { img: photos.s04_cosmetics_hero, name: 'ব্রাইটেনিং সিরাম', price: '৳ ১,৪৯০' },
    { img: photos.s04_cosmetics_item2, name: 'ফেসিয়াল অয়েল ও টিন্ট', price: '৳ ১,১৯০' },
  ];
  list.forEach((it, i) => {
    const x = 22 + i * 214;
    const y = 414;
    fillRoundRect(ctx, x, y, 202, 336, 22, '#FFFFFF');
    drawCoverPhoto(ctx, it.img, x + 10, y + 10, 182, 182, { radius: 16 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B1E23';
    ctx.font = fontSpec(700, 15);
    ctx.fillText(it.name, x + 14, y + 218);
    ctx.fillStyle = '#8E4A64';
    ctx.font = fontSpec(800, 18);
    ctx.fillText(it.price, x + 14, y + 250);
    fillRoundRect(ctx, x + 14, y + 278, 174, 40, 20, '#8E4A64');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 13);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 101, y + 298);
  });
  return c;
}

// 5. FURNITURE STORE — WOODORA (Sunlit Linen #F5F1EA, Solid Walnut #5C3D28)
function renderFurnitureDesktop(photos) {
  const W = 1160;
  const H = 760;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F5F1EA';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#232621';
  ctx.font = fontSpec(800, 26);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WOODORA', 48, 44);

  const rooms = ['লিভিং রুম', 'ডাইনিং সেট', 'বেডরুম', 'অফিস ফার্নিচার'];
  ctx.font = fontSpec(600, 15);
  rooms.forEach((rm, i) => {
    ctx.fillStyle = i === 0 ? '#5C3D28' : '#57534E';
    ctx.fillText(rm, 260 + i * 165, 44);
  });

  // Wide Architectural Interior Banner
  drawCoverPhoto(ctx, photos.s04_furniture_hero, 44, 78, W - 88, 378, {
    radius: 22,
    overlay: 'rgba(24, 20, 16, 0.26)',
  });
  fillRoundRect(ctx, 76, 336, 430, 96, 18, 'rgba(250, 247, 242, 0.94)');
  ctx.textAlign = 'left';
  ctx.fillStyle = '#5C3D28';
  ctx.font = fontSpec(700, 13);
  ctx.fillText('ARCHITECTURAL LIVING', 100, 366);
  ctx.fillStyle = '#232621';
  ctx.font = fontSpec(800, 24);
  ctx.fillText('আধুনিক ইন্টেরিয়র ও ফার্নিচার কালেকশন', 100, 402);

  // Two wide interior showcase cards below
  const fCards = [
    { img: photos.s04_furniture_hero, name: 'ওসলো ওয়ালনাট ৩-সিটার সোফা', spec: 'Solid Walnut · Bouclé Fabric', price: '৳ ৫২,০০০' },
    { img: photos.s04_furniture_item2, name: 'ক্লাসিক ৬-সিটার ওক ডাইনিং সেট', spec: 'Natural Oak · Linen Chairs', price: '৳ ৬৮,০০০' },
  ];
  fCards.forEach((fc, idx) => {
    const x = 44 + idx * 548;
    const y = 478;
    fillRoundRect(ctx, x, y, 524, 252, 20, '#FFFFFF');
    drawCoverPhoto(ctx, fc.img, x + 14, y + 14, 236, 224, { radius: 14 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#232621';
    ctx.font = fontSpec(700, 19);
    ctx.fillText(fc.name, x + 268, y + 58);
    ctx.fillStyle = '#78716C';
    ctx.font = fontSpec(500, 14);
    ctx.fillText(fc.spec, x + 268, y + 92);
    ctx.fillStyle = '#5C3D28';
    ctx.font = fontSpec(800, 24);
    ctx.fillText(fc.price, x + 268, y + 148);
    fillRoundRect(ctx, x + 268, y + 186, 196, 44, 12, '#5C3D28');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'center';
    ctx.fillText('বিস্তারিত ও অর্ডার', x + 366, y + 208);
  });

  return c;
}

function renderFurnitureMobile(photos) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F5F1EA';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#5C3D28';
  ctx.font = fontSpec(800, 23);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WOODORA LIVING', W * 0.5, 58);
  drawCoverPhoto(ctx, photos.s04_furniture_hero, 22, 92, W - 44, 270, { radius: 20 });
  const cards = [
    { img: photos.s04_furniture_hero, name: 'ওসলো ৩-সিটার সোফা', price: '৳ ৫২,০০০' },
    { img: photos.s04_furniture_item2, name: '৬-সিটার ডাইনিং টেবিল সেট', price: '৳ ৬৮,০০০' },
  ];
  cards.forEach((cd, i) => {
    const y = 386 + i * 250;
    fillRoundRect(ctx, 22, y, W - 44, 230, 18, '#FFFFFF');
    drawCoverPhoto(ctx, cd.img, 36, y + 14, 178, 202, { radius: 14 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#232621';
    ctx.font = fontSpec(700, 17);
    ctx.fillText(cd.name, 228, y + 58);
    ctx.fillStyle = '#5C3D28';
    ctx.font = fontSpec(800, 21);
    ctx.fillText(cd.price, 228, y + 106);
    fillRoundRect(ctx, 228, y + 152, 188, 44, 12, '#5C3D28');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 14);
    ctx.textAlign = 'center';
    ctx.fillText('বিস্তারিত দেখুন', 322, y + 174);
  });
  return c;
}

// 6. RESTAURANT — NOORÉ (Culinary Dark Walnut #14100E, Saffron Amber #E08A2E)
function renderRestaurantDesktop(photos) {
  const W = 1160;
  const H = 760;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#14100E';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#E08A2E';
  ctx.font = fontSpec(800, 26);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOORÉ KITCHEN', 48, 44);

  ctx.fillStyle = '#D6C7B8';
  ctx.font = fontSpec(600, 14);
  ctx.textAlign = 'right';
  ctx.fillText('Dine-in · Takeaway · Home Delivery   |   ধানমন্ডি, ঢাকা · ১১:০০ AM – ১১:০০ PM', W - 48, 44);

  // Culinary Hero
  drawCoverPhoto(ctx, photos.s04_restaurant_hero, 44, 80, 560, 642, {
    radius: 22,
    overlay: 'rgba(16, 10, 6, 0.22)',
  });
  fillRoundRect(ctx, 72, 578, 504, 118, 18, 'rgba(20, 16, 14, 0.88)');
  strokeRoundRect(ctx, 72, 578, 504, 118, 18, 'rgba(224, 138, 46, 0.42)', 1.2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E08A2E';
  ctx.font = fontSpec(700, 14);
  ctx.fillText('FRESHLY PREPARED MENU', 98, 612);
  ctx.fillStyle = '#FFF9F2';
  ctx.font = fontSpec(800, 24);
  ctx.fillText('মেনু দেখুন ও অনলাইনে অর্ডার করুন', 98, 652);

  // Right Live Menu Cards + Contact Footer
  const dishes = [
    { img: photos.s04_restaurant_hero, name: 'সিগনেচার জাফরানি চিকেন বিরিয়ানি', sub: 'বাসমতি চাল, রোস্টেড মসলা ও সালাদ', price: '৳ ৩৫০' },
    { img: photos.s04_restaurant_hero, name: 'হার্ব গ্রিলড চিকেন স্টেক প্ল্যাটার', sub: 'গার্লিক পটেটো ও হাউস সস সহ', price: '৳ ৪৮০' },
    { img: photos.s04_restaurant_item2, name: 'স্মোকি ব্রিওশ বিফ বার্গার কম্বো', sub: 'ওয়েজেস ও ফ্রেশ প্যাসনফ্রুট কুলার', price: '৳ ৩৮০' },
  ];
  dishes.forEach((d, idx) => {
    const x = 628;
    const y = 80 + idx * 176;
    fillRoundRect(ctx, x, y, 488, 160, 18, '#1F1916');
    strokeRoundRect(ctx, x, y, 488, 160, 18, 'rgba(224,138,46,0.22)', 1);
    drawCoverPhoto(ctx, d.img, x + 14, y + 14, 132, 132, { radius: 14 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFF9F2';
    ctx.font = fontSpec(700, 18);
    ctx.fillText(d.name, x + 164, y + 42);
    ctx.fillStyle = '#B8A99A';
    ctx.font = fontSpec(400, 14);
    ctx.fillText(d.sub, x + 164, y + 74);
    ctx.fillStyle = '#E08A2E';
    ctx.font = fontSpec(800, 21);
    ctx.fillText(d.price, x + 164, y + 120);
    fillRoundRect(ctx, x + 344, y + 100, 126, 40, 20, '#E08A2E');
    ctx.fillStyle = '#14100E';
    ctx.font = fontSpec(800, 14);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', x + 407, y + 120);
  });

  // Restaurant Location & Reservation Strip
  fillRoundRect(ctx, 628, 612, 488, 110, 18, '#241C17');
  strokeRoundRect(ctx, 628, 612, 488, 110, 18, 'rgba(224,138,46,0.35)', 1);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E08A2E';
  ctx.font = fontSpec(700, 14);
  ctx.fillText('ঠিকানা ও যোগাযোগ', 654, 646);
  ctx.fillStyle = '#FFF9F2';
  ctx.font = fontSpec(600, 16);
  ctx.fillText('সাতমসজিদ রোড, ধানমন্ডি, ঢাকা  ·  প্রতিদিন ১১টা – রাত ১১টা', 654, 682);

  return c;
}

function renderRestaurantMobile(photos) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#14100E';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#E08A2E';
  ctx.font = fontSpec(800, 23);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOORÉ KITCHEN', W * 0.5, 58);
  drawCoverPhoto(ctx, photos.s04_restaurant_hero, 22, 92, W - 44, 250, { radius: 20 });

  const items = [
    { img: photos.s04_restaurant_hero, name: 'স্পেশাল চিকেন বিরিয়ানি', price: '৳ ৩৫০' },
    { img: photos.s04_restaurant_item2, name: 'স্মোকি বিফ বার্গার কম্বো', price: '৳ ৩৮০' },
  ];
  items.forEach((it, i) => {
    const y = 364 + i * 196;
    fillRoundRect(ctx, 22, y, W - 44, 178, 18, '#201916');
    drawCoverPhoto(ctx, it.img, 36, y + 14, 150, 150, { radius: 14 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFF9F2';
    ctx.font = fontSpec(700, 17);
    ctx.fillText(it.name, 202, y + 52);
    ctx.fillStyle = '#E08A2E';
    ctx.font = fontSpec(800, 21);
    ctx.fillText(it.price, 202, y + 96);
    fillRoundRect(ctx, 202, y + 122, 198, 40, 20, '#E08A2E');
    ctx.fillStyle = '#14100E';
    ctx.font = fontSpec(800, 14);
    ctx.textAlign = 'center';
    ctx.fillText('অর্ডার করুন', 301, y + 142);
  });

  fillRoundRect(ctx, 22, 766, W - 44, 134, 18, '#241C17');
  ctx.fillStyle = '#FFF9F2';
  ctx.font = fontSpec(600, 15);
  ctx.textAlign = 'center';
  ctx.fillText('ধানমন্ডি, ঢাকা  ·  হোম ডেলিভারি ও টেকঅ্যাওয়ে', W * 0.5, 814);
  ctx.fillStyle = '#E08A2E';
  ctx.font = fontSpec(700, 15);
  ctx.fillText('খোলা প্রতিদিন সকাল ১১:০০ – রাত ১১:০০', W * 0.5, 854);

  return c;
}

/**
 * Interactive E-commerce Product Detail / Variant / Checkout Screen Generator (for Scene 05)
 * Renders a crisp 460x960 mobile viewport according to step state!
 */
export function renderEcommerceStepScreen(photos, { mode = 'detail', selectedSize = 1, selectedColor = 0, checkoutProgress = 0 } = {}) {
  const W = 460;
  const H = 960;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, W, 86);
  ctx.fillStyle = '#E6DFD5';
  ctx.fillRect(0, 85, W, 1);
  ctx.fillStyle = '#191817';
  ctx.font = fontSpec(700, 16);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('← ফিরে যান', 24, 56);
  ctx.font = fontSpec(800, 20);
  ctx.textAlign = 'center';
  ctx.fillText('NOIRÉ', W * 0.5, 56);

  if (mode === 'detail' || mode === 'variants') {
    const heroImg = selectedColor === 1 ? photos.s04_fashion_item2 : photos.s04_fashion_hero;
    drawCoverPhoto(ctx, heroImg, 22, 102, W - 44, 390, { radius: 20 });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8C7A6B';
    ctx.font = fontSpec(600, 14);
    ctx.fillText('লিনেন কালেকশন · স্টকে আছে', 26, 524);

    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(800, 24);
    ctx.fillText('আইভরি টেইলরড লিনেন শার্ট', 26, 558);

    ctx.fillStyle = '#9A6B4C';
    ctx.font = fontSpec(800, 26);
    ctx.fillText('৳ ২,৪৫০', 26, 598);

    // Color Swatches
    ctx.fillStyle = '#3F3A36';
    ctx.font = fontSpec(700, 15);
    ctx.fillText('রঙ নির্বাচন করুন:', 26, 650);
    const colors = [
      { label: 'আইভরি', hex: '#EDE6DA' },
      { label: 'সেজ গ্রিন', hex: '#7D907D' },
      { label: 'স্যান্ড', hex: '#CBB396' },
    ];
    colors.forEach((sw, idx) => {
      const cx = 48 + idx * 116;
      const cy = 692;
      fillRoundRect(ctx, cx - 22, cy - 20, 104, 40, 20, idx === selectedColor ? '#191817' : '#FFFFFF');
      strokeRoundRect(ctx, cx - 22, cy - 20, 104, 40, 20, idx === selectedColor ? '#191817' : '#D5CCC0', 1.5);
      ctx.fillStyle = sw.hex;
      ctx.beginPath();
      ctx.arc(cx - 4, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = idx === selectedColor ? '#FFFFFF' : '#191817';
      ctx.font = fontSpec(600, 13);
      ctx.textAlign = 'left';
      ctx.fillText(sw.label, cx + 12, cy + 1);
    });

    // Size Chips
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3F3A36';
    ctx.font = fontSpec(700, 15);
    ctx.fillText('সাইজ নির্বাচন করুন:', 26, 748);
    const sizes = ['S', 'M', 'L', 'XL'];
    sizes.forEach((sz, idx) => {
      const sx = 26 + idx * 96;
      const sy = 772;
      const active = idx === selectedSize;
      fillRoundRect(ctx, sx, sy, 82, 48, 12, active ? '#191817' : '#FFFFFF');
      strokeRoundRect(ctx, sx, sy, 82, 48, 12, active ? '#191817' : '#D5CCC0', 1.5);
      ctx.fillStyle = active ? '#FFFFFF' : '#191817';
      ctx.font = fontSpec(700, 16);
      ctx.textAlign = 'center';
      ctx.fillText(sz, sx + 41, sy + 24);
    });

    // Bottom CTA button
    fillRoundRect(ctx, 26, 852, W - 52, 62, 16, '#191817');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 18);
    ctx.textAlign = 'center';
    ctx.fillText('কার্টে যোগ ও অর্ডার করুন →', W * 0.5, 883);
  } else if (mode === 'checkout') {
    // Clean Checkout Sheet
    fillRoundRect(ctx, 22, 104, W - 44, 126, 18, '#FFFFFF');
    strokeRoundRect(ctx, 22, 104, W - 44, 126, 18, '#E6DFD5', 1);
    drawCoverPhoto(ctx, photos.s04_fashion_item2, 36, 118, 92, 98, { radius: 12 });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(700, 16);
    ctx.fillText('টেইলরড লিনেন শার্ট (সাইজ L)', 144, 146);
    ctx.fillStyle = '#6E645B';
    ctx.font = fontSpec(500, 14);
    ctx.fillText('রঙ: সেজ গ্রিন  ·  পরিমাণ: ১টি', 144, 174);
    ctx.fillStyle = '#9A6B4C';
    ctx.font = fontSpec(800, 19);
    ctx.fillText('৳ ২,৪৫০', 144, 204);

    // Delivery info fields
    const fields = [
      { label: 'কাস্টমারের নাম', value: 'তানভীর আহমেদ' },
      { label: 'মোবাইল নম্বর', value: '017XX-XXXXXX' },
      { label: 'ডেলিভারি ঠিকানা', value: 'বাড়ি ১২, রোড ৫, উত্তরা, ঢাকা' },
    ];
    fields.forEach((f, idx) => {
      const fy = 252 + idx * 102;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4A433D';
      ctx.font = fontSpec(600, 14);
      ctx.fillText(f.label, 28, fy);
      fillRoundRect(ctx, 22, fy + 18, W - 44, 56, 14, '#FFFFFF');
      strokeRoundRect(ctx, 22, fy + 18, W - 44, 56, 14, '#DCD3C7', 1.2);
      ctx.fillStyle = '#191817';
      ctx.font = fontSpec(600, 16);
      ctx.fillText(f.value, 40, fy + 46);
    });

    // Payment / COD Selector (scope-accurate)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4A433D';
    ctx.font = fontSpec(600, 14);
    ctx.fillText('পেমেন্ট মাধ্যম (প্রজেক্টের পরিধি অনুযায়ী)', 28, 568);
    fillRoundRect(ctx, 22, 588, W - 44, 58, 14, '#FFFFFF');
    strokeRoundRect(ctx, 22, 588, W - 44, 58, 14, '#191817', 1.8);
    drawCheckCircle(ctx, 50, 617, 13, '#191817', '#FFFFFF');
    ctx.fillStyle = '#191817';
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'left';
    ctx.fillText('ক্যাশ অন ডেলিভারি / সমর্থিত পেমেন্ট', 74, 617);

    // Order total summary
    fillRoundRect(ctx, 22, 668, W - 44, 118, 16, '#F2ECE3');
    ctx.fillStyle = '#4A433D';
    ctx.font = fontSpec(600, 15);
    ctx.textAlign = 'left';
    ctx.fillText('পণ্যের মূল্য', 42, 700);
    ctx.fillText('ডেলিভারি চার্জ', 42, 730);
    ctx.font = fontSpec(800, 17);
    ctx.fillStyle = '#191817';
    ctx.fillText('সর্বমোট', 42, 764);

    ctx.textAlign = 'right';
    ctx.font = fontSpec(600, 15);
    ctx.fillText('৳ ২,৪৫০', W - 42, 700);
    ctx.fillText('৳ ৭০', W - 42, 730);
    ctx.font = fontSpec(800, 19);
    ctx.fillStyle = '#9A6B4C';
    ctx.fillText('৳ ২,৫২০', W - 42, 764);

    // Submit / Confirmed state
    const confirmed = checkoutProgress > 0.62;
    fillRoundRect(ctx, 22, 814, W - 44, 68, 18, confirmed ? '#12B981' : '#191817');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(800, 18);
    ctx.textAlign = 'center';
    ctx.fillText(
      confirmed ? '✓ অর্ডার সফলভাবে সম্পন্ন হয়েছে' : 'অর্ডার নিশ্চিত করুন  ·  ৳ ২,৫২০',
      W * 0.5,
      848
    );
  }

  return c;
}
