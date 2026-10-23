/**
 * The original 77-scene narrative plan, preserved in order.
 *
 * - srcStart/srcEnd : source transcript timing (seconds, 343s total).
 * - outStart/outEnd : mapped timing for the reference 08:12.356 voiceover.
 * - narration       : verbatim Bengali narration for that scene.
 * - kicker/headline : concise on-screen copy (never full narration paragraphs).
 * - kind            : visual scene renderer used for this beat.
 * - transition      : how the scene leaves (fade | push | wipe | snap).
 *
 * Runtime timing is always recalculated from the *measured* audio duration.
 */
export const REFERENCE_AUDIO_SECONDS = 492.356;
export const SOURCE_AUDIO_SECONDS = 343;

export const SCENES = [
  {
    n: 1, srcStart: 0, srcEnd: 4, outStart: 0, outEnd: 5.742,
    narration: 'হুম একবার ভাবুন তো আপনার ব্যবসার যদি থাকত নিজের একটি প্রফেশনাল ওয়েবসাইট',
    kicker: 'একবার ভাবুন', headline: 'নিজের একটি\nপ্রফেশনাল ওয়েবসাইট', kind: 'hook', transition: 'push',
  },
  {
    n: 2, srcStart: 4, srcEnd: 11, outStart: 5.742, outEnd: 15.79,
    narration: 'যেখানে কাস্টমার সহজেই আপনার প্রোডাক্ট দেখতে পারবে পছন্দের পণ্য অর্ডার করতে পারবে',
    kicker: 'কাস্টমার অভিজ্ঞতা', headline: 'পণ্য দেখুন\nঅর্ডার করুন', kind: 'browse', transition: 'push',
  },
  {
    n: 3, srcStart: 11, srcEnd: 17, outStart: 15.79, outEnd: 24.402,
    narration: 'আর আপনি একটি অ্যাডমিন প্যানেল থেকেই পরিচালনা করতে পারবেন আপনার অনলাইন ব্যবসার গুরুত্বপূর্ণ কাজগুলো',
    kicker: 'একটি ড্যাশবোর্ড', headline: 'সবকিছু\nএকটি জায়গা থেকে', kind: 'adminIntro', transition: 'push',
  },
  {
    n: 4, srcStart: 17, srcEnd: 23, outStart: 24.402, outEnd: 33.015,
    narration: 'কেমন হতো আর এই ওয়েবসাইট তৈরি করতে যদি খরচ হয় মাত্র 3000 টাকা',
    kicker: 'খরচ কত?', headline: 'মাত্র ৩,০০০ টাকায়\nওয়েবসাইট!', kind: 'priceTease', title: false, transition: 'snap',
  },
  {
    n: 5, srcStart: 23, srcEnd: 29, outStart: 33.015, outEnd: 41.628,
    narration: 'হ্যাঁ ঠিকই শুনেছেন মাত্র তিন হাজার টাকায় কাস্টমাইজড ওয়েবসাইট',
    kicker: 'হ্যাঁ, ঠিকই শুনেছেন', headline: 'মাত্র ৩,০০০ টাকায়\nকাস্টমাইজড ওয়েবসাইট', kind: 'priceConfirm', transition: 'push',
  },
  {
    n: 6, srcStart: 29, srcEnd: 32, outStart: 41.628, outEnd: 45.934,
    narration: 'আর সবচেয়ে আকর্ষণীয় বিষয় কাজ শুরু করতে কোন অ্যাডভান্স নেই',
    kicker: 'সবচেয়ে আকর্ষণীয়', headline: 'কোনো এডভান্স নেই!', kind: 'noAdvance', title: false, transition: 'snap',
  },
  {
    n: 7, srcStart: 32, srcEnd: 37, outStart: 45.934, outEnd: 53.111,
    narration: 'কিন্তু দাঁড়ান আপনি কি ভাবছেন আপনাকে একটা রেডিমেড টেমপ্লেট ধরিয়ে দিয়ে বলা হবে এই নিন আপনার ওয়েবসাইট',
    kicker: 'কিন্তু দাঁড়ান…', headline: 'রেডিমেড টেমপ্লেট\nধরিয়ে দেওয়া হবে?', kind: 'templateDoubt', transition: 'push',
  },
  {
    n: 8, srcStart: 37, srcEnd: 43, outStart: 53.111, outEnd: 61.724,
    narration: 'জ্বী না রেডিমেড টেমপ্লেট নয় আপনার পছন্দমত কাস্টম ডিজাইন',
    kicker: 'জি না!', headline: 'রেডিমেড টেমপ্লেট নয় —\nআপনার পছন্দমতো কাস্টম ডিজাইন!', kind: 'customDesign', title: false, transition: 'snap',
  },
  {
    n: 9, srcStart: 43, srcEnd: 49, outStart: 61.724, outEnd: 70.337,
    narration: 'আপনার ব্যবসার ধরণ ব্র্যান্ডের পরিচয় এবং পছন্দ অনুযায়ী ওয়েবসাইটের ডিজাইন পরিকল্পনা করা হবে',
    kicker: 'ডিজাইন পরিকল্পনা', headline: 'আপনার ব্র্যান্ডের সঙ্গে\nমানানসই ডিজাইন', kind: 'designBoard', transition: 'push',
  },
  {
    n: 10, srcStart: 49, srcEnd: 57, outStart: 70.337, outEnd: 81.82,
    narration: 'আপনার পছন্দের কালার লোগো ব্যানার ক্যাটাগরি প্রোডাক্টের উপস্থাপন সবকিছু আপনার ব্র্যান্ডের সঙ্গে মানানসই করে সাজানোর সুযোগ',
    kicker: 'কালার • লোগো • ব্যানার', headline: 'সবকিছু আপনার\nব্র্যান্ডের রঙে', kind: 'brandCustomize', transition: 'push',
  },
  {
    n: 11, srcStart: 57, srcEnd: 65, outStart: 81.82, outEnd: 93.304,
    narration: 'আপনার ব্যবসা ফ্যাশন পোশাক জুতা ঘড়ি কসমেটিক্স ইলেকট্রনিক্স গ্রোসারি রেস্টুরেন্ট কিংবা অন্য কোন পণ্যের হোক',
    kicker: 'যেকোনো ব্যবসার জন্য', headline: 'ফ্যাশন থেকে\nরেস্টুরেন্ট', kind: 'categoriesMontage', transition: 'push',
  },
  {
    n: 12, srcStart: 65, srcEnd: 70, outStart: 93.304, outEnd: 100.481,
    narration: 'আপনার ব্যবসার জন্য তৈরি হতে পারে একটি আধুনিক আকর্ষণীয় এবং মোবাইল ফ্রেন্ডলি ওয়েবসাইট',
    kicker: '', headline: 'আধুনিক • আকর্ষণীয় •\nমোবাইল ফ্রেন্ডলি', kind: 'mobileFriendly', transition: 'push',
  },
  {
    n: 13, srcStart: 70, srcEnd: 73, outStart: 100.481, outEnd: 104.787,
    narration: 'চলুন এবার দেখে নেওয়া যাক আপনার ওয়েবসাইটে কি কি সুবিধা থাকতে পারে',
    kicker: 'আরও দেখুন', headline: 'ওয়েবসাইটে কী কী\nসুবিধা থাকতে পারে', kind: 'featuresIntro', transition: 'fade',
  },
  {
    n: 14, srcStart: 73, srcEnd: 82, outStart: 104.787, outEnd: 117.706,
    narration: 'প্রথমেই থাকছে একটি সুন্দর কাস্টমার ওয়েবসাইট যেখানে কাস্টমার সহজেই প্রোডাক্ট ক্যাটাগরি দেখতে পারবে পছন্দের পণ্য খুঁজতে পারবে প্রোডাক্টের ছবি দাম ও বিস্তারিত তথ্য জানতে পারবে',
    kicker: '০১ — কাস্টমার ওয়েবসাইট', headline: 'ক্যাটাগরি, সার্চ,\nছবি ও দাম', kind: 'storefrontWalk', transition: 'push',
  },
  {
    n: 15, srcStart: 82, srcEnd: 88, outStart: 117.706, outEnd: 126.319,
    narration: 'পছন্দের পণ্য কার্টে যোগ করা থেকে শুরু করে অর্ডার সম্পন্ন করা পর্যন্ত পুরো অভিজ্ঞতাকে সহজ ও ব্যবহার বান্ধব করে তোলাই আমাদের লক্ষ্য',
    kicker: '০২ — অর্ডার ফ্লো', headline: 'কার্ট থেকে\nঅর্ডার সম্পন্ন', kind: 'checkoutFlow', transition: 'push',
  },
  {
    n: 16, srcStart: 88, srcEnd: 93, outStart: 126.319, outEnd: 133.496,
    narration: 'আর শুধু একটি সুন্দর ওয়েবসাইটই নয় আপনার ব্যবসা পরিচালনার জন্য থাকছে এডমিন প্যানেল',
    kicker: 'ওয়েবসাইট + অ্যাডমিন', headline: 'ওয়েবসাইট + অ্যাডমিন প্যানেল', kind: 'adminBridge', transition: 'push',
  },
  {
    n: 17, srcStart: 93, srcEnd: 98, outStart: 133.496, outEnd: 140.673,
    narration: 'এবার কল্পনা করুন আপনার ব্যবসার প্রোডাক্ট অর্ডার স্টক কাস্টমার এবং বিক্রির গুরুত্বপূর্ণ তথ্য',
    kicker: 'কল্পনা করুন', headline: 'প্রোডাক্ট • অর্ডার • স্টক\nকাস্টমার • বিক্রি', kind: 'modulesIntro', transition: 'push',
  },
  {
    n: 18, srcStart: 98, srcEnd: 100, outStart: 140.673, outEnd: 143.544,
    narration: 'সবকিছু একটি জায়গা থেকে পরিচালনা করতে পারছেন',
    kicker: '', headline: 'এক জায়গা থেকে পরিচালনা', kind: 'onePlace', transition: 'snap',
  },
  {
    n: 19, srcStart: 100, srcEnd: 110, outStart: 143.544, outEnd: 157.898,
    narration: 'এডমিন প্যানেল থেকেই নতুন প্রোডাক্ট যোগ করতে পারবেন প্রোডাক্টের ছবি ও দাম পরিবর্তন করতে পারবেন ক্যাটাগরি তৈরি করতে পারবেন এবং প্রয়োজন অনুযায়ী ক্যাটাগরি এডিট বা ডিলিট করতে পারবেন',
    kicker: 'প্রোডাক্ট ও ক্যাটাগরি', headline: 'যোগ করুন, বদলান,\nমুছুনও', kind: 'productMgmt', transition: 'push',
  },
  {
    n: 20, srcStart: 110, srcEnd: 117, outStart: 157.898, outEnd: 167.947,
    narration: 'লোগো পরিবর্তন করতে চান ব্যানার আপডেট করতে চান নতুন প্রোডাক্ট যোগ করতে চান কিংবা ওয়েবসাইটের কন্টেন্ট পরিবর্তন করতে চান',
    kicker: 'কনটেন্ট আপডেট', headline: 'লোগো • ব্যানার • কনটেন্ট', kind: 'contentMgmt', transition: 'push',
  },
  {
    n: 21, srcStart: 117, srcEnd: 120, outStart: 167.947, outEnd: 172.253,
    narration: 'সমর্থিত ফিচারগুলো ব্যবহার করে নিজেই প্রয়োজনীয় পরিবর্তন করতে পারবেন',
    kicker: 'নিজেই পরিবর্তন করুন', headline: 'এডিট → প্রিভিউ → সেভ', kind: 'editPreviewSave', transition: 'fade',
  },
  {
    n: 22, srcStart: 120, srcEnd: 124, outStart: 172.253, outEnd: 177.995,
    narration: 'আর আপনার বিজ্ঞাপনের জন্য প্রয়োজন নতুন ল্যান্ডিং পেজ',
    kicker: 'বিজ্ঞাপনের জন্য', headline: 'নতুন ল্যান্ডিং পেজ', kind: 'landingIntro', transition: 'push',
  },
  {
    n: 23, srcStart: 124, srcEnd: 126, outStart: 177.995, outEnd: 180.865,
    narration: 'থাকছে আনলিমিটেড কাস্টম ল্যান্ডিং পেজ তৈরির সুযোগ',
    kicker: '', headline: 'কাস্টম ল্যান্ডিং পেজ', kind: 'landingUnlimited', transition: 'fade',
  },
  {
    n: 24, srcStart: 126, srcEnd: 134, outStart: 180.865, outEnd: 192.349,
    narration: 'প্রতিটি নতুন প্রোডাক্ট বিশেষ অফার কিংবা আলাদা বিজ্ঞাপন ক্যাম্পেইনের জন্য তৈরি করতে পারবেন নিজের প্রয়োজনমতো ল্যান্ডিং পেজ',
    kicker: 'প্রতিটি ক্যাম্পেইনের জন্য', headline: 'প্রোডাক্ট • অফার\nক্যাম্পেইন', kind: 'landingThree', transition: 'push',
  },
  {
    n: 25, srcStart: 134, srcEnd: 140, outStart: 192.349, outEnd: 200.962,
    narration: 'কোথাও থাকবে আকর্ষণীয় ব্যানার কোথাও প্রোডাক্টের বিস্তারিত বিবরণ কোথাও বিশেষ অফার আবার কোথাও সরাসরি অর্ডার করার ব্যবস্থা',
    kicker: 'ব্যানার • বিবরণ • অফার', headline: 'সরাসরি অর্ডারের সুবিধা', kind: 'landingDetail', transition: 'push',
  },
  {
    n: 26, srcStart: 140, srcEnd: 145, outStart: 200.962, outEnd: 208.139,
    narration: 'আপনার মার্কেটিং স্ট্রাটেজি অনুযায়ী বিভিন্ন ল্যান্ডিং পেজ তৈরি করে পণ্য ও অফারকে আরো সুন্দরভাবে উপস্থাপন করতে পারবেন',
    kicker: 'মার্কেটিং স্ট্রাটেজি', headline: 'পণ্য ও অফার\nসুন্দরভাবে উপস্থাপন', kind: 'marketingStrategy', transition: 'fade',
  },
  {
    n: 27, srcStart: 145, srcEnd: 148, outStart: 208.139, outEnd: 212.445,
    narration: 'এবার আসি অর্ডার ম্যানেজমেন্টে',
    kicker: 'এবার আসি', headline: 'অর্ডার ম্যানেজমেন্ট', kind: 'sectionOrders', title: false, transition: 'wipe',
  },
  {
    n: 28, srcStart: 148, srcEnd: 154, outStart: 212.445, outEnd: 221.058,
    narration: 'আপনার ওয়েবসাইটে নতুন অর্ডার এলে এডমিন প্যানেল থেকে দেখতে পারবেন অর্ডারের বিস্তারিত তথ্য',
    kicker: 'নতুন অর্ডার এলে', headline: 'অর্ডারের বিস্তারিত\nতথ্য দেখুন', kind: 'orderIncoming', transition: 'push',
  },
  {
    n: 29, srcStart: 154, srcEnd: 160, outStart: 221.058, outEnd: 229.67,
    narration: 'কাস্টমারের নাম ফোন নম্বর ঠিকানা কোন প্রোডাক্ট অর্ডার করেছেন কতটি অর্ডার করেছেন পণ্যের মূল্য ডেলিভারি চার্জ এবং মোট টাকার হিসাব',
    kicker: 'সব তথ্য একসাথে', headline: 'নাম, ফোন, ঠিকানা,\nপণ্য ও টোটাল', kind: 'orderDetail', transition: 'push',
  },
  {
    n: 30, srcStart: 160, srcEnd: 165, outStart: 229.67, outEnd: 236.848,
    narration: 'অর্ডার পেন্ডিং কনফার্ম প্রসেসিং শিফট ডেলিভারড কিংবা ক্যান্সেল্ড',
    kicker: 'অর্ডার স্ট্যাটাস', headline: 'পেন্ডিং → কনফার্ম → ডেলিভারড', kind: 'orderStatus', transition: 'push',
  },
  {
    n: 31, srcStart: 165, srcEnd: 167, outStart: 236.848, outEnd: 239.719,
    narration: 'অর্ডারের অবস্থা অনুযায়ী সবকিছু পরিচালনা করতে পারবেন',
    kicker: '', headline: 'স্ট্যাটাস অনুযায়ী পরিচালনা', kind: 'orderFilter', transition: 'fade',
  },
  {
    n: 32, srcStart: 167, srcEnd: 172, outStart: 239.719, outEnd: 246.896,
    narration: 'প্রয়োজন অনুযায়ী অর্ডার হিস্ট্রি পেমেন্ট স্ট্যাটাস বিক্রির রিপোর্ট এবং স্টকের তথ্য দেখতে পারবেন',
    kicker: 'রিপোর্ট ও হিস্ট্রি', headline: 'বিক্রি • পেমেন্ট • স্টক', kind: 'reports', transition: 'push',
  },
  {
    n: 33, srcStart: 172, srcEnd: 176, outStart: 246.896, outEnd: 252.637,
    narration: 'নতুন অর্ডার এলে নোটিফিকেশন পাওয়ার ব্যবস্থাও থাকবে যাতে গুরুত্বপূর্ণ অর্ডারের খবর দ্রুত জানতে পারেন',
    kicker: 'দ্রুত খবর', headline: 'নতুন অর্ডারের নোটিফিকেশন', kind: 'orderNotify', transition: 'fade',
  },
  {
    n: 34, srcStart: 176, srcEnd: 180, outStart: 252.637, outEnd: 258.379,
    narration: 'এবার এমন একটি সুবিধার কথা বলি যা আপনার সম্ভাব্য বিক্রি বাড়ানোর সুযোগ তৈরি করতে পারে',
    kicker: 'আরেকটি সুবিধা', headline: 'সম্ভাব্য বিক্রি বাড়ানোর\nসুযোগ', kind: 'abandonIntro', transition: 'push',
  },
  {
    n: 35, srcStart: 180, srcEnd: 187, outStart: 258.379, outEnd: 268.427,
    narration: 'ধরুন একজন কাস্টমার আপনার ওয়েবসাইটে এলেন একটি প্রোডাক্ট পছন্দ করলেন নাম ফোন নম্বর ও ঠিকানা দিলেন কিন্তু অর্ডারটি সম্পন্ন করলেন না',
    kicker: 'ধরুন…', headline: 'অর্ডার সম্পন্ন\nহল না', kind: 'abandonJourney', transition: 'push',
  },
  {
    n: 36, srcStart: 187, srcEnd: 193, outStart: 268.427, outEnd: 277.04,
    narration: 'আপনার ওয়েবসাইটে অসম্পূর্ণ অর্ডার বা চেকআউট তথ্য সংরক্ষণের ব্যবস্থা থাকলে এডমিন প্যানেল থেকে সেই তথ্য দেখতে পারবেন',
    kicker: 'সংরক্ষিত তথ্য', headline: 'অসম্পূর্ণ চেকআউট\nএডমিনে দেখুন', kind: 'abandonAdmin', transition: 'push',
  },
  {
    n: 37, srcStart: 193, srcEnd: 197, outStart: 277.04, outEnd: 282.782,
    narration: 'প্রয়োজন অনুযায়ী কাস্টমারের সঙ্গে যোগাযোগ করে অর্ডার সম্পন্ন করার সুযোগও তৈরি হবে',
    kicker: 'প্রয়োজন অনুযায়ী', headline: 'যোগাযোগ করে\nঅর্ডার সম্পন্ন করুন', kind: 'abandonContact', transition: 'fade',
  },
  {
    n: 38, srcStart: 197, srcEnd: 199, outStart: 282.782, outEnd: 285.653,
    narration: 'আর এখানেই শেষ নয়',
    kicker: 'আর এখানেই শেষ নয়', headline: '', kind: 'notEnd', title: false, transition: 'wipe',
  },
  {
    n: 39, srcStart: 199, srcEnd: 200, outStart: 285.653, outEnd: 287.088,
    narration: 'রিটার্গেটিং মার্কেটিং এর সুযোগ',
    kicker: 'এরপর', headline: 'রিটার্গেটিং মার্কেটিং', kind: 'retargetTitle', title: false, transition: 'snap',
  },
  {
    n: 40, srcStart: 200, srcEnd: 207, outStart: 287.088, outEnd: 297.136,
    narration: 'মেটা পিক্সেল এবং প্রয়োজনীয় কনভার্শন ট্র্যাকিং সেটআপ এর মাধ্যমে আপনার ওয়েবসাইটে আসা ভিজিটরদের কার্যক্রম অনুযায়ী মার্কেটিং পরিকল্পনা করতে পারবেন',
    kicker: 'মেটা পিক্সেল • কনভার্শন', headline: 'ভিজিটরদের কার্যক্রম\nট্র্যাক করুন', kind: 'retargetFlow', transition: 'push',
  },
  {
    n: 41, srcStart: 207, srcEnd: 212, outStart: 297.136, outEnd: 304.313,
    narration: 'যারা প্রোডাক্ট দেখেছেন কার্টে যোগ করেছেন কিংবা কেনাকাটার আগ্রহ দেখিয়েছেন',
    kicker: 'অডিয়েন্স সেগমেন্ট', headline: 'দেখেছেন • কার্টে\nযোগ করেছেন • আগ্রহ', kind: 'retargetAudience', transition: 'push',
  },
  {
    n: 42, srcStart: 212, srcEnd: 217, outStart: 304.313, outEnd: 311.491,
    narration: 'তাদের কাছে আবারও আপনার প্রোডাক্ট ও অফার পৌঁছে দেওয়ার জন্য রিটার্গেটিং ক্যাম্পেইন চালাতে পারবেন',
    kicker: 'রিটার্গেটিং ক্যাম্পেইন', headline: 'আবারও পৌঁছে দিন\nআপনার অফার', kind: 'retargetCampaign', transition: 'push',
  },
  {
    n: 43, srcStart: 217, srcEnd: 223, outStart: 311.491, outEnd: 320.103,
    narration: 'অর্থাৎ আপনার ওয়েবসাইটে একবার এসেই কেউ চলে গেলে তাকে আবার আপনার ব্যবসার দিকে ফিরিয়ে আনার সুযোগ তৈরি হবে',
    kicker: 'ভিজিট → অ্যাড → ফিরে আসা', headline: 'ফিরিয়ে আনার সুযোগ', kind: 'retargetLoop', transition: 'fade',
  },
  {
    n: 44, srcStart: 223, srcEnd: 226, outStart: 320.103, outEnd: 324.409,
    narration: 'এবার আসি কুরিয়ার অটোমেশন এবং কাস্টমারের কুরিয়ার হিস্টরিতে',
    kicker: 'এবার আসি', headline: 'কুরিয়ার অটোমেশন\nও হিস্টরি', kind: 'sectionCourier', title: false, transition: 'wipe',
  },
  {
    n: 45, srcStart: 226, srcEnd: 231, outStart: 324.409, outEnd: 331.587,
    narration: 'আপনার অনলাইন ব্যবসায় অর্ডার নেওয়ার পর পার্সেল পাঠানো ট্র্যাকিং করা এবং ডেলিভারি আপডেট রাখাও অত্যন্ত গুরুত্বপূর্ণ',
    kicker: 'পার্সেল পাঠানো', headline: 'ট্র্যাকিং ও\nডেলিভারি আপডেট', kind: 'courierJourney', transition: 'push',
  },
  {
    n: 46, srcStart: 231, srcEnd: 238, outStart: 331.587, outEnd: 341.635,
    narration: 'সমর্থিত কুরিয়ার সার্ভিসের ইন্টিগ্রেশন থাকলে এডমিন প্যানেল থেকে অর্ডার কুরিয়ারে পাঠানো কনসাইনমেন্ট তৈরি ট্র্যাকিং নম্বর সংরক্ষণ এবং ডেলিভারি স্ট্যাটাস আপডেট করার ব্যবস্থা করা সম্ভব',
    kicker: 'সমর্থিত ইন্টিগ্রেশন হলে', headline: 'কনসাইনমেন্ট • ট্র্যাকিং\nস্ট্যাটাস আপডেট', kind: 'courierAdmin', transition: 'push',
  },
  {
    n: 47, srcStart: 238, srcEnd: 242, outStart: 341.635, outEnd: 347.377,
    narration: 'আর কুরিয়ার হিস্ট্রি ইন্টিগ্রেশন সমর্থিত হলে কাস্টমারের পূর্ববর্তী পার্সেল ডেলিভারি ও রিটার্নের রেকর্ডও দেখতে পারবেন',
    kicker: 'কুরিয়ার হিস্টরি', headline: 'ডেলিভারি ও রিটার্নের\nরেকর্ড', kind: 'courierHistory', transition: 'push',
  },
  {
    n: 48, srcStart: 242, srcEnd: 247, outStart: 347.377, outEnd: 354.554,
    narration: 'কতটি পার্সেল সফলভাবে ডেলিভারি হয়েছে কতটি রিটার্ন হয়েছে এসব তথ্য অর্ডার যাচাই এবং ব্যবসার সিদ্ধান্ত নিতে সাহায্য করতে পারে',
    kicker: 'ডেলিভারি ও রিটার্ন', headline: 'সিদ্ধান্ত নিতে\nসহায়ক তথ্য', kind: 'courierStats', transition: 'fade',
  },
  {
    n: 49, srcStart: 247, srcEnd: 251, outStart: 354.554, outEnd: 360.295,
    narration: 'এবার ভাবুন আপনার ব্যবসায় ভুয়া অর্ডার কিংবা সন্দেহজনক কার্যক্রম নিয়ন্ত্রণের ব্যবস্থা থাকলে কেমন হয়',
    kicker: 'সন্দেহজনক অর্ডার', headline: 'ভুয়া অর্ডার\nনিয়ন্ত্রণ', kind: 'securityIntro', transition: 'push',
  },
  {
    n: 50, srcStart: 251, srcEnd: 256, outStart: 360.295, outEnd: 367.473,
    narration: 'প্রয়োজন অনুযায়ী আইপি ভিত্তিক রেট লিমিটিং সন্দেহজনক অর্ডার শনাক্তকরণ এবং ডুপ্লিকেট অর্ডার নিয়ন্ত্রণের মত ফিচার যুক্ত করা যেতে পারে',
    kicker: 'প্রয়োজন অনুযায়ী', headline: 'রেট লিমিট • ডুপ্লিকেট\nসনাক্তকরণ', kind: 'securityRules', transition: 'push',
  },
  {
    n: 51, srcStart: 256, srcEnd: 260, outStart: 367.473, outEnd: 373.214,
    narration: 'নির্ধারিত নিয়ম অনুযায়ী সন্দেহজনক কার্যক্রম সীমিত করে অর্ডার ম্যানেজমেন্টকে আরো কার্যকর করার সুযোগ থাকবে',
    kicker: 'নিয়ম অনুযায়ী', headline: 'অনুমোদন • রিভিউ • ব্লক', kind: 'securityQueue', transition: 'fade',
  },
  {
    n: 52, srcStart: 260, srcEnd: 262, outStart: 373.214, outEnd: 376.085,
    narration: 'এবার আসি পেমেন্ট ম্যানেজমেন্টে',
    kicker: 'এবার আসি', headline: 'পেমেন্ট ম্যানেজমেন্ট', kind: 'sectionPayments', title: false, transition: 'wipe',
  },
  {
    n: 53, srcStart: 262, srcEnd: 267, outStart: 376.085, outEnd: 383.263,
    narration: 'আপনার ব্যবসার প্রয়োজন অনুযায়ী ক্যাশ অন ডেলিভারি এডভান্স পেমেন্ট এবং সমর্থিত পেমেন্ট গেটওয়ে ইন্টিগ্রেশনের ব্যবস্থা করা যাবে',
    kicker: 'পেমেন্ট অপশন', headline: 'COD • অ্যাডভান্স\nপেমেন্ট গেটওয়ে', kind: 'paymentMethods', transition: 'push',
  },
  {
    n: 54, srcStart: 267, srcEnd: 272, outStart: 383.263, outEnd: 390.44,
    narration: 'প্রয়োজনীয় ইন্টিগ্রেশন ও অনুমতি থাকলে পেমেন্ট মেথড পরিচালনা পেমেন্ট স্ট্যাটাস দেখা এবং অর্ডারের সঙ্গে পেমেন্টের হিসাব মিলিয়ে নেওয়া সম্ভব',
    kicker: 'হিসাব মিলিয়ে নিন', headline: 'পেমেন্ট স্ট্যাটাস\nও রিকনসিলিয়েশন', kind: 'paymentReconcile', transition: 'push',
  },
  {
    n: 55, srcStart: 272, srcEnd: 277, outStart: 390.44, outEnd: 397.617,
    narration: 'এছাড়া প্রয়োজন অনুযায়ী টেলিগ্রাম বট ও ইমেইল নোটিফিকেশনের মত সুবিধাও যুক্ত করা যেতে পারে',
    kicker: 'ঐচ্ছিক ইন্টিগ্রেশন', headline: 'টেলিগ্রাম বট\nও ইমেইল', kind: 'telegramEmail', transition: 'push',
  },
  {
    n: 56, srcStart: 277, srcEnd: 280, outStart: 397.617, outEnd: 401.923,
    narration: 'যাতে নতুন অর্ডার এবং গুরুত্বপূর্ণ আপডেটের খবর দ্রুত পাওয়া যায়',
    kicker: '', headline: 'নতুন অর্ডারের খবর\nসাথে সাথে', kind: 'notifyFast', transition: 'fade',
  },
  {
    n: 57, srcStart: 280, srcEnd: 284, outStart: 401.923, outEnd: 407.665,
    narration: 'অর্থাৎ আপনার অনলাইন ব্যবসার জন্য শুধু একটি ওয়েবসাইট নয় একটি সমন্বিত ব্যবসা পরিচালনা ব্যবস্থা',
    kicker: 'শুধু ওয়েবসাইট নয়', headline: 'সমন্বিত ব্যবসা\nপরিচালনা ব্যবস্থা', kind: 'systemDiagram', transition: 'push',
  },
  {
    n: 58, srcStart: 284, srcEnd: 288, outStart: 407.665, outEnd: 413.407,
    narration: 'আর ওয়েবসাইট চালানোর খরচ উপযুক্ত ফ্রি হোস্টিং প্ল্যাটফর্ম ব্যবহার করে',
    kicker: 'হোস্টিং খরচ', headline: 'উপযুক্ত ফ্রি\nহোস্টিং প্ল্যাটফর্ম', kind: 'hosting', transition: 'push',
  },
  {
    n: 59, srcStart: 288, srcEnd: 291, outStart: 413.407, outEnd: 417.713,
    narration: 'মাসিক হোস্টিং ফি ছাড়াই ওয়েবসাইট চালানোর সুযোগ থাকতে পারে',
    kicker: '', headline: 'মাসিক হোস্টিং ফি\nছাড়াই চালানোর সুযোগ', kind: 'hostingNote', title: false, transition: 'fade',
  },
  {
    n: 60, srcStart: 291, srcEnd: 294, outStart: 417.713, outEnd: 422.019,
    narration: 'ডোমেইন এবং প্রয়োজন অনুযায়ী পেইড থার্ড পার্টি সার্ভিসের খরচ আলাদা হতে পারে',
    kicker: 'খরচের স্বচ্ছতা', headline: 'ডোমেইন ও পেইড সার্ভিস\nআলাদা হতে পারে', kind: 'costNote', transition: 'fade',
  },
  {
    n: 61, srcStart: 294, srcEnd: 297, outStart: 422.019, outEnd: 426.326,
    narration: 'সবচেয়ে গুরুত্বপূর্ণ বিষয় হচ্ছে আপনার ব্যবসার প্রয়োজন বুঝে ওয়েবসাইটের পরিকল্পনা করা',
    kicker: 'সবচেয়ে গুরুত্বপূর্ণ', headline: 'আপনার প্রয়োজন বুঝে\nপরিকল্পনা', kind: 'planning', transition: 'push',
  },
  {
    n: 62, srcStart: 297, srcEnd: 299, outStart: 426.326, outEnd: 429.197,
    narration: 'কারণ প্রতিটি ব্যবসার প্রয়োজন এক নয়',
    kicker: '', headline: 'প্রতিটি ব্যবসার\nপ্রয়োজন এক নয়', kind: 'notSame', title: false, transition: 'fade',
  },
  {
    n: 63, srcStart: 299, srcEnd: 301, outStart: 429.197, outEnd: 432.068,
    narration: 'কেউ চান একটি সুন্দর অনলাইন শপ',
    kicker: 'কেউ চান', headline: 'সুন্দর অনলাইন শপ', kind: 'solShop', transition: 'push',
  },
  {
    n: 64, srcStart: 301, srcEnd: 302, outStart: 432.068, outEnd: 433.503,
    narration: 'কেউ চান প্রোডাক্ট ল্যান্ডিং পেজ',
    kicker: 'কেউ চান', headline: 'প্রোডাক্ট ল্যান্ডিং পেজ', kind: 'solLanding', transition: 'snap',
  },
  {
    n: 65, srcStart: 302, srcEnd: 307, outStart: 433.503, outEnd: 440.68,
    narration: 'আবার কেউ চান অর্ডার কুরিয়ার পেমেন্ট এবং স্টক পরিচালনার জন্য একটি পূর্ণাঙ্গ সিস্টেম',
    kicker: 'আবার কেউ চান', headline: 'পূর্ণাঙ্গ ব্যবসা\nপরিচালনা সিস্টেম', kind: 'solSystem', transition: 'push',
  },
  {
    n: 66, srcStart: 307, srcEnd: 310, outStart: 440.68, outEnd: 444.986,
    narration: 'আপনার প্রয়োজন অনুযায়ী উপযুক্ত ওয়েব সলিউশন বেছে নেওয়ার সুযোগ রয়েছে কোড পিক্সেল ওয়েবের সঙ্গে',
    kicker: 'CodePixel Web-এর সঙ্গে', headline: 'আপনার উপযুক্ত\nওয়েব সলিউশন', kind: 'solutions', transition: 'push',
  },
  {
    n: 67, srcStart: 310, srcEnd: 313, outStart: 444.986, outEnd: 449.293,
    narration: 'এখন নিশ্চয়ই ভাবছেন এত সুযোগের শুরুটা কত টাকা দিয়ে',
    kicker: 'শুরুটা কত টাকায়?', headline: 'এত সুযোগের\nশুরুটা…', kind: 'priceAnticipation', transition: 'push',
  },
  {
    n: 68, srcStart: 313, srcEnd: 315, outStart: 449.293, outEnd: 452.164,
    narration: 'মাত্র 3000 টাকায় ওয়েবসাইট কোনো অ্যাডভান্স নেই',
    kicker: '', headline: 'মাত্র ৩,০০০ টাকায় ওয়েবসাইট!\nকোনো এডভান্স নেই!', kind: 'priceFinal', title: false, transition: 'snap',
  },
  {
    n: 69, srcStart: 315, srcEnd: 320, outStart: 452.164, outEnd: 459.341,
    narration: 'সাধারণত দুই থেকে তিন দিনের মধ্যে ডেলিভারি দেওয়ার লক্ষ্য কাজের পরিধি এবং প্রয়োজনীয় উপকরণ পাওয়ার উপর নির্ভর করে',
    kicker: 'ডেলিভারি', headline: '২–৩ দিনের মধ্যে\nডেলিভারির লক্ষ্য', kind: 'delivery', transition: 'push',
  },
  {
    n: 70, srcStart: 320, srcEnd: 325, outStart: 459.341, outEnd: 466.518,
    narration: 'আর আপনার প্রয়োজন অনুযায়ী কোন কোন ফিচার নির্ধারিত প্যাকেজে থাকবে তা কাজ শুরুর আগেই আলোচনা করে নেওয়া হবে',
    kicker: 'কাজ শুরুর আগেই', headline: 'স্কোপ ও ফিচার\nআলোচনা করে নিন', kind: 'scope', transition: 'push',
  },
  {
    n: 71, srcStart: 325, srcEnd: 328, outStart: 466.518, outEnd: 470.824,
    narration: 'তাই আপনার ব্যবসাকে অনলাইনে আরো সুন্দরভাবে উপস্থাপন করতে আর দেরি কেন',
    kicker: 'আর দেরি কেন?', headline: 'অনলাইনে আরও\nসুন্দরভাবে উপস্থাপন', kind: 'whyDelay', transition: 'push',
  },
  {
    n: 72, srcStart: 328, srcEnd: 330, outStart: 470.824, outEnd: 473.695,
    narration: 'আপনার পছন্দের ডিজাইন আপনার ব্র্যান্ড',
    kicker: '', headline: 'আপনার পছন্দের ডিজাইন\n• আপনার ব্র্যান্ড', kind: 'yourDesign', title: false, transition: 'push',
  },
  {
    n: 73, srcStart: 330, srcEnd: 332, outStart: 473.695, outEnd: 476.566,
    narration: 'আজই যোগাযোগ করুন কোড পিক্সেল ওয়েবের সঙ্গে',
    kicker: 'আজই', headline: 'যোগাযোগ করুন\nCodePixel Web-এর সঙ্গে', kind: 'contactNow', title: false, transition: 'snap',
  },
  {
    n: 74, srcStart: 332, srcEnd: 335, outStart: 476.566, outEnd: 480.872,
    narration: 'আমাদের ওয়েবসাইটের ডেমো দেখুন আপনার প্রয়োজন জানান এবং আপনার ব্যবসার জন্য উপযুক্ত সমাধান সম্পর্কে জেনে নিন',
    kicker: 'ডেমো দেখুন', headline: 'codepixelweb.vercel.app', kind: 'websiteCta', title: false, transition: 'push',
  },
  {
    n: 75, srcStart: 335, srcEnd: 338, outStart: 480.872, outEnd: 485.179,
    narration: 'হোয়াটসঅ্যাপে মেসেজ করুন 01876892958',
    kicker: 'সরাসরি কথা বলুন', headline: 'হোয়াটসঅ্যাপে\nমেসেজ করুন', kind: 'whatsappCta', title: false, transition: 'push',
  },
  {
    n: 76, srcStart: 338, srcEnd: 340, outStart: 485.179, outEnd: 488.05,
    narration: 'আবারও বলছি মাত্র 3000 টাকায় কাস্টমাইজ ওয়েবসাইট কোনো অ্যাডভান্স নেই',
    kicker: 'আবারও বলছি', headline: 'মাত্র ৩,০০০ টাকায়\nকাস্টম ওয়েবসাইট!', kind: 'offerRepeat', title: false, transition: 'snap',
  },
  {
    n: 77, srcStart: 340, srcEnd: 343, outStart: 488.05, outEnd: 492.356,
    narration: 'কোড পিক্সেল ওয়েব আপনার ব্যবসা আপনার ডিজাইন আপনার অনলাইন পরিচয়',
    kicker: '', headline: 'আপনার ব্যবসা • আপনার ডিজাইন\nআপনার অনলাইন পরিচয়', kind: 'endCard', title: false, transition: 'hold',
  },
];

