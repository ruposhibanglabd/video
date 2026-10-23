import {
  FILM,
  PALETTE,
  BRAND_FACTS,
} from '../timeline/cues.mjs';
import {
  clamp,
  lerp,
  prog,
  easeOutQuart,
  easeOutQuint,
  easeOutBackSoft,
  easeInOutCubic,
  easeInOutQuart,
  fontSpec,
  fillRoundRect,
  strokeRoundRect,
  drawCoverPhoto,
  drawDarkStage,
  drawLightStage,
  drawEditorialChrome,
  drawWordmark,
  drawTextBlock,
  drawKickerPill,
  drawPhoneMockup3D,
  drawDesktopMockup3D,
  drawTabletMockup3D,
  drawTouchRipple,
  drawWhatsappIcon,
  drawCheckCircle,
} from '../engine/canvas-core.mjs';

const W = FILM.width;
const H = FILM.height;

/**
 * SCENE 06 — Admin Panel and Management (03:40 – 04:35)
 */
export function renderScene06(ctx, t, scene, assets, stores, admin) {
  const lt = t - scene.start; // 0..55
  drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.30 });
  drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

  // Sub-phases synced to voiceover:
  // 0..12.6s: Overview Dashboard
  // 12.6..26.6s: Product & Category Management
  // 26.6..38.6s: Order List & Status Management
  // 38.6..55.0s: Full Management Summary + Primary Scene 06 Message
  let activeTab = 'overview';
  let tabBadge = 'ড্যাশবোর্ড ওভারভিউ';
  if (lt >= 12.6 && lt < 26.6) {
    activeTab = 'products';
    tabBadge = 'পণ্য ও ক্যাটাগরি ব্যবস্থাপনা';
  } else if (lt >= 26.6) {
    activeTab = 'orders';
    tabBadge = 'অর্ডার তালিকা ও স্ট্যাটাস';
  }

  drawKickerPill(ctx, `ADMIN PANEL  ·  ${tabBadge}`, 76, 162, {
    theme: 'dark',
    reveal: prog(lt, 0.2, 0.8),
  });

  // Primary Scene 06 Bengali Message
  drawTextBlock(
    ctx,
    'ব্যবসা পরিচালনার প্রয়োজনীয় কাজগুলো\nসহজভাবে পরিচালনার জন্য উপযুক্ত সিস্টেম।',
    76,
    228,
    {
      weight: 800,
      size: 45,
      lineHeight: 1.34,
      maxWidth: 928,
      color: PALETTE.white,
      reveal: prog(lt, 0.4, 1.1),
    }
  );

  // Main Admin Desktop Showcase (cleanly centered y = 415..1075)
  const enter = easeOutQuint(prog(lt, 0.6, 1.3));
  const yaw = lerp(0.11, -0.05, easeInOutCubic(lt / 55));
  const surface = admin[activeTab] || admin.overview;

  drawDesktopMockup3D(ctx, surface, 540, 770 + (1 - enter) * 34, {
    width: 928,
    height: 640,
    scale: 0.99,
    yaw,
    scrollY: 0,
    urlText: 'admin-demo  ·  স্টোর পরিচালনা প্যানেল (নমুনা ডেটা)',
    stand: false,
    shadowAlpha: 0.48,
  });

  // Subtle interactive cursor on tab switches
  if (lt >= 12.2 && lt <= 13.6) {
    drawTouchRipple(ctx, 185, 622, prog(lt, 12.6, 0.55), { color: PALETTE.softCyan });
  } else if (lt >= 26.2 && lt <= 27.6) {
    drawTouchRipple(ctx, 185, 668, prog(lt, 26.6, 0.55), { color: PALETTE.softCyan });
  } else if (lt >= 32.0 && lt <= 34.0) {
    drawTouchRipple(ctx, 640, 818, prog(lt, 32.5, 0.6), { color: PALETTE.softCyan });
  }

  // Bottom 3 Management Capability Cards (highlighted dynamically per active phase)
  const modules = [
    {
      key: 'overview',
      title: 'পরিষ্কার ড্যাশবোর্ড সারসংক্ষেপ',
      desc: 'নতুন অর্ডার, প্রস্তুতকৃত পণ্য ও কম স্টকের তথ্য এক নজরে দেখা যায়।',
    },
    {
      key: 'products',
      title: 'পণ্য, ছবি ও মূল্য ব্যবস্থাপনা',
      desc: 'নতুন পণ্য যোগ, ক্যাটাগরি বিন্যাস ও স্টক হালনাগাদ করার সহজ ইন্টারফেস।',
    },
    {
      key: 'orders',
      title: 'অর্ডার তালিকা ও স্ট্যাটাস নিয়ন্ত্রণ',
      desc: 'প্রতিটি অর্ডারের কাস্টমার তথ্য ও বর্তমান অবস্থা গুছিয়ে পরিচালনা।',
    },
  ];

  modules.forEach((mod, idx) => {
    const p = easeOutQuart(prog(lt, 1.2 + idx * 0.35, 0.9));
    const y = 1142 + idx * 176 + (1 - p) * 24;
    const isCurrent = lt < 38.6 ? mod.key === activeTab : true;

    ctx.save();
    ctx.globalAlpha = p;
    fillRoundRect(
      ctx,
      76,
      y,
      928,
      156,
      22,
      isCurrent ? '#132D54' : 'rgba(16, 37, 68, 0.65)'
    );
    strokeRoundRect(
      ctx,
      76,
      y,
      928,
      156,
      22,
      isCurrent ? PALETTE.softCyan : 'rgba(141, 235, 255, 0.16)',
      isCurrent ? 1.8 : 1.1
    );

    drawCheckCircle(
      ctx,
      128,
      y + 54,
      16,
      isCurrent ? PALETTE.electricBlue : '#233B61',
      '#FFFFFF'
    );

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(700, 26);
    ctx.fillText(mod.title, 162, y + 54);

    ctx.fillStyle = isCurrent ? '#D8E6FA' : PALETTE.slateMuted;
    ctx.font = fontSpec(500, 21);
    ctx.fillText(mod.desc, 162, y + 108);
    ctx.restore();
  });

  // Honest scope note at bottom
  ctx.fillStyle = 'rgba(141, 235, 255, 0.78)';
  ctx.font = fontSpec(500, 20);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'প্রজেক্টের নির্ধারিত পরিধি অনুযায়ী প্রয়োজনীয় অ্যাডমিন ফিচার যুক্ত থাকে',
    540,
    1730
  );
}

