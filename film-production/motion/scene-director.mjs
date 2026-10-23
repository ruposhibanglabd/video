// Complete 11-Scene Master Commercial Film Director (00:00.00 -> 08:12.00 @ 30 FPS)
import {
  fontSpec,
  clamp,
  clamp01,
  lerp,
  prog,
  easeOutCubic,
  easeOutQuart,
  easeOutExpo,
  easeInOutCubic,
  easeOutBack,
  fillRoundRect,
  strokeRoundRect,
  roundRectPath,
  drawCoverImage,
  wrapTextLines,
  drawTextBlock,
  drawBrandWordmark,
  drawPerspectiveSurface,
  renderDeviceFrameToCanvas,
  drawCursorAndRipple,
  drawTopSceneHeader,
  drawCaptionBar,
} from '../render/graphics-kit.mjs';
import { SCENES, FILM_META } from '../script/master-script.mjs';
import { STORES } from '../websites/store-catalog.mjs';

function findActiveScene(t) {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (t >= SCENES[i].start) return SCENES[i];
  }
  return SCENES[0];
}

function findActiveCaption(t, voTimeline) {
  for (const seg of voTimeline) {
    if (t >= seg.at - 0.12 && t <= seg.end + 0.35) {
      const aIn = clamp01((t - (seg.at - 0.12)) / 0.25);
      const aOut = clamp01(((seg.end + 0.35) - t) / 0.30);
      return { text: seg.caption, alpha: Math.min(aIn, aOut) };
    }
  }
  return null;
}

// ============================================================================
// SCENE 01 (00:00 – 00:30): THE POWERFUL OPENING HOOK
// ============================================================================
function renderScene01(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);

  if (t < 4.25) {
    // 0–4.25s: Immediate attractive flagship website + kinetic headline push-in (strong from Frame 0!)
    const u = t / 4.25;
    const enter = lerp(0.55, 1.0, easeOutExpo(prog(t, 0, 0.55)));

    // Kinetic Headline Group (y = 166..490)
    fillRoundRect(ctx, 330, 162, 420, 48, 24, 'rgba(57, 123, 255, 0.20)');
    strokeRoundRect(ctx, 330, 162, 420, 48, 24, 'rgba(141, 235, 255, 0.45)', 1.5);
    ctx.font = fontSpec(700, 21);
    ctx.fillStyle = '#8DEBFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('বাংলাদেশি ব্যবসার জন্য প্রিমিয়াম ওয়েবসাইট', 540, 186);

    drawTextBlock(ctx, 'আপনার মনের মতো ওয়েবসাইট,\nমাত্র ৩০০০ টাকায়!', 540, 234, 930, {
      size: 62,
      weight: 800,
      color: '#FFFFFF',
      lineHeight: 1.32,
      align: 'center',
      reveal: lerp(0.84, 1.0, prog(t, 0, 0.42)),
    });

    drawTextBlock(ctx, 'আপনার পছন্দের ডিজাইন, আপনার প্রয়োজনের ফিচার!', 540, 420, 920, {
      size: 31,
      weight: 600,
      color: '#8DEBFF',
      lineHeight: 1.38,
      align: 'center',
      reveal: lerp(0.75, 1.0, prog(t, 0.08, 0.48)),
    });

    // Live 3D Perspective Desktop + Smartphone Hero Showcase pushing smoothly toward camera
    const scrollDesk = lerp(0, 130, easeInOutCubic(u));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('fashion'), scrollDesk, {
      device: 'desktop',
      url: 'aureliadhaka.shop',
    });
    const zoom = lerp(0.95, 1.01, easeOutCubic(u));
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 476, 875 + (1 - enter) * 48, 820 * zoom, 568 * zoom, {
      rotY: lerp(-0.16, -0.05, easeOutCubic(u)),
      sheenPos: prog(t, 0.6, 2.2),
    });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('watch'), lerp(0, 110, u), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 828, 1165 + (1 - enter) * 64, 318 * zoom, 650 * zoom, {
      rotY: lerp(0.19, 0.08, easeOutCubic(u)),
      shadowAlpha: 0.52,
    });

    // Bottom crisp quick-value strip (visible from frame 0 for instant mobile impact)
    const bAlpha = lerp(0.85, 1.0, easeOutCubic(prog(t, 0.0, 0.45)));
    ctx.save();
    ctx.globalAlpha = bAlpha;
    fillRoundRect(ctx, 180, 1525, 720, 84, 42, 'rgba(16, 37, 68, 0.92)');
    strokeRoundRect(ctx, 180, 1525, 720, 84, 42, '#397BFF', 2);
    ctx.font = fontSpec(800, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('মাত্র ৩০০০ টাকা   ·   এডভান্স নেই!', 540, 1567);
    ctx.restore();
  } else if (t < 10.25) {
    // 4.25–10.25s: Four distinct business showcases (Fashion, Watches, Shoes, Cosmetics) — 1.50s each, readable & crisp!
    const slots = [
      { id: 'fashion', title: 'ফ্যাশন ও পোশাক স্টোর', sub: 'জামদানি, পাঞ্জাবি ও বুটিক কালেকশন' },
      { id: 'watch', title: 'লাক্সারি ঘড়ির ওয়েবসাইট', sub: 'ক্রোনোগ্রাফ ও ক্লাসিক লেদার সিরিজ' },
      { id: 'shoe', title: 'জুতা ও ফুটওয়্যার ব্র্যান্ড', sub: 'হ্যান্ডক্রাফটেড ফরমাল ও স্নিকার শপ' },
      { id: 'cosmetics', title: 'কসমেটিকস ও স্কিনকেয়ার', sub: 'বোটানিক্যাল বিউটি ও সিরাম স্টোর' },
    ];
    const local = (t - 4.25) / 1.5;
    const idx = clamp(Math.floor(local), 0, 3);
    const subT = local - idx;
    const cur = slots[idx];
    const enter = easeOutExpo(clamp01(subT / 0.34));

    drawTextBlock(ctx, 'আপনার পছন্দের ডিজাইন,\nআপনার প্রয়োজনের ফিচার!', 540, 184, 920, {
      size: 48,
      weight: 800,
      color: '#FFFFFF',
      align: 'center',
      reveal: 1,
    });

    // Category pill badge
    fillRoundRect(ctx, 270, 344, 540, 56, 28, 'rgba(57, 123, 255, 0.24)');
    strokeRoundRect(ctx, 270, 344, 540, 56, 28, '#8DEBFF', 1.6);
    ctx.font = fontSpec(700, 24);
    ctx.fillStyle = '#8DEBFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cur.title}  —  ${cur.sub}`, 540, 372);

    const scroll = lerp(20, 250, easeInOutCubic(subT));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get(cur.id), scroll, {
      device: 'desktop',
      url: STORES.find((s) => s.id === cur.id).domain,
    });
    drawPerspectiveSurface(
      ctx,
      S.scratchDesktopA,
      468 + (1 - enter) * 80,
      820,
      835,
      578,
      { rotY: lerp(-0.14, -0.04, subT), alpha: enter, sheenPos: subT }
    );

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get(cur.id), scroll * 0.7, {
      device: 'mobile',
    });
    drawPerspectiveSurface(
      ctx,
      S.scratchMobileA,
      816 + (1 - enter) * 90,
      1210,
      344,
      704,
      { rotY: lerp(0.16, 0.06, subT), alpha: enter }
    );

    // Step dots indicator
    for (let d = 0; d < 4; d++) {
      fillRoundRect(ctx, 464 + d * 42, 1595, d === idx ? 32 : 12, 10, 5, d === idx ? '#8DEBFF' : 'rgba(255,255,255,0.25)');
    }
  } else if (t < 18.25) {
    // 10.25–18.25s: Bold Premium Price Reveal ("মাত্র ৩০০০ টাকা") + Separate Prominent Highlight ("এডভান্স নেই!")
    const pPrice = easeOutBack(prog(t, 10.25, 0.85));
    const pNoAdv = easeOutBack(prog(t, 12.45, 0.85));

    ctx.font = fontSpec(700, 28);
    ctx.fillStyle = '#8DEBFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('পেশাদার ওয়েবসাইট অফার', 540, 198);

    // Monumental Price Card (y = 248..548)
    ctx.save();
    ctx.translate(540, 398);
    ctx.scale(lerp(0.86, 1.0, pPrice), lerp(0.86, 1.0, pPrice));
    ctx.globalAlpha = clamp01(prog(t, 10.25, 0.35));

    const gradPrice = ctx.createLinearGradient(-440, -145, 440, 145);
    gradPrice.addColorStop(0, '#102544');
    gradPrice.addColorStop(0.5, '#193B6E');
    gradPrice.addColorStop(1, '#0B1B34');
    fillRoundRect(ctx, -446, -148, 892, 296, 36, gradPrice);
    strokeRoundRect(ctx, -446, -148, 892, 296, 36, '#397BFF', 3);

    ctx.font = fontSpec(700, 27);
    ctx.fillStyle = '#8DEBFF';
    ctx.fillText('পূর্ণাঙ্গ কাস্টমাইজড ওয়েবসাইট প্যাকেজ', 0, -82);

    ctx.font = fontSpec(800, 94);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('মাত্র ৩০০০ টাকা', 0, 14);

    ctx.font = fontSpec(600, 24);
    ctx.fillStyle = 'rgba(244, 246, 250, 0.85)';
    ctx.fillText('স্বচ্ছ ও নির্দিষ্ট মূল্য · কোনো লুকানো চার্জ নেই', 0, 98);
    ctx.restore();

    // Separate Prominent Highlight Badge: "এডভান্স নেই!" (locks in at 12.45s!)
    if (t >= 12.40) {
      ctx.save();
      ctx.translate(540, 684);
      ctx.scale(lerp(0.84, 1.0, pNoAdv), lerp(0.84, 1.0, pNoAdv));
      ctx.globalAlpha = clamp01(prog(t, 12.45, 0.3));

      const gBadge = ctx.createLinearGradient(-446, -96, 446, 96);
      gBadge.addColorStop(0, '#397BFF');
      gBadge.addColorStop(1, '#0F56D6');
      fillRoundRect(ctx, -446, -98, 892, 196, 32, gBadge);
      strokeRoundRect(ctx, -446, -98, 892, 196, 32, '#8DEBFF', 2.5);

      ctx.font = fontSpec(800, 68);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('এডভান্স নেই!', 0, -14);

      ctx.font = fontSpec(600, 25);
      ctx.fillStyle = '#E0F7FF';
      ctx.fillText('আগে ওয়েবসাইট দেখুন — কাজ শেষে পেমেন্ট করুন', 0, 54);
      ctx.restore();
    }

    // Visual showcase beneath offer so websites stay visible on screen
    const drift = easeInOutCubic(prog(t, 10.25, 8.0));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('shoe'), lerp(40, 220, drift), {
      device: 'desktop',
      url: 'stridelab.bd',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 430, 1235, 720, 498, { rotY: -0.09 });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('cosmetics'), lerp(20, 190, drift), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 835, 1280, 292, 598, { rotY: 0.11 });
  } else {
    // 18.25–30.00s: Transition into broader vision of building a professional online brand presence
    const u = prog(t, 18.25, 11.75);
    drawBrandWordmark(ctx, 540, 196, 1.12, 'center', false);

    drawTextBlock(ctx, 'আপনার ব্যবসার জন্য গড়ে তুলুন\nএকটি আধুনিক ও পেশাদার অনলাইন পরিচিতি', 540, 258, 920, {
      size: 46,
      weight: 800,
      color: '#FFFFFF',
      align: 'center',
      reveal: prog(t, 18.4, 0.9),
    });

    // 3-card floating showcase fan (Furniture, Fashion, Restaurant)
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('furniture'), lerp(0, 220, u), {
      device: 'desktop',
      url: 'oakandcane.bd',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 540, 742, 870, 602, {
      rotY: lerp(0.08, -0.04, easeInOutCubic(u)),
    });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('fashion'), lerp(0, 240, u), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 290, 1300, 316, 646, { rotY: -0.11 });

    renderDeviceFrameToCanvas(S.scratchMobileB, S.mobileStores.get('food'), lerp(40, 260, u), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileB, 790, 1300, 316, 646, { rotY: 0.11 });
  }
}

