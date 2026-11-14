# সেট H · মিকার হানিকম্ব কালেকশন — ফিল্ম ২ (০:৩১)

ক্লায়েন্টের Google Drive-এ রাখা ৩টি ভিডিও থেকে বানানো নতুন বিজ্ঞাপন · ৯:১৬ · ১০৮০×১৯২০ · ৩০ fps · দাম ৳৯৯৯।
নতুন পুরুষ ভয়েস (`voice-01`), এক টানা পুশ-ইনের ভেতরে ম্যাচ-ডিজলভ, পর্দায় খুব কম লেখা (D57)।

## ডাউনলোড

| ফাইল | লিংক | সাইজ |
|---|---|---|
| **ভিডিও ১০৮০×১৯২০** | [`miqa-honeycomb-film-2_1080x1920.mp4`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2_1080x1920.mp4) | 35.9 MB |
| কভার | [`miqa-honeycomb-film-2-cover_1080x1920.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/miqa-honeycomb-film-2-cover_1080x1920.jpg) | 0.4 MB |
| কনট্যাক্ট শিট | [`CONTACT-SHEET-VIDEO.jpg`](https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/2026-11-14_set-h-video-2/CONTACT-SHEET-VIDEO.jpg) | — |

**Google Drive:** ফোল্ডার "MIQA Honeycomb Video - Final (2026-11-14)" —
<https://drive.google.com/drive/folders/1--uta2wRdXU2UFwf7VfPE92koq8ndQHc>
(ভিডিও: <https://drive.google.com/file/d/1M2ZVUvj_tsWQ0F99WiFW6EbeURZJxGXu/view> ·
কভার: <https://drive.google.com/file/d/1xwV5J6LmCRci1kTPsmEuq4XVIai2QwLi/view>)

## ডকুমেন্ট

- [`VOICEOVER.md`](VOICEOVER.md) — ৮ লাইনের ভয়েস, সময়, পর্দার লেখা, কোন ভিডিওর কোন অংশ
- [`CAPTION.md`](CAPTION.md) — পোস্ট / রিলস ক্যাপশন
- [`QC-REPORT.md`](QC-REPORT.md) — মাপা স্পেক, যা দেখে মিলিয়েছি, **সৎ ঝুঁকি (পড়ে নিন)**
- [`CREDITS.md`](CREDITS.md) — ফুটেজ / ভয়েস / মিউজিক / ফন্ট

## ছাঁচ

হুক (সাদা ডায়াল ক্লোজ-আপ) → টেবিলে চার রঙ → সাদা · নীল · সবুজ · কালো → বাটারফ্লাই লক →
সেমি-অটোমেটিক মেশিন → ওয়াটারপ্রুফ + কালার গ্যারান্টি → ১ বছরের ওয়ারেন্টি + ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি →
দাম + ক্যাশ অন ডেলিভারি → অর্ডার কার্ড (৫% লাইনসহ)।

প্রতিটি শটে ঘড়ি পর্দার একই জায়গায়, একই মাপে আটকানো; এক শট থেকে পরের শটে ০.৩ সেকেন্ডের ডিজলভ —
ডায়ালের ওপর ডায়াল বসে, তাই কাট চোখে লাগে না। ফুটেজ ০.৩–০.৮× গতিতে, শুধু হাত স্থির থাকা অংশ থেকে।
আসল ফুটেজ পুরো ফ্রেমে; কোনো সাদা শেড নেই (D56)।

## রিবিল্ড

```bash
npm install
pip install --break-system-packages --user pillow numpy opencv-python-headless scipy
bash miqa/products/2026-11-14_set-h-video-2/build_n.sh
```
