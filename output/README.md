# রেন্ডার আউটপুট

- `CodePixel-Web-Promo-Reels.mp4` — 1080×1920 · 30fps · H.264 + AAC · 08:12.373
  এই ফাইলটি **৭৭-সিন টাইমলাইন প্রিভিউ** (সাইলেন্ট অডিও বেড দিয়ে রেন্ডার করা,
  কারণ এখনো আসল বাংলা ভয়েসওভার দেওয়া হয়নি)।

আসল ভয়েসওভার দিয়ে ফাইনাল করতে:

```bash
node src/render/render.mjs --audio assets/voiceover/voiceover.m4a \
  --out output/CodePixel-Web-Promo-Reels.mp4
```

অথবা `npm start` → http://localhost:3000 → অডিও আপলোড → ভিডিও তৈরি → ডাউনলোড।
