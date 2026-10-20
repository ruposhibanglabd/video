# QA রিপোর্ট — CodePixel Web Promo Reels

## চূড়ান্ত ভিডিও

| যাচাই | 1080p | 720p |
|---|---:|---:|
| ফাইল | `output/CodePixel-Web-Promo-Reels-1080p.mp4` | `output/CodePixel-Web-Promo-Reels-720p.mp4` |
| রেজোলিউশন / fps | 1080×1920 · 30 fps | 720×1280 · 30 fps |
| ভিডিও / অডিও | H.264 + AAC | H.264 + AAC |
| দৈর্ঘ্য | 492.367 s (8:12.367) | 492.373 s (8:12.373) |
| ফাইলের মাপ | 85,858,892 bytes (~82 MiB) | 21,771,160 bytes (~21 MiB) |
| ডিকোড পরীক্ষা | সম্পূর্ণ ফাইল সফলভাবে ডিকোড | সম্পূর্ণ ফাইল সফলভাবে ডিকোড |

আসল বাংলা MP3 (`assets/voiceover/voiceover.mp3`, 492.355875 s) অপরিবর্তিত গতিতে ভিডিওর শুরু থেকে যোগ করা হয়েছে। কোনো narration কাটা হয়নি।

## ভয়েস-সিঙ্ক

- আগের আনুমানিক, সমানুপাতিক scene-timecode বাদ দিয়ে প্রতিটি scene-এর বাংলা narration-এর দৈর্ঘ্য ধরে নতুন করে সময় বসানো হয়েছে।
- অডিওতে 123টি স্বাভাবিক বিরতি শনাক্ত করে 76টি scene boundary-র মধ্যে 64টি বিরতির মাঝখানে align করা হয়েছে; বাকি boundary narration-length estimate ধরে বসানো।
- প্রথম দিকের কয়েকটি কাটের যাচাই করা সময়: 6.863 s, 12.314 s, 19.850 s, 24.442 s, 29.545 s। কোনো scene 1.16 s-এর চেয়ে ছোট নয়।
- এটি **scene-level voice alignment**; আলাদা শব্দের word/phoneme-level timestamp দাবি করা হচ্ছে না।

## ভিজ্যুয়াল আপডেট

- ছয়টি locally bundled, premium editorial-style product photograph যোগ করা হয়েছে: ঘড়ি, ব্যাগ, জুতা ও fragrance/accessories।
- Storefront hero, category cards, product listing/search, product detail, cart ও campaign landing page-এ ফটোগুলো ব্যবহার করা হয়েছে; আগের flat/vector-only watch cards আর মূল পণ্যের visual নয়।
- উষ্ণ neutral, stone/linen ও brass palette-এ real e-commerce screen hierarchy রাখা হয়েছে; Bengali storefront/admin copy এবং demo-data label অক্ষুণ্ণ।
- ব্রাউজার build-এ ছবিগুলো local asset হিসেবে কপি/প্রি-লোড হয়; runtime external image request নেই।

## পরীক্ষা

- `npm run build` — PASS; storefront asset bundle যাচাই করা হয়েছে।
- `node tools/smoke-browser.mjs` — PASS (`SMOKE OK`)।
- `node --check` এবং `git diff --check` — PASS।
- 1080p ও 720p—দুটোর ffprobe metadata এবং সম্পূর্ণ audio/video decode — PASS।

## ডাউনলোড

- [1080p MP4](output/CodePixel-Web-Promo-Reels-1080p.mp4)
- [720p MP4](output/CodePixel-Web-Promo-Reels-720p.mp4)
