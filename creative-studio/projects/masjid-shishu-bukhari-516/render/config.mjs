/**
 * Project config — «সে আর মসজিদে আসে না» (Bukhari 516 · Nasa'i 1141 · Bukhari 660)
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
  cool: '#8FA5C8',
  captionBg: 'rgba(4,12,9,0.45)',
};

/** Scene list in order. `vo` file lives in ../assets/. Gaps in seconds. */
export const SCENES = [
  { id: 's1', vo: 'vo-s1.mp3', bg: 'bg-s1.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's2', vo: 'vo-s2.mp3', bg: 'bg-s2.jpg', gapAfter: 0.6, leadIn: 0.15 },
  { id: 's3', vo: 'vo-s3.mp3', bg: 'bg-s3.jpg', gapAfter: 0.9, leadIn: 0.15 },
  { id: 's4', vo: 'vo-s4.mp3', bg: 'bg-s4.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's5', vo: 'vo-s5-arabic.mp3', bg: 'bg-s5.jpg', gapAfter: 0.8, leadIn: 0.25, arabic: true },
  { id: 's6', vo: 'vo-s6.mp3', bg: 'bg-s6.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's7', vo: 'vo-s7.mp3', bg: 'bg-s7.jpg', gapAfter: 1.1, leadIn: 0.15 },
  { id: 's8', vo: 'vo-s8.mp3', bg: 'bg-s8.jpg', gapAfter: 0.7, leadIn: 0.15 },
  { id: 's9', vo: 'vo-s9.mp3', bg: 'bg-s9.jpg', gapAfter: 0.0, leadIn: 0.15 },
];

export const TAIL = 2.4; // closing hold after last VO

/** Phrases per scene (Bengali narration). `hi` = keywords rendered in gold. */
export const PHRASES = {
  s1: [
    { t: 'মাগরিবের নামাজ চলছে…', hi: [] },
    { t: 'আর পেছনে — শিশুরা দৌড়াচ্ছে, হাসছে।', hi: ['শিশুরা'] },
  ],
  s2: [
    { t: 'হঠাৎ এক মুরুব্বির রাগী চোখ…', hi: ['রাগী'] },
    { t: '«বের হয়ে যা এখান থেকে!»', hi: [], ember: true },
    { t: 'শিশুটির হাসি থেমে যায়…', hi: [] },
  ],
  s3: [
    { t: 'আল্লাহর ঘর হয়ে গেল ভয়ের জায়গা।', hi: ['ভয়ের'] },
    { t: 'সে আর মসজিদে আসে না।', hi: ['না'] },
  ],
  s4: [
    { t: 'কিন্তু জানেন কি —', hi: [] },
    { t: 'তাঁর মসজিদে কী ঘটত?', hi: ['মসজিদে'] },
  ],
  s6: [
    { t: 'সালাতে তিনি কন্যাসন্তানকে কাঁধে নিতেন —', hi: ['কাঁধে'] },
    { t: 'সিজদায় নামিয়ে, উঠে আবার তুলে নিতেন।', hi: [] },
    { t: 'একবার সিজদা লম্বা হলো — পিঠে দুই শিশু খেলছিল।', hi: ['শিশু'] },
    { t: 'তিনি তাঁদের বিঘ্নিত করেননি।', hi: ['বিঘ্নিত'] },
  ],
  s7: [
    { t: 'আরশের ছায়া পাবে সাতজন…', hi: ['ছায়া'] },
    { t: 'তাদের দুজন —', hi: ['দুজন'] },
  ],
  s8: [
    { t: 'ধমক নয় — ভালোবাসা দিন।', hi: ['ভালোবাসা'] },
    { t: 'মসজিদকে বানান শিশুর প্রিয় জায়গা।', hi: ['প্রিয়'] },
  ],
  s9: [
    { t: 'আজকের দৌড়ানো শিশুটাই —', hi: [] },
    { t: 'আগামী দিনের ইমাম।', hi: ['ইমাম'] },
  ],
};

/** Arabic hadith lines (Bukhari 516), revealed right-to-left, line by line. */
export const ARABIC_LINES = [
  'كَانَ يَؤُمُّنَا، فَيَحْمِلُ أُمَامَةَ بِنْتَ زَيْنَبٍ،',
  'فَإِذَا رَكَعَ وَضَعَهَا،',
  'وَإِذَا رَفَعَ رَفَعَهَا',
];

/** S7 promise nodes (two of the seven under Allah's shade). */
export const NODES_PROMISE = [
  { label: 'যে ইবাদতে বেড়ে উঠেছে', x: 430, y: 1000 },
  { label: 'যার হৃদয় মসজিদে আসক্ত', x: 560, y: 1300 },
];

/** Bottom-left reference footers for hadith scenes. */
export const FOOTERS = {
  s5: 'সহীহ বুখারী · ৫১৬',
  s6: 'সুনানে নাসাঈ · ১১৪১ (সহীহ)',
  s7: 'সহীহ বুখারী · ৬৬০',
};

export const SIGNATURE = 'Abdur Rahman Nayeem';
export const TITLE = 'সে আর মসজিদে আসে না';
export const THUMB_REF = 'সহীহ বুখারী · ৫১৬';