// ============================================================================
// SCENE 02 (00:30 – 01:15): THE BUSINESS OWNER'S NEED
// ============================================================================
function renderScene02(ctx, t, S, images) {
  ctx.drawImage(S.stageNavy, 0, 0);

  if (t < 45.2) {
    // Shot 2A (30–45.2s): Bangladeshi entrepreneur arranging products + scattered social inquiries context
    const u = prog(t, 30, 15.2);
    drawTextBlock(ctx, 'পোস্টের ভিড়ে কি পণ্যের তথ্য\nহারিয়ে যাচ্ছে?', 540, 174, 920, {
      size: 50,
      weight: 800,
      color: '#FFFFFF',
      align: 'center',
      reveal: prog(t, 30.3, 0.9),
    });

    // Framed cinema photograph with gentle Ken Burns zoom
    fillRoundRect(ctx, 64, 344, 952, 680, 32, '#102544');
    drawCoverImage(ctx, images.get('scene02-entrepreneur.jpg'), 72, 352, 936, 664, 28, lerp(1.01, 1.09, u), 0.5, 0.35);
    strokeRoundRect(ctx, 64, 344, 952, 680, 32, 'rgba(141,235,255,0.28)', 2);

    // Empathetic everyday entrepreneur challenges (no fake stats!)
    const cards = [
      ['বারবার একই প্রশ্ন', 'ইনবক্সে প্রতিদিন দাম, সাইজ ও ছবি আলাদা করে পাঠাতে সময় ব্যয় হয়।'],
      ['ক্যাটাগরি খুঁজে পাওয়া কঠিন', 'পুরনো পোস্ট নিচে চলে গেলে কাস্টমার সহজে সব পণ্য দেখতে পান না।'],
      ['গোছানো তথ্যের অভাব', 'ডেলিভারি নিয়ম ও পণ্যের বিবরণ এক জায়গায় পরিপাটিভাবে থাকে না।'],
    ];
    cards.forEach(([title, desc], i) => {
      const p = easeOutCubic(prog(t, 31.4 + i * 1.4, 0.8));
      const cy = 1068 + i * 178;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate((1 - p) * 45, 0);
      fillRoundRect(ctx, 64, cy, 952, 154, 24, 'rgba(16, 37, 68, 0.86)');
      strokeRoundRect(ctx, 64, cy, 952, 154, 24, 'rgba(141, 235, 255, 0.20)', 1.4);
      fillRoundRect(ctx, 92, cy + 28, 10, 98, 5, '#397BFF');

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = fontSpec(800, 29);
      ctx.fillStyle = '#8DEBFF';
      ctx.fillText(title, 128, cy + 26);

      ctx.font = fontSpec(400, 24);
      ctx.fillStyle = '#F4F6FA';
      wrapTextLines(ctx, desc, 840).slice(0, 2).forEach((l, li) => ctx.fillText(l, 128, cy + 74 + li * 34));
      ctx.restore();
    });
  } else if (t < 58.6) {
    // Shot 2B (45.2–58.6s): Customer browsing on smartphone + key question headline
    const u = prog(t, 45.2, 13.4);
    drawTextBlock(
      ctx,
      'আপনার ব্যবসার পণ্য ও পরিচয়কে\nএকটি সুন্দর ওয়েবসাইটে উপস্থাপন করতে চান?',
      540,
      176,
      928,
      {
        size: 46,
        weight: 800,
        color: '#FFFFFF',
        align: 'center',
        reveal: prog(t, 45.5, 0.95),
      }
    );

    fillRoundRect(ctx, 64, 372, 952, 720, 32, '#102544');
    drawCoverImage(ctx, images.get('scene02-customer-phone.jpg'), 72, 380, 936, 704, 28, lerp(1.01, 1.08, u), 0.5, 0.28);
    strokeRoundRect(ctx, 64, 372, 952, 720, 32, 'rgba(141,235,255,0.28)', 2);

    // Clean customer expectation summary card below photo
    const pCard = easeOutCubic(prog(t, 46.8, 0.9));
    ctx.save();
    ctx.globalAlpha = pCard;
    fillRoundRect(ctx, 64, 1138, 952, 430, 28, '#F4F6FA');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 32);
    ctx.fillStyle = '#081426';
    ctx.fillText('একজন গ্রাহক যা দেখতে পছন্দ করেন:', 112, 1184);

    const points = [
      '✓  ক্যাটাগরি অনুযায়ী পরিপাটি পণ্যের ক্যাটালগ',
      '✓  প্রতিটি পণ্যের পরিষ্কার ছবি, সাইজ ও সঠিক দাম',
      '✓  মোবাইল ফোন থেকে সহজ ও ঝামেলাহীন ব্রাউজিং',
      '✓  ব্যবসার পরিচিতি ও যোগাযোগের স্পষ্ট মাধ্যম',
    ];
    points.forEach((pt, idx) => {
      ctx.font = fontSpec(600, 26);
      ctx.fillStyle = '#102544';
      ctx.fillText(pt, 112, 1258 + idx * 68);
    });
    ctx.restore();
  } else {
    // Shot 2C (58.6–75.0s): Transformation from ordinary scattered posts -> Organized Professional Website
    const u = prog(t, 58.6, 16.4);
    const morph = easeInOutCubic(prog(t, 59.4, 2.4));

    ctx.drawImage(S.stageLight, 0, 0);
    drawTextBlock(ctx, 'অগোছালো পোস্ট থেকে\nসুশৃঙ্খল নিজস্ব ওয়েবসাইটে রূপান্তর', 540, 174, 920, {
      size: 46,
      weight: 800,
      color: '#081426',
      align: 'center',
      reveal: prog(t, 58.8, 0.8),
    });

    // Before pill -> After pill indicator
    fillRoundRect(ctx, 180, 336, 720, 56, 28, '#FFFFFF');
    strokeRoundRect(ctx, 180, 336, 720, 56, 28, 'rgba(8,20,38,0.10)', 1.4);
    fillRoundRect(ctx, lerp(186, 540, morph), 342, 354, 44, 22, '#081426');
    ctx.font = fontSpec(700, 21);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = morph < 0.5 ? '#FFFFFF' : '#475569';
    ctx.fillText('সাধারণ পোস্ট ভিউ', 363, 364);
    ctx.fillStyle = morph >= 0.5 ? '#8DEBFF' : '#475569';
    ctx.fillText('পেশাদার ওয়েবসাইট ভিউ', 717, 364);

    // Structured Desktop + Mobile Website rising cleanly into focus
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('fashion'), lerp(0, 340, u), {
      device: 'desktop',
      url: 'aureliadhaka.shop',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 480, 760, 845, 585, {
      rotY: lerp(-0.12, -0.03, morph),
      shadowAlpha: 0.25,
    });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('fashion'), lerp(0, 290, u), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 804, 1245, 342, 700, {
      rotY: 0.08,
      shadowAlpha: 0.28,
    });

    // Left feature highlights on light stage
    const tags = ['গোছানো ক্যাটাগরি', 'স্পষ্ট মূল্য তালিকা', 'ব্র্যান্ডের নিজস্ব পরিচয়'];
    tags.forEach((tg, i) => {
      const py = 1130 + i * 116;
      fillRoundRect(ctx, 76, py, 500, 92, 22, '#081426');
      ctx.font = fontSpec(700, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`0${i + 1}   ${tg}`, 114, py + 46);
    });
  }
}