/**
 * SCENE 07 — Courier and Order Workflow (04:35 – 05:15)
 * Connected 4-stage pipeline; strictly honest qualification for supported courier integration.
 */
export function renderScene07(ctx, t, scene, assets) {
  const lt = t - scene.start; // 0..40
  drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.42 });
  drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

  drawKickerPill(ctx, 'ORDER TO DELIVERY WORKFLOW', 76, 162, {
    theme: 'dark',
    reveal: prog(lt, 0.2, 0.8),
  });

  drawTextBlock(
    ctx,
    'অর্ডার থেকে ডেলিভারি স্ট্যাটাস—\nগোছানো ওয়ার্কফ্লো ব্যবস্থাপনা।',
    76,
    228,
    {
      weight: 800,
      size: 48,
      lineHeight: 1.30,
      maxWidth: 928,
      color: PALETTE.white,
      reveal: prog(lt, 0.4, 1.0),
    }
  );

  // Studio fulfillment parcel visual strip (y = 392..668)
  const photoP = easeOutQuart(prog(lt, 0.7, 1.1));
  ctx.save();
  ctx.globalAlpha = photoP;
  drawCoverPhoto(ctx, assets.photos.s07_packaging_parcel, 76, 392, 928, 276, {
    radius: 24,
    zoom: 1.03 + 0.05 * (lt / 40),
    overlay: 'rgba(8, 20, 38, 0.34)',
  });
  strokeRoundRect(ctx, 76, 392, 928, 276, 24, 'rgba(141,235,255,0.24)', 1.4);

  fillRoundRect(ctx, 106, 586, 610, 54, 27, 'rgba(8, 20, 38, 0.86)');
  ctx.fillStyle = PALETTE.softCyan;
  ctx.font = fontSpec(600, 19);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('সমর্থিত কুরিয়ার ইন্টিগ্রেশন ও প্রজেক্ট স্কোপ অনুযায়ী পরিচালিত', 411, 613);
  ctx.restore();

  // Animated 4-Stage Connected Pipeline (y = 716..1650)
  const NODES = [
    {
      code: '01',
      en: 'Order Created',
      bn: 'অর্ডার তৈরি ও গ্রহণ',
      detail: 'কাস্টমার অর্ডার দেওয়ার সাথে সাথে অ্যাডমিন তালিকায় স্বয়ংক্রিয়ভাবে যুক্ত হয়',
      trigger: 2.0,
    },
    {
      code: '02',
      en: 'Order Management',
      bn: 'তথ্য যাচাই ও প্রস্তুতি',
      detail: 'নাম, ঠিকানা ও পণ্য যাচাই করে অর্ডার স্ট্যাটাস আপডেট ও ইনভয়েস প্রস্তুতি',
      trigger: 8.0,
    },
    {
      code: '03',
      en: 'Courier Information',
      bn: 'কুরিয়ার তথ্য যুক্তকরণ',
      detail: 'সমর্থিত কুরিয়ার সুবিধা যুক্ত থাকলে প্রয়োজনীয় ডেলিভারি তথ্য সংরক্ষণ ও প্রেরণ',
      trigger: 14.5,
    },
    {
      code: '04',
      en: 'Status Tracking',
      bn: 'ডেলিভারি স্ট্যাটাস ট্র্যাকিং',
      detail: 'পণ্য প্রেরণ থেকে ডেলিভারি সম্পন্ন হওয়া পর্যন্ত স্ট্যাটাস পর্যবেক্ষণ',
      trigger: 21.5,
    },
  ];

  // Vertical connecting spine at x = 148
  const spineX = 148;
  const spineTop = 790;
  const spineBot = 1546;
  ctx.strokeStyle = 'rgba(141, 235, 255, 0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(spineX, spineTop);
  ctx.lineTo(spineX, spineBot);
  ctx.stroke();

  // Animated progress signal down the spine
  const flowFrac = clamp((lt - 2.0) / 22.0, 0, 1);
  const activeSpineH = (spineBot - spineTop) * easeInOutCubic(flowFrac);
  const sigGrad = ctx.createLinearGradient(0, spineTop, 0, spineTop + activeSpineH + 1);
  sigGrad.addColorStop(0, PALETTE.electricBlue);
  sigGrad.addColorStop(1, PALETTE.softCyan);
  ctx.strokeStyle = sigGrad;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(spineX, spineTop);
  ctx.lineTo(spineX, spineTop + activeSpineH);
  ctx.stroke();

  NODES.forEach((nd, idx) => {
    const ny = 716 + idx * 242;
    const nodeP = easeOutQuart(prog(lt, nd.trigger - 1.2, 0.9));
    const lit = lt >= nd.trigger;

    ctx.save();
    ctx.globalAlpha = Math.max(0.32, nodeP);

    // Connector circle on spine
    ctx.fillStyle = lit ? PALETTE.softCyan : '#183156';
    ctx.beginPath();
    ctx.arc(spineX, ny + 96, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lit ? PALETTE.deepNavy : PALETTE.slateMuted;
    ctx.font = fontSpec(800, 17);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nd.code, spineX, ny + 96);

    // Workflow card
    const cx = 204;
    const cw = 800;
    fillRoundRect(ctx, cx, ny, cw, 206, 22, lit ? '#122A4E' : 'rgba(16, 37, 68, 0.55)');
    strokeRoundRect(
      ctx,
      cx,
      ny,
      cw,
      206,
      22,
      lit ? PALETTE.softCyan : 'rgba(141, 235, 255, 0.16)',
      lit ? 1.8 : 1.1
    );

    // English badge on top right of card
    fillRoundRect(ctx, cx + cw - 246, ny + 24, 218, 36, 18, 'rgba(57, 123, 255, 0.20)');
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 15);
    ctx.textAlign = 'center';
    ctx.fillText(nd.en, cx + cw - 137, ny + 42);

    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 29);
    ctx.fillText(nd.bn, cx + 32, ny + 56);

    drawTextBlock(ctx, nd.detail, cx + 32, ny + 96, {
      weight: 500,
      size: 21,
      lineHeight: 1.42,
      maxWidth: cw - 64,
      color: lit ? '#DCE8FA' : PALETTE.slateMuted,
      reveal: 1.0,
    });
    ctx.restore();
  });
}