export const BRAND = {
  name: 'CodePixel Web',
  website: 'codepixelweb.vercel.app',
  url: 'https://codepixelweb.vercel.app/',
  whatsapp: '01876892958',
  whatsappBn: '০১৮৭৬৮৯২৯৫৮',
  offer: 'মাত্র ৩,০০০ টাকায় ওয়েবসাইট!',
  advance: 'কোনো এডভান্স নেই!',
  differentiator: 'রেডিমেড টেমপ্লেট নয় — আপনার পছন্দমতো কাস্টম ডিজাইন!',
  tagline: 'আপনার ব্যবসা • আপনার ডিজাইন • আপনার অনলাইন পরিচয়',
};

/* ------------------------------------------------------------------ tone map
 * Which backdrops each beat plays against. Dark = cinematic hook / chapters,
 * light = the product-demo core where the viewer "uses" the shop.
 * Kept separate from the copy above so the narrative plan stays readable.
 */
const TONE = {
  1: 'dark', 2: 'dark', 3: 'dark', 4: 'dark', 5: 'dark', 6: 'dark', 7: 'dark',
  8: 'light', 9: 'light', 10: 'light', 11: 'light', 12: 'light', 13: 'dark',
  14: 'light', 15: 'light', 16: 'light', 17: 'dark', 18: 'dark',
  19: 'light', 20: 'light', 21: 'light', 22: 'dark', 23: 'light', 24: 'light',
  25: 'light', 26: 'light',
  27: 'dark', 28: 'light', 29: 'light', 30: 'light', 31: 'light', 32: 'light',
  33: 'light', 34: 'dark', 35: 'light', 36: 'light', 37: 'light', 38: 'dark',
  39: 'dark', 40: 'dark', 41: 'dark', 42: 'dark', 43: 'dark',
  44: 'dark', 45: 'light', 46: 'light', 47: 'light', 48: 'light',
  49: 'dark', 50: 'light', 51: 'light', 52: 'dark', 53: 'light', 54: 'light',
  55: 'light', 56: 'dark',
  57: 'dark', 58: 'dark', 59: 'dark', 60: 'dark', 61: 'dark', 62: 'dark',
  63: 'light', 64: 'light', 65: 'light', 66: 'dark',
  67: 'dark', 68: 'dark', 69: 'dark', 70: 'dark', 71: 'dark', 72: 'dark',
  73: 'dark', 74: 'dark', 75: 'dark', 76: 'dark', 77: 'dark',
};
SCENES.forEach((s) => { s.tone = TONE[s.n] || 'dark'; });