// ============================================================================
// SCENE 03 (01:15 – 02:00): INTRODUCING CODEPIXEL WEB
// ============================================================================
function renderScene03(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);
  const u = prog(t, 75, 45);

  // Header brand block
  drawBrandWordmark(ctx, 540, 186, 1.24, 'center', false);
  drawTextBlock(
    ctx,
    'আপনার ব্যবসার ধরন, পছন্দ ও প্রয়োজন অনুযায়ী\nওয়েবসাইট তৈরির সুচিন্তিত পরিকল্পনা',
    540,
    248,
    930,
    {
      size: 40,
      weight: 700,
      color: '#F4F6FA',
      align: 'center',
      reveal: prog(t, 75.4, 0.9),
    }
  );

  if (t < 105.0) {
    // 75–105s: Guided tour of Desktop Homepage (Hero -> Navigation -> Categories -> Product Cards)
    const scrollTour = easeInOutCubic(prog(t, 82.0, 20.0)) * 560;
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('fashion'), scrollTour, {
      device: 'desktop',
      url: 'codepixelweb.vercel.app',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 540, 785, 948, 656, {
      rotY: lerp(-0.10, 0.03, easeInOutCubic(prog(t, 75, 28))),
      sheenPos: prog(t, 77, 3.0),
    });

    // Three highlight cards underneath matching VO points
    const cols = [
      ['পরিষ্কার নেভিগেশন', 'গ্রাহক সহজেই পছন্দের মেনু ও বিভাগে যেতে পারেন'],
      ['আকর্ষণীয় প্রোডাক্ট কার্ড', 'ছবি, দাম ও পণ্যের তথ্য স্পষ্টভাবে সাজানো থাকে'],
      ['সুবিন্যস্ত ক্যাটাগরি', 'পণ্যের ধরন অনুযায়ী গোছানো বিভাগ বিন্যাস'],
    ];
    cols.forEach(([h, d], i) => {
      const p = easeOutCubic(prog(t, 77.5 + i * 3.2, 0.9));
      const cy = 1152 + i * 158;
      ctx.save();
      ctx.globalAlpha = p;
      fillRoundRect(ctx, 72, cy, 936, 136, 22, 'rgba(16, 37, 68, 0.88)');
      strokeRoundRect(ctx, 72, cy, 936, 136, 22, i === 1 ? '#397BFF' : 'rgba(141,235,255,0.22)', 1.6);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = fontSpec(800, 27);
      ctx.fillStyle = '#8DEBFF';
      ctx.fillText(h, 112, cy + 24);
      ctx.font = fontSpec(400, 23);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(d, 112, cy + 72);
      ctx.restore();
    });
  } else {
    // 105–120s: Cinematic transition into Smartphone layout + Honest Scope Card
    const m = easeInOutCubic(prog(t, 105.0, 2.2));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('fashion'), 260, {
      device: 'desktop',
      url: 'aureliadhaka.shop',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 392, 790, 660, 458, { rotY: -0.11 });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('fashion'), lerp(0, 320, prog(t, 105.5, 13.5)), {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 772, 910 + (1 - m) * 80, 386, 790, {
      rotY: lerp(0.18, 0.05, m),
      shadowAlpha: 0.5,
    });

    // Honest Scope Communication Box
    fillRoundRect(ctx, 68, 1356, 944, 240, 26, 'rgba(16, 37, 68, 0.94)');
    strokeRoundRect(ctx, 68, 1356, 944, 240, 26, '#8DEBFF', 1.8);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 27);
    ctx.fillStyle = '#8DEBFF';
    ctx.fillText('স্বচ্ছ কাজের পরিধি (Project Scope)', 110, 1392);
    ctx.font = fontSpec(500, 24);
    ctx.fillStyle = '#F4F6FA';
    wrapTextLines(
      ctx,
      'আপনার ব্যবসার প্রয়োজন অনুযায়ী ডিজাইন ও ফিচার নিয়ে শুরুতেই আলোচনা করা হয়—যেন কাজের পরিধি ও প্রযোজ্য শর্ত সম্পর্কে সম্পূর্ণ স্বচ্ছ ধারণা থাকে।',
      860
    ).slice(0, 3).forEach((l, i) => ctx.fillText(l, 110, 1442 + i * 38));
  }
}