/**
 * SCENE 08 — Mobile-first and Responsive Design (05:15 – 05:55)
 * Desktop -> Tablet -> Smartphone transformation + Synchronized 3-Device Ensemble.
 */
export function renderScene08(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..40
  drawLightStage(ctx, t, { warm: false });
  drawEditorialChrome(ctx, scene, t, { theme: 'light' });

  drawKickerPill(ctx, 'MOBILE-FIRST & RESPONSIVE ARCHITECTURE', 540, 162, {
    theme: 'light',
    align: 'center',
    reveal: prog(lt, 0.2, 0.8),
  });

  // Primary Scene 08 Bengali Message
  drawTextBlock(
    ctx,
    'মোবাইল ও ডেস্কটপে\nসুন্দর অভিজ্ঞতা।',
    540,
    228,
    {
      weight: 800,
      size: 58,
      lineHeight: 1.26,
      maxWidth: 928,
      color: PALETTE.deepNavy,
      align: 'center',
      reveal: prog(lt, 0.4, 1.0),
    }
  );

  if (lt < 27.5) {
    // Live Responsive Transformation Sequence:
    // 0..10.5s: Mobile-first focus | 10.5..19.0s: Tablet reflow | 19.0..27.5s: Full Desktop reflow
    let modeLabel = 'স্মার্টফোন ভিউ  ·  Mobile-First Navigation';
    if (lt >= 10.5 && lt < 19.0) modeLabel = 'ট্যাবলেট ভিউ  ·  2-Column Adaptive Grid';
    else if (lt >= 19.0) modeLabel = 'ডেস্কটপ ভিউ  ·  Full Editorial Widescreen';

    fillRoundRect(ctx, 220, 404, 640, 50, 25, PALETTE.deepNavy);
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 20);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(modeLabel, 540, 429);

    if (lt < 10.5) {
      const p = easeOutQuint(prog(lt, 0.5, 1.2));
      const sc = lerp(0, 440, easeInOutCubic(prog(lt, 1.5, 8.2)));
      drawPhoneMockup3D(ctx, stores.fashionMobile, 540, 1055 + (1 - p) * 36, {
        width: 450,
        height: 920,
        scale: 1.14,
        yaw: Math.sin(lt * 0.5) * 0.07,
        scrollY: sc,
        shadowAlpha: 0.26,
      });
    } else if (lt < 19.0) {
      const p = easeOutQuint(prog(lt, 10.5, 1.0));
      const sc = lerp(0, 260, easeInOutCubic(prog(lt, 11.4, 6.8)));
      drawTabletMockup3D(ctx, stores.fashionTablet, 540, 1050, {
        width: 720,
        height: 980,
        scale: lerp(0.84, 1.02, p),
        yaw: lerp(-0.16, 0.04, p),
        scrollY: sc,
        shadowAlpha: 0.24,
      });
    } else {
      const p = easeOutQuint(prog(lt, 19.0, 1.0));
      const sc = lerp(0, 380, easeInOutCubic(prog(lt, 19.8, 6.8)));
      drawDesktopMockup3D(ctx, stores.fashionDesktop, 540, 960, {
        width: 928,
        height: 630,
        scale: lerp(0.88, 1.0, p),
        yaw: lerp(0.16, -0.03, p),
        scrollY: sc,
        urlText: 'noire-studio.com  ·  Responsive Layout',
        shadowAlpha: 0.24,
      });
    }

    // Bottom responsive checkpoints strip
    const checks = ['স্বয়ংক্রিয় লেআউট সমন্বয়', 'মসৃণ স্ক্রলিং', 'স্পষ্ট বাটন ও ছবি'];
    checks.forEach((ck, i) => {
      const cx = 76 + i * 316;
      fillRoundRect(ctx, cx, 1624, 296, 112, 20, '#FFFFFF');
      strokeRoundRect(ctx, cx, 1624, 296, 112, 20, 'rgba(8,20,38,0.10)', 1.2);
      drawCheckCircle(ctx, cx + 38, 1680, 14, PALETTE.electricBlue, '#FFFFFF');
      ctx.fillStyle = PALETTE.deepNavy;
      ctx.font = fontSpec(700, 20);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ck, cx + 64, 1680);
    });
  } else {
    // Phase 8C (27.5 - 40.0s): Synchronized 3-Device Ensemble (Desktop + Tablet + Smartphone)
    const enter = easeOutQuint(prog(lt, 27.5, 1.4));
    const syncScroll = lerp(0, 380, easeInOutCubic(prog(lt, 28.4, 10.5)));

    ctx.save();
    ctx.globalAlpha = enter;
    // Desktop centered upper
    drawDesktopMockup3D(ctx, stores.fashionDesktop, 540, 745 + (1 - enter) * 28, {
      width: 910,
      height: 580,
      scale: 0.94,
      yaw: 0.03,
      scrollY: syncScroll,
      urlText: 'Desktop · 1440px',
      stand: false,
      shadowAlpha: 0.20,
    });

    // Tablet lower-left
    drawTabletMockup3D(ctx, stores.fashionTablet, 330, 1365 + (1 - enter) * 44, {
      width: 580,
      height: 780,
      scale: 0.72,
      yaw: 0.11,
      scrollY: syncScroll * 0.75,
      shadowAlpha: 0.24,
    });

    // Smartphone lower-right foreground
    drawPhoneMockup3D(ctx, stores.fashionMobile, 770, 1375 + (1 - enter) * 56, {
      width: 430,
      height: 880,
      scale: 0.74,
      yaw: -0.11,
      scrollY: syncScroll * 1.15,
      shadowAlpha: 0.28,
    });
    ctx.restore();
  }
}

