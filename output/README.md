# রেন্ডার আউটপুট

- `CodePixel-Web-Promo-Reels.mp4` — মাস্টার · 1080×1920 · 30 fps · H.264 High + AAC
  (48 kHz) · 08:12.367 · আসল বাংলা ভয়েসওভার সহ · 136 MB
- `CodePixel-Web-Promo-Reels-share.mp4` — একই ভিডিও CRF 28-এ (71 MB), শেয়ার/সেন্ডের জন্য

`CodePixel-Web-Promo-Reels-share.mp4` **Git-এ ট্র্যাক করা** (৭১ MB < GitHub-এর ১০০ MB
সীমা) — তাই ক্লোন করলেই পাওয়া যায়। মাস্টার (১৩৬ MB) `.gitignore`-এ, শুধু রেন্ডার
করে তৈরি হয়।

আবার রেন্ডার করতে:

```bash
npm run render:fast -- --audio assets/voiceover/voiceover.mp3 \
  --out output/CodePixel-Web-Promo-Reels.mp4 --workers 2

# শেয়ার কপি
node_modules/@ffmpeg-installer/linux-x64/ffmpeg -y \
  -i output/CodePixel-Web-Promo-Reels.mp4 \
  -c:v libx264 -preset fast -crf 28 -pix_fmt yuv420p -profile:v high -level 4.2 -g 60 \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart \
  output/CodePixel-Web-Promo-Reels-share.mp4
```

অথবা `npm start` → http://localhost:3000 → অডিও আপলোড → **ভিডিও তৈরি করুন** →
**ভিডিও ডাউনলোড করুন** (রেন্ডার ব্রাউজারেই হয়)।
