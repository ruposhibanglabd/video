# CodePixel Web — প্রিমিয়াম বাংলা বিজ্ঞাপন ও MP4 স্টুডিও

**CodePixel Web (`https://codepixelweb.vercel.app/`)**-এর জন্য তৈরি সম্পূর্ণ বাংলা ভয়েসওভারযুক্ত, মিলিসেকেন্ড-সিঙ্ক করা, সিনেম্যাটিক `1080 × 1920` (`30 FPS`, `H.264 + AAC`) প্রিমিয়াম বিজ্ঞাপন এবং ইন্টারেক্টিভ ওয়েব প্লেয়ার ও MP4 ডাউনলোড স্টুডিও।

## ⬇️ সরাসরি ডাউনলোড (GitHub)

- **One-click MP4 (Release Asset):** <https://github.com/ruposhibanglabd/video/releases/download/codepixel-web-ad-v1/CodePixel-Web-Premium-Ad.mp4>
- **Release Page:** <https://github.com/ruposhibanglabd/video/releases/tag/codepixel-web-ad-v1>
- **Repo Branch File:** <https://github.com/ruposhibanglabd/video/raw/arena/c6103df1-video/output/CodePixel-Web-Premium-Ad.mp4>

**File:** `CodePixel-Web-Premium-Ad.mp4` · `1080×1920` (9:16) · `30 FPS` · `H.264 High + AAC-LC 48 kHz Stereo` · `02:13.87` · `42.31 MB`
**SHA-256:** `e037ff66d96d5b2e850f598f6b36a31a012f0c3c8baa56a5eb5530ff3557f8fe`

## মূল আউটপুটসমূহ

- **Final Rendered MP4 Video:** `output/CodePixel-Web-Premium-Ad.mp4` (`1080×1920`, `30 FPS`, `02:13.9`, `42.31 MB`)
- **Bengali Master Voiceover:** `assets/voiceover/codepixel-voiceover.mp3` (`48 kHz`, `192 kbps`)
- **Original Agency Score & UI SFX:** `assets/audio/codepixel-music-sfx.mp3`
- **Decoded MP4 Storyboard Sheet:** `output/qa/storyboard-contact-sheet.png`
- **Complete Script, Storyboard & Sync Timeline:** [`DELIVERABLES.md`](./DELIVERABLES.md) · [`QA-REPORT.md`](./QA-REPORT.md)

## দ্রুত চালানো ও ডাউনলোড

```bash
npm install
npm start            # http://localhost:3000 (লাইভ প্লেয়ার + ১-ক্লিকে MP4 ডাউনলোড)
```

### কমান্ড লাইনে পুনরায় রেন্ডার ও যাচাই

```bash
node tools/build-audio.mjs
node src/render/render.mjs \
  --audio assets/audio/codepixel-final-audio.m4a \
  --out output/CodePixel-Web-Premium-Ad.mp4
node tools/qa-frames.mjs
node tools/smoke-browser.mjs
```