// ============================================================================
// SCENE 04 (02:00 – 02:50): WEBSITES FOR DIFFERENT BUSINESSES (7 VERTICALS)
// ============================================================================
function renderScene04(ctx, t, S) {
  ctx.drawImage(S.stageLight, 0, 0);

  const slots = [
    { id: 'fashion', num: '01 / 07', title: 'ফ্যাশন ও পোশাক ব্র্যান্ড', desc: 'শাড়ি, পাঞ্জাবি, কুর্তি ও এথনিক কালেকশনের জন্য এডিটোরিয়াল ডিজাইন' },
    { id: 'watch', num: '02 / 07', title: 'ঘড়ির অনলাইন শোরুম', desc: 'ক্রোনোগ্রাফ ও ক্লাসিক হাতঘড়ির জন্য প্রিমিয়াম ডার্ক-অ্যান্ড-লাইট লেআউট' },
    { id: 'shoe', num: '03 / 07', title: 'জুতা ও লেদার ফুটওয়্যার', desc: 'সাইজ ফিল্টার ও স্পষ্ট প্রোডাক্ট কার্ডসহ আধুনিক জুতার স্টোর' },
    { id: 'cosmetics', num: '04 / 07', title: 'কসমেটিকস ও স্কিনকেয়ার', desc: 'সৌন্দর্য ও ত্বকের যত্নের পণ্যের জন্য কোমল রঙ ও পরিচ্ছন্ন ক্যাটালগ' },
    { id: 'furniture', num: '05 / 07', title: 'ফার্নিচার ও ইন্টেরিয়র', desc: 'সোফা, চেয়ার ও ঘরের আসবাবের জন্য প্রশস্ত ইন্টেরিয়র লুকবুক' },
    { id: 'food', num: '06 / 07', title: 'রেস্তোরাঁ ও ফুড বিজনেস', desc: 'বিরিয়ানি, বার্গার ও প্ল্যাটার অর্ডারের সহজ মেনু-ভিত্তিক ওয়েবসাইট' },
    { id: 'dual', num: '07 / 07', title: 'জুয়েলারি ও ইলেকট্রনিকস', desc: 'গহনা, গ্যাজেটসহ যেকোনো পণ্যের ব্যবসার উপযোগী কাস্টম লেআউট' },
  ];

  const slotDur = 50 / 7;
  const rawIdx = (t - 120) / slotDur;
  const idx = clamp(Math.floor(rawIdx), 0, 6);
  const sub = rawIdx - idx;
  const item = slots[idx];
  const enter = easeOutExpo(clamp01(sub / 0.22));

  // Category header on light neutral stage
  fillRoundRect(ctx, 430, 158, 220, 44, 22, '#081426');
  ctx.font = fontSpec(700, 19);
  ctx.fillStyle = '#8DEBFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.num, 540, 180);

  drawTextBlock(ctx, item.title, 540, 222, 920, {
    size: 52,
    weight: 800,
    color: '#081426',
    align: 'center',
    reveal: 1,
  });

  drawTextBlock(ctx, item.desc, 540, 304, 880, {
    size: 26,
    weight: 500,
    color: '#334155',
    align: 'center',
    reveal: 1,
  });

  if (item.id !== 'dual') {
    const store = STORES.find((s) => s.id === item.id);
    const scroll = lerp(0, 440, easeInOutCubic(sub));

    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get(item.id), scroll, {
      device: 'desktop',
      url: store.domain,
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 480 + (1 - enter) * 60, 735, 860, 596, {
      rotY: lerp(-0.09, -0.02, sub),
      shadowAlpha: 0.26,
      alpha: enter,
    });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get(item.id), scroll * 0.72, {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 796 + (1 - enter) * 70, 1265, 352, 720, {
      rotY: 0.08,
      shadowAlpha: 0.30,
      alpha: enter,
    });

    // Distinct design identity card bottom-left
    fillRoundRect(ctx, 68, 1105, 508, 430, 28, '#081426');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(700, 20);
    ctx.fillStyle = '#8DEBFF';
    ctx.fillText('স্বতন্ত্র ব্র্যান্ড ডিজাইন বৈশিষ্ট্য', 106, 1148);

    // Color swatches of that store!
    [store.bg, store.heroBg, store.accent, store.ink].forEach((sw, si) => {
      fillRoundRect(ctx, 106 + si * 74, 1196, 56, 56, 14, sw);
      strokeRoundRect(ctx, 106 + si * 74, 1196, 56, 56, 14, 'rgba(255,255,255,0.35)', 2);
    });

    const bullets = [
      '• পণ্যের ধরন অনুযায়ী মানানসই রঙ ও ফন্ট',
      '• সুস্পষ্ট মেনু ও ক্যাটাগরি ফিল্টার',
      '• ডেস্কটপ ও মোবাইলে সামঞ্জস্যপূর্ণ ভিউ',
    ];
    bullets.forEach((b, bi) => {
      ctx.font = fontSpec(600, 23);
      ctx.fillStyle = '#F4F6FA';
      ctx.fillText(b, 106, 1288 + bi * 66);
    });
  } else {
    // Dual Jewellery + Electronics showcase
    const scroll = lerp(0, 340, easeInOutCubic(sub));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('jewel'), scroll, {
      device: 'desktop',
      url: 'aurajewels.bd',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 540, 695, 880, 580, {
      rotY: -0.05,
      shadowAlpha: 0.25,
    });

    renderDeviceFrameToCanvas(S.scratchDesktopB, S.desktopStores.get('electronics'), scroll, {
      device: 'desktop',
      url: 'lumentech.bd',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopB, 540, 1295, 880, 580, {
      rotY: 0.05,
      shadowAlpha: 0.25,
    });
  }
}

// ============================================================================
// SCENE 05 (02:50 – 03:40): E-COMMERCE CUSTOMER EXPERIENCE (6 REALISTIC STEPS)
// ============================================================================
function renderScene05(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);

  const steps = [
    '১. ওয়েবসাইট ওপেন',
    '২. ক্যাটাগরি ব্রাউজ',
    '৩. প্রোডাক্ট নির্বাচন',
    '৪. বিস্তারিত তথ্য',
    '৫. সাইজ নির্বাচন',
    '৬. অর্ডার সম্পন্ন',
  ];
  const stepDur = 50 / 6; // 8.333s per step
  const raw = (t - 170) / stepDur;
  const sIdx = clamp(Math.floor(raw), 0, 5);
  const sub = raw - sIdx;

  // Step title + 6-pill progress strip
  drawTextBlock(ctx, steps[sIdx], 540, 168, 920, {
    size: 48,
    weight: 800,
    color: '#FFFFFF',
    align: 'center',
    reveal: 1,
  });

  // 6 progress segments
  for (let i = 0; i < 6; i++) {
    const px = 72 + i * 158;
    fillRoundRect(ctx, px, 254, 146, 10, 5, i <= sIdx ? (i === sIdx ? '#8DEBFF' : '#397BFF') : 'rgba(255,255,255,0.16)');
  }

  // Main Interactive Browser Viewport Frame (x = 58..1022, y = 292..1580)
  const fx = 58;
  const fy = 296;
  const fw = 964;
  const fh = 1284;
  fillRoundRect(ctx, fx, fy, fw, fh, 30, '#FFFFFF');
  strokeRoundRect(ctx, fx, fy, fw, fh, 30, 'rgba(141,235,255,0.38)', 2.5);

  ctx.save();
  roundRectPath(ctx, fx + 10, fy + 10, fw - 20, fh - 20, 22);
  ctx.clip();

  const innerX = fx + 10;
  const innerY = fy + 10;
  const innerW = fw - 20;
  const innerH = fh - 20;

  if (sIdx === 0) {
    // Step 1: Opens website & smooth browse scroll
    const src = S.desktopStores.get('fashion');
    const sy = lerp(0, 180, easeInOutCubic(sub));
    ctx.drawImage(src, 0, sy, src.width, src.width * (innerH / innerW), innerX, innerY, innerW, innerH);
    const cx = lerp(760, 520, easeInOutCubic(sub));
    const cy = lerp(980, 620, easeInOutCubic(sub));
    drawCursorAndRipple(ctx, cx, cy, 0, 1.15);
  } else if (sIdx === 1) {
    // Step 2: Browses categories & clicks 'পাঞ্জাবি' pill
    const clicked = sub >= 0.45;
    const src = clicked ? S.desktopFiltered : S.desktopStores.get('fashion');
    const sy = 380;
    ctx.drawImage(src, 0, sy, src.width, src.width * (innerH / innerW), innerX, innerY, innerW, innerH);
    const targetX = innerX + 318;
    const targetY = innerY + 194;
    const cx = lerp(640, targetX, easeOutCubic(clamp01(sub / 0.42)));
    const cy = lerp(520, targetY, easeOutCubic(clamp01(sub / 0.42)));
    drawCursorAndRipple(ctx, cx, cy, prog(sub, 0.44, 0.32), 1.15);
  } else if (sIdx === 2) {
    // Step 3: Clicks featured Panjabi product card
    const src = S.desktopFiltered;
    const sy = 500;
    const zoom = 1 + 0.06 * easeInOutCubic(prog(sub, 0.55, 0.45));
    const vw = (src.width / zoom);
    const vh = vw * (innerH / innerW);
    ctx.drawImage(src, (src.width - vw) * 0.72, sy, vw, vh, innerX, innerY, innerW, innerH);
    const tx = innerX + 760;
    const ty = innerY + 462;
    const cx = lerp(330, tx, easeOutCubic(clamp01(sub / 0.48)));
    const cy = lerp(260, ty, easeOutCubic(clamp01(sub / 0.48)));
    drawCursorAndRipple(ctx, cx, cy, prog(sub, 0.50, 0.34), 1.18);
  } else if (sIdx === 3) {
    // Step 4: Views Product Details & scrolls specifications
    const src = S.pdpSizeM;
    const maxS = Math.max(0, src.height - innerH * (src.width / innerW));
    const sy = lerp(0, maxS, easeInOutCubic(sub));
    ctx.drawImage(src, 0, sy, src.width, src.width * (innerH / innerW), innerX, innerY, innerW, innerH);
    drawCursorAndRipple(ctx, lerp(680, 610, sub), lerp(520, 740, sub), 0, 1.15);
  } else if (sIdx === 4) {
    // Step 5: Selects Size L (42) option + clicks "এখনই অর্ডার করুন"
    const sizeSelected = sub >= 0.36;
    const src = sizeSelected ? S.pdpSizeL : S.pdpSizeM;
    ctx.drawImage(src, 0, 0, src.width, Math.min(src.height, src.width * (innerH / innerW)), innerX, innerY, innerW, innerH);
    const scaleF = innerW / src.width;
    const sizeLX = innerX + 670 * scaleF;
    const sizeLY = innerY + 568 * scaleF;
    const orderBtnX = innerX + 692 * scaleF;
    const orderBtnY = innerY + 655 * scaleF;

    let cx, cy, rip = 0;
    if (sub < 0.62) {
      cx = lerp(520, sizeLX, easeOutCubic(clamp01(sub / 0.34)));
      cy = lerp(420, sizeLY, easeOutCubic(clamp01(sub / 0.34)));
      rip = prog(sub, 0.35, 0.25);
    } else {
      cx = lerp(sizeLX, orderBtnX, easeOutCubic(prog(sub, 0.62, 0.22)));
      cy = lerp(sizeLY, orderBtnY, easeOutCubic(prog(sub, 0.62, 0.22)));
      rip = prog(sub, 0.84, 0.16);
    }
    drawCursorAndRipple(ctx, cx, cy, rip, 1.18);
  } else {
    // Step 6: Proceeds through Checkout Demonstration & Confirms Order
    const done = sub >= 0.48;
    const src = done ? S.checkoutDone : S.checkoutFill;
    ctx.drawImage(src, 0, 0, src.width, src.height, innerX, innerY, innerW, innerH * (src.height / (src.width * (innerH / innerW))));
    const scaleF = innerW / src.width;
    const btnX = innerX + 732 * scaleF;
    const btnY = innerY + 631 * scaleF;
    const cx = lerp(420, btnX, easeOutCubic(clamp01(sub / 0.44)));
    const cy = lerp(540, btnY, easeOutCubic(clamp01(sub / 0.44)));
    drawCursorAndRipple(ctx, cx, cy, prog(sub, 0.46, 0.30), 1.18);
  }
  ctx.restore();
}

