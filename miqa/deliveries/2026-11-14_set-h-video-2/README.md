# সেট H · মিকার হানিকম্ব কালেকশন — ফিল্ম ২ (০:৩১) · v3

ক্লায়েন্টের ফোনের **আসল ভিডিও ফাইল** (১০৮০×১৯২০) থেকে বানানো বিজ্ঞাপন · ৯:১৬ · ১০৮০×১৯২০ · ৩০ fps · দাম ৳৯৯৯ · পুরুষ ভয়েস (`voice-01`)।

**v3 (১৪ নভেম্বর ২০২৬):** ক্লায়েন্ট Drive-এ আসল ফাইল দিয়ে বললেন — "আমি আসল ভিডিও ফাইল দিয়েছি, ওটাতে কোয়ালিটি ঠিক আছে … ওগুলো দিয়ে তৈরি করো যেন ছবি ভিডিওর কোয়ালিটি নষ্ট না হয়।"
আগের দুটি ভার্সন (v1, v2) WhatsApp-এ চাপানো ৪৮০×৮৫৪ কপি থেকে বানানো ছিল। v3 পুরোটাই আসল ফাইল থেকে (D59):

- ছবিতে হাত দেওয়া হয়নি — রঙ বদল, শার্পনিং, ঝাপসা, গাঢ় করা, ভিনিয়েট, গ্রেইন কিছুই নেই (D58);
- প্রতিটি ফ্রেম আসল ভিডিওর একটি আসল ফ্রেম, আসল গতিতে;
- উৎস আর ফিল্ম দুটোই ১০৮০×১৯২০; হাতের কাঁপুনি কমাতে ১০–২৫% ক্রপ (বেশিরভাগ শটে ১৫%);
- এনকোড ১৮.৮ Mb/s (আসল ফাইল ~২০ Mb/s);
- WhatsApp কপির কোনো শট মেশানো হয়নি।

**সীমাবদ্ধতা:** Drive-এ ৪টি আসল ফাইল আছে; এর ২টি (৯৫ MB ও ৫৮ MB) নামানো গেছে, বাকি ২টি (১১২ MB ও ১৩২ MB) ১০০ MB সীমার কারণে নামানো যায়নি।
তাই ফিল্মটি দুটি ফাইল থেকে কাটা — বিস্তারিত [`QC-REPORT.md`](QC-REPORT.md) §৪।

## ডাউনলোড

| ফাইল | লিংক | সাইজ |
|---|---|---|
| **ভিডিও ১০৮০×১৯২০** | [`miqa-honeycomb-film-2-v3_1080x1920.mp4`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2-v3_1080x1920.mp4) | 74.0 MB |
| কভার | [`miqa-honeycomb-film-2-v3-cover_1080x1920.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2-v3-cover_1080x1920.jpg) | 0.5 MB |
| কনট্যাক্ট শিট | [`CONTACT-SHEET-VIDEO.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/CONTACT-SHEET-VIDEO.jpg) | — |

**Google Drive:** ফোল্ডার "MIQA Honeycomb Video - Final (2026-11-14)" —
<https://drive.google.com/drive/folders/1--uta2wRdXU2UFwf7VfPE92koq8ndQHc>
(v3 ভিডিও: <https://drive.google.com/file/d/10qCqgljSMbTn9wR-Bc1mP-7Tw3-SU8VK/view> ·
v3 কভার: <https://drive.google.com/file/d/1qt6sLUEqGh6ip7XbQaWC1-XqH9gPgVZ4/view>).
ফোল্ডারে "v3" ছাড়া বাকি ফাইলগুলো পুরনো (v1, v2)।

## ডকুমেন্ট

- [`VOICEOVER.md`](VOICEOVER.md) — ৮ লাইনের ভয়েস, সময়, পর্দার লেখা, কোন ভিডিওর কোন অংশ
- [`CAPTION.md`](CAPTION.md) — পোস্ট / রিলস ক্যাপশন
- [`QC-REPORT.md`](QC-REPORT.md) — মাপা স্পেক, যা দেখে মিলিয়েছি, **সৎ ঝুঁকি (পড়ে নিন)**
- [`CREDITS.md`](CREDITS.md) — ফুটেজ / ভয়েস / মিউজিক / ফন্ট

## ছাঁচ

হুক (সাদা ডায়াল, হাতের তালুতে) → কাগজের ওপর দুই রঙ → নীলটি অন্যদের পাশে রাখা → সারিতে চার রঙ → সাদা · নীল · সবুজ · কালো →
বাটারফ্লাই লক (এক টেকে খোলা) → সেমি-অটোমেটিক মেশিন → ওয়াটারপ্রুফ + কালার গ্যারান্টি → ১ বছরের ওয়ারেন্টি + ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি →
দাম + ক্যাশ অন ডেলিভারি → অর্ডার কার্ড (৫% লাইনসহ)।

## রিবিল্ড

```bash
npm install
pip install --break-system-packages --user pillow numpy opencv-python-headless scipy
# আসল ফাইল দুটি Drive থেকে নামিয়ে রাখুন: miqa/products/2026-11-14_set-h-video-2/input/orig/README.md
bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
```
