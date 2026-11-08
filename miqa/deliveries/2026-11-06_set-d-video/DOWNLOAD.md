# ডাউনলোড — সেট D (ভেলোরা) নতুন কাট

## সবচেয়ে সহজ: সরাসরি লিংক (GitHub → Download)

ভিডিও ফাইলটা রিপোতে কমিট করা আছে। নিচের লিংকে গেলে GitHub-এ ফাইলটা খুলবে,
তার ডান দিকে **Download raw file** (⤓) চাপলেই ফোন/ল্যাপটপে সেভ হবে — লগইন লাগবে না।

**নতুন ভিডিও (০:৫৭, ১০৮০×১৯২০, ২৪ MB):**

```
https://github.com/ruposhibanglabd/video/raw/arena/3c25d26c-video/miqa/deliveries/2026-11-06_set-d-video/miqa-set-d-velora_daylight_1080x1920.mp4
```

একই ফাইল, ZIP-এ (কিছু ব্রাউজার/ফোনে MP4-এর বদলে ZIP নামাতে সুবিধা):

```
https://github.com/ruposhibanglabd/video/raw/arena/3c25d26c-video/miqa/deliveries/2026-11-06_set-d-video/MIQA-SetD-Daylight_1080x1920.zip
```

## কমান্ড লাইন দিয়ে

```bash
# সরাসরি ভিডিও
curl -L -O https://github.com/ruposhibanglabd/video/raw/arena/3c25d26c-video/miqa/deliveries/2026-11-06_set-d-video/miqa-set-d-velora_daylight_1080x1920.mp4

# বা শুধু এই ফোল্ডারটা (sparse checkout)
git clone --filter=blob:none --sparse https://github.com/ruposhibanglabd/video.git
cd video && git sparse-checkout set miqa/deliveries/2026-11-06_set-d-video
```

## এই ফোল্ডারে কী কী আছে

| ফাইল | কী |
|---|---|
| `miqa-set-d-velora_daylight_1080x1920.mp4` | **নতুন ভিডিও** — ০:৫৭, ২৪ MB, রিলস/ফেসবুক ভিডিও |
| `MIQA-SetD-Daylight_1080x1920.zip` | উপরের ভিডিওটাই ZIP-এ |
| `facebook-d2/*.jpg` | নতুন অ্যাড আর্ট — ৪:৫, স্কোয়ার, স্টোরি + ৪টি ক্যারোসেল কার্ড |
| `CONTACT-SHEET-DAYLIGHT.jpg` | ১৪টি কী-ফ্রেম এক পাতায় |
| `miqa-set-d-velora_1080x1920.mp4` | আগের (অন্ধকার) কাট — রেফারেন্স |
| `facebook/` | আগের পোস্ট আর্ট |

> রিপো **public**, তাই লিংক যে কেউ খুলতে পারবে। শুধু `main`-এ মার্জ হওয়ার আগে
> লিংকের ব্রাঞ্চ নাম `arena/3c25d26c-video` — মার্জ হলে `main` দিয়ে একই লিংক কাজ করবে।