// ============================================================================
// SCENE 06 (03:40 – 04:35): ADMIN PANEL & BUSINESS MANAGEMENT
// ============================================================================
function renderScene06(ctx, t, S) {
  ctx.drawImage(S.stageLight, 0, 0);

  let modeTitle = 'ড্যাশবোর্ড ওভারভিউ ও রিপোর্ট';
  let activeSurface = S.adminOverview;
  let cursorTarget = [540, 620];
  let sub = 0;

  if (t < 236) {
    sub = prog(t, 220, 16);
    modeTitle = 'ড্যাশবোর্ড সারসংক্ষেপ (ডেমো ভিউ)';
    activeSurface = S.adminOverview;
    cursorTarget = [lerp(360, 740, easeInOutCubic(sub)), lerp(520, 680, easeInOutCubic(sub))];
  } else if (t < 252) {
    sub = prog(t, 236, 16);
    modeTitle = 'প্রোডাক্ট যোগ ও সম্পাদনা প্যানেল';
    activeSurface = S.adminProducts;
    cursorTarget = [lerp(560, 845, easeOutCubic(sub)), lerp(560, 1072, easeOutCubic(sub))];
  } else if (t < 266) {
    sub = prog(t, 252, 14);
    modeTitle = 'অর্ডার তালিকা ও স্ট্যাটাস আপডেট';
    activeSurface = S.adminOrders;
    cursorTarget = [lerp(480, 860, easeOutCubic(sub)), lerp(560, 560, easeOutCubic(sub))];
  } else {
    sub = prog(t, 266, 9);
    modeTitle = 'প্রয়োজন অনুযায়ী ব্যবস্থাপনা ফিচার পরিকল্পনা';
    activeSurface = S.adminOverview;
    cursorTarget = [680, 640];
  }

  drawTextBlock(ctx, modeTitle, 540, 168, 920, {
    size: 45,
    weight: 800,
    color: '#081426',
    align: 'center',
    reveal: 1,
  });

  drawTextBlock(ctx, 'সহজ বাংলা ও ইংরেজি লেবেল · পরিচ্ছন্ন ডেমো ইন্টারফেস', 540, 240, 880, {
    size: 25,
    weight: 600,
    color: '#397BFF',
    align: 'center',
    reveal: 1,
  });

  // Crisp elevated Admin Frame
  const ax = 52;
  const ay = 304;
  const aw = 976;
  const ah = 854;
  fillRoundRect(ctx, ax + 6, ay + 18, aw, ah, 28, 'rgba(8,20,38,0.14)');
  fillRoundRect(ctx, ax, ay, aw, ah, 26, '#FFFFFF');
  ctx.save();
  roundRectPath(ctx, ax, ay, aw, ah, 26);
  ctx.clip();
  ctx.drawImage(activeSurface, ax, ay, aw, ah);
  ctx.restore();
  strokeRoundRect(ctx, ax, ay, aw, ah, 26, 'rgba(8,20,38,0.12)', 1.6);

  drawCursorAndRipple(ctx, cursorTarget[0], cursorTarget[1], prog(sub, 0.55, 0.28), 1.1);

  // Honest Scope & Capability Cards below Admin panel (y = 1196..1605)
  fillRoundRect(ctx, 56, 1196, 968, 404, 28, '#081426');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 29);
  ctx.fillStyle = '#8DEBFF';
  ctx.fillText('ব্যবস্থাপনা প্যানেলে যা যা পরিকল্পনা করা যায়:', 100, 1236);

  const items = [
    '• নতুন পণ্য যোগ, ছবি পরিবর্তন, মূল্য ও স্টক সম্পাদনা',
    '• গ্রাহকের অর্ডার তালিকা ও অর্ডার স্ট্যাটাস হালনাগাদ',
    '• ক্যাটাগরি সাজানো ও দৈনন্দিন কাজের সারসংক্ষেপ দেখা',
  ];
  items.forEach((it, idx) => {
    ctx.font = fontSpec(600, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(it, 100, 1300 + idx * 58);
  });

  fillRoundRect(ctx, 96, 1490, 888, 76, 16, 'rgba(57, 123, 255, 0.18)');
  ctx.font = fontSpec(600, 21);
  ctx.fillStyle = '#E0F7FF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('বিঃদ্রঃ প্রজেক্টের পরিধি ও আলোচনা সাপেক্ষে প্রয়োজনীয় অ্যাডমিন ফিচার যুক্ত করা হয়।', 540, 1528);
}

// ============================================================================
// SCENE 07 (04:35 – 05:15): ORDER & COURIER WORKFLOW (DEMO PRESENTATION)
// ============================================================================
function renderScene07(ctx, t, S, images) {
  ctx.drawImage(S.stageNavy, 0, 0);

  const activeStage = clamp(Math.floor(((t - 275) / 40) * 4), 0, 3);

  // Clear Demo Workflow Badge
  fillRoundRect(ctx, 295, 158, 490, 44, 22, 'rgba(57,123,255,0.22)');
  strokeRoundRect(ctx, 295, 158, 490, 44, 22, '#8DEBFF', 1.4);
  ctx.font = fontSpec(700, 19);
  ctx.fillStyle = '#8DEBFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('অর্ডার ও ডেলিভারি প্রবাহ · ডেমো প্রদর্শনী', 540, 180);

  drawTextBlock(ctx, 'অর্ডার গ্রহণ থেকে ডেলিভারি প্রস্তুতি', 540, 220, 920, {
    size: 46,
    weight: 800,
    color: '#FFFFFF',
    align: 'center',
    reveal: prog(t, 275.3, 0.8),
  });

  // Top Order Summary Card with product thumbnail
  fillRoundRect(ctx, 64, 316, 952, 236, 26, '#FFFFFF');
  drawCoverImage(ctx, images.get('fashion-panjabi-1.jpg'), 92, 342, 152, 184, 18, 1.04);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(800, 26);
  ctx.fillStyle = '#081426';
  ctx.fillText('নমুনা অর্ডার #CP-1048  ·  তানভীর আহমেদ', 274, 348);
  ctx.font = fontSpec(600, 22);
  ctx.fillStyle = '#475569';
  ctx.fillText('পণ্য: মেরুন কটন-সিল্ক পাঞ্জাবি (সাইজ: L)  ·  পরিমাণ: ১ টি', 274, 396);
  ctx.fillText('ঠিকানা: ধানমন্ডি, ঢাকা  ·  দেয় বিল: ৳ ২,৯২০ (ডেমো তথ্য)', 274, 438);

  fillRoundRect(ctx, 274, 486, 260, 44, 22, '#DCFCE7');
  ctx.font = fontSpec(700, 19);
  ctx.fillStyle = '#15803D';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('● ওয়ার্কফ্লো সক্রিয় (ডেমো)', 404, 508);

  // 4-Step Vertical Interactive Workflow Cards (y = 582..1595)
  const wfSteps = [
    ['ধাপ ০১ — ম্যানেজমেন্ট প্যানেলে অর্ডার প্রদর্শন', 'গ্রাহকের অর্ডার জমা হওয়ার সাথে সাথে পণ্যের নাম, সাইজ ও ঠিকানা তালিকায় দেখা যায়।'],
    ['ধাপ ০২ — অর্ডারের তথ্য ও বিল যাচাই', 'ফোনে কথা বলে ঠিকানা, ডেলিভারি চার্জ ও পণ্যের প্রাপ্যতা নিশ্চিত করে নেওয়া যায়।'],
    ['ধাপ ০৩ — কুরিয়ার ও ডিসপ্যাচ নোট প্রস্তুতি', 'পার্কেলের ওজন, ডেলিভারি এলাকা ও প্রয়োজনীয় কুরিয়ার তথ্য গুছিয়ে রাখা যায়।'],
    ['ধাপ ০৪ — ডেলিভারি স্ট্যাটাস পর্যায়ক্রমিক আপডেট', 'প্যাকিং সম্পন্ন → ডিসপ্যাচ প্রস্তুত → ডেলিভারির পথে → সম্পন্ন স্ট্যাটাস ট্র্যাকিং।'],
  ];

  wfSteps.forEach(([title, desc], i) => {
    const wy = 584 + i * 246;
    const reached = i <= activeStage;
    const isCurrent = i === activeStage;
    const p = easeOutCubic(prog(t, 275.4 + i * 1.2, 0.8));

    ctx.save();
    ctx.globalAlpha = p;
    fillRoundRect(
      ctx,
      64,
      wy,
      952,
      222,
      26,
      isCurrent ? '#132E57' : reached ? 'rgba(16, 37, 68, 0.90)' : 'rgba(16, 37, 68, 0.52)'
    );
    strokeRoundRect(
      ctx,
      64,
      wy,
      952,
      222,
      26,
      isCurrent ? '#8DEBFF' : reached ? '#397BFF' : 'rgba(255,255,255,0.12)',
      isCurrent ? 2.5 : 1.4
    );

    // Step circle badge
    ctx.beginPath();
    ctx.arc(132, wy + 72, 34, 0, Math.PI * 2);
    ctx.fillStyle = reached ? '#397BFF' : 'rgba(255,255,255,0.12)';
    ctx.fill();
    ctx.font = fontSpec(800, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(reached ? '✓' : String(i + 1), 132, wy + 73);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 27);
    ctx.fillStyle = isCurrent ? '#8DEBFF' : '#FFFFFF';
    ctx.fillText(title, 192, wy + 40);

    ctx.font = fontSpec(400, 23);
    ctx.fillStyle = 'rgba(244, 246, 250, 0.90)';
    wrapTextLines(ctx, desc, 785).slice(0, 2).forEach((l, li) => ctx.fillText(l, 192, wy + 96 + li * 36));
    ctx.restore();
  });
}

