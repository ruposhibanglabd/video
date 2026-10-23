/**
 * Master 11-Scene / 46-Beat Timeline & Verified Brand Data
 * CodePixel Web — 2026 Brand Film (08:12.000 | 492.0s | 30 FPS | 1080x1920)
 */

export const FILM = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 492.0,
  totalFrames: 14760,
};

export const PALETTE = {
  deepNavy: '#081426',
  midnightBlue: '#102544',
  electricBlue: '#397BFF',
  softCyan: '#8DEBFF',
  white: '#FFFFFF',
  lightNeutral: '#F4F6FA',
  slateMuted: '#8FA3BF',
  inkMuted: '#4A5B73',
  emeraldTrust: '#12B981',
  whatsappGreen: '#25D366',
};

export const BRAND_FACTS = {
  name: 'CodePixel Web',
  domain: 'codepixelweb.vercel.app',
  url: 'https://codepixelweb.vercel.app/',
  whatsapp: '01876892958',
  whatsappBn: '০১৮৭৬-৮৯২৯৫৮',
  whatsappDisplay: '+880 1876-892958',
  priceHeadline: 'মাত্র ৩০০০ টাকা',
  advanceHeadline: 'এডভান্স নেই',
  deliveryHeadline: 'ডেলিভারি ২–৩ দিনে',
  deliveryCondition: 'সাধারণত ২–৩ দিনে ডেলিভারি — কাজের পরিধি ও প্রয়োজনীয় উপকরণ সাপেক্ষে',
  hostingHeadline: 'মাসিক হোস্টিং ফি নেই',
  hostingCondition: 'ব্যবহৃত হোস্টিং ব্যবস্থার শর্ত অনুযায়ী • ডোমেইন ও প্রযোজ্য থার্ড-পার্টি চার্জ আলাদা',
};

export const SCENES = [
  {
    id: 1,
    code: '01',
    titleEn: 'CINEMATIC OPENING',
    titleBn: 'পরিচয় ও প্রথম আস্থা',
    start: 0.0,
    end: 30.0,
    theme: 'dark',
    transitionIn: 'open',
    primaryMessage: 'আপনার ব্যবসা। আপনার পরিচয়। আপনার ওয়েবসাইট।',
  },
  {
    id: 2,
    code: '02',
    titleEn: 'THE BUSINESS REALITY',
    titleBn: 'উদ্যোক্তার বাস্তবতা',
    start: 30.0,
    end: 75.0,
    theme: 'dark',
    transitionIn: 'shutter',
    primaryMessage: 'আপনার ব্যবসার পণ্য ও তথ্য একটি নিজস্ব ওয়েবসাইটে সুন্দরভাবে উপস্থাপন করতে চান?',
  },
  {
    id: 3,
    code: '03',
    titleEn: 'THE CODEPIXEL SOLUTION',
    titleBn: 'কাস্টম ওয়েব সলিউশন',
    start: 75.0,
    end: 120.0,
    theme: 'light',
    transitionIn: 'curtainLight',
    primaryMessage: 'আপনার প্রয়োজন অনুযায়ী ওয়েবসাইট তৈরি করুন।',
  },
  {
    id: 4,
    code: '04',
    titleEn: 'TAILORED FOR EVERY INDUSTRY',
    titleBn: 'ব্যবসার ধরন অনুযায়ী ডিজাইন',
    start: 120.0,
    end: 170.0,
    theme: 'mixed',
    transitionIn: 'depthDissolve',
    primaryMessage: 'ফ্যাশন থেকে রেস্টুরেন্ট—আপনার ব্যবসার ধরন অনুযায়ী ডিজাইন।',
  },
  {
    id: 5,
    code: '05',
    titleEn: 'E-COMMERCE EXPERIENCE',
    titleBn: 'কাস্টমারের কেনাকাটার অভিজ্ঞতা',
    start: 170.0,
    end: 220.0,
    theme: 'light',
    transitionIn: 'curtainLight',
    primaryMessage: 'পণ্য দেখা থেকে অর্ডার—সহজ ও স্বচ্ছন্দ কাস্টমার অভিজ্ঞতা।',
  },
  {
    id: 6,
    code: '06',
    titleEn: 'ADMIN PANEL & MANAGEMENT',
    titleBn: 'সহজ অ্যাডমিন ড্যাশবোর্ড',
    start: 220.0,
    end: 275.0,
    theme: 'dark',
    transitionIn: 'curtainDark',
    primaryMessage: 'ব্যবসা পরিচালনার প্রয়োজনীয় কাজগুলো সহজভাবে পরিচালনার জন্য উপযুক্ত সিস্টেম।',
  },
  {
    id: 7,
    code: '07',
    titleEn: 'ORDER & COURIER WORKFLOW',
    titleBn: 'অর্ডার ও ডেলিভারি ওয়ার্কফ্লো',
    start: 275.0,
    end: 315.0,
    theme: 'dark',
    transitionIn: 'shutter',
    primaryMessage: 'অর্ডার থেকে ডেলিভারি স্ট্যাটাস—গোছানো অর্ডার ওয়ার্কফ্লো।',
  },
  {
    id: 8,
    code: '08',
    titleEn: 'MOBILE-FIRST & RESPONSIVE',
    titleBn: 'সব ডিভাইসে নিখুঁত উপস্থাপনা',
    start: 315.0,
    end: 355.0,
    theme: 'light',
    transitionIn: 'curtainLight',
    primaryMessage: 'মোবাইল ও ডেস্কটপে সুন্দর অভিজ্ঞতা।',
  },
  {
    id: 9,
    code: '09',
    titleEn: 'TRANSPARENT PRICING & TRUST',
    titleBn: 'স্বচ্ছ মূল্য ও আস্থা',
    start: 355.0,
    end: 405.0,
    theme: 'dark',
    transitionIn: 'curtainDark',
    primaryMessage: 'মাত্র ৩০০০ টাকা • এডভান্স নেই',
  },
  {
    id: 10,
    code: '10',
    titleEn: 'HOW TO GET STARTED',
    titleBn: 'শুরু করার সহজ ৩টি ধাপ',
    start: 405.0,
    end: 445.0,
    theme: 'light',
    transitionIn: 'curtainLight',
    primaryMessage: 'আপনার ব্যবসার প্রয়োজন আমাদের জানান।',
  },
  {
    id: 11,
    code: '11',
    titleEn: 'CODEPIXEL WEB',
    titleBn: 'আপনার অনলাইন পরিচয়',
    start: 445.0,
    end: 492.0,
    theme: 'dark',
    transitionIn: 'depthDissolve',
    primaryMessage: 'আপনার ব্যবসার জন্য ওয়েবসাইট তৈরি করতে চান? এখনই WhatsApp-এ মেসেজ দিন।',
  },
];

