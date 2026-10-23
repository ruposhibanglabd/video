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
  drawTouchRipple,
  drawCheckCircle,
} from '../engine/canvas-core.mjs';
import { renderEcommerceStepScreen } from '../ui/industry-stores.mjs';

const W = FILM.width;
const H = FILM.height;

/**
 * SCENE 01 — Cinematic Opening (00:00 – 00:30)
 */
export function renderScene01(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..30
  drawDarkStage(ctx, t, { accentX: 0.52, accentY: 0.34 });

  if (lt < 8.4) {
    // Shot 1A (0.0 - 8.4s): Golden-hour Dhaka boutique studio + immediate clear business hook
    const enter = easeOutQuint(prog(lt, 0.0, 1.1));
    const exit = 1 - easeInOutCubic(prog(lt, 7.6, 0.8));
    const vis = enter * exit;

    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

    ctx.save();
    ctx.globalAlpha = vis;
    const zoom = 1.02 + 0.09 * (lt / 8.4);
    const panX = lerp(-0.02, 0.02, lt / 8.4);
    const cardY = 176 + (1 - enter) * 28;

    drawCoverPhoto(ctx, assets.photos.s01_boutique_env, 76, cardY, 928, 930, {
      radius: 30,
      zoom,
      panX,
    });
    strokeRoundRect(ctx, 76, cardY, 928, 930, 30, 'rgba(255,255,255,0.16)', 1.5);

    // Subtle glass badge on photo corner
    fillRoundRect(ctx, 108, cardY + 30, 368, 48, 24, 'rgba(8, 20, 38, 0.78)');
    strokeRoundRect(ctx, 108, cardY + 30, 368, 48, 24, 'rgba(141, 235, 255, 0.32)', 1);
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(600, 18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('বাংলাদেশি ব্যবসার নিজস্ব ওয়েব স্টুডিও', 292, cardY + 54);
    ctx.restore();

    drawKickerPill(ctx, 'পেশাদার অনলাইন উপস্থিতি', 76, 1154, {
      theme: 'dark',
      reveal: prog(lt, 0.35, 0.8) * exit,
    });

    drawTextBlock(
      ctx,
      'প্রতিটি সফল ব্যবসার পেছনে থাকে\nনিজস্ব একটি পরিচয় ও আস্থা।',
      76,
      1222,
      {
        weight: 800,
        size: 52,
        lineHeight: 1.32,
        maxWidth: 928,
        color: PALETTE.white,
        reveal: prog(lt, 0.55, 1.0) * exit,
      }
    );

    drawTextBlock(
      ctx,
      'আপনার পণ্য ও ব্র্যান্ডকে অনলাইনে পেশাদারভাবে তুলে ধরুন — CodePixel Web-এর সঙ্গে।',
      76,
      1402,
      {
        weight: 500,
        size: 30,
        lineHeight: 1.45,
        maxWidth: 928,
        color: PALETTE.slateMuted,
        reveal: prog(lt, 1.1, 1.0) * exit,
      }
    );
  } else if (lt < 17.2) {
    // Shot 1B (8.4 - 17.2s): Macro product close-up + 3D Smartphone website reveal
    const enter = easeOutQuart(prog(lt, 8.4, 0.9));
    const exit = 1 - easeInOutCubic(prog(lt, 16.4, 0.8));
    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

    ctx.save();
    ctx.globalAlpha = enter * exit;
    const zoom = 1.03 + 0.08 * ((lt - 8.4) / 8.8);
    drawCoverPhoto(ctx, assets.photos.s01_hero_craft, 76, 168, 928, 520, {
      radius: 28,
      zoom,
      panX: lerp(0.02, -0.02, (lt - 8.4) / 8.8),
    });
    strokeRoundRect(ctx, 76, 168, 928, 520, 28, 'rgba(141,235,255,0.22)', 1.5);
    ctx.restore();

    // Left editorial copy + Right emerging 3D smartphone
    drawKickerPill(ctx, 'প্রথম দর্শনেই আস্থা', 76, 742, {
      theme: 'dark',
      reveal: prog(lt, 8.8, 0.8) * exit,
    });

    drawTextBlock(
      ctx,
      'কাস্টমার যখন অনলাইনে\nআপনার পণ্য খোঁজেন—\nতখন একটি সুন্দর\nওয়েবসাইটই গড়ে তোলে\nপ্রথম বিশ্বাস।',
      76,
      812,
      {
        weight: 700,
        size: 42,
        lineHeight: 1.36,
        maxWidth: 430,
        color: PALETTE.white,
        reveal: prog(lt, 9.1, 1.1) * exit,
      }
    );

    const phoneEnter = easeOutQuint(prog(lt, 9.4, 1.5));
    ctx.save();
    ctx.globalAlpha = phoneEnter * exit;
    const phoneY = lerp(1360, 1210, phoneEnter);
    const yaw = lerp(-0.28, -0.11, easeInOutCubic(prog(lt, 9.4, 6.5)));
    const scroll = lerp(0, 260, easeInOutCubic(prog(lt, 10.6, 5.8)));
    drawPhoneMockup3D(ctx, stores.fashionMobile, 770, phoneY, {
      width: 420,
      height: 860,
      scale: 0.94,
      yaw,
      scrollY: scroll,
    });
    ctx.restore();
  } else {
    // Shot 1C & 1D (17.2 - 30.0s): Hero Bengali Title + Brand Identity Reveal
    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

    const titleRev = prog(lt, 17.3, 1.2);
    drawKickerPill(ctx, 'CODEPIXEL WEB  ·  DIGITAL AGENCY', 540, 172, {
      theme: 'dark',
      align: 'center',
      reveal: titleRev,
    });

    // Primary Scene 01 Bengali Message (exact from storyboard)
    drawTextBlock(
      ctx,
      'আপনার ব্যবসা।\nআপনার পরিচয়।\nআপনার ওয়েবসাইট।',
      540,
      244,
      {
        weight: 800,
        size: 66,
        lineHeight: 1.26,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: prog(lt, 17.45, 1.4),
      }
    );

    // Centerpiece 3D Phone transitioning smoothly & brand plaque below
    const brandPhase = easeInOutQuart(prog(lt, 22.4, 1.4));
    const phoneCenterY = lerp(1150, 1045, brandPhase);
    const phoneScale = lerp(0.95, 0.78, brandPhase);
    const phoneYaw = Math.sin((lt - 17.2) * 0.45) * 0.09;
    const phoneScroll = lerp(140, 520, easeInOutCubic(prog(lt, 17.5, 11.5)));

    drawPhoneMockup3D(ctx, stores.fashionMobile, 540, phoneCenterY, {
      width: 430,
      height: 880,
      scale: phoneScale,
      yaw: phoneYaw,
      scrollY: phoneScroll,
    });

    // Brand Identity Plaque Reveal (22.4 - 30.0s)
    if (brandPhase > 0.01) {
      ctx.save();
      ctx.globalAlpha = brandPhase;
      const py = lerp(1540, 1468, brandPhase);
      fillRoundRect(ctx, 76, py, 928, 304, 28, 'rgba(16, 37, 68, 0.88)');
      strokeRoundRect(ctx, 76, py, 928, 304, 28, 'rgba(141, 235, 255, 0.34)', 1.6);

      drawWordmark(ctx, 540, py + 96, { size: 62, theme: 'dark', align: 'center' });

      ctx.fillStyle = PALETTE.softCyan;
      ctx.font = fontSpec(600, 26);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(BRAND_FACTS.domain, 540, py + 158);

      ctx.fillStyle = 'rgba(244, 246, 250, 0.84)';
      ctx.font = fontSpec(500, 25);
      ctx.fillText('বাংলাদেশের উদ্যোক্তাদের প্রয়োজন অনুযায়ী কাস্টম ওয়েবসাইট', 540, py + 224);
      ctx.restore();
    }
  }
}

/**
 * SCENE 02 — The Business Problem (00:30 – 01:15)
 * Grounded in real Bangladeshi Facebook-page selling challenges; zero fake stats.
 */
export function renderScene02(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..45
  drawDarkStage(ctx, t, { accentX: 0.46, accentY: 0.30 });
  drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

  if (lt < 11.2) {
    // Shot 2A (0 - 11.2s): Entrepreneur checking Facebook page on smartphone
    const enter = easeOutQuart(prog(lt, 0.2, 1.0));
    const exit = 1 - easeInOutCubic(prog(lt, 10.3, 0.9));

    drawKickerPill(ctx, 'বাংলাদেশের ক্ষুদ্র ও মাঝারি উদ্যোক্তা', 76, 168, {
      theme: 'dark',
      reveal: enter * exit,
    });

    drawTextBlock(
      ctx,
      'ফেসবুক পেজে প্রতিদিন দারুণ সব\nপণ্য বিক্রি করছেন অনেক উদ্যোক্তা।',
      76,
      236,
      {
        weight: 800,
        size: 48,
        lineHeight: 1.32,
        maxWidth: 928,
        color: PALETTE.white,
        reveal: prog(lt, 0.4, 1.1) * exit,
      }
    );

    ctx.save();
    ctx.globalAlpha = enter * exit;
    drawCoverPhoto(ctx, assets.photos.s02_entrepreneur, 76, 418, 928, 720, {
      radius: 28,
      zoom: 1.02 + 0.06 * (lt / 11.2),
    });
    strokeRoundRect(ctx, 76, 418, 928, 720, 28, 'rgba(255,255,255,0.16)', 1.5);

    // Clean contextual social post card below photo
    const cardPop = easeOutQuart(prog(lt, 1.4, 1.0));
    const cy = lerp(1220, 1184, cardPop);
    fillRoundRect(ctx, 76, cy, 928, 490, 26, '#102544');
    strokeRoundRect(ctx, 76, cy, 928, 490, 26, 'rgba(141,235,255,0.22)', 1.4);

    // Social page header inside card
    ctx.fillStyle = PALETTE.electricBlue;
    ctx.beginPath();
    ctx.arc(136, cy + 62, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = fontSpec(700, 24);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('আপনার অনলাইন পেজ  ·  নতুন পণ্যের পোস্ট', 180, cy + 56);
    ctx.fillStyle = PALETTE.slateMuted;
    ctx.font = fontSpec(500, 19);
    ctx.fillText('পোস্টের নিচে অসংখ্য কমেন্ট ও ইনবক্স মেসেজ...', 180, cy + 90);

    // Mini product photo strip inside post
    drawCoverPhoto(ctx, assets.photos.s04_fashion_hero, 110, cy + 132, 260, 290, { radius: 16 });
    drawCoverPhoto(ctx, assets.photos.s04_fashion_item2, 392, cy + 132, 260, 290, { radius: 16 });
    drawCoverPhoto(ctx, assets.photos.s07_packaging_parcel, 674, cy + 132, 296, 290, { radius: 16 });
    ctx.restore();
  } else if (lt < 28.8) {
    // Shot 2B & 2C (11.2 - 28.8s): Scattered inquiries & buried posts
    const enter = easeOutQuart(prog(lt, 11.2, 0.9));
    const exit = 1 - easeInOutCubic(prog(lt, 27.9, 0.9));

    drawKickerPill(ctx, 'প্রতিদিনের বাস্তব চ্যালেঞ্জ', 76, 168, {
      theme: 'dark',
      reveal: enter * exit,
    });

    drawTextBlock(
      ctx,
      'শুধু পোস্ট আর ইনবক্সের ভিড়ে\nপণ্যের তথ্য গুছিয়ে তুলে ধরা কঠিন।',
      76,
      236,
      {
        weight: 800,
        size: 48,
        lineHeight: 1.32,
        maxWidth: 928,
        color: PALETTE.white,
        reveal: prog(lt, 11.4, 1.0) * exit,
      }
    );

    const inquiries = [
      {
        t0: 12.0,
        q: '“ভাইয়া এই শার্টটার দাম কত? কোন কোন কালার আছে?”',
        sub: 'একই প্রশ্নের উত্তর প্রতিদিন বারবার লিখে জানাতে হয়',
      },
      {
        t0: 14.8,
        q: '“আগের সপ্তাহের পোস্টটা খুঁজে পাচ্ছি না, ছবি আবার দেবেন?”',
        sub: 'নতুন পোস্টের নিচে হারিয়ে যায় আপনার সেরা পণ্যগুলো',
      },
      {
        t0: 18.2,
        q: '“সব ক্যাটাগরি আর সাইজ একসাথে কোথায় দেখব?”',
        sub: 'ক্যাটাগরি ও স্টক এক জায়গায় না থাকায় কাস্টমার দ্বিধায় পড়েন',
      },
      {
        t0: 21.8,
        q: '“অর্ডার করতে কী কী তথ্য দিতে হবে?”',
        sub: 'গোছানো অর্ডার ফর্ম না থাকায় অর্ডার নিতে সময় বেশি লাগে',
      },
    ];

    inquiries.forEach((inq, idx) => {
      const p = easeOutQuart(prog(lt, inq.t0, 0.95)) * exit;
      if (p <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = p;
      const y = 438 + idx * 290 + (1 - p) * 28;
      fillRoundRect(ctx, 76, y, 928, 254, 24, '#102544');
      strokeRoundRect(ctx, 76, y, 928, 254, 24, 'rgba(57, 123, 255, 0.28)', 1.5);

      // Left number badge
      fillRoundRect(ctx, 112, y + 36, 134, 40, 20, 'rgba(57,123,255,0.18)');
      ctx.fillStyle = PALETTE.softCyan;
      ctx.font = fontSpec(700, 18);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`কাস্টমার প্রশ্ন ০${idx + 1}`, 179, y + 56);

      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.white;
      ctx.font = fontSpec(700, 30);
      ctx.fillText(inq.q, 112, y + 128);

      ctx.fillStyle = PALETTE.slateMuted;
      ctx.font = fontSpec(500, 23);
      ctx.fillText(inq.sub, 112, y + 188);
      ctx.restore();
    });
  } else {
    // Shot 2D (28.8 - 45.0s): Clean Website Presentation + Primary Scene 02 Question
    const enter = easeOutQuint(prog(lt, 28.8, 1.2));

    drawKickerPill(ctx, 'গোছানো সমাধানের কথা ভাবুন', 540, 168, {
      theme: 'dark',
      align: 'center',
      reveal: enter,
    });

    // Primary Scene 02 Bengali Message
    drawTextBlock(
      ctx,
      'আপনার ব্যবসার পণ্য ও তথ্য\nএকটি নিজস্ব ওয়েবসাইটে\nসুন্দরভাবে উপস্থাপন করতে চান?',
      540,
      238,
      {
        weight: 800,
        size: 52,
        lineHeight: 1.32,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: prog(lt, 29.1, 1.3),
      }
    );

    // Side-by-side transformation: Desktop + Phone preview emerging cleanly
    ctx.save();
    ctx.globalAlpha = enter;
    const rise = (1 - enter) * 44;
    const scrollD = lerp(0, 340, easeInOutCubic(prog(lt, 30.0, 13.0)));
    drawDesktopMockup3D(ctx, stores.fashionDesktop, 540, 960 + rise, {
      width: 900,
      height: 590,
      scale: 0.96,
      yaw: 0.05,
      scrollY: scrollD,
      urlText: 'yourbusiness.com  ·  কাস্টম ওয়েবসাইট ডেমো',
    });

    // Clean summary strip below desktop
    const pills = ['স্পষ্ট ক্যাটাগরি', 'পণ্যের ছবি ও মূল্য', '২৪/৭ গোছানো ক্যাটালগ'];
    pills.forEach((pl, i) => {
      const px = 76 + i * 316;
      const py = 1388 + rise;
      fillRoundRect(ctx, px, py, 296, 118, 20, '#102544');
      strokeRoundRect(ctx, px, py, 296, 118, 20, 'rgba(141,235,255,0.28)', 1.2);
      drawCheckCircle(ctx, px + 42, py + 59, 16, PALETTE.electricBlue, '#FFFFFF');
      ctx.fillStyle = PALETTE.white;
      ctx.font = fontSpec(700, 23);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pl, px + 72, py + 59);
    });
    ctx.restore();
  }
}

/**
 * SCENE 03 — The CodePixel Web Solution (01:15 – 02:00)
 * Daylight Light Neutral (#F4F6FA) Editorial Studio: Full Desktop -> Smooth Smartphone Transition.
 */
export function renderScene03(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..45
  drawLightStage(ctx, t, { warm: false });
  drawEditorialChrome(ctx, scene, t, { theme: 'light' });

  drawKickerPill(ctx, 'CODEPIXEL WEB SOLUTION', 76, 164, {
    theme: 'light',
    reveal: prog(lt, 0.2, 0.9),
  });

  // Primary Scene 03 Bengali Message
  drawTextBlock(
    ctx,
    'আপনার প্রয়োজন অনুযায়ী\nওয়েবসাইট তৈরি করুন।',
    76,
    230,
    {
      weight: 800,
      size: 58,
      lineHeight: 1.28,
      maxWidth: 928,
      color: PALETTE.deepNavy,
      reveal: prog(lt, 0.4, 1.1),
    }
  );

  if (lt < 28.0) {
    // Phase A (0 - 28.0s): Full Modern Desktop Website Design + Custom Branding Architecture
    const enter = easeOutQuint(prog(lt, 0.6, 1.3));
    const exit = 1 - easeInOutCubic(prog(lt, 27.1, 0.9));

    ctx.save();
    ctx.globalAlpha = enter * exit;
    const yaw = lerp(0.18, -0.04, easeInOutCubic(prog(lt, 1.0, 25.0)));
    const scrollY = lt < 18.0
      ? lerp(0, 120, easeInOutCubic(prog(lt, 2.0, 15.0)))
      : lerp(120, 480, easeInOutCubic(prog(lt, 18.0, 9.0)));

    drawDesktopMockup3D(ctx, stores.fashionDesktop, 540, 815 + (1 - enter) * 36, {
      width: 928,
      height: 620,
      scale: 0.98,
      yaw,
      scrollY,
      urlText: 'noire-studio.com  ·  কাস্টম ব্র্যান্ডেড ওয়েবসাইট',
      shadowAlpha: 0.22,
    });

    // 4 Architectural Feature Cards below Desktop
    const features = [
      { title: 'পরিষ্কার হোমপেজ', desc: 'প্রথম দেখাতেই আপনার ব্র্যান্ডের পেশাদার পরিচয়' },
      { title: 'সুন্দর নেভিগেশন', desc: 'সহজ মেনু থেকে যেকোনো পণ্যে দ্রুত প্রবেশ' },
      { title: 'সুবিন্যস্ত ক্যাটাগরি ও পণ্য', desc: 'ছবি, বিবরণ ও স্পষ্ট মূল্যে গোছানো ক্যাটালগ' },
      { title: 'কাস্টম ব্র্যান্ডিং', desc: 'কপি-পেস্ট টেমপ্লেট নয়, আপনার রঙ ও স্টাইল' },
    ];

    features.forEach((ft, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardP = easeOutQuart(prog(lt, 2.2 + idx * 1.4, 0.9));
      const x = 76 + col * 476;
      const y = 1210 + row * 228 + (1 - cardP) * 24;

      ctx.save();
      ctx.globalAlpha *= cardP;
      fillRoundRect(ctx, x, y, 452, 204, 22, '#FFFFFF');
      strokeRoundRect(ctx, x, y, 452, 204, 22, 'rgba(8,20,38,0.09)', 1.4);

      fillRoundRect(ctx, x + 28, y + 28, 48, 8, 4, PALETTE.electricBlue);
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.deepNavy;
      ctx.font = fontSpec(800, 26);
      ctx.fillText(ft.title, x + 28, y + 76);

      drawTextBlock(ctx, ft.desc, x + 28, y + 106, {
        weight: 500,
        size: 20,
        lineHeight: 1.42,
        maxWidth: 396,
        color: PALETTE.inkMuted,
        reveal: 1.0,
      });
      ctx.restore();
    });
    ctx.restore();
  } else {
    // Phase B (28.0 - 45.0s): Smooth 3D Transition from Desktop View -> Smartphone Responsive View
    const trans = easeInOutQuart(prog(lt, 28.0, 2.2));

    // Desktop glides smoothly into background-left
    const deskX = lerp(540, 370, trans);
    const deskY = lerp(815, 760, trans);
    const deskScale = lerp(0.98, 0.68, trans);
    const deskYaw = lerp(-0.04, 0.16, trans);

    drawDesktopMockup3D(ctx, stores.fashionDesktop, deskX, deskY, {
      width: 928,
      height: 620,
      scale: deskScale,
      yaw: deskYaw,
      scrollY: 260,
      urlText: 'noire-studio.com',
      shadowAlpha: 0.18,
    });

    // Smartphone rises smoothly into crisp foreground-right
    const phoneEnter = easeOutQuint(prog(lt, 28.4, 1.8));
    ctx.save();
    ctx.globalAlpha = phoneEnter;
    const phoneX = lerp(820, 720, phoneEnter);
    const phoneY = lerp(1220, 1060, phoneEnter);
    const phoneYaw = lerp(-0.24, -0.09, easeOutQuart(prog(lt, 28.4, 4.0)));
    const phoneScroll = lerp(0, 460, easeInOutCubic(prog(lt, 30.0, 13.0)));

    drawPhoneMockup3D(ctx, stores.fashionMobile, phoneX, phoneY, {
      width: 430,
      height: 890,
      scale: 0.92,
      yaw: phoneYaw,
      scrollY: phoneScroll,
      shadowAlpha: 0.28,
    });
    ctx.restore();

    // Left callout stack during mobile reveal
    const calloutP = easeOutQuart(prog(lt, 29.8, 1.2));
    ctx.save();
    ctx.globalAlpha = calloutP;
    fillRoundRect(ctx, 76, 1110, 392, 430, 24, PALETTE.deepNavy);
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.softCyan;
    ctx.font = fontSpec(700, 18);
    ctx.fillText('RESPONSIVE EXCELLENCE', 108, 1168);

    drawTextBlock(
      ctx,
      'ডেস্কটপ থেকে স্মার্টফোন—\nপ্রতিটি পর্দায় নিখুঁত,\nপরিচ্ছন্ন ও পেশাদার।',
      108,
      1204,
      {
        weight: 700,
        size: 32,
        lineHeight: 1.38,
        maxWidth: 328,
        color: PALETTE.white,
        reveal: calloutP,
      }
    );

    const bullets = ['১০০% মোবাইল রেসপনসিভ', 'স্পষ্ট ছবি ও টাইপোগ্রাফি', 'সহজ অর্ডার অভিজ্ঞতা'];
    bullets.forEach((b, i) => {
      const by = 1384 + i * 46;
      drawCheckCircle(ctx, 122, by, 12, PALETTE.electricBlue, '#FFFFFF');
      ctx.fillStyle = '#E2E8F0';
      ctx.font = fontSpec(600, 20);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(b, 146, by);
    });
    ctx.restore();
  }
}

/**
 * SCENE 04 — Multiple Business Possibilities (02:00 – 02:50)
 * 6 Distinct Industry Storefronts (Fashion, Watch, Shoe, Cosmetics, Furniture, Restaurant) + Bento Finale.
 */
export function renderScene04(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..50

  const INDUSTRIES = [
    {
      idx: '01',
      nameBn: 'ফ্যাশন ও পোশাক স্টোর',
      nameEn: 'FASHION & APPAREL',
      desc: 'আধুনিক লুকবুক, ক্যাটাগরি ও পরিচ্ছন্ন ক্যাটালগ লেআউট',
      bgTop: '#FAF7F2',
      bgBot: '#EDE6DC',
      isDark: false,
      accent: '#9A6B4C',
      swatches: ['#FAF7F2', '#191817', '#9A6B4C'],
      desk: stores.fashionDesktop,
      mob: stores.fashionMobile,
      url: 'fashion-demo  ·  NOIRÉ',
      t0: 6.5,
      t1: 12.6,
    },
    {
      idx: '02',
      nameBn: 'মিনিমাল ও প্রিমিয়াম ঘড়ির স্টোর',
      nameEn: 'LUXURY WATCH STORE',
      desc: 'ডার্ক অবসিডিয়ান ও ব্রাশড গোল্ডে প্রিমিয়াম প্রোডাক্ট ফোকাস',
      bgTop: '#0B101B',
      bgBot: '#060911',
      isDark: true,
      accent: '#C9A46A',
      swatches: ['#0B0E14', '#C9A46A', '#1E293B'],
      desk: stores.watchDesktop,
      mob: stores.watchMobile,
      url: 'watch-demo  ·  TIMEORA',
      t0: 12.6,
      t1: 17.8,
    },
    {
      idx: '03',
      nameBn: 'জুতা ও ফুটওয়্যার ই-কমার্স',
      nameEn: 'FOOTWEAR E-COMMERCE',
      desc: 'সাইজ চিপ, ক্যাটাগরি ফিল্টার ও স্পষ্ট প্রোডাক্ট গ্রিড',
      bgTop: '#F4F6F9',
      bgBot: '#E5E9F0',
      isDark: false,
      accent: '#4A2C1D',
      swatches: ['#F3F5F8', '#4A2C1D', '#111827'],
      desk: stores.shoeDesktop,
      mob: stores.shoeMobile,
      url: 'footwear-demo  ·  STRIDE',
      t0: 17.8,
      t1: 23.8,
    },
    {
      idx: '04',
      nameBn: 'কসমেটিকস ও বিউটি ব্র্যান্ড',
      nameEn: 'CLEAN BEAUTY & SKINCARE',
      desc: 'কোমল রঙ, রুটিন ক্যাটাগরি ও পরিচ্ছন্ন বিউটি উপস্থাপনা',
      bgTop: '#FDF6F7',
      bgBot: '#F4E5E9',
      isDark: false,
      accent: '#8E4A64',
      swatches: ['#FDF6F6', '#8E4A64', '#F5E6E8'],
      desk: stores.cosmeticsDesktop,
      mob: stores.cosmeticsMobile,
      url: 'beauty-demo  ·  LUMÉRA',
      t0: 23.8,
      t1: 28.4,
    },
    {
      idx: '05',
      nameBn: 'ফার্নিচার ও ইন্টেরিয়র স্টোর',
      nameEn: 'FURNITURE & INTERIOR',
      desc: 'বড় ইন্টেরিয়র ছবি, মাপ ও উপকরণের বিস্তারিত উপস্থাপনা',
      bgTop: '#F6F2EB',
      bgBot: '#EAE3D6',
      isDark: false,
      accent: '#5C3D28',
      swatches: ['#F5F1EA', '#5C3D28', '#232621'],
      desk: stores.furnitureDesktop,
      mob: stores.furnitureMobile,
      url: 'furniture-demo  ·  WOODORA',
      t0: 28.4,
      t1: 33.4,
    },
    {
      idx: '06',
      nameBn: 'রেস্টুরেন্ট ও ডাইনিং ওয়েবসাইট',
      nameEn: 'RESTAURANT & FOOD MENU',
      desc: 'খাবারের মেনু, আকর্ষণীয় ছবি, সময়সূচি ও ঠিকানার স্পষ্ট তথ্য',
      bgTop: '#16110E',
      bgBot: '#0C0907',
      isDark: true,
      accent: '#E08A2E',
      swatches: ['#14100E', '#E08A2E', '#FFF9F2'],
      desk: stores.restaurantDesktop,
      mob: stores.restaurantMobile,
      url: 'restaurant-demo  ·  NOORÉ',
      t0: 33.4,
      t1: 40.5,
    },
  ];

  if (lt < 6.5) {
    // Intro Card (0 - 6.5s)
    drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.35 });
    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

    drawKickerPill(ctx, 'স্বতন্ত্র ইন্ডাস্ট্রি ডিজাইন', 540, 190, {
      theme: 'dark',
      align: 'center',
      reveal: prog(lt, 0.2, 0.8),
    });

    drawTextBlock(
      ctx,
      'ফ্যাশন থেকে রেস্টুরেন্ট—\nআপনার ব্যবসার ধরন\nঅনুযায়ী ডিজাইন।',
      540,
      268,
      {
        weight: 800,
        size: 60,
        lineHeight: 1.28,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: prog(lt, 0.4, 1.1),
      }
    );

    drawTextBlock(
      ctx,
      'একই ডিজাইন সবার জন্য নয় — প্রতিটি ব্যবসার নিজস্ব রঙ, লেআউট ও উপস্থাপনা।',
      540,
      540,
      {
        weight: 500,
        size: 28,
        lineHeight: 1.42,
        maxWidth: 860,
        color: PALETTE.slateMuted,
        align: 'center',
        reveal: prog(lt, 0.9, 1.0),
      }
    );

    // 6 Industry Preview Index Cards
    INDUSTRIES.forEach((ind, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const p = easeOutQuart(prog(lt, 1.1 + i * 0.25, 0.8));
      const x = 76 + col * 476;
      const y = 690 + row * 320 + (1 - p) * 24;
      ctx.save();
      ctx.globalAlpha = p;
      fillRoundRect(ctx, x, y, 452, 292, 24, '#102544');
      strokeRoundRect(ctx, x, y, 452, 292, 24, 'rgba(141,235,255,0.22)', 1.3);

      // Mini preview crop of each distinct desktop store
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 16, y + 16, 420, 192, 14);
      ctx.clip();
      ctx.drawImage(ind.desk, x + 16, y + 16, 420, 275);
      ctx.restore();

      ctx.fillStyle = PALETTE.softCyan;
      ctx.font = fontSpec(700, 16);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ind.idx, x + 24, y + 248);

      ctx.fillStyle = PALETTE.white;
      ctx.font = fontSpec(700, 22);
      ctx.fillText(ind.nameBn, x + 68, y + 248);
      ctx.restore();
    });
  } else if (lt < 40.5) {
    // Individual Industry Showcases (6.5 - 40.5s)
    const active = INDUSTRIES.find((it) => lt >= it.t0 && lt < it.t1) || INDUSTRIES[INDUSTRIES.length - 1];
    const segDur = active.t1 - active.t0;
    const u = clamp((lt - active.t0) / segDur, 0, 1);
    const enter = easeOutQuint(prog(lt, active.t0, 0.75));

    // Industry-tailored atmospheric background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, active.bgTop);
    bg.addColorStop(1, active.bgBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const theme = active.isDark ? 'dark' : 'light';
    drawEditorialChrome(ctx, scene, t, { theme });

    // Industry Number + Palette Swatches Row
    ctx.save();
    ctx.globalAlpha = enter;
    drawKickerPill(ctx, `${active.idx} / 06  ·  ${active.nameEn}`, 76, 162, {
      theme,
      accent: active.accent,
      reveal: enter,
    });

    // Color palette swatches on top-right
    active.swatches.forEach((hex, sIdx) => {
      const sx = W - 76 - (2 - sIdx) * 44 - 18;
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.arc(sx, 183, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = active.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(8,20,38,0.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    drawTextBlock(ctx, active.nameBn, 76, 226, {
      weight: 800,
      size: 52,
      lineHeight: 1.25,
      maxWidth: 928,
      color: active.isDark ? '#FFFFFF' : PALETTE.deepNavy,
      reveal: enter,
    });

    drawTextBlock(ctx, active.desc, 76, 304, {
      weight: 500,
      size: 26,
      lineHeight: 1.38,
      maxWidth: 928,
      color: active.isDark ? '#CBD5E1' : '#475569',
      reveal: enter,
    });

    // Coordinated Desktop + Mobile Showcase for this specific industry
    const drift = lerp(-0.08, 0.06, easeInOutCubic(u));
    drawDesktopMockup3D(ctx, active.desk, 510, 770 + (1 - enter) * 32, {
      width: 900,
      height: 590,
      scale: 0.94,
      yaw: drift,
      scrollY: 0,
      urlText: active.url,
      stand: false,
      shadowAlpha: active.isDark ? 0.48 : 0.22,
    });

    drawPhoneMockup3D(ctx, active.mob, 770, 1345 + (1 - enter) * 48, {
      width: 410,
      height: 820,
      scale: 0.80,
      yaw: -0.14 + drift * 0.5,
      scrollY: 0,
      shadowAlpha: active.isDark ? 0.50 : 0.25,
    });

    // Bottom left industry highlight card
    fillRoundRect(
      ctx,
      76,
      1210,
      430,
      360,
      24,
      active.isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
    );
    strokeRoundRect(
      ctx,
      76,
      1210,
      430,
      360,
      24,
      active.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(8,20,38,0.09)',
      1.3
    );

    ctx.fillStyle = active.accent;
    ctx.fillRect(108, 1250, 48, 6);

    ctx.textAlign = 'left';
    ctx.fillStyle = active.isDark ? '#FFFFFF' : PALETTE.deepNavy;
    ctx.font = fontSpec(800, 28);
    ctx.fillText('ব্যবসা-উপযোগী কাঠামো', 108, 1306);

    const pts = ['নিজস্ব কালার প্যালেট', 'মানানসই ফন্ট ও লেআউট', 'প্রাসঙ্গিক ক্যাটাগরি ও তথ্য'];
    pts.forEach((pt, pi) => {
      const py = 1372 + pi * 56;
      drawCheckCircle(ctx, 122, py, 12, active.accent, '#FFFFFF');
      ctx.fillStyle = active.isDark ? '#E2E8F0' : '#334155';
      ctx.font = fontSpec(600, 21);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pt, 148, py);
    });
    ctx.restore();
  } else {
    // Finale Bento Grid (40.5 - 50.0s): All 6 Distinct Storefronts + Core Scene 04 Message
    drawDarkStage(ctx, t, { accentX: 0.5, accentY: 0.25 });
    drawEditorialChrome(ctx, scene, t, { theme: 'dark' });

    const rev = prog(lt, 40.5, 1.0);
    drawKickerPill(ctx, '৪১+ লাইভ ডেমো ও কাস্টম ডিজাইন সক্ষমতা', 540, 162, {
      theme: 'dark',
      align: 'center',
      reveal: rev,
    });

    // Primary Scene 04 Bengali Message
    drawTextBlock(
      ctx,
      'ফ্যাশন থেকে রেস্টুরেন্ট—\nআপনার ব্যবসার ধরন অনুযায়ী ডিজাইন।',
      540,
      228,
      {
        weight: 800,
        size: 50,
        lineHeight: 1.30,
        maxWidth: 928,
        color: PALETTE.white,
        align: 'center',
        reveal: rev,
      }
    );

    INDUSTRIES.forEach((ind, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const p = easeOutQuart(prog(lt, 40.8 + i * 0.14, 0.8));
      const x = 76 + col * 476;
      const y = 418 + row * 442 + (1 - p) * 26;
      ctx.save();
      ctx.globalAlpha = p;
      fillRoundRect(ctx, x, y, 452, 418, 22, '#102544');
      strokeRoundRect(ctx, x, y, 452, 418, 22, 'rgba(141,235,255,0.24)', 1.3);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 14, y + 14, 424, 314, 14);
      ctx.clip();
      ctx.drawImage(ind.desk, x + 14, y + 14, 424, 314);
      ctx.restore();

      ctx.fillStyle = ind.accent;
      ctx.beginPath();
      ctx.arc(x + 34, y + 372, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.white;
      ctx.font = fontSpec(700, 21);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ind.nameBn, x + 56, y + 372);
      ctx.restore();
    });
  }
}

/**
 * SCENE 05 — E-commerce Experience (02:50 – 03:40)
 * Step-by-step realistic customer journey (1: Open -> 2: Browse -> 3: Detail -> 4: Variant -> 5: Order)
 */
export function renderScene05(ctx, t, scene, assets, stores) {
  const lt = t - scene.start; // 0..50
  drawLightStage(ctx, t, { warm: true });
  drawEditorialChrome(ctx, scene, t, { theme: 'light' });

  // Determine active step (0..4) synced to voiceover timestamps:
  // 0: 0..9.2s | 1: 9.2..15.5s | 2: 15.5..21.2s | 3: 21.2..27.3s | 4: 27.3..50.0s
  let stepIdx = 0;
  if (lt >= 27.3) stepIdx = 4;
  else if (lt >= 21.2) stepIdx = 3;
  else if (lt >= 15.5) stepIdx = 2;
  else if (lt >= 9.2) stepIdx = 1;

  const STEPS = [
    { num: '০১', short: 'ওয়েবসাইট খোলা', title: 'সহজেই ওয়েবসাইটে প্রবেশ', sub: 'দ্রুত লোডিং ও পরিচ্ছন্ন হোমপেজে প্রথম দর্শন' },
    { num: '০২', short: 'পণ্য ব্রাউজ', title: 'ক্যাটাগরি ও পণ্য ব্রাউজ', sub: 'পছন্দের ক্যাটাগরি থেকে সহজে পণ্য খুঁজে নেওয়া' },
    { num: '০৩', short: 'বিস্তারিত দেখা', title: 'ছবি, মূল্য ও বিবরণ যাচাই', sub: 'বড় ছবি ও পণ্যের স্পষ্ট তথ্য এক পর্দায়' },
    { num: '০৪', short: 'সাইজ ও কালার', title: 'সাইজ বা কালার নির্বাচন', sub: 'প্রযোজ্য ক্ষেত্রে পছন্দের ভ্যারিয়েন্ট বেছে নেওয়া' },
    { num: '০৫', short: 'অর্ডার প্রক্রিয়া', title: 'সহজ চেকআউট ও অর্ডার', sub: 'কাজের পরিধি অনুযায়ী COD বা উপযুক্ত পেমেন্ট সুবিধা' },
  ];

  const cur = STEPS[stepIdx];

  // 5-Step Progress Rail at Top (y = 158)
  STEPS.forEach((st, idx) => {
    const sx = 76 + idx * 189;
    const active = idx === stepIdx;
    const passed = idx < stepIdx;
    fillRoundRect(
      ctx,
      sx,
      156,
      175,
      54,
      27,
      active ? PALETTE.deepNavy : passed ? '#DCE8FF' : '#FFFFFF'
    );
    strokeRoundRect(
      ctx,
      sx,
      156,
      175,
      54,
      27,
      active ? PALETTE.deepNavy : 'rgba(8,20,38,0.12)',
      1.2
    );
    ctx.fillStyle = active ? PALETTE.softCyan : passed ? PALETTE.electricBlue : '#64748B';
    ctx.font = fontSpec(700, 16);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${st.num} ${st.short}`, sx + 87.5, 183);
  });

  // Active Step Headline & Subcopy
  drawTextBlock(ctx, cur.title, 540, 240, {
    weight: 800,
    size: 50,
    lineHeight: 1.26,
    maxWidth: 928,
    color: PALETTE.deepNavy,
    align: 'center',
    reveal: 1.0,
  });

  drawTextBlock(ctx, cur.sub, 540, 312, {
    weight: 500,
    size: 26,
    lineHeight: 1.38,
    maxWidth: 880,
    color: PALETTE.inkMuted,
    align: 'center',
    reveal: 1.0,
  });

  // Interactive Phone Screen Choreography (centered cleanly y = 395..1645)
  const phoneCx = 540;
  const phoneCy = 1045;
  const phoneScale = 1.24; // 450*1.24 = 558px wide, 920*1.24 = 1140px tall -> crisp & readable!

  let screenSurface = stores.fashionMobile;
  let scrollY = 0;
  let yaw = 0;
  let cursor = null;

  if (stepIdx === 0) {
    const enter = easeOutQuint(prog(lt, 0.2, 1.4));
    yaw = lerp(0.16, 0.02, enter);
    scrollY = lerp(0, 60, easeInOutCubic(prog(lt, 1.5, 7.0)));
  } else if (stepIdx === 1) {
    yaw = -0.03;
    scrollY = lerp(60, 510, easeInOutCubic(prog(lt, 9.4, 4.8)));
    // Cursor moves onto first product card & taps at lt=15.1s
    const cp = easeInOutCubic(prog(lt, 13.4, 1.6));
    const cx = lerp(690, 415, cp);
    const cy = lerp(1320, 960, cp);
    const clickP = prog(lt, 14.9, 0.55);
    cursor = { x: cx, y: cy, clickP };
  } else if (stepIdx === 2) {
    yaw = 0.02;
    screenSurface = renderEcommerceStepScreen(assets.photos, {
      mode: 'detail',
      selectedSize: 1,
      selectedColor: 0,
    });
  } else if (stepIdx === 3) {
    yaw = -0.02;
    // At lt=22.1s select color 1 (Sage Green), at lt=24.2s select size 2 ('L')
    const selColor = lt >= 22.2 ? 1 : 0;
    const selSize = lt >= 24.3 ? 2 : 1;
    screenSurface = renderEcommerceStepScreen(assets.photos, {
      mode: 'variants',
      selectedSize: selSize,
      selectedColor: selColor,
    });
    if (lt < 23.4) {
      const p1 = easeInOutCubic(prog(lt, 21.3, 0.8));
      cursor = { x: lerp(620, 488, p1), y: lerp(1220, 1295, p1), clickP: prog(lt, 22.1, 0.55) };
    } else {
      const p2 = easeInOutCubic(prog(lt, 23.4, 0.8));
      cursor = { x: lerp(488, 535, p2), y: lerp(1295, 1405, p2), clickP: prog(lt, 24.2, 0.55) };
    }
  } else {
    yaw = 0;
    const chkProg = prog(lt, 27.3, 21.0);
    screenSurface = renderEcommerceStepScreen(assets.photos, {
      mode: 'checkout',
      selectedSize: 2,
      selectedColor: 1,
      checkoutProgress: chkProg,
    });
    if (lt >= 39.2 && lt <= 42.0) {
      const p3 = easeInOutCubic(prog(lt, 39.2, 1.0));
      cursor = { x: lerp(660, 540, p3), y: lerp(1360, 1500, p3), clickP: prog(lt, 40.3, 0.65) };
    }
  }

  drawPhoneMockup3D(ctx, screenSurface, phoneCx, phoneCy, {
    width: 450,
    height: 920,
    scale: phoneScale,
    yaw,
    scrollY,
    shadowAlpha: 0.24,
  });

  if (cursor) {
    drawTouchRipple(ctx, cursor.x, cursor.y, cursor.clickP, { color: PALETTE.electricBlue });
  }

  // Honest scope disclaimer pill at bottom of Scene 05
  fillRoundRect(ctx, 76, 1706, 928, 86, 20, '#FFFFFF');
  strokeRoundRect(ctx, 76, 1706, 928, 86, 20, 'rgba(8,20,38,0.10)', 1.2);
  ctx.fillStyle = PALETTE.deepNavy;
  ctx.font = fontSpec(600, 21);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'পণ্য দেখা থেকে অর্ডার — কাজের পরিধি অনুযায়ী প্রয়োজনীয় ই-কমার্স ও পেমেন্ট সুবিধা',
    540,
    1749
  );
}
