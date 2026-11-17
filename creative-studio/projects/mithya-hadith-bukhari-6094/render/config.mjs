/**
 * Project config — «তোমার নামের পাশে কী লেখা হচ্ছে?» (Bukhari 6094)
 * All texts, scene metadata and palette. Timing is computed at runtime
 * from the actual voiceover durations (see render.mjs).
 */

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const PAL = {
  gold: '#E9C87E',
  goldBright: '#F6DC9E',
  goldDeep: '#B08A3E',
  ivory: '#F5EFE2',
  ivoryDim: 'rgba(245,239,226,0.72)',
  emeraldDeep: '#071510',
  emeraldPanel: 'rgba(6,20,15,0.55)',
  ember: '#E08A4A',
  emberDeep: '#A34A28',
  captionBg: 'rgba(4,12,9,0.45)',
};

/** Scene list in order. `vo` file lives in ../assets/. Gaps in seconds. */
export const SCENES = [
  { id: 's1', vo: 'vo-s1.mp3', bg: 'bg-s1.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's2', vo: 'vo-s2.mp3', bg: 'bg-s2.jpg', gapAfter: 0.6, leadIn: 0.15 },
  { id: 's3', vo: 'vo-s3.mp3', bg: 'bg-s3.jpg', gapAfter: 0.9, leadIn: 0.15 },
  { id: 's4', vo: 'vo-s4-arabic.mp3', bg: 'bg-s4.jpg', gapAfter: 0.7, leadIn: 0.25, arabic: true },
  { id: 's5', vo: 'vo-s5.mp3', bg: 'bg-s5.jpg', gapAfter: 0.6, leadIn: 0.15 },
  { id: 's6', vo: 'vo-s6.mp3', bg: 'bg-s6.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's7', vo: 'vo-s7.mp3', bg: 'bg-s7.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's8', vo: 'vo-s8.mp3', bg: 'bg-s8.jpg', gapAfter: 0.0, leadIn: 0.15 },
];

export const TAIL = 2.4; // signature hold after last VO

/** Phrases per scene (Bengali narration). `hi` = keywords rendered in gold. */
export const PHRASES = {
  s1: [
    { t: 'তুমি যতবার কথা বলো —', hi: [] },
    { t: 'আল্লাহর কাছে তোমার একটি পরিচয় লেখা হতে থাকে।', hi: ['পরিচয়'] },
  ],
  s2: [
    { t: 'প্রশ্ন হলো…', hi: [] },
    { t: 'সেখানে কী লেখা হচ্ছে?', hi: ['কী'] },
  ],
  s3: [
    { t: 'রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম', hi: [] },
    { t: 'এমন একটি সত্য শুনিয়েছেন — যা প্রতিটি কথার ওজন বদলে দেয়।', hi: ['ওজন'] },
  ],
  s5: [
    { t: 'নিশ্চয়ই সত্য নিয়ে যায় নেকীর দিকে…', hi: ['সত্য'] },
    { t: 'আর নেকী পৌঁছে দেয় জান্নাতে।', hi: ['জান্নাতে'] },
    { t: 'মানুষ সত্য বলতে বলতে এমন হয়ে যায় —', hi: [] },
    { t: 'আল্লাহর কাছে সে লিপিবদ্ধ: সিদ্দীক। মহাসত্যবাদী।', hi: ['সিদ্দীক'] },
  ],
  s6: [
    { t: 'আর মিথ্যা?', hi: ['মিথ্যা'] },
    { t: 'মিথ্যা নিয়ে যায় পাপের দিকে…', hi: ['পাপের'] },
    { t: 'আর পাপ পৌঁছে দেয় জাহান্নামে।', hi: ['জাহান্নামে'] },
  ],
  s7: [
    { t: 'মানুষ মিথ্যা বলতে বলতে এমন হয়ে যায় —', hi: [] },
    { t: 'আল্লাহর কাছে সে লিপিবদ্ধ: কায্যাব। মহামিথ্যুক।', hi: ['কায্যাব'] },
    { t: 'ভাবো তো — আজ তোমার খাতায় কোন নামটা বড় হচ্ছে?', hi: ['কোন নামটা'] },
  ],
  s8: [
    { t: 'আমাদের চোখে ছোট্ট একটি মিথ্যা…', hi: [] },
    { t: 'কিন্তু খাতায় পড়ছে একটি করে আখড়।', hi: ['আখড়'] },
    { t: 'আজ থেকেই শুরু করো — একটি সত্য, আরেকটি সত্য…', hi: ['সত্য'] },
    { t: 'যতক্ষণ না আল্লাহ লিখে দিচ্ছেন: সিদ্দীক।', hi: ['সিদ্দীক'] },
  ],
};

/** Arabic hadith lines (Bukhari 6094), revealed right-to-left, line by line. */
export const ARABIC_LINES = [
  'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ،',
  'وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ،',
  'وَإِنَّ الرَّجُلَ لَيَصْدُقُ حَتَّى يَكُونَ صِدِّيقًا،',
  'وَإِنَّ الْكَذِبَ يَهْدِي إِلَى الْفُجُورِ،',
  'وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ،',
  'وَإِنَّ الرَّجُلَ لَيَكْذِبُ، حَتَّى يُكْتَبَ عِنْدَ اللَّهِ كَذَّابًا',
];

/** S5 light-path nodes and S6 ember-path nodes. */
export const NODES_LIGHT = [
  { label: 'সত্য', x: 470, y: 1300 },
  { label: 'নেকী', x: 610, y: 1060 },
  { label: 'জান্নাত', x: 470, y: 820 },
];
export const NODES_EMBER = [
  { label: 'মিথ্যা', x: 610, y: 790 },
  { label: 'পাপ', x: 470, y: 1050 },
  { label: 'জাহান্নাম', x: 610, y: 1310 },
];

export const SIGNATURE = 'Abdur Rahman Nayeem';
export const REFERENCE_CARD = ['সহীহ বুখারী · ৬০৯৪', 'সহীহ মুসলিম · ২৬০৭'];
export const TITLE = 'তোমার নামের পাশে কী লেখা হচ্ছে?';
