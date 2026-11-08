# ডাউনলোড গাইড — সেট H (MONTVARE)

সব ছবি GitHub-এ কমিট করা আছে, রিপো **পাবলিক** — তাই ডাউনলোডের জন্য লগইন বা টুল লাগে না।

---

## ১. সবচেয়ে সহজ — এক ক্লিকে পুরো প্যাক (সুপারিশ ⭐)

নিচের লিংকে ক্লিক করলেই ZIP নামবে (১৪ MB, ৭৮টি ফাইল):

```
https://github.com/ruposhibanglabd/video/raw/arena/75062295-video/miqa/deliveries/2026-11-08_set-h/set-h_MONTVARE-all-images.zip
```

ফোনে ব্রাউজার থেকে খুললে ZIP ফাইল ডাউনলোড ফোল্ডারে যাবে; Android-এ “Files” অ্যাপ দিয়ে, iPhone-এ
“Files → Downloads” থেকে ট্যাপ করলেই খুলে যাবে।

### ZIP-এর ভেতরে

```
01-montvare-emerald/     MONTVARE-Emerald-main.jpg
                         MONTVARE-Emerald-main-600.jpg     ← থাম্ব
                         MONTVARE-Emerald-angle.jpg
                         MONTVARE-Emerald-dial.jpg
                         MONTVARE-Emerald-bracelet.jpg
                         MONTVARE-Emerald-wrist.jpg
02-montvare-champagne/   … একই কাঠামো
03-montvare-black/
04-montvare-silver/
05-montvare-blue/
06-montvare-cherry-red/
07-montvare-black-steel/
08-shared/               set-h-shared-lock.jpg
                         set-h-all-seven-colours.jpg      ← সাত রঙ এক ছবিতে
README.md  DESCRIPTIONS.md  WEBSITE.md  QC-REPORT.md  CONTACT-SHEET.jpg
```

অন্য ZIP (আগের কাঠামো, slug-নামে ফাইল) — `…/set-h_website-images.zip`
ফাইলগুলো আসলে `website/` + `website/thumbs/` ফোল্ডারে।

---

## ২. একটা একটা ছবি নামাতে চাইলে

ব্রাউজারে ফোল্ডারটা খুলুন:

```
https://github.com/ruposhibanglabd/video/tree/arena/75062295-video/miqa/deliveries/2026-11-08_set-h/website
```

ফাইলে ক্লিক → ডানদিকে **“Download raw file”** (⤓ আইকন)। থাম্বের জন্য:
`…/website/thumbs/`

### সরাসরি লিংকের ছাঁচ

```
https://github.com/ruposhibanglabd/video/raw/arena/75062295-video/miqa/deliveries/2026-11-08_set-h/website/<ফাইলনাম>.jpg
```

উদাহরণ:
- সবুজের প্রধান ছবি → `…/website/set-h-01-green_1_main.jpg`
- নীলের হাতে-পরা → `…/website/set-h-05-blue_5_wrist.jpg`
- সবুজের ৬০০ থাম্ব → `…/website/thumbs/set-h-01-green_1_main_600.jpg`

**স্লাগ-নাম:** `set-h-01-green` · `set-h-02-champagne` · `set-h-03-black` ·
`set-h-04-silver` · `set-h-05-blue` · `set-h-06-red` · `set-h-07-black-steel`
**শট-নাম:** `_1_main` · `_2_angle` · `_3_dial` · `_4_bracelet` · `_5_wrist`

---

## ৩. ডেভেলপার/স্ক্রিপ্ট দিয়ে (এক কমান্ডে সব)

```bash
git clone --branch arena/75062295-video --depth 1 \
  https://github.com/ruposhibanglabd/video.git
cd video/miqa/deliveries/2026-11-08_set-h
```

অথবা শুধু ছবিগুলো:

```bash
mkdir set-h && cd set-h
curl -LO https://github.com/ruposhibanglabd/video/raw/arena/75062295-video/miqa/deliveries/2026-11-08_set-h/set-h_MONTVARE-all-images.zip
unzip set-h_MONTVARE-all-images.zip
```

Windows PowerShell-এ `curl` না থাকলে: `Invoke-WebRequest -Uri <লিংক> -OutFile set-h.zip`

---

## ৪. ব্রাঞ্চ আপডেট হলে

ZIP তৈরি হয়েছে কমিট `978d7d3`-এ। ব্রাঞ্চে নতুন কমিট এলে লিংকটা এখনও কাজ করবে, কিন্তু
নতুন ছবি পেতে **আবার ডাউনলোড** করতে হবে (ব্রাউজারে `Ctrl+Shift+R` দিয়ে পেজ রিফ্রেশ করুন)।

---

## ৫. ছবির স্পেক (মনে রাখার জন্য)

| | |
|---|---|
| মূল ছবি | ১৬০০×১৬০০ px, sRGB JPEG, quality 92 (২৫০–৫০০ KB) |
| থাম্ব | ৬০০×৬০০ px, quality 82 (৩৫–৭৫ KB) |
| মোট | ৭ রঙ × ৫ শট = ৩৫ + ২ শেয়ার্ড = **৩৭টি ছবি** |
| লেখা | ছবিতে কোনো দাম/URL/লোগো/ওয়াটারমার্ক নেই |
