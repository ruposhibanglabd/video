# CREDITS — Set C v2 · MIQA Octavia

| উপাদান | উৎস |
|---|---|
| ছবি | সেট C-র নিজস্ব রেন্ডার (`miqa/deliveries/2026-11-05_set-c/`) — AI-তে তৈরি, ১০০% নিজস্ব; ভিডিওতে সেগুলো থেকেই ঘড়ি কেটে বসানো |
| ঘড়ি কাটআউট | `work/cut/*_trim.png` — প্রাইমারি রেন্ডার থেকে প্রাকৃতিক পটভূমি বাদ দিয়ে, নরম ফেথার (Pillow + numpy) |
| ভয়েসওভার | **voice-02** (নারী, bn-BD) — এই সেশনে অডিশন করে বাছা; স্ক্রিপ্ট `VO-SCRIPT.md` |
| মিউজিক | নিজস্ব সিন্থ (numpy/scipy): ৯০ BPM, A মেজর — শান্ত প্যাড, ফেল্ট পিয়ানো, বেস, নরম কিক/রিম/হ্যাট, ট্রানজিশন whoosh, পানির plink, সোনালি bell — সম্পূর্ণ copyright-free |
| SFX | নিজস্ব সিন্থ: whoosh, plink, stamp, sparkle, boom, final bell |
| টাইপোগ্রাফি | Hind Siliguri (বাংলা), Cinzel / Tiro Bangla / Montserrat / Cormorant Garamond — সব OFL, `miqa/brand/fonts/` |
| বাংলা শেপিং | `@napi-rs/canvas` (যুক্তাক্ষর অটুট) |
| লোগো | শুধু টেক্সট-ওয়ার্ডমার্ক (Cinzel) — ক্লায়েন্টের লোগো ফাইল এখনো আসেনি |
| রেন্ডার | `render_v2.py` (Pillow + numpy) → ffmpeg/libx264; `audio_v2.py` (numpy/scipy) → ffmpeg/AAC |
| ফেসবুক পোস্ট | `facebook_post.py` + `facebook_text.mjs` — ৫টি ঘড়ি একসাথে, ১০৮০×১৩৫০ |

কোনো স্টক ফুটেজ, স্টক মিউজিক, টেমপ্লেট বা তৃতীয় পক্ষের ছবি ব্যবহার করা হয়নি।
