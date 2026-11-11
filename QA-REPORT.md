# QA রিপোর্ট — CodePixel Web Promo Reels

## চূড়ান্ত ভিডিও

| যাচাই | 1080p | 720p |
|---|---:|---:|
| ফাইল | `output/CodePixel-Web-Promo-Reels-1080p.mp4` | `output/CodePixel-Web-Promo-Reels-720p.mp4` |
| রেজোলিউশন / fps | 1080×1920 · 30 fps | 720×1280 · 30 fps |
| ভিডিও / অডিও | H.264 + AAC | H.264 + AAC |
| দৈর্ঘ্য | 492.367 s (8:12.367) | 492.367 s (8:12.367) |
| ফাইলের মাপ | 69,699,303 bytes (~66.5 MiB) | 36,976,077 bytes (~35.3 MiB) |
| ডিকোড পরীক্ষা | সম্পূর্ণ ফাইল সফলভাবে ডিকোড | সম্পূর্ণ ফাইল সফলভাবে ডিকোড |

আসল বাংলা MP3 (`assets/voiceover/voiceover.mp3`, 492.355875 s) অপরিবর্তিত গতিতে ভিডিওর শুরু থেকে যোগ করা হয়েছে। কোনো narration কাটা হয়নি। 720p সংস্করণটি চূড়ান্ত 1080p master থেকে একই aspect ratio-তে downscale করা হয়েছে; অডিও ট্র্যাক একই রাখা হয়েছে।

## ভয়েস-সিঙ্ক

- প্রতিটি scene-এর বাংলা narration-এর দৈর্ঘ্য ধরে scene timing নির্ধারণ করা হয়েছে।
- অডিওতে 123টি স্বাভাবিক বিরতি শনাক্ত করে 76টি scene boundary-র মধ্যে 64টি বিরতির মাঝখানে align করা হয়েছে; বাকি boundary narration-length estimate ধরে বসানো।
- 77টি scene, 14,771 frames, 30 fps; কোনো narration কাটা হয়নি।
- এটি **scene-level voice alignment**; আলাদা শব্দের word/phoneme-level timestamp দাবি করা হচ্ছে না। ভয়েসওভার word-by-word শুনে মেলানো হয়েছে—এমন দাবিও করা হচ্ছে না।

## ভিজ্যুয়াল আপডেট

- Storefront-এ বড়, পূর্ণাঙ্গ desktop browser showcase যোগ করা হয়েছে: home/category page, product detail, এবং দুই-কলামের checkout flow; মোবাইল storefront preview-ও রয়েছে।
- Storefront, landing-page এবং business-category showcase-এ মোট নয়টি locally bundled editorial photograph ব্যবহার করা হয়েছে—ঘড়ি, ব্যাগ, জুতা, fragrance, fashion, restaurant এবং beauty।
- ফ্যাশন, রেস্টুরেন্ট ও beauty-র জন্য campaign-style landing page এবং পরিষ্কার category cards যোগ করা হয়েছে। Admin dashboard browser panels আরও বড় ও সামঞ্জস্যপূর্ণ করা হয়েছে, যাতে টেবিল, স্ট্যাটাস ও কন্ট্রোল ভালোভাবে দেখা যায়।
- Bengali demo labels বজায় আছে; sample customer/order/price details illustrative demo data। কোনো runtime external image request নেই।
- দীর্ঘ রিল জুড়ে একটানা একই নীল-কালো mood এড়াতে chapter অনুযায়ী subdued warm retail, cool admin, emerald order, violet retargeting, amber logistics এবং warm closing palette ব্যবহার করা হয়েছে; UI reveal, camera push ও page transition সংযত রাখা হয়েছে।
- নতুন browser storefront, checkout, category ও admin দৃশ্যের representative frames ভিডিও থেকে আলাদাভাবে দেখে layout/legibility যাচাই করা হয়েছে।

## পরীক্ষা

- `npm run build` — PASS।
- `node tools/smoke-browser.mjs` — PASS (`SMOKE OK`)।
- `node --check` (source `.mjs` files) এবং `git diff --check` — PASS।
- 1080p ও 720p—দুটোর ffprobe metadata, H.264/AAC streams, resolution, frame rate, duration এবং সম্পূর্ণ audio/video decode — PASS।

## ডাউনলোড

- [1080p MP4](output/CodePixel-Web-Promo-Reels-1080p.mp4)
- [720p MP4](output/CodePixel-Web-Promo-Reels-720p.mp4)