/**
 * Exact frame-synced voiceover placement slices.
 * Each item extracts [srcStart, srcEnd] from `file` and places it at `at` seconds on the master timeline.
 */
export const VOICEOVER_CLIPS = [
  // Scene 01 (0 - 30s)
  { scene: 1, file: 'vo_s01.mp3', srcStart: 0.000, srcEnd: 6.250, at: 0.60 },
  { scene: 1, file: 'vo_s01.mp3', srcStart: 6.250, srcEnd: 16.280, at: 7.10 },
  { scene: 1, file: 'vo_s01.mp3', srcStart: 16.280, srcEnd: 20.980, at: 17.45 },
  { scene: 1, file: 'vo_s01.mp3', srcStart: 20.980, srcEnd: 27.936, at: 22.40 },

  // Scene 02 (30 - 75s)
  { scene: 2, file: 'vo_s02.mp3', srcStart: 0.000, srcEnd: 7.120, at: 31.10 },
  { scene: 2, file: 'vo_s02.mp3', srcStart: 7.120, srcEnd: 17.720, at: 39.40 },
  { scene: 2, file: 'vo_s02.mp3', srcStart: 17.720, srcEnd: 24.230, at: 51.40 },
  { scene: 2, file: 'vo_s02.mp3', srcStart: 24.230, srcEnd: 35.448, at: 59.50 },

  // Scene 03 (75 - 120s)
  { scene: 3, file: 'vo_s03.mp3', srcStart: 0.000, srcEnd: 5.470, at: 76.00 },
  { scene: 3, file: 'vo_s03.mp3', srcStart: 5.470, srcEnd: 15.820, at: 82.30 },
  { scene: 3, file: 'vo_s03.mp3', srcStart: 15.820, srcEnd: 24.710, at: 93.50 },
  { scene: 3, file: 'vo_s03.mp3', srcStart: 24.710, srcEnd: 39.408, at: 103.30 },

  // Scene 04 (120 - 170s)
  { scene: 4, file: 'vo_s04.mp3', srcStart: 0.000, srcEnd: 5.030, at: 120.90 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 5.030, srcEnd: 9.990, at: 126.80 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 9.990, srcEnd: 14.150, at: 132.80 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 14.150, srcEnd: 19.180, at: 138.00 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 19.180, srcEnd: 27.500, at: 144.10 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 27.500, srcEnd: 33.510, at: 153.50 },
  { scene: 4, file: 'vo_s04.mp3', srcStart: 33.510, srcEnd: 37.776, at: 160.80 },

  // Scene 05 (170 - 220s)
  { scene: 5, file: 'vo_s05.mp3', srcStart: 0.000, srcEnd: 7.090, at: 171.00 },
  { scene: 5, file: 'vo_s05.mp3', srcStart: 7.090, srcEnd: 12.030, at: 179.40 },
  { scene: 5, file: 'vo_s05.mp3', srcStart: 12.030, srcEnd: 16.290, at: 185.70 },
  { scene: 5, file: 'vo_s05.mp3', srcStart: 16.290, srcEnd: 18.290, at: 191.50 },
  { scene: 5, file: 'vo_s05.mp3', srcStart: 18.290, srcEnd: 30.570, at: 197.40 },
  { scene: 5, file: 'vo_s05.mp3', srcStart: 30.570, srcEnd: 36.528, at: 210.60 },

  // Scene 06 (220 - 275s)
  { scene: 6, file: 'vo_s06.mp3', srcStart: 0.000, srcEnd: 10.040, at: 221.20 },
  { scene: 6, file: 'vo_s06.mp3', srcStart: 10.040, srcEnd: 22.360, at: 232.80 },
  { scene: 6, file: 'vo_s06.mp3', srcStart: 22.360, srcEnd: 32.570, at: 246.80 },
  { scene: 6, file: 'vo_s06.mp3', srcStart: 32.570, srcEnd: 41.808, at: 258.80 },

  // Scene 07 (275 - 315s)
  { scene: 7, file: 'vo_s07.mp3', srcStart: 0.000, srcEnd: 5.220, at: 276.20 },
  { scene: 7, file: 'vo_s07.mp3', srcStart: 5.220, srcEnd: 9.630, at: 282.80 },
  { scene: 7, file: 'vo_s07.mp3', srcStart: 9.630, srcEnd: 21.360, at: 288.80 },
  { scene: 7, file: 'vo_s07.mp3', srcStart: 21.360, srcEnd: 28.008, at: 302.00 },

  // Scene 08 (315 - 355s)
  { scene: 8, file: 'vo_s08.mp3', srcStart: 0.000, srcEnd: 9.150, at: 316.20 },
  { scene: 8, file: 'vo_s08.mp3', srcStart: 9.150, srcEnd: 23.990, at: 326.80 },
  { scene: 8, file: 'vo_s08.mp3', srcStart: 23.990, srcEnd: 31.656, at: 343.00 },

  // Scene 09 (355 - 405s)
  { scene: 9, file: 'vo_s09.mp3', srcStart: 0.000, srcEnd: 3.680, at: 356.00 },
  { scene: 9, file: 'vo_s09.mp3', srcStart: 3.680, srcEnd: 15.920, at: 360.80 },
  { scene: 9, file: 'vo_s09.mp3', srcStart: 15.920, srcEnd: 23.500, at: 374.40 },
  { scene: 9, file: 'vo_s09.mp3', srcStart: 23.500, srcEnd: 29.600, at: 383.40 },
  { scene: 9, file: 'vo_s09.mp3', srcStart: 29.600, srcEnd: 38.904, at: 390.80 },

  // Scene 10 (405 - 445s)
  { scene: 10, file: 'vo_s10_11.mp3', srcStart: 0.000, srcEnd: 3.680, at: 406.20 },
  { scene: 10, file: 'vo_s10_11.mp3', srcStart: 3.680, srcEnd: 10.510, at: 411.20 },
  { scene: 10, file: 'vo_s10_11.mp3', srcStart: 10.510, srcEnd: 17.220, at: 419.40 },
  { scene: 10, file: 'vo_s10_11.mp3', srcStart: 17.220, srcEnd: 28.410, at: 427.50 },

  // Scene 11 (445 - 492s)
  { scene: 11, file: 'vo_s10_11.mp3', srcStart: 28.410, srcEnd: 42.740, at: 446.20 },
  { scene: 11, file: 'vo_s10_11.mp3', srcStart: 42.740, srcEnd: 56.240, at: 462.00 },
  { scene: 11, file: 'vo_s10_11.mp3', srcStart: 56.240, srcEnd: 60.936, at: 476.60 },
];