/**
 * SCENE 09 — Pricing and Trust (05:55 – 06:45)
 * Clean, high-impact commercial typography stage.
 * Strict rules:
 *  - Fixed "মাত্র ৩০০০ টাকা" (never "৩০০০ টাকা থেকে")
 *  - Separate unmistakable highlight: "এডভান্স নেই"
 *  - "ডেলিভারি ২–৩ দিনে" & "মাসিক হোস্টিং ফি নেই" with clear, unhidden conditions!
 */
export function renderScene09(ctx, t, scene) {
  const lt = t - scene.start; // 0..50
  drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.36 });
  drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

  // Step 1 (0.8s+): "আপনার ওয়েবসাইট"
  const pIntro = easeOutQuart(prog(lt, 0.4, 0.9));
  drawKickerPill(ctx, 'স্বচ্ছ ও ফিক্সড প্যাকেজ অফার', 540, 168, {
    theme: 'dark',
    align: 'center',
    reveal: pIntro,
  });

  drawTextBlock(ctx, 'আপনার ওয়েবসাইট', 540, 236, {
    weight: 700,
    size: 46,
    lineHeight: 1.2,
    maxWidth: 928,
    color: '#D8E6FA',
    align: 'center',
    reveal: prog(lt, 0.7, 0.9),
  });

  // Step 2 (5.6s+): Hero Fixed Price Card — "মাত্র ৩০০০ টাকা"
  if (lt >= 5.4) {
    const pPrice = easeOutBackSoft(prog(lt, 5.4, 1.0));
    ctx.save();
    ctx.globalAlpha = clamp(prog(lt, 5.4, 0.6), 0, 1);
    const scale = lerp(0.92, 1.0, pPrice);
    ctx.translate(540, 455);
    ctx.scale(scale, scale);

    fillRoundRect(ctx, -464, -135, 928, 270, 32, '#102544');
    strokeRoundRect(ctx, -464, -135, 928, 270, 32, PALETTE.softCyan, 2.4);

    // Subtle top accent bar
    fillRoundRect(ctx, -140, -135, 280, 6, 3, PALETTE.softCyan);

    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 92);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BRAND_FACTS.priceHeadline, 0, -18);

    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(600, 27);
    ctx.fillText('ফিক্সড প্যাকেজ প্রাইস  ·  লুকানো কোনো খরচ নেই', 0, 74);
    ctx.restore();
  }

  // Step 3 (19.0s+): Separate High-Contrast Visual Highlight — "এডভান্স নেই"
  if (lt >= 19.0) {
    const pAdv = easeOutBackSoft(prog(lt, 19.0, 0.95));
    ctx.save();
    ctx.globalAlpha = clamp(prog(lt, 19.0, 0.6), 0, 1);
    const yAdv = lerp(660, 626, pAdv);

    // Distinct Electric Blue / Emerald Trust Spotlight Card
    const grad = ctx.createLinearGradient(76, yAdv, 1004, yAdv + 228);
    grad.addColorStop(0, '#163B73');
    grad.addColorStop(1, '#0F2E5C');
    fillRoundRect(ctx, 76, yAdv, 928, 228, 28, grad);
    strokeRoundRect(ctx, 76, yAdv, 928, 228, 28, '#397BFF', 2.4);

    fillRoundRect(ctx, 114, yAdv + 30, 206, 40, 20, 'rgba(18, 185, 129, 0.22)');
    strokeRoundRect(ctx, 114, yAdv + 30, 206, 40, 20, '#12B981', 1.2);
    ctx.fillStyle = '#34D399';
    ctx.font = fontSpec(700, 18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('১০০% আস্থার নিশ্চয়তা', 217, yAdv + 50);

    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 64);
    ctx.fillText(BRAND_FACTS.advanceHeadline, 114, yAdv + 122);

    ctx.fillStyle = '#E2EEFF';
    ctx.font = fontSpec(600, 25);
    ctx.fillText('কাজ শুরু করতে কোনো অগ্রিম টাকা নেই — ওয়েবসাইট দেখে তারপর পেমেন্ট', 114, yAdv + 184);
    ctx.restore();
  }

  // Step 4 (28.2s+): "ডেলিভারি ২–৩ দিনে" (with prominent unhidden scope/materials condition!)
  if (lt >= 28.2) {
    const pDel = easeOutQuart(prog(lt, 28.2, 0.9));
    ctx.save();
    ctx.globalAlpha = pDel;
    const yDel = 890 + (1 - pDel) * 28;

    fillRoundRect(ctx, 76, yDel, 928, 344, 28, '#102544');
    strokeRoundRect(ctx, 76, yDel, 928, 344, 28, 'rgba(141, 235, 255, 0.30)', 1.6);

    drawCheckCircle(ctx, 132, yDel + 74, 22, PALETTE.electricBlue, '#FFFFFF');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 52);
    ctx.fillText(BRAND_FACTS.deliveryHeadline, 174, yDel + 74);

    // Prominent, clearly legible condition box (NEVER hidden in tiny text!)
    fillRoundRect(ctx, 112, yDel + 142, 856, 166, 20, 'rgba(8, 20, 38, 0.68)');
    strokeRoundRect(ctx, 112, yDel + 142, 856, 166, 20, 'rgba(141, 235, 255, 0.22)', 1.2);
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 24);
    ctx.fillText('প্রযোজ্য শর্ত (স্পষ্টভাবে জেনে নিন):', 142, yDel + 186);
    ctx.fillStyle = '#F4F6FA';
    ctx.font = fontSpec(500, 25);
    ctx.fillText('সাধারণত ২–৩ দিনে ডেলিভারি — তবে কাজের পরিধি এবং', 142, yDel + 232);
    ctx.fillText('প্রয়োজনীয় ছবি ও তথ্য পাওয়ার ওপর সময় নির্ভরশীল।', 142, yDel + 272);
    ctx.restore();
  }

  // Step 5 (35.6s+): "মাসিক হোস্টিং ফি নেই" (with prominent unhidden hosting/domain condition!)
  if (lt >= 35.6) {
    const pHost = easeOutQuart(prog(lt, 35.6, 0.9));
    ctx.save();
    ctx.globalAlpha = pHost;
    const yHost = 1268 + (1 - pHost) * 28;

    fillRoundRect(ctx, 76, yHost, 928, 392, 28, '#102544');
    strokeRoundRect(ctx, 76, yHost, 928, 392, 28, 'rgba(141, 235, 255, 0.30)', 1.6);

    drawCheckCircle(ctx, 132, yHost + 74, 22, PALETTE.emeraldTrust, '#FFFFFF');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 50);
    ctx.fillText(BRAND_FACTS.hostingHeadline, 174, yHost + 74);

    fillRoundRect(ctx, 112, yHost + 142, 856, 214, 20, 'rgba(8, 20, 38, 0.68)');
    strokeRoundRect(ctx, 112, yHost + 142, 856, 214, 20, 'rgba(141, 235, 255, 0.22)', 1.2);
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 24);
    ctx.fillText('হোস্টিং ও খরচের স্বচ্ছতা:', 142, yHost + 186);
    ctx.fillStyle = '#F4F6FA';
    ctx.font = fontSpec(500, 24);
    ctx.fillText('• ব্যবহৃত ফ্রি/ক্লাউড হোস্টিং ব্যবস্থার শর্ত অনুযায়ী মাসিক হোস্টিং ফি নেই।', 142, yHost + 236);
    ctx.fillText('• কাস্টম ডোমেইন ও পেইড থার্ড-পার্টি সেবার খরচ আলাদা (শুরুতেই জানানো হয়)।', 142, yHost + 286);
    ctx.restore();
  }
}