// ============================================================================
// SCENE 08 (05:15 – 05:55): RESPONSIVE WEBSITE EXPERIENCE
// ============================================================================
function renderScene08(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);

  if (t < 332) {
    // 315–332s: Live Device Morph (Desktop -> Tablet -> Smartphone)
    const phase = (t - 315) / 17; // 0..1
    let label = 'কম্পিউটার ভিউ (Desktop Layout)';
    if (phase >= 0.34 && phase < 0.68) label = 'ট্যাবলেট ভিউ (Tablet Layout)';
    else if (phase >= 0.68) label = 'স্মার্টফোন ভিউ (Mobile Layout)';

    drawTextBlock(ctx, 'সব ডিভাইসে সাবলীল ও স্পষ্ট উপস্থাপনা', 540, 174, 920, {
      size: 46,
      weight: 800,
      color: '#FFFFFF',
      align: 'center',
      reveal: prog(t, 315.3, 0.8),
    });

    fillRoundRect(ctx, 290, 258, 500, 52, 26, 'rgba(57,123,255,0.25)');
    strokeRoundRect(ctx, 290, 258, 500, 52, 26, '#8DEBFF', 1.5);
    ctx.font = fontSpec(700, 23);
    ctx.fillStyle = '#8DEBFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 540, 284);

    if (phase < 0.34) {
      const u = phase / 0.34;
      renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('watch'), lerp(0, 320, u), {
        device: 'desktop',
        url: 'chronodhaka.shop',
      });
      drawPerspectiveSurface(ctx, S.scratchDesktopA, 540, 930, 940, 650, { rotY: lerp(-0.08, 0.04, u) });
    } else if (phase < 0.68) {
      const u = (phase - 0.34) / 0.34;
      renderDeviceFrameToCanvas(S.scratchTablet, S.tabletStores.get('fashion'), lerp(0, 260, u), {
        device: 'tablet',
      });
      drawPerspectiveSurface(ctx, S.scratchTablet, 540, 955, 700, 920, { rotY: lerp(0.10, -0.04, u) });
    } else {
      const u = (phase - 0.68) / 0.32;
      renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('watch'), lerp(0, 460, u), {
        device: 'mobile',
      });
      drawPerspectiveSurface(ctx, S.scratchMobileA, 540, 975, 500, 1020, { rotY: lerp(-0.10, 0.03, u) });
    }
  } else {
    // 332–355s: Synchronized 3-Device Responsive Trio (Desktop + Tablet + Smartphone)
    const u = prog(t, 332, 23);
    drawTextBlock(
      ctx,
      'মোবাইল, ট্যাবলেট কিংবা কম্পিউটার—\nসব পর্দায় সমান স্বাচ্ছন্দ্য',
      540,
      174,
      920,
      {
        size: 44,
        weight: 800,
        color: '#FFFFFF',
        align: 'center',
        reveal: 1,
      }
    );

    const sScroll = lerp(0, 380, easeInOutCubic(u));
    renderDeviceFrameToCanvas(S.scratchDesktopA, S.desktopStores.get('fashion'), sScroll, {
      device: 'desktop',
      url: 'aureliadhaka.shop',
    });
    drawPerspectiveSurface(ctx, S.scratchDesktopA, 540, 648, 880, 608, { rotY: -0.04 });

    renderDeviceFrameToCanvas(S.scratchTablet, S.tabletStores.get('fashion'), sScroll * 0.75, {
      device: 'tablet',
    });
    drawPerspectiveSurface(ctx, S.scratchTablet, 342, 1300, 456, 600, { rotY: 0.08 });

    renderDeviceFrameToCanvas(S.scratchMobileA, S.mobileStores.get('fashion'), sScroll * 0.9, {
      device: 'mobile',
    });
    drawPerspectiveSurface(ctx, S.scratchMobileA, 784, 1300, 314, 642, { rotY: -0.09 });
  }
}

