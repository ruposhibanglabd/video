# সেট H · মিকার হানিকম্ব কালেকশন — ফিল্ম ২ (০:৩১) · v2

ক্লায়েন্টের Google Drive-এ রাখা ৩টি ভিডিও থেকে বানানো বিজ্ঞাপন · ৯:১৬ · ১০৮০×১৯২০ · ৩০ fps · দাম ৳৯৯৯ · নতুন পুরুষ ভয়েস (`voice-01`)।

**v2 (১৪ নভেম্বর ২০২৬):** ক্লায়েন্ট v1 বাতিল করেছেন — "ভিডিওর কোয়ালিটি একদম নষ্ট হয়ে গেছে, আমার ভিডিও আর তোমার ভিডিওর মধ্যে কোনো মিল নাই"।
v1-এ ৪৮০ পিক্সেলের ফুটেজে অনেক বেশি কাজ করা হয়েছিল (বেশি জুম, স্লো-মোশনে দুই ফ্রেমের মিশ্রণ, জোরালো শার্পনিং, রঙ বদল, চারপাশ ঝাপসা ও গাঢ়, গ্রেইন)।
v2-তে ক্লায়েন্টের ছবিই দেখানো হচ্ছে, যেমন আছে তেমন (D58):

- রঙ বদলানো হয়নি; ঝাপসা, গাঢ় করা, ভিনিয়েট, গ্রেইন — কিছুই নেই;
- প্রতিটি ফ্রেম ক্লায়েন্টের ভিডিওর একটি আসল ফ্রেম, আসল গতিতে (স্লো-মোশন বা মিশ্রিত ফ্রেম নেই);
- ফোনের প্রায় পুরো ফ্রেম (১৫–৩০% ক্রপ — শুধু হাতের কাঁপুনি কমানোর জন্য যতটুকু লাগে);
- এক শট থেকে পরের শটে ০.৩ সেকেন্ডের নরম ডিজলভ; কোনো হার্ড কাট নেই।

## ডাউনলোড

| ফাইল | লিংক | সাইজ |
|---|---|---|
| **ভিডিও ১০৮০×১৯২০** | [`miqa-honeycomb-film-2-v2_1080x1920.mp4`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2-v2_1080x1920.mp4) | 46.8 MB |
| কভার | [`miqa-honeycomb-film-2-v2-cover_1080x1920.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2-v2-cover_1080x1920.jpg) | 0.4 MB |
| কনট্যাক্ট শিট | [`CONTACT-SHEET-VIDEO.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/CONTACT-SHEET-VIDEO.jpg) | — |

**Google Drive:** ফোল্ডার "MIQA Honeycomb Video - Final (2026-11-14)" —
<https://drive.google.com/drive/folders/1--uta2wRdXU2UFwf7VfPE92koq8ndQHc>
(v2 ভিডিও: <https://drive.google.com/file/d/1nJULWaQjAQrif6WyGLE4_CJ5JkuRMjjo/view> ·
v2 কভার: <https://drive.google.com/file/d/1cIJxiH_QzQ2U5Ys6pNij-V_4s6h1SVjY/view>).
ফোল্ডারে নামের শেষে "v2" ছাড়া ফাইল দুটি বাতিল হওয়া v1।

## ডকুমেন্ট

- [`VOICEOVER.md`](VOICEOVER.md) — ৮ লাইনের ভয়েস, সময়, পর্দার লেখা, কোন ভিডিওর কোন অংশ
- [`CAPTION.md`](CAPTION.md) — পোস্ট / রিলস ক্যাপশন
- [`QC-REPORT.md`](QC-REPORT.md) — মাপা স্পেক, যা দেখে মিলিয়েছি, **সৎ ঝুঁকি (পড়ে নিন)**
- [`CREDITS.md`](CREDITS.md) — ফুটেজ / ভয়েস / মিউজিক / ফন্ট

## ছাঁচ

হুক (সাদা ডায়াল ক্লোজ-আপ) → কাগজের ওপর তিন রঙ → এক টেকে চার রঙ (নীলটি রাখা, সবুজটি তোলা) → সাদা · নীল · সবুজ · কালো →
বাটারফ্লাই লক → সেমি-অটোমেটিক মেশিন → ওয়াটারপ্রুফ + কালার গ্যারান্টি → ১ বছরের ওয়ারেন্টি + ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি →
দাম + ক্যাশ অন ডেলিভারি → অর্ডার কার্ড (৫% লাইনসহ)।

## রিবিল্ড

```bash
npm install
pip install --break-system-packages --user pillow numpy opencv-python-headless scipy
bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
```