/**
 * SCENE 10 — How to Get Started (06:45 – 07:25)
 * Simple, honest 3-step onboarding process on clean daylight #F4F6FA stage.
 */
export function renderScene10(ctx, t, scene) {
  const lt = t - scene.start; // 0..40
  drawLightStage(ctx, t, { warm: false });
  drawEditorialChrome(ctx, scene, t, { theme: 'light' });

  drawKickerPill(ctx, 'HOW TO GET STARTED  ·  সহজ ৩টি ধাপ', 76, 164, {
    theme: 'light',
    reveal: prog(lt, 0.2, 0.8),
  });

  // Primary Scene 10 Bengali Message
  drawTextBlock(
    ctx,
    'আপনার ব্যবসার প্রয়োজন\nআমাদের জানান।',
    76,
    230,
    {
      weight: 800,
      size: 56,
      lineHeight: 1.28,
      maxWidth: 928,
      color: PALETTE.deepNavy,
      reveal: prog(lt, 0.4, 1.0),
    }
  );

  const STEPS = [
    {
      num: 'ধাপ ০১',
      t0: 5.8,
      title: 'WhatsApp-এ যোগাযোগ করুন',
      line1: `সরাসরি WhatsApp (${BRAND_FACTS.whatsapp})-এ মেসেজ দিন অথবা`,
      line2: `${BRAND_FACTS.domain}-এ লাইভ ডেমোগুলো ঘুরে দেখুন।`,
      accent: '#25D366',
    },
    {
      num: 'ধাপ ০২',
      t0: 14.0,
      title: 'প্রয়োজন ও ব্যবসার ধরন জানান',
      line1: 'আপনার পণ্যের ক্যাটাগরি, ব্র্যান্ডের নাম, পছন্দের রঙ এবং',
      line2: 'ওয়েবসাইটে কী কী সুবিধা চান তা আমাদের জানান।',
      accent: PALETTE.electricBlue,
    },
    {
      num: 'ধাপ ০৩',
      t0: 22.1,
      title: 'পরিকল্পনা ও কাজের পরিধি নিশ্চিত করুন',
      line1: 'কাজ শুরুর আগেই ডিজাইন পরিকল্পনা ও নির্ধারিত প্যাকেজে',
      line2: 'অন্তর্ভুক্ত ফিচারের পরিধি আলোচনা করে চূড়ান্ত করা হবে।',
      accent: PALETTE.deepNavy,
    },
  ];

  STEPS.forEach((st, idx) => {
    const p = easeOutQuint(prog(lt, st.t0 - 1.0, 1.1));
    const preVisible = easeOutQuart(prog(lt, 1.2 + idx * 0.35, 0.9));
    const active = lt >= st.t0 - 0.8;
    const y = 442 + idx * 384 + (1 - preVisible) * 28;

    ctx.save();
    ctx.globalAlpha = preVisible;
    fillRoundRect(ctx, 76, y, 928, 344, 28, active ? '#FFFFFF' : 'rgba(255,255,255,0.68)');
    strokeRoundRect(
      ctx,
      76,
      y,
      928,
      344,
      28,
      active ? st.accent : 'rgba(8,20,38,0.10)',
      active ? 2.4 : 1.2
    );

    // Step pill
    fillRoundRect(ctx, 118, y + 38, 152, 48, 24, active ? st.accent : '#E2E8F0');
    ctx.fillStyle = active ? '#FFFFFF' : '#475569';
    ctx.font = fontSpec(800, 21);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(st.num, 194, y + 62);

    if (active) {
      drawCheckCircle(ctx, 948, y + 62, 20, st.accent, '#FFFFFF');
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.deepNavy;
    ctx.font = fontSpec(800, 38);
    ctx.fillText(st.title, 118, y + 144);

    ctx.fillStyle = active ? '#334155' : '#64748B';
    ctx.font = fontSpec(500, 25);
    ctx.fillText(st.line1, 118, y + 218);
    ctx.fillText(st.line2, 118, y + 262);
    ctx.restore();
  });

  // Bottom reassurance bar
  if (lt >= 24.0) {
    const bp = easeOutQuart(prog(lt, 24.0, 1.0));
    ctx.save();
    ctx.globalAlpha = bp;
    fillRoundRect(ctx, 76, 1624, 928, 128, 24, PALETTE.deepNavy);
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 26);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'কাজ শুরুর আগে কোনো এডভান্স নেই  ·  তৈরি শেষে দেখে পেমেন্ট',
      540,
      1688
    );
    ctx.restore();
  }
}