/**
 * Purposeful, restrained sound-design cues synced to key motion & UI moments.
 * Types: 'transition' | 'impact' | 'uiClick' | 'uiConfirm' | 'shimmer'
 */
export const SFX_CUES = [
  // Scene 01
  { at: 0.15, type: 'shimmer', gain: 0.45 },
  { at: 12.20, type: 'transition', gain: 0.40 },
  { at: 17.35, type: 'impact', gain: 0.65 },
  { at: 23.00, type: 'shimmer', gain: 0.40 },

  // Major scene transitions
  { at: 29.85, type: 'transition', gain: 0.55 },
  { at: 59.30, type: 'shimmer', gain: 0.42 },
  { at: 74.85, type: 'transition', gain: 0.58 },
  { at: 103.10, type: 'transition', gain: 0.42 },
  { at: 119.85, type: 'transition', gain: 0.55 },

  // Scene 04 industry switches (subtle soft air ticks, not loud)
  { at: 126.70, type: 'uiClick', gain: 0.32 },
  { at: 132.70, type: 'uiClick', gain: 0.32 },
  { at: 137.90, type: 'uiClick', gain: 0.32 },
  { at: 144.00, type: 'uiClick', gain: 0.32 },
  { at: 148.30, type: 'uiClick', gain: 0.32 },
  { at: 153.40, type: 'uiClick', gain: 0.32 },
  { at: 160.65, type: 'shimmer', gain: 0.42 },

  // Scene 05 e-commerce interactions
  { at: 169.85, type: 'transition', gain: 0.55 },
  { at: 185.60, type: 'uiClick', gain: 0.45 },
  { at: 192.10, type: 'uiClick', gain: 0.42 },
  { at: 194.20, type: 'uiClick', gain: 0.42 },
  { at: 197.30, type: 'uiClick', gain: 0.45 },
  { at: 210.40, type: 'uiConfirm', gain: 0.52 },

  // Scene 06 Admin interactions
  { at: 219.85, type: 'transition', gain: 0.55 },
  { at: 232.70, type: 'uiClick', gain: 0.38 },
  { at: 246.70, type: 'uiClick', gain: 0.38 },
  { at: 252.50, type: 'uiConfirm', gain: 0.42 },

  // Scene 07 Courier workflow nodes
  { at: 274.85, type: 'transition', gain: 0.55 },
  { at: 282.70, type: 'uiClick', gain: 0.36 },
  { at: 288.70, type: 'uiClick', gain: 0.36 },
  { at: 295.00, type: 'uiClick', gain: 0.36 },
  { at: 301.90, type: 'uiConfirm', gain: 0.45 },

  // Scene 08 Responsive morphs
  { at: 314.85, type: 'transition', gain: 0.55 },
  { at: 331.00, type: 'transition', gain: 0.35 },
  { at: 336.50, type: 'transition', gain: 0.35 },

  // Scene 09 Commercial Pricing & Trust highlights
  { at: 354.85, type: 'transition', gain: 0.60 },
  { at: 360.65, type: 'impact', gain: 0.78 },
  { at: 374.25, type: 'impact', gain: 0.65 },
  { at: 383.25, type: 'uiConfirm', gain: 0.45 },
  { at: 390.65, type: 'uiConfirm', gain: 0.45 },

  // Scene 10 Steps
  { at: 404.85, type: 'transition', gain: 0.55 },
  { at: 411.10, type: 'uiClick', gain: 0.36 },
  { at: 419.30, type: 'uiClick', gain: 0.36 },
  { at: 427.40, type: 'uiConfirm', gain: 0.44 },

  // Scene 11 Finale & CTA
  { at: 444.85, type: 'transition', gain: 0.60 },
  { at: 461.85, type: 'impact', gain: 0.70 },
  { at: 467.50, type: 'uiConfirm', gain: 0.48 },
  { at: 481.50, type: 'shimmer', gain: 0.55 },
];
