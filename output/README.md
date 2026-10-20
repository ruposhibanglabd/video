# রেন্ডার আউটপুট

- `CodePixel-Web-Promo-Reels.mp4` — 1080×1920 · 30 fps · H.264 + AAC · 08:12.367
  · আসল বাংলা ভয়েসওভার (`assets/voiceover/voiceover.mp3`, 492.356 s) সহ।

আবার রেন্ডার করতে (এই ফোল্ডারে পুনরায় লেখা হবে):

```bash
node src/render/render.mjs --audio assets/voiceover/voiceover.mp3 \
  --out output/CodePixel-Web-Promo-Reels.mp4
```

অথবা `npm start` → http://localhost:3000 → অডিও আপলোড → **ভিডিও তৈরি করুন** →
**ভিডিও ডাউনলোড করুন** (রেন্ডার ব্রাউজারেই হয়)।

`*.mp4` ফাইল Git-এ কমিট হয় না (`.gitignore`)।