/**
 * SCENE 11 — Final Brand Film Ending (07:25 – 08:12)
 * Short website montage -> Cleanest, most memorable Brand Composition + WhatsApp CTA held >20s!
 */
export function renderScene11(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..47
  drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.34 });

  if (lt < 16.4) {
    // Phase 11A (0 - 16.4s): Curated Website Portfolio Ribbon Montage + Offer Recap
    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });
    const enter = easeOutQuart(prog(lt, 0.2, 1.0));
    const exit = 1 - easeInOutCubic(prog(lt, 15.4, 1.0));

    drawKickerPill(ctx, 'YOUR BUSINESS  ·  YOUR WEBSITE', 540, 168, {
      theme: 'dark',
      align: 'center',
      reveal: enter * exit,
    });

    drawTextBlock(
      ctx,
      'আপনার ব্যবসাকে অনলাইনে\nআরও পেশাদারভাবে তুলে ধরুন।',
      540,
      238,
      {
        weight: 800,
        size: 54,
        lineHeight: 1.28,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: prog(lt, 0.4, 1.1) * exit,
      }
    );

    // Smooth dual-row drifting showcase of all 6 crafted industry websites
    ctx.save();
    ctx.globalAlpha = enter * exit;
    const row1 = [stores.fashionDesktop, stores.watchDesktop, stores.shoeDesktop, stores.fashionDesktop];
    const row2 = [stores.restaurantDesktop, stores.furnitureDesktop, stores.cosmeticsDesktop, stores.restaurantDesktop];

    const drift1 = -lerp(0, 420, lt / 16.4);
    const drift2 = lerp(-420, 0, lt / 16.4);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 440, W, 860);
    ctx.clip();

    row1.forEach((surf, i) => {
      const rx = 76 + i * 560 + drift1;
      const ry = 468;
      fillRoundRect(ctx, rx - 8, ry - 8, 536, 366, 22, '#102544');
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rx, ry, 520, 350, 16);
      ctx.clip();
      ctx.drawImage(surf, rx, ry, 520, 350);
      ctx.restore();
    });

    row2.forEach((surf, i) => {
      const rx = 76 + i * 560 + drift2;
      const ry = 884;
      fillRoundRect(ctx, rx - 8, ry - 8, 536, 366, 22, '#102544');
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rx, ry, 520, 350, 16);
      ctx.clip();
      ctx.drawImage(surf, rx, ry, 520, 350);
      ctx.restore();
    });
    ctx.restore();

    // Offer Recap Banner below montage
    fillRoundRect(ctx, 76, 1344, 928, 290, 28, '#102544');
    strokeRoundRect(ctx, 76, 1344, 928, 290, 28, PALETTE.softCyan, 1.8);

    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 56);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('মাত্র ৩০০০ টাকা  ·  এডভান্স নেই', 540, 1450);

    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(600, 26);
    ctx.fillText('আপনার প্রয়োজন অনুযায়ী কাস্টমাইজড ওয়েবসাইট', 540, 1546);
    ctx.restore();
  } else {
    // Phase 11B & 11C (16.4 - 47.0s = 30.6s!): Final Brand Film Ending & Held CTA
    // Held 100% clear & un-faded right up to 08:12.000!
    const enter = easeOutQuint(prog(lt, 16.4, 1.4));

    // Top subtle architectural brand header
    drawEditorialChrome(ctx, scene, t, { theme: 'dark', showHeader: true });

    // Clean Brand Wordmark Plaque (y = 200..445)
    ctx.save();
    ctx.globalAlpha = enter;
    const rise = (1 - enter) * 28;

    fillRoundRect(ctx, 76, 196 + rise, 928, 250, 30, '#102544');
    strokeRoundRect(ctx, 76, 196 + rise, 928, 250, 30, 'rgba(141, 235, 255, 0.34)', 1.8);

    drawWordmark(ctx, 540, 314 + rise, { size: 78, theme: 'dark', align: 'center' });

    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(600, 25);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('আপনার ব্যবসা। আপনার পরিচয়। আপনার ওয়েবসাইট।', 540, 388 + rise);
    ctx.restore();

    // Primary Question Copy (exact from Scene 11 prompt)
    drawTextBlock(
      ctx,
      'আপনার ব্যবসার জন্য\nওয়েবসাইট তৈরি করতে চান?',
      540,
      518,
      {
        weight: 800,
        size: 60,
        lineHeight: 1.28,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: prog(lt, 17.0, 1.2),
      }
    );

    // Core Offer Trust Pills Row (y = 720)
    const offerP = easeOutQuart(prog(lt, 17.6, 1.0));
    ctx.save();
    ctx.globalAlpha = offerP;
    const badges = ['মাত্র ৩০০০ টাকা', 'এডভান্স নেই', 'কাস্টম ডিজাইন'];
    badges.forEach((b, i) => {
      const bx = 76 + i * 316;
      fillRoundRect(ctx, bx, 728, 296, 76, 38, 'rgba(57, 123, 255, 0.16)');
      strokeRoundRect(ctx, bx, 728, 296, 76, 38, 'rgba(141, 235, 255, 0.34)', 1.4);
      ctx.fillStyle = PALETTE.softCyan;
      ctx.font = fontSpec(700, 25);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b, bx + 148, 766);
    });
    ctx.restore();

    // Primary WhatsApp CTA Card (exact copy: "এখনই WhatsApp-এ মেসেজ দিন।" + verified 01876892958)
    const ctaP = easeOutBackSoft(prog(lt, 18.2, 1.1));
    ctx.save();
    ctx.globalAlpha = clamp(prog(lt, 18.2, 0.7), 0, 1);
    const pulse = 1 + 0.008 * Math.sin((lt - 18.2) * 2.2);
    ctx.translate(540, 1068);
    ctx.scale(lerp(0.94, 1.0, ctaP) * pulse, lerp(0.94, 1.0, ctaP) * pulse);

    // Outer glow shadow (controlled, elegant)
    ctx.shadowColor = 'rgba(37, 211, 102, 0.24)';
    ctx.shadowBlur = 36;
    fillRoundRect(ctx, -464, -196, 928, 392, 34, '#0D2644');
    ctx.shadowBlur = 0;
    strokeRoundRect(ctx, -464, -196, 928, 392, 34, '#25D366', 2.6);

    // Primary Green WhatsApp CTA Button inside card (auto-centered icon + text lockup)
    fillRoundRect(ctx, -412, -144, 824, 146, 26, '#25D366');
    const ctaText = 'এখনই WhatsApp-এ মেসেজ দিন।';
    ctx.font = fontSpec(800, 42);
    const ctaTextW = ctx.measureText(ctaText).width;
    const iconSpace = 66;
    const lockupStart = -(iconSpace + ctaTextW) * 0.5;
    drawWhatsappIcon(ctx, lockupStart + 24, -71, 28, '#081426');

    ctx.fillStyle = '#081426';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText, lockupStart + iconSpace, -71);

    // Verified WhatsApp Number large & crisp
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.white;
    ctx.font = fontSpec(800, 56);
    ctx.fillText(`WhatsApp: ${BRAND_FACTS.whatsapp}`, 0, 74);

    ctx.fillStyle = '#B8CCE4';
    ctx.font = fontSpec(500, 24);
    ctx.fillText('মেসেজ দিয়ে আপনার ব্যবসার প্রয়োজন জানান — দ্রুত উত্তর পাবেন', 0, 144);
    ctx.restore();

    // Official Website URL Plaque (exact: "https://codepixelweb.vercel.app/")
    const urlP = easeOutQuart(prog(lt, 19.0, 1.1));
    ctx.save();
    ctx.globalAlpha = urlP;
    const uy = 1326 + (1 - urlP) * 24;
    fillRoundRect(ctx, 76, uy, 928, 224, 28, '#102544');
    strokeRoundRect(ctx, 76, uy, 928, 224, 28, 'rgba(57, 123, 255, 0.42)', 1.8);

    ctx.fillStyle = PALETTE.slateMuted;
    ctx.font = fontSpec(600, 23);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('লাইভ ডেমো ও বিস্তারিত দেখতে ভিজিট করুন', 540, uy + 68);

    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(800, 40);
    ctx.fillText(BRAND_FACTS.url, 540, uy + 144);
    ctx.restore();

    // Clean closing signature footer above bottom rail
    if (lt >= 19.6) {
      ctx.save();
      ctx.globalAlpha = easeOutQuart(prog(lt, 19.6, 1.0));
      ctx.fillStyle = 'rgba(244, 246, 250, 0.78)';
      ctx.font = fontSpec(600, 24);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CodePixel Web  ·  বাংলাদেশের ব্যবসায়ীদের বিশ্বস্ত ওয়েব পার্টনার', 540, 1656);
      ctx.restore();
    }
  }
}
