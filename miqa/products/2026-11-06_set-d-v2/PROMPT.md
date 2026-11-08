# Set D v2 (ডিজাইন-ফ্যামিলি ২) — ছবি বানানোর প্রম্পট ও স্ক্রিপ্ট

তারিখ: ৬ নভেম্বর ২০২৬ · প্রোডাক্ট ০৫–০৮ · রেফারেন্স: `products/source-photos/2026-11-06_set-d-new/`

## ১. রেফারেন্স → আউটপুট

| প্রোডাক্ট | রঙ / ডায়াল | রেফারেন্স ছবি | আউটপুট |
|---|---|---|---|
| ০৫ | আইভরি সিরামিক / আইভরি-শ্যাম্পেন | `IMG20261029114459`, `IMG20261029114500` | `p05_hero_b` (প্রাইমারি), `p05_wrist_b` (হাতে পরা) |
| ০৬ | ব্লাশ পিংক / গোলাপি | `IMG20261029114713`, `IMG20261029114717` | `p06_hero_a`, `p06_wrist` |
| ০৭ | কালো সিরামিক / সিলভার | `IMG20261029114836`, `IMG20261029114849` | `p07_hero_a`, `p07_wrist` |
| ০৮ | নেভি সিরামিক / নীল | `IMG20261029115146`, `IMG20261029115147` | `p08_hero_a` |

বাতিল করা রেন্ডার: `p05_hero_a` (কোণা), `p05_wrist` (ক্রোনোগ্রাফ ডায়াল এসে গিয়েছিল — বাতিল),
`p05_angle` (ডায়ালে ROMAN XII এসে যায় — বাতিল)।

## ২. প্রম্পট (প্রাইমারি)

> Use the reference photo as the exact watch. Keep everything identical: rose-gold polished case
> with a wide crystal-set (pavé) bezel ring, **<ডায়ালের রঙ>** sunray dial with "MICHAELKORS" brand
> text in the exact spelling, the numeral **12** at the top, rose-gold baton hour markers, three
> gold hands, rose-gold crown on the right, and the two-tone bracelet of **<সিরামিকের রঙ>** glossy
> ceramic centre links framed by polished rose-gold side links. Re-render the whole watch standing
> upright, dead-on front view, symmetrical, full bracelet complete at both ends, centred with the
> watch filling about 78% of the frame height in the upper two-thirds and the bottom fifth left
> empty. Seamless ivory-pearl studio backdrop (ivory #F6EDE3, highlight #FBF4F1, champagne #D9B779),
> soft warm key light from the upper left, white bounce card, glossy speculars on the polished metal,
> sparkling crystals, natural contact shadow plus a soft drop shadow lower-right. Premium e-commerce
> catalogue photography, square 1:1, ultra sharp macro detail. No text overlay, no Bengali
> characters, no watermark, no human hand, no model, no box, no cropped bracelet, no price.

## ৩. প্রম্পট (হাতে পরা)

প্রাইমারির বর্ণনা + `South Asian woman's slender wrist from above, watch face toward the camera,
only hand and forearm in frame, blush silk sleeve at the top, natural nude nails, no other
jewellery` + `CRITICAL: the dial has exactly THREE hands and nothing else — NO chronograph, NO
subdials, NO date window, only ONE crown`।

## ৪. ফিনিশ (`compose_v2.mjs`)

1. রেন্ডার ১০২৪² → ২০০০² ক্যানভাস। ব্যাকগ্রাউন্ডের রঙ রেন্ডারের নিচের কিনারা থেকে মাপা
   (`avgRow`) — তাই সিম নেই। উপরের বর্গে ১৮৬০px, নিচে ফাঁকা বন্ধ।
2. হালকা গ্রেড: `saturate(1.05) contrast(1.02)`; কিনারায় ৬০px ফেদার; কোণায় আইভরি ভিনিয়েট।
3. প্রাইমারিতে নিচে **দুটি পিল** (y≈1812, উচ্চতা ১৮৬): বাঁয়ে ওই ঘড়ির আসল ডায়ালের ক্রপ
   (ব্যাস ১৪৮), ডানে বাংলা লেখা — `HindSiliguri-SemiBold` ৭৬px, `#5A1A2E`, পিল
   `rgba(253,247,243,.95)`, রিং-বর্ডার `#D9B779`। **letterSpacing নেই।**
4. `image` → JPG q93, sRGB, 4:4:4, strip।

চালানো: `bash miqa/products/2026-11-06_set-d/build_v2.sh`

- ইনসেট কাটা: `make_insets.sh` (ক্লায়েন্টের ছবি থেকে ডায়ালের ক্রপ ৪০০²)
- কর্নার-কেস: `make_chip_v2.mjs` (পুরো ক্যানভাসে শুধু পিল, টেস্ট করার জন্য)

## ৫. বাকি

প্রতিটির **কোণ (২৫–৩০°)**, **ডায়াল ক্লোজ-আপ**, **স্টাইলড ফ্ল্যাট-লে** + ০৮-এর হাতে-পরা।
ইমেজ-জেনারেশনের দৈনিক সীমা (১০/টার্ন) শেষ — পরের ধাপে একই প্রম্পট ছাঁচে বানাতে হবে।