// ============================================================================
// SCENE 09 (05:55 – 06:45): PRICE, VALUE & TRUST
// ============================================================================
function renderScene09(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);

  // Header title
  drawBrandWordmark(ctx, 540, 180, 1.15, 'center', false);
  drawTextBlock(ctx, 'আপনার প্রয়োজন অনুযায়ী ওয়েবসাইট', 540, 238, 920, {
    size: 46,
    weight: 800,
    color: '#FFFFFF',
    align: 'center',
    reveal: prog(t, 355.3, 0.8),
  });

  // Hero Price Card ("মাত্র ৩০০০ টাকা" — exact mandatory wording, never "থেকে")
  const pPrice = easeOutBack(prog(t, 362.5, 0.9));
  if (t >= 356.0) {
    const preScale = t < 362.5 ? 0.97 : lerp(0.92, 1.0, pPrice);
    ctx.save();
    ctx.translate(540, 480);
    ctx.scale(preScale, preScale);

    const gp = ctx.createLinearGradient(-450, -145, 450, 145);
    gp.addColorStop(0, '#102544');
    gp.addColorStop(0.5, '#1B4079');
    gp.addColorStop(1, '#0C1E3A');
    fillRoundRect(ctx, -456, -150, 912, 300, 36, gp);
    strokeRoundRect(ctx, -456, -150, 912, 300, 36, t >= 362.5 ? '#8DEBFF' : '#397BFF', 3);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSpec(700, 26);
    ctx.fillStyle = '#8DEBFF';
    ctx.fillText('ওয়েবসাইট ডেভেলপমেন্ট প্যাকেজ মূল্য', 0, -86);

    ctx.font = fontSpec(800, 96);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('মাত্র ৩০০০ টাকা', 0, 14);

    ctx.font = fontSpec(500, 23);
    ctx.fillStyle = 'rgba(244,246,250,0.88)';
    ctx.fillText('আপনার ব্যবসার প্রয়োজন অনুযায়ী ডিজাইন ও ডেভেলপমেন্ট', 0, 102);
    ctx.restore();
  }

  // Prominent "এডভান্স নেই" Highlight Card (illuminates strongly at 372.5s)
  const advActive = t >= 372.5;
  const pAdv = advActive ? easeOutBack(prog(t, 372.5, 0.85)) : 1;
  ctx.save();
  ctx.translate(540, 770);
  ctx.scale(advActive ? lerp(0.93, 1.0, pAdv) : 0.98, advActive ? lerp(0.93, 1.0, pAdv) : 0.98);
  const gAdv = ctx.createLinearGradient(-456, -98, 456, 98);
  gAdv.addColorStop(0, advActive ? '#397BFF' : '#132C52');
  gAdv.addColorStop(1, advActive ? '#1254D1' : '#0F2240');
  fillRoundRect(ctx, -456, -100, 912, 200, 32, gAdv);
  strokeRoundRect(ctx, -456, -100, 912, 200, 32, '#8DEBFF', advActive ? 3 : 1.5);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = fontSpec(800, 68);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('এডভান্স নেই', 0, -14);

  ctx.font = fontSpec(600, 24);
  ctx.fillStyle = '#E0F7FF';
  ctx.fillText('কাজ শুরুর আগে কোনো অগ্রিম টাকা দিতে হবে না', 0, 56);
  ctx.restore();

  // Two Side-by-Side Value Cards: "ডেলিভারি ২–৩ দিনে" & "মাসিক হোস্টিং ফি নেই" (illuminate at 383s)
  const delivActive = t >= 382.8;
  const cards = [
    {
      title: 'ডেলিভারি ২–৩ দিনে',
      note: 'প্রজেক্টের পরিধি ও প্রয়োজনীয় কনটেন্ট প্রস্তুত থাকার ওপর নির্ভরশীল',
      x: 84,
    },
    {
      title: 'মাসিক হোস্টিং ফি নেই',
      note: 'প্রযোজ্য হোস্টিং ব্যবস্থার আওতায় মাসিক কোনো হোস্টিং চার্জ নেই',
      x: 556,
    },
  ];
  cards.forEach((c) => {
    fillRoundRect(ctx, c.x, 1006, 440, 290, 28, delivActive ? '#132E57' : 'rgba(16,37,68,0.72)');
    strokeRoundRect(ctx, c.x, 1006, 440, 290, 28, delivActive ? '#8DEBFF' : 'rgba(141,235,255,0.22)', delivActive ? 2.2 : 1.2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 36);
    ctx.fillStyle = '#FFFFFF';
    wrapTextLines(ctx, c.title, 390).forEach((l, li) => ctx.fillText(l, c.x + 220, 1054 + li * 46));

    ctx.font = fontSpec(500, 21);
    ctx.fillStyle = '#CBD5E1';
    wrapTextLines(ctx, c.note, 384).slice(0, 3).forEach((l, li) => ctx.fillText(l, c.x + 220, 1158 + li * 32));
  });

  // Honest Scope Note at bottom (y = 1332..1595)
  fillRoundRect(ctx, 84, 1332, 912, 248, 26, 'rgba(16, 37, 68, 0.90)');
  strokeRoundRect(ctx, 84, 1332, 912, 248, 26, 'rgba(141,235,255,0.28)', 1.5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = fontSpec(700, 26);
  ctx.fillStyle = '#8DEBFF';
  ctx.fillText('স্বচ্ছতা ও বিশ্বস্ততার প্রতিশ্রুতি', 540, 1368);
  ctx.font = fontSpec(400, 23);
  ctx.fillStyle = '#F4F6FA';
  wrapTextLines(
    ctx,
    '৩০০০ টাকার প্যাকেজের বাইরের কোনো বিশেষ কাস্টম ফিচার বা বড় সিস্টেম প্রয়োজন হলে, কাজ শুরুর আগেই আলোচনা করে বিস্তারিত ও প্রযোজ্য খরচ পরিষ্কারভাবে জানানো হয়।',
    830
  ).slice(0, 3).forEach((l, li) => ctx.fillText(l, 540, 1420 + li * 36));
}

// ============================================================================
// SCENE 10 (06:45 – 07:25): HOW TO GET STARTED (SIMPLE 3-STEP WHATSAPP PROCESS)
// ============================================================================
function renderScene10(ctx, t, S) {
  ctx.drawImage(S.stageLight, 0, 0);

  const activeStep = t < 414 ? 0 : t < 423 ? 1 : 2;

  drawTextBlock(ctx, 'শুরু করার সহজ ৩টি ধাপ', 540, 168, 920, {
    size: 50,
    weight: 800,
    color: '#081426',
    align: 'center',
    reveal: prog(t, 405.2, 0.8),
  });

  const steps = [
    ['ধাপ ০১ — WhatsApp-এ যোগাযোগ করুন', 'CodePixel Web-এর অফিশিয়াল WhatsApp-এ একটি মেসেজ পাঠিয়ে কথা শুরু করুন।'],
    ['ধাপ ০২ — ব্যবসার ধরন ও প্রয়োজন জানান', 'আপনার পণ্য, পছন্দের ডিজাইন ধারণা ও কী কী ফিচার প্রয়োজন তা সংক্ষেপে বলুন।'],
    ['ধাপ ০৩ — পরিধি ও মূল্য নিশ্চিত করে শুরু', 'প্রজেক্টের পরিধি, উপলব্ধ ফিচার ও প্রযোজ্য মূল্য নিশ্চিত করে কাজ শুরু করা হয়।'],
  ];

  steps.forEach(([title, desc], i) => {
    const sy = 278 + i * 244;
    const isAct = i === activeStep;
    const p = easeOutCubic(prog(t, 405.4 + i * 1.1, 0.8));

    ctx.save();
    ctx.globalAlpha = p;
    fillRoundRect(ctx, 64, sy, 952, 218, 28, isAct ? '#081426' : '#FFFFFF');
    strokeRoundRect(ctx, 64, sy, 952, 218, 28, isAct ? '#397BFF' : 'rgba(8,20,38,0.10)', isAct ? 3 : 1.5);

    fillRoundRect(ctx, 100, sy + 36, 72, 72, 20, isAct ? '#397BFF' : '#EFF6FF');
    ctx.font = fontSpec(800, 30);
    ctx.fillStyle = isAct ? '#FFFFFF' : '#1D4ED8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${i + 1}`, 136, sy + 72);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSpec(800, 29);
    ctx.fillStyle = isAct ? '#FFFFFF' : '#081426';
    ctx.fillText(title, 200, sy + 36);

    ctx.font = fontSpec(500, 23);
    ctx.fillStyle = isAct ? '#CBD5E1' : '#475569';
    wrapTextLines(ctx, desc, 770).slice(0, 2).forEach((l, li) => ctx.fillText(l, 200, sy + 94 + li * 36));
    ctx.restore();
  });

  // Inviting WhatsApp Conversation & Verified CTA Card (y = 1032..1605)
  fillRoundRect(ctx, 64, 1034, 952, 566, 32, '#081426');
  strokeRoundRect(ctx, 64, 1034, 952, 566, 32, '#397BFF', 2);

  // Chat header bar
  fillRoundRect(ctx, 92, 1062, 896, 84, 20, '#102544');
  ctx.beginPath();
  ctx.arc(144, 1104, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#22C55E';
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = fontSpec(800, 26);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('CodePixel Web  ·  WhatsApp ডেস্ক', 172, 1104);

  // Sample message bubble from entrepreneur
  const msg1P = easeOutCubic(prog(t, 408.0, 0.9));
  ctx.save();
  ctx.globalAlpha = msg1P;
  fillRoundRect(ctx, 180, 1174, 796, 104, 22, '#1D4ED8');
  ctx.font = fontSpec(500, 23);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('“আসসালামু আলাইকুম, আমার ব্যবসার জন্য একটি ওয়েবসাইট করতে চাই।”', 214, 1226);
  ctx.restore();

  // Warm helpful reply bubble
  const msg2P = easeOutCubic(prog(t, 412.0, 0.9));
  ctx.save();
  ctx.globalAlpha = msg2P;
  fillRoundRect(ctx, 98, 1300, 810, 112, 22, '#162F54');
  strokeRoundRect(ctx, 98, 1300, 810, 112, 22, 'rgba(141,235,255,0.28)', 1.2);
  ctx.font = fontSpec(500, 22);
  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('“নিশ্চয়ই! আপনার ব্যবসার ধরন ও পছন্দের ডিজাইন জানান, শুরু করছি।”', 130, 1356);
  ctx.restore();

  // Prominent WhatsApp CTA Button (verified number from codepixelweb.vercel.app)
  fillRoundRect(ctx, 116, 1446, 848, 118, 28, '#16A34A');
  ctx.font = fontSpec(800, 34);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`WhatsApp-এ মেসেজ দিন: ${FILM_META.whatsappDisplay}`, 540, 1505);
}

