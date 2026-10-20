# ভয়েসওভার এখানে রাখুন

ফাইলটির নাম দিন `voiceover.m4a` (বা `.mp3` / `.wav`) এবং এই ফোল্ডারে রাখুন:

```
assets/voiceover/voiceover.m4a
```

তারপর রেন্ডার:

```bash
node src/render/render.mjs --audio assets/voiceover/voiceover.m4a \
  --out output/CodePixel-Web-Promo-Reels.mp4
```

অথবা `npm start` করে ব্রাউজারে `http://localhost:3000` খুলে অডিও আপলোড করুন।

> অডিও কখনো সম্পাদনা/ক্রপ/স্পিড-চেঞ্জ করা হয় না; ভিডিওর দৈর্ঘ্য
> অডিওর আসল duration থেকে নেওয়া হয়।
