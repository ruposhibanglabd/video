# রেন্ডার আউটপুট

- `CodePixel-Web-Premium-Ad.mp4` — 1080×1920 · 30 FPS · H.264 High + AAC-LC · 02:13.87 (4,017 ফ্রেম) · 42.31 MB
  · মাস্টারড বাংলা ভয়েসওভার + মিউজিক/এসএফএক্স মিক্স (`assets/audio/codepixel-final-audio.m4a`) সহ।

আবার রেন্ডার করতে (এই ফোল্ডারে পুনরায় লেখা হবে):

```bash
npm install
node src/render/render.mjs --audio assets/audio/codepixel-final-audio.m4a \
  --out output/CodePixel-Web-Premium-Ad.mp4
node tools/qa-frames.mjs   # QA যাচাই + স্টোরিবোর্ড কন্টাক্ট শিট
```

চূড়ান্ত মাস্টার `CodePixel-Web-Premium-Ad.mp4` Git-এ কমিট করা হয় এবং
GitHub Release থেকেও ডাউনলোড করা যায়। অন্যান্য `*.mp4`, `output/qa/`,
`output/stills/` ফাইল `.gitignore`-এ বাদ থাকে।