// ============================================================================
// SCENE 11 (07:25 – 08:12): PREMIUM BRAND FINALE
// ============================================================================
function renderScene11(ctx, t, S) {
  ctx.drawImage(S.stageNavy, 0, 0);

  if (t < 463.5) {
    // 445.0–463.5s: Curated Multi-Website Brand Montage (6 signature websites gliding cleanly below header)
    const u = prog(t, 445.0, 18.5);
    drawBrandWordmark(ctx, 540, 184, 1.2, 'center', false);
    drawTextBlock(ctx, 'প্রতিটি ব্যবসার জন্য নিজস্ব ও পেশাদার ওয়েবসাইট', 540, 246, 920, {
      size: 40,
      weight: 800,
      color: '#FFFFFF',
      align: 'center',
      reveal: 1,
    });

    const leftIds = ['fashion', 'shoe', 'furniture'];
    const rightIds = ['watch', 'cosmetics', 'food'];
    const drift = lerp(0, -135, easeInOutCubic(u));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 336, 1080, 1460);
    ctx.clip();

    leftIds.forEach((id, idx) => {
      const ds = S.desktopStores.get(id);
      const y = 560 + idx * 430 + drift;
      drawPerspectiveSurface(ctx, ds, 300, y, 440, 380, { rotY: 0.08, shadowAlpha: 0.35 });
    });
    rightIds.forEach((id, idx) => {
      const ds = S.desktopStores.get(id);
      const y = 630 + idx * 430 - drift * 0.65;
      drawPerspectiveSurface(ctx, ds, 780, y, 440, 380, { rotY: -0.08, shadowAlpha: 0.35 });
    });
    ctx.restore();
  } else {
    // 463.5–492.0s (28.5 full seconds! Completely settled well over 5+ seconds right to the final frame without black fade!)
    const p1 = easeOutCubic(prog(t, 463.6, 1.0));
    const p2 = easeOutBack(prog(t, 464.5, 0.95));
    const p3 = easeOutBack(prog(t, 465.4, 0.95));
    const p4 = easeOutCubic(prog(t, 466.2, 0.95));

    // Clean Negative Space Brand Header (y = 215..345)
    ctx.save();
    ctx.globalAlpha = p1;
    drawBrandWordmark(ctx, 540, 238, 1.48, 'center', false);
    ctx.restore();

    // Primary Question Copy: “আপনার ব্যবসার জন্য ওয়েবসাইট তৈরি করতে চান?”
    drawTextBlock(ctx, 'আপনার ব্যবসার জন্য\nওয়েবসাইট তৈরি করতে চান?', 540, 344, 920, {
      size: 56,
      weight: 800,
      color: '#FFFFFF',
      lineHeight: 1.34,
      align: 'center',
      reveal: prog(t, 463.9, 0.9),
    });

    // Clear Price Card: “মাত্র ৩০০০ টাকা”
    ctx.save();
    ctx.translate(540, 668);
    ctx.scale(lerp(0.9, 1.0, p2), lerp(0.9, 1.0, p2));
    ctx.globalAlpha = clamp01(prog(t, 464.5, 0.4));
    const gPrice = ctx.createLinearGradient(-430, -118, 430, 118);
    gPrice.addColorStop(0, '#102544');
    gPrice.addColorStop(0.5, '#1B4079');
    gPrice.addColorStop(1, '#102544');
    fillRoundRect(ctx, -436, -120, 872, 240, 34, gPrice);
    strokeRoundRect(ctx, -436, -120, 872, 240, 34, '#397BFF', 3);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSpec(800, 90);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('মাত্র ৩০০০ টাকা', 0, 4);
    ctx.restore();

    // Prominent Separate Badge: “এডভান্স নেই”
    ctx.save();
    ctx.translate(540, 916);
    ctx.scale(lerp(0.9, 1.0, p3), lerp(0.9, 1.0, p3));
    ctx.globalAlpha = clamp01(prog(t, 465.4, 0.4));
    fillRoundRect(ctx, -436, -84, 872, 168, 30, '#397BFF');
    strokeRoundRect(ctx, -436, -84, 872, 168, 30, '#8DEBFF', 2.5);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSpec(800, 64);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('এডভান্স নেই', 0, 2);
    ctx.restore();

    // Prominent WhatsApp CTA Card: “এখনই WhatsApp-এ মেসেজ দিন” + Website URL
    ctx.save();
    ctx.globalAlpha = p4;
    const pulse = 1 + 0.012 * Math.sin((t - 466) * 2.4);
    ctx.save();
    ctx.translate(540, 1168);
    ctx.scale(pulse, pulse);
    fillRoundRect(ctx, -436, -98, 872, 196, 32, '#16A34A');
    strokeRoundRect(ctx, -436, -98, 872, 196, 32, '#86EFAC', 2.5);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSpec(800, 46);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('এখনই WhatsApp-এ মেসেজ দিন', 0, -20);
    ctx.font = fontSpec(700, 30);
    ctx.fillStyle = '#DCFCE7';
    ctx.fillText(`WhatsApp: ${FILM_META.whatsappDisplay}`, 0, 46);
    ctx.restore();

    // Official Brand Name & Exact Website URL Block (y = 1326..1560)
    fillRoundRect(ctx, 104, 1326, 872, 214, 30, 'rgba(16, 37, 68, 0.90)');
    strokeRoundRect(ctx, 104, 1326, 872, 214, 30, 'rgba(141, 235, 255, 0.35)', 1.8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontSpec(800, 42);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('CodePixel Web', 540, 1394);

    ctx.font = fontSpec(700, 33);
    ctx.fillStyle = '#8DEBFF';
    ctx.fillText('https://codepixelweb.vercel.app/', 540, 1474);
    ctx.restore();
  }
}

// ============================================================================
// MASTER COMPOSITOR WITH SMOOTH OPTICAL SCENE TRANSITIONS
// ============================================================================
function renderRawSceneByIndex(sceneIdx, ctx, t, S, images) {
  switch (sceneIdx) {
    case 0: return renderScene01(ctx, t, S);
    case 1: return renderScene02(ctx, t, S, images);
    case 2: return renderScene03(ctx, t, S);
    case 3: return renderScene04(ctx, t, S);
    case 4: return renderScene05(ctx, t, S);
    case 5: return renderScene06(ctx, t, S);
    case 6: return renderScene07(ctx, t, S, images);
    case 7: return renderScene08(ctx, t, S);
    case 8: return renderScene09(ctx, t, S);
    case 9: return renderScene10(ctx, t, S);
    default: return renderScene11(ctx, t, S);
  }
}

export function renderMasterFrame(ctx, transitionCanvas, frameIndex, S, images, voTimeline) {
  const t = frameIndex / FILM_META.fps;

  // Determine current scene index
  let sIdx = 0;
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (t >= SCENES[i].start) {
      sIdx = i;
      break;
    }
  }

  // Smooth directional mask wipe / optical dissolve across 0.55s at every scene boundary
  const TRANS_DUR = 0.55;
  const curScene = SCENES[sIdx];
  const sinceStart = t - curScene.start;

  if (sIdx > 0 && sinceStart >= 0 && sinceStart < TRANS_DUR) {
    const u = easeInOutCubic(sinceStart / TRANS_DUR);
    // Render previous scene into main ctx first
    renderRawSceneByIndex(sIdx - 1, ctx, t, S, images);

    // Render incoming scene into transitionCanvas and composite smoothly
    const tctx = transitionCanvas.getContext('2d');
    renderRawSceneByIndex(sIdx, tctx, t, S, images);

    ctx.save();
    if (sIdx % 2 === 1) {
      // Smooth vertical architectural curtain reveal + subtle light edge
      const revealH = FILM_META.height * u;
      ctx.beginPath();
      ctx.rect(0, FILM_META.height - revealH, FILM_META.width, revealH);
      ctx.clip();
      ctx.drawImage(transitionCanvas, 0, 0);
      ctx.fillStyle = 'rgba(141, 235, 255, 0.55)';
      ctx.fillRect(0, FILM_META.height - revealH, FILM_META.width, 3);
    } else {
      // Smooth optical dissolve + slight scale settle
      ctx.globalAlpha = u;
      const sc = lerp(1.035, 1.0, u);
      ctx.translate(540, 960);
      ctx.scale(sc, sc);
      ctx.drawImage(transitionCanvas, -540, -960);
    }
    ctx.restore();
  } else {
    renderRawSceneByIndex(sIdx, ctx, t, S, images);
  }

  // Subtle top brand + scene indicator pill
  const lightScenes =
    (sIdx === 1 && t >= 58.6) ||
    sIdx === 3 ||
    sIdx === 5 ||
    sIdx === 9;
  drawTopSceneHeader(ctx, curScene.number, curScene.bnTitle, t / FILM_META.durationSec, lightScenes);

  // Synchronized Bengali subtitle bar at safe bottom (skip on settled final CTA so end screen stays minimal & spacious!)
  if (t < 463.5) {
    const cap = findActiveCaption(t, voTimeline);
    if (cap) drawCaptionBar(ctx, cap.text, cap.alpha);
  }
}
