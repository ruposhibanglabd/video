# ভয়েসওভার

```
assets/voiceover/voiceover.mp3     # বর্তমান ফাইল (492.355875s, 44.1 kHz mono, MP3)
```

মূল ফাইলটি ছিল:
`ElevenLabs_2026-10-20T06_23_48_Debashish - Warm, Proud_gen_sp100_s50_sb75_v4 (1).mp3`
(একই বাইট, শুধু কাজের সুবিধার জন্য নাম বদলানো হয়েছে)

রেন্ডার:

```bash
node src/render/render.mjs --audio assets/voiceover/voiceover.mp3 \
  --out output/CodePixel-Web-Promo-Reels.mp4
```

অথবা `npm start` করে ব্রাউজারে `http://localhost:3000` খুলে অডিও আপলোড করুন।

> অডিও কখনো সম্পাদনা/ক্রপ/স্পিড-চেঞ্জ করা হয় না; ভিডিওর দৈর্ঘ্য
> অডিওর আসল duration থেকে নেওয়া হয়।
