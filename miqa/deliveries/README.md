# ডেলিভারি — চূড়ান্ত ভিডিও, ছবি আর লিস্টিং এখানে থাকবে

প্রতিটি প্রোডাক্টের জন্য একটি ফোল্ডার: `deliveries/<YYYY-MM-DD>_<slug>/`

| ফাইল | কী |
|---|---|
| `<slug>_4K_2160x3840.mp4` | 4K মাস্টার, H.264, 30 fps, AAC স্টেরিও (< 100 MB) |
| `<slug>_1080x1920.mp4` | মোবাইল ও প্রিভিউ কপি |
| `<slug>_cover_2160x3840.jpg`, `<slug>_cover_1080x1920.jpg` | কভার বা থাম্বনেইল |
| `AD-COPY.md` | Primary Text, Headline, Description |
| `CREDITS.md` | ভয়েস (AI, bn-BD), মিউজিক ও সাউন্ড ইফেক্ট (নিজস্ব কম্পোজিশন, কপিরাইট-মুক্ত), ফন্ট (OFL) |
| `QC-REPORT.md` | QC চেকলিস্টের ফলাফল |

**ডাউনলোড লিংকের ফরম্যাট** (রিপোজিটরি পাবলিক):
`https://github.com/ruposhibanglabd/video/raw/main/miqa/deliveries/<folder>/<file>.mp4`
main-এ মেশানোর আগে `main`-এর জায়গায় ব্রাঞ্চের নাম বসাতে হবে।

**কিছু সীমা:**
- GitHub-এ প্রতিটি ফাইল ১০০ MB-এর কম হতে হবে। তাই 4K ফাইল সাইজ মেপে এনকোড করা হয় ([RUNBOOK §৮](../production/RUNBOOK.md))।
- Facebook আর Instagram ভিডিও দেখায় সর্বোচ্চ প্রায় 1080–1440p পর্যন্ত। 4K মাস্টার আপলোড করলে Facebook নিজেই সেটা ছোট করে নেয়, আর মূল কপি সর্বোচ্চ কোয়ালিটিতে আপনার কাছে থেকে যায়।
- অনেক ভিডিও জমলে রিপোজিটরি বড় হয়ে যাবে। তখন পুরনো ডেলিভারিগুলো আলাদা আর্কাইভ রিপোতে সরানো যাবে।

## ওয়েবসাইটের ছবি
ফোল্ডার: `deliveries/<YYYY-MM-DD>_<slug>/website-images/` ([নির্দেশিকা](../creative/PRODUCT-IMAGES-GUIDE.md))

| ফাইল | কী |
|---|---|
| `<slug>_01_primary.jpg` | প্রাইমারি: নিচে বাংলা লেখা + লকের ছোট ছবি |
| `<slug>_02_on-wrist.jpg` | হাতে পরা |
| `<slug>_03_angle.jpg` | কোণ থেকে |
| `<slug>_04_closeup.jpg` | ক্লোজ-আপ |
| `<slug>_05_box.jpg` / `_05_colors.jpg` / `_05_styled.jpg` | বক্স / সব রঙ / স্টাইলড |
| `deliveries/<YYYY-MM-DD>_<slug>/<slug>_website-images.zip` | সব ছবি একসাথে |

- সব ছবি ২০০০×২০০০, JPG (sRGB)।
- লিংকের ফরম্যাট ভিডিওর মতোই, শুধু শেষে `.jpg` বা `.zip`।
- **সেট:** `deliveries/<YYYY-MM-DD>_set-<নাম>/`। ভেতরে প্রতিটি প্রোডাক্টের ফোল্ডার আর সেটের ভিডিও।

## নাম ও বিবরণ (লিস্টিং)
- ফাইল: `deliveries/<YYYY-MM-DD>_<slug>/LISTING.md`।
- ভেতরে থাকবে নামের প্রস্তাব, আর সাইটের প্রতিটি ঘরের লেখা ([ছাঁচ](../templates/PRODUCT-LISTING.template.md))।
- চ্যাটেও প্রতিটি ঘর আলাদা কপি-বক্সে দেওয়া হবে।
